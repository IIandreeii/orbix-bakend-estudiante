import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import type {
  IHashService,
  ITokenService,
} from '../../services/security.service.interface';
import type { IAuthRepository } from '../../../domain/repositories/auth.repository.interface';
import type { IRefreshTokenRepository } from '../../../domain/repositories/refresh-token.repository.interface';
import {
  ForbiddenDomainException,
  UnauthorizedDomainException,
} from '../../../domain/exceptions/domain.exception';
import type { ISubscriptionRepository } from '../../../domain/repositories/subscription.repository.interface';
import { SubscriptionStatus } from '../../../domain/entities/subscription.entity';

import type { IAppConfig } from '../../services/app-config.interface';

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  subscription: {
    plan: string;
    isActive: boolean;
    endDate: Date;
    whatsappLimit: number;
    advisorsLimit: number;
    shopsLimit: number;
  } | null;
}

export class LoginUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly authRepository: IAuthRepository,
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly hashService: IHashService,
    private readonly tokenService: ITokenService,
    private readonly configService: IAppConfig,
    private readonly subscriptionRepository: ISubscriptionRepository,
  ) {}

  async execute(request: LoginRequest): Promise<LoginResponse> {
    const user = await this.userRepository.findByEmail(request.email);

    if (!user) {
      throw new UnauthorizedDomainException('Credenciales inválidas');
    }

    if (!user.isActive) {
      throw new ForbiddenDomainException(
        'Tu cuenta aún no ha sido verificada. Por favor, revisa tu correo.',
      );
    }

    const auth = await this.authRepository.findCredentialByUserId(
      user.id,
      'PASSWORD',
    );

    if (!auth || !auth.credential) {
      throw new UnauthorizedDomainException('Credenciales inválidas');
    }

    const isPasswordValid = await this.hashService.compare(
      request.password || '',
      auth.credential,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedDomainException('Credenciales inválidas');
    }

    const accessToken = await this.tokenService.generate(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        type: 'access',
      },
      '15m',
      this.configService.get('JWT_SECRET'),
    );

    const refreshToken = await this.tokenService.generate(
      {
        sub: user.id,
        type: 'refresh',
      },
      '7d',
      this.configService.get('JWT_REFRESH_SECRET'),
    );

    const hashedRefreshToken = await this.hashService.hash(refreshToken);

    await this.refreshTokenRepository.create({
      token: hashedRefreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    const targetUserId = user.parentId || user.id;
    const subscription = await this.subscriptionRepository.findByUserId(
      targetUserId,
    );

    const userJson = user.toJSON();

    return {
      accessToken,
      refreshToken,
      user: {
        id: userJson.id,
        email: userJson.email,
        firstName: userJson.firstName,
        lastName: userJson.lastName,
        role: userJson.role,
      },
      subscription: subscription
        ? {
            plan: subscription.planType,
            isActive:
              subscription.status === SubscriptionStatus.ACTIVE &&
              !subscription.isExpired(),
            endDate: subscription.endDate,
            whatsappLimit: subscription.whatsappLimit,
            advisorsLimit: subscription.advisorsLimit,
            shopsLimit: subscription.shopsLimit,
          }
        : null,
    };
  }
}
