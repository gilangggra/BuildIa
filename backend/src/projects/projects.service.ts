import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class ProjectsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll(userId: string) {
    const { data, error } = await this.supabaseService.getClient()
      .from('projects')
      .select('*')
      .eq('owner_id', userId); // For now, only fetch owned projects (RLS will also filter)

    if (error) {
      throw new InternalServerErrorException(error.message);
    }
    return data;
  }

  async create(userId: string, createProjectDto: any) {
    const { data, error } = await this.supabaseService.getClient()
      .from('projects')
      .insert({
        ...createProjectDto,
        owner_id: userId,
      })
      .select()
      .single();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }
    return data;
  }

  async findOne(userId: string, id: string) {
    const { data, error } = await this.supabaseService.getClient()
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException('Project not found');
    }
    return data;
  }
}
