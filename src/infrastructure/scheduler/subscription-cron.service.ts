import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CheckExpiredSubscriptionsUseCase } from '../../core/application/use-cases/subscriptions/check-expired-subscriptions.use-case';

@Injectable()
export class SubscriptionCronService {
  private readonly logger = new Logger(SubscriptionCronService.name);

  constructor(
    private readonly checkExpiredUseCase: CheckExpiredSubscriptionsUseCase,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleSubscriptionExpiration() {
    this.logger.debug('Iniciando verificación de suscripciones vencidas...');
    try {
      const count = await this.checkExpiredUseCase.execute();
      if (count > 0) {
        this.logger.log(`Se han marcado ${count} suscripciones como vencidas.`);
      }
    } catch (error) {
      this.logger.error('Error al verificar suscripciones vencidas:', error);
    }
  }
}
