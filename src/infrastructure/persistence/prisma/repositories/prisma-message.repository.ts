import { Injectable } from '@nestjs/common';
import {
  IMessageRepository,
  FindMessagesQuery,
  MessageWithChat,
  MessageContextResult,
} from '../../../../core/domain/repositories/message.repository.interface';
import {
  Message,
  MessageDirection,
  MessageType,
  MessageStatus,
} from '../../../../core/domain/entities/message.entity';
import { PrismaService } from '../prisma.service';
import { Message as PrismaMessage, Prisma } from '@prisma/client';
import { PaginatedResult } from '../../../../core/domain/repositories/chat.repository.interface';

@Injectable()
export class PrismaMessageRepository implements IMessageRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapToDomain(prismaMessage: PrismaMessage): Message {
    return Message.create({
      id: prismaMessage.id,
      chatId: prismaMessage.chatId,
      waMessageId: prismaMessage.waMessageId ?? undefined,
      direction: prismaMessage.direction as MessageDirection,
      type: prismaMessage.type as MessageType,
      content: prismaMessage.content ?? undefined,
      mediaId: prismaMessage.mediaId ?? undefined,
      mediaUrl: prismaMessage.mediaUrl ?? undefined,
      mimeType: prismaMessage.mimeType ?? undefined,
      status: prismaMessage.status as MessageStatus,
      sentByAI: prismaMessage.sentByAI,
      errorCode: prismaMessage.errorCode ?? undefined,
      errorDetails: prismaMessage.errorDetails ?? undefined,
      quotedMessageId: prismaMessage.quotedMessageId ?? undefined,
      createdAt: prismaMessage.createdAt,
      updatedAt: prismaMessage.updatedAt,
    });
  }

  async findById(id: string): Promise<Message | null> {
    const message = await this.prisma.message.findUnique({
      where: { id },
    });
    return message ? this.mapToDomain(message) : null;
  }

  async findByChatId(chatId: string, limit?: number): Promise<Message[]> {
    const messages = await this.prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return messages.reverse().map((msg) => this.mapToDomain(msg));
  }

  async findPaginated(
    query: FindMessagesQuery,
  ): Promise<PaginatedResult<Message>> {
    const { chatId, page = 1, limit = 30, search, beforeId, afterId } = query;
    let skip = (page - 1) * limit;

    const where: any = {
      chatId,
    };

    if (search) {
      where.content = { contains: search };
    }

    let orderBy: any = { createdAt: 'desc' };
    let shouldReverse = true;

    if (beforeId) {
      const msg = await this.prisma.message.findUnique({
        where: { id: beforeId },
      });
      if (msg) {
        where.createdAt = { lt: msg.createdAt };
        skip = 0; // ignorar paginación tradicional
      }
    } else if (afterId) {
      const msg = await this.prisma.message.findUnique({
        where: { id: afterId },
      });
      if (msg) {
        where.createdAt = { gt: msg.createdAt };
        orderBy = { createdAt: 'asc' };
        shouldReverse = false;
        skip = 0; // ignorar paginación tradicional
      }
    }

    const [messages, total] = await this.prisma.$transaction([
      this.prisma.message.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.message.count({ where }),
    ]);

    const finalMessages = shouldReverse ? messages.reverse() : messages;

    return {
      data: finalMessages.map((m) => this.mapToDomain(m)),
      total,
      page: beforeId || afterId ? 1 : page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByWaMessageId(waMessageId: string): Promise<Message | null> {
    const message = await this.prisma.message.findUnique({
      where: { waMessageId },
    });
    return message ? this.mapToDomain(message) : null;
  }

  async save(message: Message): Promise<void> {
    const data = message.toJSON();
    await this.prisma.message.create({
      data: {
        id: data.id,
        chatId: data.chatId,
        waMessageId: data.waMessageId,
        direction: data.direction,
        type: data.type,
        content: data.content,
        mediaId: data.mediaId,
        mediaUrl: data.mediaUrl,
        mimeType: data.mimeType,
        status: data.status,
        sentByAI: data.sentByAI,
        errorCode: data.errorCode,
        errorDetails: data.errorDetails,
        quotedMessageId: data.quotedMessageId,
      },
    });
  }

  async update(message: Message): Promise<void> {
    const data = message.toJSON();
    await this.prisma.message.update({
      where: { id: data.id },
      data: {
        status: data.status,
        errorCode: data.errorCode,
        errorDetails: data.errorDetails,
        updatedAt: data.updatedAt,
      },
    });
  }

  async searchGlobal(query: {
    whatsAppAccountId: string;
    search: string;
    labelId?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResult<MessageWithChat>> {
    const { whatsAppAccountId, search, labelId, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.MessageWhereInput = {
      chat: {
        whatsAppAccountId,
      },
    };

    // If labelId is provided, filter chats by that label
    if (labelId) {
      where.chat = {
        ...where.chat,
        labels: {
          some: { id: labelId },
        },
      } as any;
    }

    // Search criteria: message content OR customer name OR label name
    if (search) {
      where.OR = [
        { content: { contains: search } },
        {
          chat: {
            OR: [
              { customerName: { contains: search } },
              { labels: { some: { name: { contains: search } } } },
            ],
          } as any,
        },
      ];
    }

    const [messages, total] = await this.prisma.$transaction([
      this.prisma.message.findMany({
        where,
        include: {
          chat: {
            select: {
              customerName: true,
              customerPhone: true,
              labels: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.message.count({ where }),
    ]);

    return {
      data: messages.map((m) => ({
        id: m.id,
        chatId: m.chatId,
        waMessageId: m.waMessageId ?? undefined,
        direction: m.direction as MessageDirection,
        type: m.type as MessageType,
        content: m.content ?? undefined,
        mediaId: m.mediaId ?? undefined,
        mediaUrl: m.mediaUrl ?? undefined,
        mimeType: m.mimeType ?? undefined,
        status: m.status as MessageStatus,
        sentByAI: m.sentByAI,
        errorCode: m.errorCode ?? undefined,
        errorDetails: m.errorDetails ?? undefined,
        quotedMessageId: m.quotedMessageId ?? undefined,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
        chat: {
          customerName: m.chat.customerName || undefined,
          customerPhone: m.chat.customerPhone,
          labels: m.chat.labels?.map((l) => ({
            id: l.id,
            name: l.name,
            color: l.color,
          })),
        },
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findContextById(
    messageId: string,
    limit: number = 20,
  ): Promise<MessageContextResult | null> {
    const targetMsg = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!targetMsg) return null;

    const { chatId, createdAt } = targetMsg;

    // Get messages BEFORE (older)
    const beforeMessages = await this.prisma.message.findMany({
      where: {
        chatId,
        createdAt: { lt: createdAt },
      },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
    });

    // Get messages AFTER (newer)
    const afterMessages = await this.prisma.message.findMany({
      where: {
        chatId,
        createdAt: { gt: createdAt },
      },
      orderBy: { createdAt: 'asc' },
      take: limit + 1,
    });

    const hasMoreBefore = beforeMessages.length > limit;
    const hasMoreAfter = afterMessages.length > limit;

    const finalBefore = beforeMessages.slice(0, limit).reverse();
    const finalAfter = afterMessages.slice(0, limit);

    const allMessages = [
      ...finalBefore.map((m) => this.mapToDomain(m)),
      this.mapToDomain(targetMsg),
      ...finalAfter.map((m) => this.mapToDomain(m)),
    ];

    return {
      targetMessage: this.mapToDomain(targetMsg),
      messages: allMessages,
      hasMoreBefore,
      hasMoreAfter,
    };
  }
}
