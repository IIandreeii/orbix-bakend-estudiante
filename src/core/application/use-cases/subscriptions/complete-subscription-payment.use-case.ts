import { NotFoundDomainException } from '../../../domain/exceptions/domain.exception';
import type {
  IPaymentGateway,
  PaymentAuthorizationResponse,
} from '../../services/payment-gateway.interface';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import type {
  ISubscriptionRepository,
  ISubscriptionPaymentRepository,
} from '../../../domain/repositories/subscription.repository.interface';
import {
  Subscription,
  PlanType,
  SubscriptionStatus,
} from '../../../domain/entities/subscription.entity';
import { v4 as uuidv4 } from 'uuid';

export interface CompleteSubscriptionPaymentRequest {
  userId?: string;
  tokenId: string;
  purchaseNumber: string;
  planType?: PlanType;
  amount?: number;
  currency?: string;
}

export class CompleteSubscriptionPaymentUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly subscriptionRepository: ISubscriptionRepository,
    private readonly paymentRepository: ISubscriptionPaymentRepository,
    private readonly paymentGateway: IPaymentGateway,
  ) {}

  async execute(
    request: CompleteSubscriptionPaymentRequest,
  ): Promise<PaymentAuthorizationResponse> {
    let userId = request.userId;
    let planType = request.planType;
    let amount = request.amount;
    const currency = request.currency || 'PEN';
    let subscriptionId = '';

    if (!userId || !planType || !amount) {
      const paymentRecord = await this.paymentRepository.findByPurchaseNumber(
        request.purchaseNumber,
      );

      if (!paymentRecord) {
        throw new NotFoundDomainException('Sesión de pago no encontrada');
      }

      const sub = await this.subscriptionRepository.findById(
        paymentRecord.subscriptionId,
      );
      if (!sub)
        throw new NotFoundDomainException(
          'Suscripción no encontrada para el pago',
        );

      userId = userId || sub.userId;
      planType = planType || paymentRecord.planType || sub.planType;
      amount = amount || Number(paymentRecord.amount);
      subscriptionId = sub.id;
    }

    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundDomainException('Usuario no encontrado');

    const response = await this.paymentGateway.authorizePayment(
      request.tokenId,
      request.purchaseNumber,
      amount,
      currency,
      user,
    );

    if (!response.success) {
      return response;
    }

    let subscription = await this.subscriptionRepository.findByUserId(user.id);

    const now = new Date();
    let newEndDate: Date;

    const PLAN_PRICES: Record<PlanType, number> = {
      [PlanType.TRIAL]: 0,
      [PlanType.BASIC]: 209.0,
      [PlanType.ADVANCED]: 349.0,
    };

    const newPlanPrice = PLAN_PRICES[planType] || 0;
    const newDailyPrice = newPlanPrice / 30;

    if (
      subscription &&
      subscription.status === SubscriptionStatus.ACTIVE &&
      !subscription.isExpired()
    ) {
      const remainingTimeMillis =
        subscription.endDate.getTime() - now.getTime();
      const remainingDays = Math.max(
        0,
        remainingTimeMillis / (24 * 60 * 60 * 1000),
      );

      const oldPlanPrice = PLAN_PRICES[subscription.planType] || 0;
      const oldDailyPrice = oldPlanPrice / 30;
      const creditAmount = remainingDays * oldDailyPrice;

      const totalValue = creditAmount + newPlanPrice;

      const totalDaysToAdd = totalValue / newDailyPrice;

      newEndDate = new Date();
      newEndDate.setTime(now.getTime() + totalDaysToAdd * 24 * 60 * 60 * 1000);
    } else {
      newEndDate = new Date();
      newEndDate.setDate(now.getDate() + 30);
    }

    const limits = Subscription.getLimitsForPlan(planType);

    subscription = Subscription.create({
      id: subscription?.id || subscriptionId || uuidv4(),
      userId: user.id,
      planType: planType,
      status: SubscriptionStatus.ACTIVE,
      startDate: now,
      endDate: newEndDate,
      ...limits,
      createdAt: subscription?.toJSON().createdAt || new Date(),
      updatedAt: new Date(),
    });

    await this.subscriptionRepository.save(subscription);

    const existingPayment = await this.paymentRepository.findByPurchaseNumber(
      request.purchaseNumber,
    );
    if (existingPayment) {
      await this.paymentRepository.updateStatus(
        existingPayment.id,
        'PAID',
        response.transactionId,
      );
    }

    return response;
  }
}
