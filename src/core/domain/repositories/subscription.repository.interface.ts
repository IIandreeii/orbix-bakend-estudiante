import { Subscription, PlanType } from '../entities/subscription.entity';

export interface ISubscriptionRepository {
  /**
   * Obtiene la suscripción de un usuario
   */
  findByUserId(userId: string): Promise<Subscription | null>;

  /**
   * Crea o actualiza una suscripción
   */
  save(subscription: Subscription): Promise<void>;

  /**
   * Busca suscripciones por expirar para renovaciones automáticas
   */
  findExpiringInRange(start: Date, end: Date): Promise<Subscription[]>;

  /**
   * Obtiene una suscripción por su ID único
   */
  findById(id: string): Promise<Subscription | null>;

  /**
   * Busca suscripciones que están activas pero cuya fecha de fin ya pasó
   */
  findActiveExpired(now: Date): Promise<Subscription[]>;
}

export interface ISubscriptionPaymentRepository {
  /**
   * Crea una nueva orden de pago (SubscriptionPayment)
   */
  create(
    subscriptionId: string,
    amount: number,
    currency: string,
    purchaseNumber: string,
    planType: PlanType,
  ): Promise<string>;

  /**
   * Actualiza el estado de un pago (ej: PENDING -> PAID)
   */
  updateStatus(
    paymentId: string,
    status: string,
    transactionId?: string,
  ): Promise<void>;

  /**
   * Obtiene un pago por su ID
   */
  findById(paymentId: string): Promise<SubscriptionPayment | null>;

  /**
   * Obtiene un pago por su número de compra externo
   */
  findByPurchaseNumber(
    purchaseNumber: string,
  ): Promise<SubscriptionPayment | null>;

  /**
   * Lista todos los pagos de suscripción
   */
  findAll(): Promise<SubscriptionPayment[]>;
}

export interface SubscriptionPayment {
  id: string;
  subscriptionId: string;
  purchaseNumber: string | null;
  amount: number;
  currency: string;
  planType: PlanType;
  status: string;
  transactionId?: string | null;
  paidAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}
