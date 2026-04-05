import type { IChatRepository } from '../../../domain/repositories/chat.repository.interface';
import type { IMessageRepository } from '../../../domain/repositories/message.repository.interface';
import type { IWhatsAppMessagingService } from '../../../domain/services/whatsapp-messaging.interface';
import { Chat } from '../../../domain/entities/chat.entity';
import {
  Message,
  MessageDirection,
  MessageType,
  MessageStatus,
} from '../../../domain/entities/message.entity';
import { v4 as uuidv4 } from 'uuid';
import type {
  IInboundMediaProcessor,
  IInboundMessagePostProcessor,
} from '../../services/messaging-flow.interface';

export interface ReceiveMessageCommand {
  whatsAppAccountId: string;
  from: string;
  customerName?: string;
  waMessageId: string;
  type: string;
  content?: string;
  mediaId?: string;
  mimeType?: string;
  quotedMessageId?: string;
  timestamp: string;
}

export class ReceiveMessageUseCase {
  constructor(
    private readonly chatRepository: IChatRepository,
    private readonly messageRepository: IMessageRepository,
    private readonly mediaProcessor: IInboundMediaProcessor,
    private readonly postProcessor: IInboundMessagePostProcessor,
  ) {}

  async execute(command: ReceiveMessageCommand): Promise<void> {
    const {
      whatsAppAccountId,
      from: customerPhone,
      customerName,
      waMessageId,
      type,
      content,
      mediaId,
      mimeType,
      quotedMessageId,
      timestamp,
    } = command;

    let chat = await this.chatRepository.findByCustomerPhone(
      whatsAppAccountId,
      customerPhone,
    );

    if (!chat) {
      chat = Chat.create({
        id: uuidv4(),
        whatsAppAccountId,
        customerPhone,
        customerName: customerName,
        unreadCount: 1,
        lastMessageContent: content || `[${type.toUpperCase()}]`,
        lastMessageAt: new Date(parseInt(timestamp) * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await this.chatRepository.save(chat);
    } else {
      chat.updateLastMessage(content || `[${type.toUpperCase()}]`, true);
      if (customerName) {
        chat = Chat.create({ ...chat.toJSON(), customerName });
      }
      await this.chatRepository.update(chat);
    }

    const existing =
      await this.messageRepository.findByWaMessageId(waMessageId);
    if (existing) return;

    const finalContent = content;
    const finalMediaUrl = await this.mediaProcessor.process({
      whatsAppAccountId,
      waMessageId,
      mediaId,
      mimeType,
    });

    const message = Message.create({
      id: uuidv4(),
      chatId: chat.id,
      waMessageId,
      direction: MessageDirection.INBOUND,
      type: type.toUpperCase() as MessageType,
      content: finalContent,
      mediaId,
      mediaUrl: finalMediaUrl,
      mimeType,
      status: MessageStatus.READ,
      quotedMessageId,
      createdAt: new Date(parseInt(timestamp) * 1000),
      updatedAt: new Date(),
    });

    await this.messageRepository.save(message);

    await this.postProcessor.process({
      whatsAppAccountId,
      waMessageId,
      customerPhone,
      chat,
      message,
    });
  }
}
