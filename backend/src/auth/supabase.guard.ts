import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class SupabaseGuard implements CanActivate {
  constructor(private readonly supabaseService: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('No authorization header found');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('No token found');
    }

    try {
      const supabase = this.supabaseService.getClient();
      if (!supabase) {
        throw new UnauthorizedException('Supabase client not initialized');
      }

      const { data, error } = await supabase.auth.getUser(token);

      if (error || !data.user) {
        throw new UnauthorizedException('Invalid or expired token');
      }

      // Attach user to request object (matches what passport-jwt did)
      request.user = {
        userId: data.user.id,
        email: data.user.email,
        role: data.user.role,
      };

      return true;
    } catch (err: any) {
      console.error('SupabaseGuard Error:', err);
      throw new UnauthorizedException(err.message || 'Authentication failed');
    }
  }
}
