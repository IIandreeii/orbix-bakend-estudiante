import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  ISubscriptionPaymentRepository,
  SubscriptionPayment,
} from '../../../../core/domain/repositories/subscription.repository.interface';
import { PaymentStatus, PlanType, Prisma } from '@prisma/client';
import { PlanType as DomainPlanType } from '../../../../core/domain/entities/subscription.entity';

const toNumber = (value: unknown): number => {
  if (typeof value === 'number') return value;
  if (value instanceof Prisma.Decimal) return value.toNumber();
  return Number(value);
};

@Injectable()
export class PrismaSubscriptionPaymentRepository implements ISubscriptionPaymentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    subscriptionId: string,
    amount: number,
    currency: string,
    purchaseNumber: string,
    planType: PlanType,
  ): Promise<string> {
    const payment = await this.prisma.subscriptionPayment.create({
      data: {
        subscriptionId,
        purchaseNumber,
        amount,
        currency,
        planType,
        status: PaymentStatus.PENDING,
      },
    });
    return payment.id;
  }

  async updateStatus(
    paymentId: string,
    status: string,
    transactionId?: string,
  ): Promise<void> {
    await this.prisma.subscriptionPayment.update({
      where: { id: paymentId },
      data: {
        status: status as PaymentStatus,
        transactionId,
        paidAt: status === PaymentStatus.PAID ? new Date() : undefined,
      },
    });
  }

  async findById(paymentId: string): Promise<SubscriptionPayment | null> {
    const payment = await this.prisma.subscriptionPayment.findUnique({
      where: { id: paymentId },
    });
    if (!payment) return null;

    return {
      ...payment,
      amount: toNumber(payment.amount),
      planType: payment.planType as DomainPlanType,
    };
  }

  async findByPurchaseNumber(
    purchaseNumber: string,
  ): Promise<SubscriptionPayment | null> {
    const payment = await this.prisma.subscriptionPayment.findFirst({
      where: { purchaseNumber },
    });
    if (!payment) return null;

    return {
      ...payment,
      amount: toNumber(payment.amount),
      planType: payment.planType as DomainPlanType,
    };
  }

  async findAll(): Promise<SubscriptionPayment[]> {
    const payments = await this.prisma.subscriptionPayment.findMany({
      where: {
        status: {
          in: [PaymentStatus.PAID, PaymentStatus.FAILED],
        },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        subscription: {
          include: {
            user: true,
          },
        },
      },
    });

    return payments.map((p) => ({
      ...p,
      amount: toNumber(p.amount),
      planType: p.planType as DomainPlanType,
      // Incluimos información básica del usuario vinculada a la suscripción
      userName: p.subscription.user
        ? `${p.subscription.user.firstName} ${p.subscription.user.lastName}`
        : 'Desconocido',
      userEmail: p.subscription.user ? p.subscription.user.email : '',
    }));
  }
}
