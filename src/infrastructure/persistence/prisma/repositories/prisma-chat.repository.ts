import { Injectable } from '@nestjs/common';
import {
  IChatRepository,
  FindChatsQuery,
  PaginatedResult,
} from '../../../../core/domain/repositories/chat.repository.interface';
import type { Prisma } from '@prisma/client';
import { Chat } from '../../../../core/domain/entities/chat.entity';
import { PrismaService } from '../prisma.service';
import type { Chat as PrismaChat, Label as PrismaLabel } from '@prisma/client';

type ChatWithLabels = PrismaChat & {
  labels?: PrismaLabel[];
};

@Injectable()
export class PrismaChatRepository implements IChatRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapToDomain(prismaChat: ChatWithLabels): Chat {
    return Chat.create({
      id: prismaChat.id,
      whatsAppAccountId: prismaChat.whatsAppAccountId,
      customerPhone: prismaChat.customerPhone,
      customerName: prismaChat.customerName ?? undefined,
      unreadCount: prismaChat.unreadCount,
      lastMessageContent: prismaChat.lastMessageContent ?? undefined,
      labels: prismaChat.labels?.map((l) => ({
        id: l.id,
        name: l.name,
        color: l.color,
      })),
      lastMessageAt: prismaChat.lastMessageAt,
      createdAt: prismaChat.createdAt,
      updatedAt: prismaChat.updatedAt,
    });
  }

  async findById(id: string): Promise<Chat | null> {
    const chat = await this.prisma.chat.findUnique({
      where: { id },
      include: { labels: true },
    });
    return chat ? this.mapToDomain(chat as ChatWithLabels) : null;
  }

  async findByCustomerPhone(
    whatsAppAccountId: string,
    customerPhone: string,
  ): Promise<Chat | null> {
    const chat = await this.prisma.chat.findUnique({
      where: {
        whatsAppAccountId_customerPhone: {
          whatsAppAccountId,
          customerPhone,
        },
      },
      include: { labels: true },
    });
    return chat ? this.mapToDomain(chat as ChatWithLabels) : null;
  }

  async findByWhatsAppAccountId(whatsAppAccountId: string): Promise<Chat[]> {
    const chats = await this.prisma.chat.findMany({
      where: { whatsAppAccountId },
      include: { labels: true },
      orderBy: { lastMessageAt: 'desc' },
    });
    return chats.map((chat) => this.mapToDomain(chat as ChatWithLabels));
  }

  async findPaginated(query: FindChatsQuery): Promise<PaginatedResult<Chat>> {
    const { whatsAppAccountId, page = 1, limit = 20, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ChatWhereInput = { whatsAppAccountId };

    if (search) {
      where.OR = [
        { customerName: { contains: search } },
        { customerPhone: { contains: search } },
        { lastMessageContent: { contains: search } },
      ];
    }

    const [chats, total] = await this.prisma.$transaction([
      this.prisma.chat.findMany({
        where,
        include: { labels: true },
        orderBy: { lastMessageAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.chat.count({ where }),
    ]);

    return {
      data: chats.map((c) => this.mapToDomain(c as ChatWithLabels)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async save(chat: Chat): Promise<void> {
    const data = chat.toJSON();
    await this.prisma.chat.create({
      data: {
        id: data.id,
        whatsAppAccountId: data.whatsAppAccountId,
        customerPhone: data.customerPhone,
        customerName: data.customerName,
        unreadCount: data.unreadCount,
        lastMessageContent: data.lastMessageContent,
        lastMessageAt: data.lastMessageAt,
      },
    });
  }

  async update(chat: Chat): Promise<void> {
    const data = chat.toJSON();
    await this.prisma.chat.update({
      where: { id: data.id },
      data: {
        customerName: data.customerName,
        unreadCount: data.unreadCount,
        lastMessageContent: data.lastMessageContent,
        lastMessageAt: data.lastMessageAt,
      },
    });
  }

  async addLabel(chatId: string, labelId: string): Promise<void> {
    await this.prisma.chat.update({
      where: { id: chatId },
      data: {
        labels: {
          connect: { id: labelId },
        },
      },
    });
  }

  async removeLabel(chatId: string, labelId: string): Promise<void> {
    await this.prisma.chat.update({
      where: { id: chatId },
      data: {
        labels: {
          disconnect: { id: labelId },
        },
      },
    });
  }
}
