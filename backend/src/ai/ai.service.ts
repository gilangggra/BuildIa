import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';
import * as path from 'path';
import { SupabaseService } from '../supabase/supabase.service';

const AI_CALL_TIMEOUT_MS = 90_000; // 90 seconds — prevents hanging requests

@Injectable()
export class AiService {
  // Cache AI clients per API key to avoid creating a new instance per request
  private readonly clientCache = new Map<string, GoogleGenAI>();

  constructor(
    private configService: ConfigService,
    private supabaseService: SupabaseService,
  ) {}

  async getUserApiKey(userId?: string): Promise<string> {
    if (userId) {
      try {
        const { data } = await this.supabaseService.getClient().from('profiles').select('preferences').eq('id', userId).single();
        if (data?.preferences?.geminiToken) {
          return data.preferences.geminiToken;
        }
      } catch (e) {
        console.warn('Failed to fetch user geminiToken, falling back to server key');
      }
    }
    const envKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!envKey) console.warn('GEMINI_API_KEY is missing in .env!');
    return envKey || 'dummy_key_for_build';
  }

  private getAiClient(apiKey: string): GoogleGenAI {
    // Return cached client to avoid creating a new SDK instance per request
    if (!this.clientCache.has(apiKey)) {
      this.clientCache.set(apiKey, new GoogleGenAI({ apiKey }));
    }
    return this.clientCache.get(apiKey)!;
  }

  async generateEmbedding(text: string, userId?: string): Promise<number[]> {
    try {
      const apiKey = await this.getUserApiKey(userId);
      const ai = this.getAiClient(apiKey);
      const response = await ai.models.embedContent({
        model: 'embedding-001',
        contents: text,
      });
      return response.embeddings?.[0]?.values || [];
    } catch (e) {
      console.error('Failed to generate embedding', e);
      return [];
    }
  }

  async getSystemInstruction(agentType: string): Promise<string> {
    try {
      const supabase = this.supabaseService.getClient();
      const { data } = await supabase.from('agents').select('system_prompt').eq('id', agentType).single();
      if (data && data.system_prompt) {
        return data.system_prompt;
      }
    } catch (e) {
      console.warn(`Failed to fetch system prompt for ${agentType} from DB, falling back to file system.`);
    }

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

  async generateRawContent(contents: any[], systemInstruction: string, userId?: string) {
    try {
      const apiKey = await this.getUserApiKey(userId);
      const ai = this.getAiClient(apiKey);

      // Wrap in a timeout to prevent indefinitely hanging requests
      const aiCallPromise = ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents,
        config: { systemInstruction: systemInstruction },
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error(`AI call timed out after ${AI_CALL_TIMEOUT_MS / 1000}s`)),
          AI_CALL_TIMEOUT_MS,
        ),
      );

      const response = await Promise.race([aiCallPromise, timeoutPromise]);

      return {
        text: response.text || '',
        usage: {
          promptTokens: response.usageMetadata?.promptTokenCount || 0,
          completionTokens: response.usageMetadata?.candidatesTokenCount || 0,
        }
      };
    } catch (e: any) {
      console.error('generateRawContent Error:', e);
      throw new InternalServerErrorException('AI Generation failed: ' + e.message);
    }
  }
}
