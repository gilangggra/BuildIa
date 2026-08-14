import { Module } from '@nestjs/common';
import { ArtefactsController } from './artefacts.controller';
import { ArtefactsService } from './artefacts.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [SupabaseModule, AiModule],
  controllers: [ArtefactsController],
  providers: [ArtefactsService]
})
export class ArtefactsModule {}
