import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class AgentsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll() {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('agents')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      throw new InternalServerErrorException(error.message);
    }
    return data;
  }

  async create(payload: any) {
    const id = payload.id || payload.label.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const { data, error } = await this.supabaseService
      .getClient()
      .from('agents')
      .insert({
        id,
        label: payload.label,
        description: payload.description,
        type: payload.type || 'code',
        icon_name: payload.icon_name || 'Bot',
        system_prompt: payload.system_prompt,
        is_system: false,
      })
      .select()
      .single();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }
    return data;
  }
}
