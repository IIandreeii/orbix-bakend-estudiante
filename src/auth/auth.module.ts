import { Module } from '@nestjs/common';
import { AuthController } from '../interface/http/controllers/auth.controller';
import { LoginUseCase } from '../core/application/use-cases/auth/login.use-case';
import { RegisterUseCase } from '../core/application/use-cases/auth/register.use-case';
import { RefreshTokenUseCase } from '../core/application/use-cases/auth/refresh-token.use-case';
import { LogoutUseCase } from '../core/application/use-cases/auth/logout.use-case';
import { ForgotPasswordUseCase } from '../core/application/use-cases/auth/forgot-password.use-case';
import { ResetPasswordUseCase } from '../core/application/use-cases/auth/reset-password.use-case';
import {
  VerifyEmailUseCase,
  SendVerificationEmailUseCase,
} from '../core/application/use-cases/auth/verify-email.use-case';
import { ResendVerificationUseCase } from '../core/application/use-cases/auth/resend-verification.use-case';
import { GetProfileUseCase } from '../core/application/use-cases/auth/get-profile.use-case';
import { UpdateProfileUseCase } from '../core/application/use-cases/auth/update-profile.use-case';
import { ListPaymentsUseCase } from '../core/application/use-cases/auth/list-payments.use-case';
import { AdminController } from '../interface/http/controllers/admin.controller';

import { PrismaModule } from '../infrastructure/persistence/prisma/prisma.module';
import { SecurityModule } from '../infrastructure/security/security.module';
import { I_AUTH_REPOSITORY } from '../core/domain/repositories/auth.repository.interface';
import { I_REFRESH_TOKEN_REPOSITORY } from '../core/domain/repositories/refresh-token.repository.interface';
import { I_VERIFICATION_TOKEN_REPOSITORY } from '../core/domain/repositories/verification-token.repository.interface';
import { I_PASSWORD_RESET_TOKEN_REPOSITORY } from '../core/domain/repositories/password-reset-token.repository.interface';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule } from '@nestjs/config';
import { MailerAdapter } from '../infrastructure/email/mailer.adapter';
import { I_MAILER } from '../core/application/services/mailer.interface';
import { I_APP_CONFIG } from '../core/application/services/app-config.interface';
import { AppConfigService } from '../infrastructure/config/app-config.service';
import { I_LOGGER } from '../core/application/services/logger.interface';
import { NestLoggerAdapter } from '../infrastructure/logging/nest-logger.adapter';
import type { IUserRepository } from '../core/domain/repositories/user.repository.interface';
import type { IAuthRepository } from '../core/domain/repositories/auth.repository.interface';
import type { IRefreshTokenRepository } from '../core/domain/repositories/refresh-token.repository.interface';
import type { IPasswordResetTokenRepository } from '../core/domain/repositories/password-reset-token.repository.interface';
import type { IVerificationTokenRepository } from '../core/domain/repositories/verification-token.repository.interface';
import type {
  IHashService,
  ITokenService,
} from '../core/application/services/security.service.interface';
import type { IAppConfig } from '../core/application/services/app-config.interface';
import type { ISubscriptionRepository } from '../core/domain/repositories/subscription.repository.interface';
import type { ISubscriptionPaymentRepository } from '../core/domain/repositories/subscription.repository.interface';
import type { IMailer } from '../core/application/services/mailer.interface';
import type { ILogger } from '../core/application/services/logger.interface';

@Module({
  imports: [PrismaModule, SecurityModule, MailerModule, ConfigModule],
  controllers: [AuthController, AdminController],
  providers: [
    { provide: I_APP_CONFIG, useClass: AppConfigService },
    { provide: I_MAILER, useClass: MailerAdapter },
    { provide: I_LOGGER, useClass: NestLoggerAdapter },
    {
      provide: LoginUseCase,
      inject: [
        'IUserRepository',
        I_AUTH_REPOSITORY,
        I_REFRESH_TOKEN_REPOSITORY,
        'IHashService',
        'ITokenService',
        I_APP_CONFIG,
        'ISubscriptionRepository',
      ],
      useFactory: (
        repo: IUserRepository,
        authRepo: IAuthRepository,
        refreshRepo: IRefreshTokenRepository,
        hash: IHashService,
        token: ITokenService,
        config: IAppConfig,
        subscriptionRepo: ISubscriptionRepository,
      ) =>
        new LoginUseCase(
          repo,
          authRepo,
          refreshRepo,
          hash,
          token,
          config,
          subscriptionRepo,
        ),
    },
    {
      provide: RegisterUseCase,
      inject: [
        'IUserRepository',
        'IHashService',
        SendVerificationEmailUseCase,
        'ISubscriptionRepository',
      ],
      useFactory: (
        repo: IUserRepository,
        hash: IHashService,
        verifyEmail: SendVerificationEmailUseCase,
        subscriptionRepo: ISubscriptionRepository,
      ) => new RegisterUseCase(repo, hash, verifyEmail, subscriptionRepo),
    },
    {
      provide: RefreshTokenUseCase,
      inject: [
        I_REFRESH_TOKEN_REPOSITORY,
        'ITokenService',
        'IHashService',
        I_APP_CONFIG,
      ],
      useFactory: (
        refreshRepo: IRefreshTokenRepository,
        token: ITokenService,
        hash: IHashService,
        config: IAppConfig,
      ) => new RefreshTokenUseCase(refreshRepo, token, hash, config),
    },
    {
      provide: LogoutUseCase,
      inject: [
        I_REFRESH_TOKEN_REPOSITORY,
        'ITokenService',
        'IHashService',
        I_APP_CONFIG,
        I_LOGGER,
      ],
      useFactory: (
        refreshRepo: IRefreshTokenRepository,
        token: ITokenService,
        hash: IHashService,
        config: IAppConfig,
        logger: ILogger,
      ) => new LogoutUseCase(refreshRepo, token, hash, config, logger),
    },
    {
      provide: ForgotPasswordUseCase,
      inject: [
        'IUserRepository',
        I_PASSWORD_RESET_TOKEN_REPOSITORY,
        'IHashService',
        I_MAILER,
        I_APP_CONFIG,
      ],
      useFactory: (
        userRepo: IUserRepository,
        resetRepo: IPasswordResetTokenRepository,
        hash: IHashService,
        mailer: IMailer,
        config: IAppConfig,
      ) => new ForgotPasswordUseCase(userRepo, resetRepo, hash, mailer, config),
    },
    {
      provide: ResetPasswordUseCase,
      inject: [
        I_AUTH_REPOSITORY,
        I_REFRESH_TOKEN_REPOSITORY,
        I_PASSWORD_RESET_TOKEN_REPOSITORY,
        'IHashService',
      ],
      useFactory: (
        authRepo: IAuthRepository,
        refreshRepo: IRefreshTokenRepository,
        resetRepo: IPasswordResetTokenRepository,
        hash: IHashService,
      ) => new ResetPasswordUseCase(authRepo, refreshRepo, resetRepo, hash),
    },
    {
      provide: VerifyEmailUseCase,
      inject: [
        'IUserRepository',
        I_VERIFICATION_TOKEN_REPOSITORY,
        'IHashService',
      ],
      useFactory: (
        userRepo: IUserRepository,
        verifyRepo: IVerificationTokenRepository,
        hash: IHashService,
      ) => new VerifyEmailUseCase(userRepo, verifyRepo, hash),
    },
    {
      provide: SendVerificationEmailUseCase,
      inject: [
        I_VERIFICATION_TOKEN_REPOSITORY,
        'IHashService',
        I_MAILER,
        I_APP_CONFIG,
      ],
      useFactory: (
        verifyRepo: IVerificationTokenRepository,
        hash: IHashService,
        mailer: IMailer,
        config: IAppConfig,
      ) => new SendVerificationEmailUseCase(verifyRepo, hash, mailer, config),
    },
    {
      provide: ResendVerificationUseCase,
      inject: ['IUserRepository', SendVerificationEmailUseCase],
      useFactory: (
        userRepo: IUserRepository,
        sendEmail: SendVerificationEmailUseCase,
      ) => new ResendVerificationUseCase(userRepo, sendEmail),
    },
    {
      provide: GetProfileUseCase,
      inject: ['IUserRepository', 'ISubscriptionRepository'],
      useFactory: (
        userRepo: IUserRepository,
        subscriptionRepo: ISubscriptionRepository,
      ) => new GetProfileUseCase(userRepo, subscriptionRepo),
    },
    {
      provide: UpdateProfileUseCase,
      inject: ['IUserRepository'],
      useFactory: (userRepo: IUserRepository) =>
        new UpdateProfileUseCase(userRepo),
    },
    {
      provide: ListPaymentsUseCase,
      inject: ['ISubscriptionPaymentRepository'],
      useFactory: (paymentRepo: ISubscriptionPaymentRepository) =>
        new ListPaymentsUseCase(paymentRepo),
    },
  ],
})
export class AuthModule {}
