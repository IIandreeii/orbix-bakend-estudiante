import {
  ITokenService,
  IHashService,
} from '../../services/security.service.interface';
import { IRefreshTokenRepository } from '../../../domain/repositories/refresh-token.repository.interface';
import type { IAppConfig } from '../../services/app-config.interface';
import type { ILogger } from '../../services/logger.interface';

export class LogoutUseCase {
  constructor(
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly tokenService: ITokenService,
    private readonly hashService: IHashService,
    private readonly configService: IAppConfig,
    private readonly logger: ILogger,
  ) {}

  async execute(refreshToken: string): Promise<void> {
    if (!refreshToken) return;

    try {
      const payload = await this.tokenService.verify<{ sub?: string }>(
        refreshToken,
        {
          ignoreExpiration: true,
          secret: this.configService.get('JWT_REFRESH_SECRET'),
        },
      );

      if (payload?.sub) {
        const userTokens = await this.refreshTokenRepository.findByUserId(
          payload.sub,
        );

        for (const t of userTokens) {
          const isValid = await this.hashService.compare(refreshToken, t.token);
          if (isValid) {
            await this.refreshTokenRepository.deleteByToken(t.token);
            break;
          }
        }
      }
    } catch (error) {
      this.logger.error(
        `Error during logout token invalidation: ${(error as Error).message}`,
      );
    }
  }
}
