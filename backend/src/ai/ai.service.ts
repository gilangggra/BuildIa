import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';
import * as path from 'path';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class AiService {
  private ai: GoogleGenAI;

  constructor(
    private configService: ConfigService,
    private supabaseService: SupabaseService,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is missing in .env!');
    }
    // Inisialisasi client Google Gen AI
    this.ai = new GoogleGenAI({ apiKey: apiKey || 'dummy_key_for_build' });
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.ai.models.embedContent({
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

  async generateRawContent(contents: any[], systemInstruction: string) {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents,
        config: { systemInstruction: systemInstruction },
      });
      
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
