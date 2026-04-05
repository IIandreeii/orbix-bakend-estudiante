import { Injectable } from '@nestjs/common';
import {
  ILabelRepository,
  FindLabelsQuery,
  PaginatedResult,
} from '../../../../core/domain/repositories/label.repository.interface';
import { Label } from '../../../../core/domain/entities/label.entity';
import { PrismaService } from '../prisma.service';
import type { Prisma, Label as PrismaLabel } from '@prisma/client';

@Injectable()
export class PrismaLabelRepository implements ILabelRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapToDomain(prismaLabel: PrismaLabel): Label {
    return Label.create({
      id: prismaLabel.id,
      whatsAppAccountId: prismaLabel.whatsAppAccountId,
      name: prismaLabel.name,
      color: prismaLabel.color,
      createdAt: prismaLabel.createdAt,
      updatedAt: prismaLabel.updatedAt,
    });
  }

  async findById(id: string): Promise<Label | null> {
    const label = await this.prisma.label.findUnique({
      where: { id },
    });
    return label ? this.mapToDomain(label) : null;
  }

  async findByWhatsAppAccountId(whatsAppAccountId: string): Promise<Label[]> {
    const labels = await this.prisma.label.findMany({
      where: { whatsAppAccountId },
      orderBy: { createdAt: 'desc' },
    });
    return labels.map((label) => this.mapToDomain(label));
  }

  async findPaginated(query: FindLabelsQuery): Promise<PaginatedResult<Label>> {
    const { whatsAppAccountId, page = 1, limit = 20, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.LabelWhereInput = { whatsAppAccountId };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { color: { contains: search } },
      ];
    }

    const [labels, total] = await this.prisma.$transaction([
      this.prisma.label.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.label.count({ where }),
    ]);

    return {
      data: labels.map((l) => this.mapToDomain(l)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async save(label: Label): Promise<void> {
    const data = label.toJSON();
    await this.prisma.label.create({
      data: {
        id: data.id,
        whatsAppAccountId: data.whatsAppAccountId,
        name: data.name,
        color: data.color,
      },
    });
  }

  async update(label: Label): Promise<void> {
    const data = label.toJSON();
    await this.prisma.label.update({
      where: { id: data.id },
      data: {
        name: data.name,
        color: data.color,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.label.delete({
      where: { id },
    });
  }
}
