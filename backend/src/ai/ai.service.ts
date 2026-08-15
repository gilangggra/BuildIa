import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AiService {
  private ai: GoogleGenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is missing in .env!');
    }
    // Inisialisasi client Google Gen AI
    this.ai = new GoogleGenAI({ apiKey: apiKey || 'dummy_key_for_build' });
  }

  private getSystemInstruction(agentType: string): string {
    const promptPath = path.join(
      process.cwd(),
      '..',
      'project-ai-platform',
      '.ai',
      'prompts',
      `${agentType}.md`,
    );
    if (fs.existsSync(promptPath)) {
      return fs.readFileSync(promptPath, 'utf-8');
    }
    return 'You are a helpful AI assistant for software development.';
  }

  async generateArtefact(agentType: string, customPrompt: string) {
    const MAX_RETRIES = 3;
    let attempts = 0;
    let currentPrompt = customPrompt;
    let finalResult = '';

    let totalPromptTokens = 0;
    let totalCompletionTokens = 0;

    while (attempts < MAX_RETRIES) {
      attempts++;
      try {
        const systemInstruction = this.getSystemInstruction(agentType);

        // 1. Generate Content
        const response = await this.ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: currentPrompt,
          config: {
            systemInstruction: systemInstruction,
          },
        });

        finalResult = response.text || '';

        // Track Tokens
        if (response.usageMetadata) {
          totalPromptTokens += response.usageMetadata.promptTokenCount || 0;
          totalCompletionTokens +=
            response.usageMetadata.candidatesTokenCount || 0;
        }

        // 2. Self-Healing Loop Logic for Coder
        if (agentType === 'code-generator') {
          const reviewerInstruction =
            this.getSystemInstruction('reviewer') +
            '\n\nOutput STRICTLY valid JSON ONLY: {"status": "pass"|"fail", "feedback": "reason"}';
          const reviewPrompt = `Review this code for critical syntax or logic errors:\n\n${finalResult}\n\nOutput ONLY valid JSON.`;

          const reviewResponse = await this.ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: reviewPrompt,
            config: { systemInstruction: reviewerInstruction },
          });

          if (reviewResponse.usageMetadata) {
            totalPromptTokens +=
              reviewResponse.usageMetadata.promptTokenCount || 0;
            totalCompletionTokens +=
              reviewResponse.usageMetadata.candidatesTokenCount || 0;
          }

          try {
            const rawReview = (reviewResponse.text || '')
              .replace(/```json/g, '')
              .replace(/```/g, '')
              .trim();
            const reviewData = JSON.parse(rawReview);

            if (reviewData.status === 'fail' && attempts < MAX_RETRIES) {
              console.log(
                `[Self-Healing] Attempt ${attempts} failed. Reviewer feedback: ${reviewData.feedback}`,
              );
              currentPrompt = `${customPrompt}\n\n[REVIEWER FEEDBACK - FIX THESE ISSUES]:\n${reviewData.feedback}\n\n[YOUR PREVIOUS CODE]:\n${finalResult}`;
              continue; // Retry!
            }
          } catch (e) {
            console.log(
              '[Self-Healing] Failed to parse reviewer JSON, proceeding anyway.',
            );
          }
        }

        break; // Passed review or not a code-generator
      } catch (error: any) {
        console.error('AI Generation Error:', error);
        throw new InternalServerErrorException(
          'AI Generation failed: ' + error.message,
        );
      }
    }

    return {
      text: finalResult,
      usage: {
        promptTokens: totalPromptTokens,
        completionTokens: totalCompletionTokens,
        totalTokens: totalPromptTokens + totalCompletionTokens,
      },
    };
  }
}
