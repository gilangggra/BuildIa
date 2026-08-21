import { Module } from '@nestjs/common';
import { AgentsController } from './agents.controller';
import { AgentsService } from './agents.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [SupabaseModule, AuthModule], // AuthModule provides SupabaseGuard
  controllers: [AgentsController],
  providers: [AgentsService],
})
export class AgentsModule {}
