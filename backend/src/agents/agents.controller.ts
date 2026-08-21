import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AgentsService } from './agents.service';
import { SupabaseGuard } from '../auth/supabase.guard';
import { CreateAgentDto } from './dto/agents.dto';

// All agent endpoints require authentication — agents are user-scoped resources
@UseGuards(SupabaseGuard)
@Controller('v1/agents')
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Get()
  async findAll() {
    return this.agentsService.findAll();
  }

  @Post()
  async create(@Body() payload: CreateAgentDto) {
    return this.agentsService.create(payload);
  }
}
