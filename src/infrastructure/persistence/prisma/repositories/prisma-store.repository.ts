import { Injectable } from '@nestjs/common';
import {
  IStoreRepository,
  StoreFilter,
  PaginatedStores,
} from '../../../../core/domain/repositories/store.repository.interface';
import { Store } from '../../../../core/domain/entities/store.entity';
import { PrismaService } from '../prisma.service';
import { Store as PrismaStore, Prisma } from '@prisma/client';

@Injectable()
export class PrismaStoreRepository implements IStoreRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapToDomain(prismaStore: PrismaStore): Store {
    return Store.create({
      id: prismaStore.id,
      whatsAppAccountId: prismaStore.whatsAppAccountId,
      name: prismaStore.name,
      domain: prismaStore.domain ?? undefined,
      externalStoreId: prismaStore.externalStoreId ?? undefined,
      code: prismaStore.code ?? undefined,
      isActive: prismaStore.isActive,
      createdAt: prismaStore.createdAt,
      updatedAt: prismaStore.updatedAt,
    });
  }

  async findById(id: string): Promise<Store | null> {
    const store = await this.prisma.store.findUnique({
      where: { id },
    });
    return store ? this.mapToDomain(store) : null;
  }

  async findAll(filter: StoreFilter): Promise<PaginatedStores> {
    const { whatsAppAccountId, name, domain, page, limit } = filter;
    const skip = (page - 1) * limit;

    const where: Prisma.StoreWhereInput = {
      isActive: true,
      ...(whatsAppAccountId && { whatsAppAccountId }),
      ...(name && { name: { contains: name } }),
      ...(domain && { domain: { contains: domain } }),
    };

    const [data, total] = await Promise.all([
      this.prisma.store.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.store.count({ where }),
    ]);

    return {
      data: data.map((d) => this.mapToDomain(d)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async save(store: Store): Promise<void> {
    const data = store.toJSON();
    await this.prisma.store.create({
      data: {
        id: data.id,
        whatsAppAccountId: data.whatsAppAccountId,
        name: data.name,
        domain: data.domain,
        externalStoreId: data.externalStoreId,
        code: data.code,
        isActive: data.isActive,
      },
    });
  }

  async update(store: Store): Promise<void> {
    const data = store.toJSON();
    await this.prisma.store.update({
      where: { id: data.id },
      data: {
        name: data.name,
        domain: data.domain,
        externalStoreId: data.externalStoreId,
        code: data.code,
        isActive: data.isActive,
      },
    });
  }

  async findByDomain(domain: string): Promise<Store | null> {
    const store = await this.prisma.store.findFirst({
      where: { domain, isActive: true },
    });
    return store ? this.mapToDomain(store) : null;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.store.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
