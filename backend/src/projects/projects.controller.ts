import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { SupabaseGuard } from '../auth/supabase.guard';
import { CreateProjectDto } from './dto/projects.dto';

@UseGuards(SupabaseGuard)
@Controller('v1/projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  findAll(@Request() req) {
    return this.projectsService.findAll(req.user.userId);
  }

  @Post()
  create(@Request() req, @Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(req.user.userId, createProjectDto);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.projectsService.findOne(req.user.userId, id);
  }

  @Post(':id/deploy/github')
  deployToGithub(@Request() req, @Param('id') id: string) {
    return this.projectsService.deployToGithub(req.user.userId, id);
  }
}
