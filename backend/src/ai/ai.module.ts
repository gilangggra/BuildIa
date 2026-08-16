import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiOrchestratorService } from './ai-orchestrator.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  providers: [AiService, AiOrchestratorService],
  exports: [AiService, AiOrchestratorService],
})
export class AiModule {}
