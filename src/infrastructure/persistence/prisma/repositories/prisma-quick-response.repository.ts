import { Injectable } from '@nestjs/common';
import {
  IQuickResponseRepository,
  QuickResponseFilter,
  PaginatedQuickResponses,
} from '../../../../core/domain/repositories/quick-response.repository.interface';
import { QuickResponse } from '../../../../core/domain/entities/quick-response.entity';
import { PrismaService } from '../prisma.service';
import { QuickResponse as PrismaQuickResponse } from '@prisma/client';
import type { Prisma } from '@prisma/client';

@Injectable()
export class PrismaQuickResponseRepository implements IQuickResponseRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapToDomain(prismaQR: PrismaQuickResponse): QuickResponse {
    return QuickResponse.create({
      id: prismaQR.id,
      whatsAppAccountId: prismaQR.whatsAppAccountId,
      keyword: prismaQR.keyword,
      responseMessage: prismaQR.responseMessage,
      imageUrl: prismaQR.imageUrl ?? undefined,
      videoUrl: prismaQR.videoUrl ?? undefined,
      isConfirmed: prismaQR.isConfirmed,
      isInformative: prismaQR.isInformative,
      isActive: prismaQR.isActive,
      createdAt: prismaQR.createdAt,
      updatedAt: prismaQR.updatedAt,
    });
  }

  async findById(id: string): Promise<QuickResponse | null> {
    const qr = await this.prisma.quickResponse.findUnique({
      where: { id },
    });
    return qr ? this.mapToDomain(qr) : null;
  }

  async findAll(filter: QuickResponseFilter): Promise<PaginatedQuickResponses> {
    const { whatsAppAccountId, keyword, isActive, page, limit } = filter;
    const skip = (page - 1) * limit;

    const where: Prisma.QuickResponseWhereInput = {};
    if (whatsAppAccountId) where.whatsAppAccountId = whatsAppAccountId;
    if (keyword) where.keyword = { contains: keyword };
    if (isActive !== undefined) where.isActive = isActive;

    const [items, total] = await Promise.all([
      this.prisma.quickResponse.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.quickResponse.count({ where }),
    ]);

    return {
      data: items.map((item) => this.mapToDomain(item)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async save(qr: QuickResponse): Promise<void> {
    const data = qr.toJSON();
    await this.prisma.quickResponse.create({
      data: {
        id: data.id,
        whatsAppAccountId: data.whatsAppAccountId,
        keyword: data.keyword,
        responseMessage: data.responseMessage,
        imageUrl: data.imageUrl,
        videoUrl: data.videoUrl,
        isConfirmed: data.isConfirmed,
        isInformative: data.isInformative,
        isActive: data.isActive,
      },
    });
  }

  async update(qr: QuickResponse): Promise<void> {
    const data = qr.toJSON();
    await this.prisma.quickResponse.update({
      where: { id: data.id },
      data: {
        keyword: data.keyword,
        responseMessage: data.responseMessage,
        imageUrl: data.imageUrl,
        videoUrl: data.videoUrl,
        isConfirmed: data.isConfirmed,
        isInformative: data.isInformative,
        isActive: data.isActive,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.quickResponse.delete({
      where: { id },
    });
  }

  async findByKeyword(
    whatsAppAccountId: string,
    keyword: string,
  ): Promise<QuickResponse | null> {
    const qr = await this.prisma.quickResponse.findFirst({
      where: {
        whatsAppAccountId,
        keyword: { equals: keyword },
      },
    });
    return qr ? this.mapToDomain(qr) : null;
  }
}
