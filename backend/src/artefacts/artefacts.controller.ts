import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ArtefactsService } from './artefacts.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('v1/projects/:projectId/artefacts')
export class ArtefactsController {
  constructor(private readonly artefactsService: ArtefactsService) {}

  @Get()
  findAll(@Param('projectId') projectId: string) {
    return this.artefactsService.findAll(projectId);
  }

  @Post()
  generate(@Param('projectId') projectId: string, @Body() generateDto: any) {
    // Expected generateDto: { type: string, agentType: string, prompt: string }
    return this.artefactsService.generate(projectId, generateDto);
  }

  @Get(':id')
  findOne(@Param('projectId') projectId: string, @Param('id') id: string) {
    return this.artefactsService.findOne(projectId, id);
  }

  @Put(':id')
  update(@Param('projectId') projectId: string, @Param('id') id: string, @Body() updateDto: any) {
    return this.artefactsService.update(projectId, id, updateDto);
  }
}
