import type { IChatRepository } from '../../../domain/repositories/chat.repository.interface';
import type {
  SendMessageOptions,
} from '../../../domain/services/whatsapp-messaging.interface';
import { Chat } from '../../../domain/entities/chat.entity';
import { v4 as uuidv4 } from 'uuid';
import type { IQuickResponseRepository } from '../../../domain/repositories/quick-response.repository.interface';
import type { IWhatsAppTemplateRepository } from '../../../domain/repositories/whatsapp-template.repository.interface';
import { DomainException } from '../../../domain/exceptions/domain.exception';
import type {
  IMessageContentResolver,
  IOutboundMessageDispatcher,
} from '../../services/messaging-flow.interface';

export interface SendMessageCommand extends SendMessageOptions {
  whatsAppAccountId: string;
  quickResponseKey?: string;
}

export class SendMessageUseCase {
  constructor(
    private readonly chatRepository: IChatRepository,
    private readonly quickResponseRepository: IQuickResponseRepository,
    private readonly templateRepository: IWhatsAppTemplateRepository,
    private readonly contentResolver: IMessageContentResolver,
    private readonly outboundDispatcher: IOutboundMessageDispatcher,
  ) {}

  async execute(command: SendMessageCommand): Promise<void> {
    const { whatsAppAccountId, to: customerPhone, quickResponseKey } = command;

    let chat = await this.chatRepository.findByCustomerPhone(
      whatsAppAccountId,
      customerPhone,
    );

    if (quickResponseKey) {
      const qr = await this.quickResponseRepository.findByKeyword(
        whatsAppAccountId,
        quickResponseKey,
      );
      if (!qr) {
        throw new DomainException(
          `Quick response with key '${quickResponseKey}' not found`,
        );
      }

      const summaryContent = qr.responseMessage || '[MEDIA]';

      if (!chat) {
        chat = Chat.create({
          id: uuidv4(),
          whatsAppAccountId,
          customerPhone,
          unreadCount: 0,
          lastMessageContent: summaryContent,
          lastMessageAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        await this.chatRepository.save(chat);
      }

      // Logic for sending Quick Response (potentially multiple messages)
      let sentSomething = false;

      // 1. Handle Image
      if (qr.imageUrl) {
        await this.sendSingleMessage(chat, {
          to: customerPhone,
          type: 'image',
          content: qr.responseMessage,
          mediaUrl: qr.imageUrl,
        });
        sentSomething = true;
      }

      // 2. Handle Video
      if (qr.videoUrl) {
        await this.sendSingleMessage(chat, {
          to: customerPhone,
          type: 'video',
          content: sentSomething ? undefined : qr.responseMessage, // Only add caption if not sent with image
          mediaUrl: qr.videoUrl,
        });
        sentSomething = true;
      }

      // 3. Handle Text Only (if no media)
      if (!sentSomething) {
        await this.sendSingleMessage(chat, {
          to: customerPhone,
          type: 'text',
          content: qr.responseMessage,
        });
      }

      return;
    }

    if (!command.type) {
      if (command.template) command.type = 'template';
      else if (command.mediaUrl || command.mediaId) command.type = 'image';
      else command.type = 'text';
    }

    if (
      command.type === 'template' &&
      command.template &&
      !command.template.languageCode
    ) {
      const tpl = await this.templateRepository.findByName(
        whatsAppAccountId,
        command.template.name,
      );
      if (tpl) {
        command.template.languageCode = tpl.language;
      } else {
        command.template.languageCode = 'es';
      }
    }

    const bodyContent = await this.contentResolver.resolve(
      whatsAppAccountId,
      command,
    );

    if (!chat) {
      chat = Chat.create({
        id: uuidv4(),
        whatsAppAccountId,
        customerPhone,
        unreadCount: 0,
        lastMessageContent: bodyContent,
        lastMessageAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await this.chatRepository.save(chat);
    }

    await this.sendSingleMessage(chat, command);
  }

  private async sendSingleMessage(
    chat: Chat,
    options: SendMessageOptions,
  ): Promise<void> {
    await this.outboundDispatcher.dispatch(chat, options);
  }
}
