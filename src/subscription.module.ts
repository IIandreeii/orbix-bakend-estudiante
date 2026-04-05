import { Module } from '@nestjs/common';
import { SubscriptionController } from './interface/http/controllers/subscription.controller';
import { CreatePaymentSessionUseCase } from './core/application/use-cases/subscriptions/create-payment-session.use-case';
import { CompleteSubscriptionPaymentUseCase } from './core/application/use-cases/subscriptions/complete-subscription-payment.use-case';
import { PrismaModule } from './infrastructure/persistence/prisma/prisma.module';
import { PaymentsModule } from './infrastructure/payments/modules/payments.module';

import { ConfigModule } from '@nestjs/config';
import { I_LOGGER } from './core/application/services/logger.interface';
import { NestLoggerAdapter } from './infrastructure/logging/nest-logger.adapter';

import { CheckExpiredSubscriptionsUseCase } from './core/application/use-cases/subscriptions/check-expired-subscriptions.use-case';
import { SubscriptionCronService } from './infrastructure/scheduler/subscription-cron.service';
import type { IUserRepository } from './core/domain/repositories/user.repository.interface';
import type {
  ISubscriptionPaymentRepository,
  ISubscriptionRepository,
} from './core/domain/repositories/subscription.repository.interface';
import type { IPaymentGateway } from './core/application/services/payment-gateway.interface';
import type { ILogger } from './core/application/services/logger.interface';

@Module({
  imports: [PrismaModule, PaymentsModule, ConfigModule],
  controllers: [SubscriptionController],
  providers: [
    { provide: I_LOGGER, useClass: NestLoggerAdapter },
    {
      provide: CreatePaymentSessionUseCase,
      inject: [
        'IUserRepository',
        'ISubscriptionRepository',
        'ISubscriptionPaymentRepository',
        'IPaymentGateway',
        I_LOGGER,
      ],
      useFactory: (
        userRepo: IUserRepository,
        subscriptionRepo: ISubscriptionRepository,
        paymentRepo: ISubscriptionPaymentRepository,
        paymentGateway: IPaymentGateway,
        logger: ILogger,
      ) =>
        new CreatePaymentSessionUseCase(
          userRepo,
          subscriptionRepo,
          paymentRepo,
          paymentGateway,
          logger,
        ),
    },
    {
      provide: CompleteSubscriptionPaymentUseCase,
      inject: [
        'IUserRepository',
        'ISubscriptionRepository',
        'ISubscriptionPaymentRepository',
        'IPaymentGateway',
      ],
      useFactory: (
        userRepo: IUserRepository,
        subscriptionRepo: ISubscriptionRepository,
        paymentRepo: ISubscriptionPaymentRepository,
        paymentGateway: IPaymentGateway,
      ) =>
        new CompleteSubscriptionPaymentUseCase(
          userRepo,
          subscriptionRepo,
          paymentRepo,
          paymentGateway,
        ),
    },
    {
      provide: CheckExpiredSubscriptionsUseCase,
      inject: ['ISubscriptionRepository'],
      useFactory: (subscriptionRepo: ISubscriptionRepository) =>
        new CheckExpiredSubscriptionsUseCase(subscriptionRepo),
    },
    SubscriptionCronService,
  ],
})
export class SubscriptionModule {}
