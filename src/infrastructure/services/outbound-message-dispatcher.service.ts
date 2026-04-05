import { Injectable, Inject } from '@nestjs/common';
import type { IChatRepository } from '../../core/domain/repositories/chat.repository.interface';
import type { IMessageRepository } from '../../core/domain/repositories/message.repository.interface';
import type {
  IWhatsAppMessagingService,
  SendMessageOptions,
} from '../../core/domain/services/whatsapp-messaging.interface';
import {
  Message,
  MessageDirection,
  MessageStatus,
  MessageType,
} from '../../core/domain/entities/message.entity';
import { v4 as uuidv4 } from 'uuid';
import type { IRealtimeNotifier } from '../../core/application/services/realtime-notifier.interface';
import type { Chat } from '../../core/domain/entities/chat.entity';
import type { IMessageContentResolver } from '../../core/application/services/messaging-flow.interface';
import { I_MESSAGE_CONTENT_RESOLVER } from '../../core/application/services/messaging-flow.interface';

@Injectable()
export class OutboundMessageDispatcherService {
  constructor(
    @Inject('IChatRepository')
    private readonly chatRepository: IChatRepository,
    @Inject('IMessageRepository')
    private readonly messageRepository: IMessageRepository,
    @Inject('IWhatsAppMessagingService')
    private readonly messagingService: IWhatsAppMessagingService,
    @Inject(I_MESSAGE_CONTENT_RESOLVER)
    private readonly contentResolver: IMessageContentResolver,
    @Inject('IRealtimeNotifier')
    private readonly realtimeNotifier: IRealtimeNotifier,
  ) {}

  async dispatch(chat: Chat, options: SendMessageOptions): Promise<void> {
    const whatsAppAccountId = chat.whatsAppAccountId;
    const { mediaUrl, mediaId, mimeType } = options;
    const type = options.type || 'text';

    const bodyContent = await this.contentResolver.resolve(
      whatsAppAccountId,
      options,
    );

    const lastMsgSummary = bodyContent || `[${type.toUpperCase()}]`;
    chat.updateLastMessage(lastMsgSummary, false);
    await this.chatRepository.update(chat);

    try {
      const response = await this.messagingService.sendMessage(
        whatsAppAccountId,
        { ...options, type },
      );

      const message = Message.create({
        id: uuidv4(),
        chatId: chat.id,
        waMessageId: response.waMessageId,
        direction: MessageDirection.OUTBOUND,
        type: type.toUpperCase() as MessageType,
        content: bodyContent || undefined,
        mediaId,
        mediaUrl,
        mimeType,
        status: MessageStatus.SENT,
        sentByAI: false,
        quotedMessageId: options.quotedMessageId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await this.messageRepository.save(message);
      this.realtimeNotifier.emitNewMessage(whatsAppAccountId, message.toJSON());
      this.realtimeNotifier.emitChatUpdate(whatsAppAccountId, chat.toJSON());
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorCode = this.getErrorCode(error);
      const failMessage = Message.create({
        id: uuidv4(),
        chatId: chat.id,
        direction: MessageDirection.OUTBOUND,
        type: type.toUpperCase() as MessageType,
        content: bodyContent || undefined,
        mediaId,
        mediaUrl,
        mimeType,
        status: MessageStatus.FAILED,
        sentByAI: false,
        errorCode,
        errorDetails: errorMessage,
        quotedMessageId: options.quotedMessageId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await this.messageRepository.save(failMessage);
      this.realtimeNotifier.emitNewMessage(
        whatsAppAccountId,
        failMessage.toJSON(),
      );
      throw error;
    }
  }

  private getErrorCode(error: unknown): number | undefined {
    if (
      typeof error === 'object' &&
      error &&
      'code' in error &&
      typeof (error as { code?: unknown }).code === 'number'
    ) {
      return (error as { code: number }).code;
    }
    return undefined;
  }
}
