import { NotFoundDomainException } from '../../../domain/exceptions/domain.exception';
import type {
  IPaymentGateway,
  PaymentSessionResponse,
} from '../../services/payment-gateway.interface';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import type {
  ISubscriptionRepository,
  ISubscriptionPaymentRepository,
} from '../../../domain/repositories/subscription.repository.interface';
import {
  PlanType,
  Subscription,
  SubscriptionStatus,
} from '../../../domain/entities/subscription.entity';
import { v4 as uuidv4 } from 'uuid';
import type { ILogger } from '../../services/logger.interface';

export interface CreatePaymentSessionRequest {
  userId: string;
  planType?: PlanType;
}

export class CreatePaymentSessionUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly subscriptionRepository: ISubscriptionRepository,
    private readonly paymentRepository: ISubscriptionPaymentRepository,
    private readonly paymentGateway: IPaymentGateway,
    private readonly logger: ILogger,
  ) {}

  async execute(
    request: CreatePaymentSessionRequest,
  ): Promise<PaymentSessionResponse> {
    const user = await this.userRepository.findById(request.userId);
    if (!user) {
      throw new NotFoundDomainException('Usuario no encontrado');
    }

    let subscription = await this.subscriptionRepository.findByUserId(user.id);
    let finalPlan: PlanType;

    if (request.planType) {
      finalPlan = request.planType;
    } else if (subscription && subscription.planType !== PlanType.TRIAL) {
      finalPlan = subscription.planType;
    } else {
      finalPlan = PlanType.BASIC;
    }

    this.logger.log(`Plan a cobrar final: ${finalPlan}`);

    if (finalPlan === PlanType.TRIAL) {
      throw new Error(
        'No se puede crear una sesión de pago para un plan Trial directamente',
      );
    }

    let amount = 0;
    const currency = 'PEN';
    switch (finalPlan) {
      case PlanType.BASIC:
        amount = 209.0;
        break;
      case PlanType.ADVANCED:
        amount = 349.0;
        break;
      default:
        throw new Error('Tipo de plan no soportado para pago directo');
    }

    const purchaseNumber =
      `${Date.now()}${Math.floor(Math.random() * 100)}`.slice(-12);
    this.logger.log(`Generado PurchaseNumber: ${purchaseNumber}`);

    if (!subscription) {
      this.logger.log(
        'El usuario no tiene suscripción. Creando una base (CANCELED)...',
      );
      subscription = Subscription.create({
        id: uuidv4(),
        userId: user.id,
        planType: finalPlan,
        status: SubscriptionStatus.CANCELED,
        startDate: new Date(),
        endDate: new Date(),
        ...Subscription.getLimitsForPlan(finalPlan),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await this.subscriptionRepository.save(subscription);
    }

    this.logger.log('Guardando registro de pago PENDING en DB...');
    await this.paymentRepository.create(
      subscription.id,
      amount,
      currency,
      purchaseNumber,
      finalPlan,
    );

    this.logger.log('Llamando a Niubiz para sessionKey...');
    return await this.paymentGateway.createSession(
      amount,
      user,
      purchaseNumber,
    );
  }
}
