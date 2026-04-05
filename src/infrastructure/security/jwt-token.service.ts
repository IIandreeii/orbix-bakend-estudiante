import { ITokenService } from '../../core/application/services/security.service.interface';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import type { JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';
import type { StringValue } from 'ms';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtTokenService implements ITokenService {
  constructor(private readonly jwtService: NestJwtService) {}

  async generate(
    payload: Record<string, unknown>,
    expiresIn?: string,
    secret?: string,
  ): Promise<string> {
    const options: JwtSignOptions = {
      expiresIn: (expiresIn || '7d') as StringValue,
    };
    if (secret) {
      options.secret = secret;
    }
    return this.jwtService.signAsync(payload, options);
  }

  async verify<TPayload extends Record<string, unknown>>(
    token: string,
    options?: JwtVerifyOptions,
  ): Promise<TPayload> {
    return this.jwtService.verifyAsync(token, options);
  }
}
