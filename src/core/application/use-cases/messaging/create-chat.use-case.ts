import { v4 as uuidv4 } from 'uuid';
import type { IChatRepository } from '../../../domain/repositories/chat.repository.interface';
import { Chat } from '../../../domain/entities/chat.entity';
import { BadRequestDomainException } from '../../../domain/exceptions/domain.exception';

export interface CreateChatParams {
  whatsAppAccountId: string;
  customerPhone: string;
  customerName?: string;
}

export class CreateChatUseCase {
  constructor(private readonly chatRepository: IChatRepository) {}

  async execute(params: CreateChatParams): Promise<Chat> {
    const existing = await this.chatRepository.findByCustomerPhone(
      params.whatsAppAccountId,
      params.customerPhone,
    );

    if (existing) {
      throw new BadRequestDomainException('Ya existe un chat con ese número de teléfono');
    }

    const chat = Chat.create({
      id: uuidv4(),
      whatsAppAccountId: params.whatsAppAccountId,
      customerPhone: params.customerPhone,
      customerName: params.customerName,
      unreadCount: 0,
      lastMessageAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.chatRepository.save(chat);
    return chat;
  }
}
