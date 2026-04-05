import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import type { IUserRepository } from '../../../core/domain/repositories/user.repository.interface';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    @Inject('IUserRepository')
    private userRepository: IUserRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const cookies = request.cookies as Record<string, string | undefined>;
    const token = cookies['auth-token'];

    if (!token) {
      throw new UnauthorizedException('No token found');
    }

    try {
      const secret = this.configService.get<string>('JWT_SECRET');
      if (!secret) {
        throw new UnauthorizedException('JWT secret not configured');
      }
      const payload = await this.jwtService.verifyAsync<{ sub: string }>(
        token,
        { secret },
      );

      const user = await this.userRepository.findById(payload.sub);
      if (!user || user.isActive === false) {
        throw new UnauthorizedException('User inactive or not found');
      }

      request['user'] = {
        ...payload,
        email: user.email,
        role: user.role,
      };
    } catch (e) {
      if (e instanceof UnauthorizedException) throw e;
      throw new UnauthorizedException('Invalid token');
    }

    return true;
  }
}
