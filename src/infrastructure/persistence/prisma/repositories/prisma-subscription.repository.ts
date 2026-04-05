import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ISubscriptionRepository } from '../../../../core/domain/repositories/subscription.repository.interface';
import {
  Subscription,
  SubscriptionStatus,
} from '../../../../core/domain/entities/subscription.entity';
import type { PlanType } from '../../../../core/domain/entities/subscription.entity';

@Injectable()
export class PrismaSubscriptionRepository implements ISubscriptionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<Subscription | null> {
    const data = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (!data) return null;

    return Subscription.create({
      id: data.id,
      userId: data.userId,
      planType: data.planType as PlanType,
      status: data.status as SubscriptionStatus,
      startDate: data.startDate,
      endDate: data.endDate,
      whatsappLimit: data.whatsappLimit,
      advisorsLimit: data.advisorsLimit,
      shopsLimit: data.shopsLimit,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  async save(subscription: Subscription): Promise<void> {
    await this.prisma.subscription.upsert({
      where: { userId: subscription.userId },
      update: {
        planType: subscription.planType,
        status: subscription.status,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        whatsappLimit: subscription.whatsappLimit,
        advisorsLimit: subscription.advisorsLimit,
        shopsLimit: subscription.shopsLimit,
      },
      create: {
        id: subscription.id,
        userId: subscription.userId,
        planType: subscription.planType,
        status: subscription.status,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        whatsappLimit: subscription.whatsappLimit,
        advisorsLimit: subscription.advisorsLimit,
        shopsLimit: subscription.shopsLimit,
      },
    });
  }

  async findExpiringInRange(start: Date, end: Date): Promise<Subscription[]> {
    const results = await this.prisma.subscription.findMany({
      where: {
        endDate: { gte: start, lte: end },
        status: 'ACTIVE',
      },
    });

    return results.map((data) =>
      Subscription.create({
        id: data.id,
        userId: data.userId,
        planType: data.planType as PlanType,
        status: data.status as SubscriptionStatus,
        startDate: data.startDate,
        endDate: data.endDate,
        whatsappLimit: data.whatsappLimit,
        advisorsLimit: data.advisorsLimit,
        shopsLimit: data.shopsLimit,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      }),
    );
  }

  async findById(id: string): Promise<Subscription | null> {
    const data = await this.prisma.subscription.findUnique({
      where: { id },
    });

    if (!data) return null;

    return Subscription.create({
      id: data.id,
      userId: data.userId,
      planType: data.planType as PlanType,
      status: data.status as SubscriptionStatus,
      startDate: data.startDate,
      endDate: data.endDate,
      whatsappLimit: data.whatsappLimit,
      advisorsLimit: data.advisorsLimit,
      shopsLimit: data.shopsLimit,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  async findActiveExpired(now: Date): Promise<Subscription[]> {
    const records = await this.prisma.subscription.findMany({
      where: {
        status: SubscriptionStatus.ACTIVE,
        endDate: {
          lt: now,
        },
      },
    });

    return records.map((data) =>
      Subscription.create({
        id: data.id,
        userId: data.userId,
        planType: data.planType as PlanType,
        status: data.status as SubscriptionStatus,
        startDate: data.startDate,
        endDate: data.endDate,
        whatsappLimit: data.whatsappLimit,
        advisorsLimit: data.advisorsLimit,
        shopsLimit: data.shopsLimit,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      }),
    );
  }
}
