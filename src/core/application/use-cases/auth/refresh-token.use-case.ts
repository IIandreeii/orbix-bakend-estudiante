import {
  ITokenService,
  IHashService,
} from '../../services/security.service.interface';
import { IRefreshTokenRepository } from '../../../domain/repositories/refresh-token.repository.interface';
import { UnauthorizedDomainException } from '../../../domain/exceptions/domain.exception';
import type { IAppConfig } from '../../services/app-config.interface';

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload extends Record<string, unknown> {
  sub: string;
  email?: string;
  role?: string;
  type: 'access' | 'refresh';
}

export class RefreshTokenUseCase {
  constructor(
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly tokenService: ITokenService,
    private readonly hashService: IHashService,
    private readonly configService: IAppConfig,
  ) {}

  async execute(token: string): Promise<RefreshResponse> {
    if (!token) {
      throw new UnauthorizedDomainException('Se requiere un refresh token');
    }

    try {
      const payload = await this.tokenService.verify<JwtPayload>(token, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      if (payload.type !== 'refresh') {
        throw new UnauthorizedDomainException('Tipo de token inválido');
      }

      const userTokens = await this.refreshTokenRepository.findByUserId(
        payload.sub,
      );
      type StoredToken = (typeof userTokens)[0];
      let validStoredToken: StoredToken | null = null;
      for (const t of userTokens) {
        const isValid = await this.hashService.compare(token, t.token);
        if (isValid && !t.isRevoked && new Date() < t.expiresAt) {
          validStoredToken = t;
          break;
        }
      }

      if (!validStoredToken) {
        throw new UnauthorizedDomainException('Sesión expirada o revocada');
      }

      const accessToken = await this.tokenService.generate(
        {
          sub: validStoredToken.user.id,
          email: validStoredToken.user.email,
          role: validStoredToken.user.role,
          type: 'access',
        },
        '15m',
        this.configService.get('JWT_SECRET'),
      );

      const newRefreshToken = await this.tokenService.generate(
        {
          sub: validStoredToken.user.id,
          type: 'refresh',
        },
        '7d',
        this.configService.get('JWT_REFRESH_SECRET'),
      );

      const hashedNewRefreshToken =
        await this.hashService.hash(newRefreshToken);

      await this.refreshTokenRepository.revokeAndRotate(
        validStoredToken.token,
        {
          token: hashedNewRefreshToken,
          userId: validStoredToken.user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      );

      return {
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      if (error instanceof UnauthorizedDomainException) throw error;
      throw new UnauthorizedDomainException(
        'Refresh token inválido o expirado',
      );
    }
  }
}
