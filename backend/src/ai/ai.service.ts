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

  async generateArtefact(agentType: string, customPrompt: string) {
    try {
      // Path ke folder root -> project-ai-platform/.ai/prompts
      const promptPath = path.join(process.cwd(), '..', 'project-ai-platform', '.ai', 'prompts', `${agentType}.md`);
      let systemInstruction = 'You are a helpful AI assistant for software development.';
      
      if (fs.existsSync(promptPath)) {
        systemInstruction = fs.readFileSync(promptPath, 'utf-8');
      } else {
        console.warn(`Prompt file for agent ${agentType} not found at ${promptPath}`);
      }

      // Memanggil Gemini API dengan System Instruction
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: customPrompt,
        config: {
          systemInstruction: systemInstruction,
        }
      });

      return response.text;
    } catch (error: any) {
      throw new InternalServerErrorException('AI Generation failed: ' + error.message);
    }
  }
}
