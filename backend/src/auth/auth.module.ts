import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { SupabaseGuard } from './supabase.guard';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    SupabaseModule,
  ],
  providers: [JwtStrategy, SupabaseGuard],
  exports: [PassportModule, SupabaseGuard],
})
export class AuthModule {}
