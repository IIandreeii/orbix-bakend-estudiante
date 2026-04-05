import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaUserRepository } from './repositories/prisma-user.repository';
import { PrismaAuthRepository } from './repositories/prisma-auth.repository';
import { PrismaRefreshTokenRepository } from './repositories/prisma-refresh-token.repository';
import { PrismaVerificationTokenRepository } from './repositories/prisma-verification-token.repository';
import { PrismaPasswordResetTokenRepository } from './repositories/prisma-password-reset-token.repository';
import { PrismaSubscriptionRepository } from './repositories/prisma-subscription.repository';
import { PrismaSubscriptionPaymentRepository } from './repositories/prisma-subscription-payment.repository';
import { I_AUTH_REPOSITORY } from '../../../core/domain/repositories/auth.repository.interface';
import { I_REFRESH_TOKEN_REPOSITORY } from '../../../core/domain/repositories/refresh-token.repository.interface';
import { I_VERIFICATION_TOKEN_REPOSITORY } from '../../../core/domain/repositories/verification-token.repository.interface';
import { I_PASSWORD_RESET_TOKEN_REPOSITORY } from '../../../core/domain/repositories/password-reset-token.repository.interface';

@Global()
@Module({
  providers: [
    PrismaService,
    {
      provide: 'IUserRepository',
      useClass: PrismaUserRepository,
    },
    {
      provide: I_AUTH_REPOSITORY,
      useClass: PrismaAuthRepository,
    },
    {
      provide: I_REFRESH_TOKEN_REPOSITORY,
      useClass: PrismaRefreshTokenRepository,
    },
    {
      provide: I_VERIFICATION_TOKEN_REPOSITORY,
      useClass: PrismaVerificationTokenRepository,
    },
    {
      provide: I_PASSWORD_RESET_TOKEN_REPOSITORY,
      useClass: PrismaPasswordResetTokenRepository,
    },
    {
      provide: 'ISubscriptionRepository',
      useClass: PrismaSubscriptionRepository,
    },
    {
      provide: 'ISubscriptionPaymentRepository',
      useClass: PrismaSubscriptionPaymentRepository,
    },
  ],
  exports: [
    PrismaService,
    'IUserRepository',
    I_AUTH_REPOSITORY,
    I_REFRESH_TOKEN_REPOSITORY,
    I_VERIFICATION_TOKEN_REPOSITORY,
    I_PASSWORD_RESET_TOKEN_REPOSITORY,
    'ISubscriptionRepository',
    'ISubscriptionPaymentRepository',
  ],
})
export class PrismaModule {}
