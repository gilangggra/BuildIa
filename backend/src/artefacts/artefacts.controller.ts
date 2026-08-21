import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ArtefactsService } from './artefacts.service';
import { SupabaseGuard } from '../auth/supabase.guard';
import {
  GenerateArtefactDto,
  RefactorArtefactDto,
  MagicBuildDto,
  UpdateArtefactDto,
} from './dto/artefacts.dto';

@UseGuards(SupabaseGuard)
@Controller('v1/projects/:projectId/artefacts')
export class ArtefactsController {
  constructor(private readonly artefactsService: ArtefactsService) {}

  @Get()
  findAll(@Param('projectId') projectId: string) {
    return this.artefactsService.findAll(projectId);
  }

  @Post()
  generate(
    @Request() req,
    @Param('projectId') projectId: string,
    @Body() generateDto: GenerateArtefactDto,
  ) {
    return this.artefactsService.generate(projectId, generateDto, req.user.userId);
  }

  @Post('magic-build')
  magicBuild(
    @Request() req,
    @Param('projectId') projectId: string,
    @Body() dto: MagicBuildDto,
  ) {
    return this.artefactsService.magicBuild(projectId, dto.prompt, req.user.userId);
  }

  @Post(':id/refactor')
  refactor(
    @Request() req,
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Body() dto: RefactorArtefactDto,
  ) {
    return this.artefactsService.refactorArtefact(projectId, id, dto.prompt, req.user.userId);
  }

  @Get(':id')
  findOne(@Param('projectId') projectId: string, @Param('id') id: string) {
    return this.artefactsService.findOne(projectId, id);
  }

  @Put(':id')
  update(
    @Request() req,
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Body() updateDto: UpdateArtefactDto,
  ) {
    // Pass userId so RAG embedding uses the correct user's API key on approval
    return this.artefactsService.update(projectId, id, updateDto, req.user.userId);
  }

  @Delete(':id')
  remove(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
  ) {
    return this.artefactsService.remove(projectId, id);
  }
}
