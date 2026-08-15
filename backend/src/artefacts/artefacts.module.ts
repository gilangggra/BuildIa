import { Module } from '@nestjs/common';
import { ArtefactsController } from './artefacts.controller';
import { ArtefactsService } from './artefacts.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { AiModule } from '../ai/ai.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [SupabaseModule, AiModule, AuthModule],
  controllers: [ArtefactsController],
  providers: [ArtefactsService],
})
export class ArtefactsModule {}
