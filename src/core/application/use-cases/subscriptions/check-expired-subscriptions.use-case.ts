import type { ISubscriptionRepository } from '../../../domain/repositories/subscription.repository.interface';

export class CheckExpiredSubscriptionsUseCase {
  constructor(
    private readonly subscriptionRepository: ISubscriptionRepository,
  ) {}

  async execute(): Promise<number> {
    const now = new Date();

    const expiredSubscriptions =
      await this.subscriptionRepository.findActiveExpired(now);

    let count = 0;
    for (const sub of expiredSubscriptions) {
      sub.cancel();
      await this.subscriptionRepository.save(sub);
      count++;
    }

    return count;
  }
}
