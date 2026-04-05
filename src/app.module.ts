import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './infrastructure/persistence/prisma/prisma.module';
import { SecurityModule } from './infrastructure/security/security.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { PaymentsModule } from './infrastructure/payments/modules/payments.module';
import { SubscriptionModule } from './subscription.module';
import { AppConfigModule } from './config.module';
import { MessagingModule } from './messaging.module';
import { LabelModule } from './label.module';
import { UserModule } from './user.module';
import { TutorialSectionModule } from './tutorial.module';

import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get<number>('THROTTLE_TTL') || 60000,
          limit: config.get<number>('THROTTLE_LIMIT') || 20,
        },
      ],
    }),
    PrismaModule,
    SecurityModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.get('MAIL_HOST'),
          port: config.get('MAIL_PORT'),
          secure: config.get('MAIL_SECURE') === 'true',
          auth: {
            user: config.get('MAIL_USER'),
            pass: config.get('MAIL_PASS'),
          },
        },
        defaults: {
          from: `"Orbix Support" <${config.get('MAIL_FROM')}>`,
        },
      }),
    }),
    AuthModule,
    PaymentsModule,
    SubscriptionModule,
    AppConfigModule,
    MessagingModule,
    LabelModule,
    UserModule,
    TutorialSectionModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
