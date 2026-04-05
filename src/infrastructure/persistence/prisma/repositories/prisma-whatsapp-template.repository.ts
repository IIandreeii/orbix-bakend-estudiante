import { Injectable } from '@nestjs/common';
import {
  IWhatsAppTemplateRepository,
  TemplateFilter,
  PaginatedTemplates,
} from '../../../../core/domain/repositories/whatsapp-template.repository.interface';
import {
  WhatsAppTemplate,
  TemplateType,
} from '../../../../core/domain/entities/whatsapp-template.entity';
import { PrismaService } from '../prisma.service';
import { WhatsAppTemplate as PrismaTemplate } from '@prisma/client';
import type { Prisma } from '@prisma/client';

@Injectable()
export class PrismaWhatsAppTemplateRepository implements IWhatsAppTemplateRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapToDomain(prismaTpl: PrismaTemplate): WhatsAppTemplate {
    return WhatsAppTemplate.create({
      id: prismaTpl.id,
      whatsAppAccountId: prismaTpl.whatsAppAccountId,
      name: prismaTpl.name,
      language: prismaTpl.language,
      templateType: prismaTpl.templateType as TemplateType,
      status: prismaTpl.status ?? undefined,
      content: prismaTpl.content ?? undefined,
      createdAt: prismaTpl.createdAt,
      updatedAt: prismaTpl.updatedAt,
    });
  }

  async findById(id: string): Promise<WhatsAppTemplate | null> {
    const tpl = await this.prisma.whatsAppTemplate.findUnique({
      where: { id },
    });
    return tpl ? this.mapToDomain(tpl) : null;
  }

  async findAll(filter: TemplateFilter): Promise<PaginatedTemplates> {
    const { whatsAppAccountId, name, templateType, page, limit } = filter;
    const skip = (page - 1) * limit;

    const where: Prisma.WhatsAppTemplateWhereInput = {};
    if (whatsAppAccountId) where.whatsAppAccountId = whatsAppAccountId;
    if (name) where.name = { contains: name };
    if (templateType) where.templateType = templateType;

    const [items, total] = await Promise.all([
      this.prisma.whatsAppTemplate.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.whatsAppTemplate.count({ where }),
    ]);

    return {
      data: items.map((item) => this.mapToDomain(item)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async save(template: WhatsAppTemplate): Promise<void> {
    const data = template.toJSON();
    await this.prisma.whatsAppTemplate.create({
      data: {
        id: data.id,
        whatsAppAccountId: data.whatsAppAccountId,
        name: data.name,
        language: data.language,
        templateType: data.templateType,
        status: data.status,
        content: data.content,
      },
    });
  }

  async update(template: WhatsAppTemplate): Promise<void> {
    const data = template.toJSON();
    await this.prisma.whatsAppTemplate.update({
      where: { id: data.id },
      data: {
        name: data.name,
        language: data.language,
        templateType: data.templateType,
        status: data.status,
        content: data.content,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.whatsAppTemplate.delete({
      where: { id },
    });
  }

  async findByName(
    whatsAppAccountId: string,
    name: string,
  ): Promise<WhatsAppTemplate | null> {
    const tpl = await this.prisma.whatsAppTemplate.findFirst({
      where: {
        whatsAppAccountId,
        name: { equals: name },
      },
    });
    return tpl ? this.mapToDomain(tpl) : null;
  }
}
