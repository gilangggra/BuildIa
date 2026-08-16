import { Body, Controller, Get, Post } from '@nestjs/common';
import { AgentsService } from './agents.service';

@Controller('v1/agents')
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Get()
  async findAll() {
    return this.agentsService.findAll();
  }

  @Post()
  async create(@Body() payload: any) {
    return this.agentsService.create(payload);
  }
}
