import { NotFoundDomainException } from '../../../domain/exceptions/domain.exception';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import type { ISubscriptionRepository } from '../../../domain/repositories/subscription.repository.interface';
import { SubscriptionStatus } from '../../../domain/entities/subscription.entity';

export class GetProfileUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly subscriptionRepository: ISubscriptionRepository,
  ) {}

  async execute(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundDomainException('Usuario no encontrado');
    }

    const targetUserId = user.parentId || userId;
    const subscription = await this.subscriptionRepository.findByUserId(targetUserId);

    return {
      user: user.toJSON(),
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
