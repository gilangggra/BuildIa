import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { AiService } from './ai.service';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class AiOrchestratorService {
  constructor(
    private readonly aiService: AiService,
    private readonly supabaseService: SupabaseService,
  ) {}

  async generateArtefact(agentType: string, customPrompt: string, projectId?: string, chatHistory: any[] = []) {
    const MAX_RETRIES = 3;
    let attempts = 0;
    let currentPrompt = customPrompt;
    let finalResult = '';
    let totalPromptTokens = 0;
    let totalCompletionTokens = 0;

    let retrievedContext = '';
    let ragCitations: any[] = [];
    
    // RAG Retrieval Logic
    if (projectId) {
      try {
        const queryEmbedding = await this.aiService.generateEmbedding(customPrompt);
        if (queryEmbedding && queryEmbedding.length > 0) {
          const supabase = this.supabaseService.getClient();
          const { data: matchedArtefacts, error } = await supabase.rpc('match_artefacts', {
            query_embedding: queryEmbedding,
            match_threshold: 0.1,
            match_count: 3,
            p_project_id: projectId
          });
          
          if (!error && matchedArtefacts && matchedArtefacts.length > 0) {
            ragCitations = matchedArtefacts.map((art: any) => ({
              id: art.id,
              name: art.name,
              type: art.type
            }));
            
            retrievedContext = '\n\n=======================================================\nCRITICAL INSTRUCTION: You MUST incorporate the following constraints and design guidelines from the project\'s APPROVED ARTEFACTS (Long-Term Memory) into your code. Do NOT ignore these rules even if the user does not explicitly ask for them in the prompt.\n\n[PROJECT CONTEXT (LONG-TERM MEMORY)]:\n';
            matchedArtefacts.forEach((art: any) => {
              retrievedContext += `--- ARTEFACT: ${art.name} (${art.type}) ---\n${art.content}\n\n`;
            });
            console.log(`[RAG] Retrieved ${matchedArtefacts.length} context artefacts for ${agentType}`);
          }
        }
      } catch (err) {
        console.error('[RAG] Retrieval failed', err);
      }
    }

    while (attempts < MAX_RETRIES) {
      attempts++;
      try {
        const systemInstruction = (await this.aiService.getSystemInstruction(agentType)) + retrievedContext;
        const contents: any[] = [];
        
        if (chatHistory && chatHistory.length > 0) {
          chatHistory.forEach((msg) => {
            contents.push({ role: 'user', parts: [{ text: msg.prompt }] });
            contents.push({ role: 'model', parts: [{ text: msg.content }] });
          });
        }
        contents.push({ role: 'user', parts: [{ text: currentPrompt }] });

        // 1. Generate Content
        const response = await this.aiService.generateRawContent(contents, systemInstruction);
        finalResult = response.text || '';
        totalPromptTokens += response.usage.promptTokens;
        totalCompletionTokens += response.usage.completionTokens;

        // 2. Self-Healing Loop Logic for Coder & Security SAST Audit
        if (agentType === 'code-generator') {
          const reviewerInstruction =
            (await this.aiService.getSystemInstruction('reviewer')) +
            '\n\nCRITICAL SECURITY GUARDRAILS (SAST):\n' +
            'You must act as an Application Security (AppSec) Expert. Audit the code against OWASP Top 10 vulnerabilities.\n' +
            'If the code contains ANY of the following, you MUST fail it:\n' +
            '- Hardcoded credentials, secrets, or API keys\n' +
            '- Potential SQL Injection or NoSQL Injection vulnerabilities\n' +
            '- Unsafe use of dangerouslySetInnerHTML or eval() (XSS risk)\n' +
            '- Missing input validation or sanitization\n' +
            '\nOutput STRICTLY valid JSON ONLY: {"status": "pass"|"fail", "feedback": "reason"}';
          
          const reviewPrompt = `Review this code for critical syntax or logic errors:\n\n${finalResult}\n\nOutput ONLY valid JSON.`;
          
          const reviewContents = [{ role: 'user', parts: [{ text: reviewPrompt }] }];
          const reviewResponse = await this.aiService.generateRawContent(reviewContents, reviewerInstruction);

          totalPromptTokens += reviewResponse.usage.promptTokens;
          totalCompletionTokens += reviewResponse.usage.completionTokens;

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
            console.log('[Self-Healing] Failed to parse reviewer JSON, proceeding anyway.');
          }
        }

        break; // Passed review or not a code-generator
      } catch (error: any) {
        console.error('AI Generation Error:', error);
        throw new InternalServerErrorException('AI Generation failed: ' + error.message);
      }
    }

    return {
      text: finalResult,
      ragCitations,
      usage: {
        promptTokens: totalPromptTokens,
        completionTokens: totalCompletionTokens,
        totalTokens: totalPromptTokens + totalCompletionTokens,
      },
    };
  }
}
