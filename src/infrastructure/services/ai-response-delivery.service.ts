import { Injectable, Inject } from '@nestjs/common';
import type {
  AIResponseDeliveryInput,
  IAIOutboundDraftFactory,
  IAIResponseDeliveryService,
} from '../../core/application/services/ai-orchestration.interface';
import type { IWhatsAppMessagingService } from '../../core/domain/services/whatsapp-messaging.interface';
import type { IWhatsAppTemplateRepository } from '../../core/domain/repositories/whatsapp-template.repository.interface';
import type { IMessageRepository } from '../../core/domain/repositories/message.repository.interface';
import type { IChatRepository } from '../../core/domain/repositories/chat.repository.interface';
import type { IRealtimeNotifier } from '../../core/application/services/realtime-notifier.interface';
import {
  Message,
  MessageDirection,
  MessageStatus,
  MessageType,
} from '../../core/domain/entities/message.entity';
import { v4 as uuidv4 } from 'uuid';
import { I_AI_OUTBOUND_DRAFT_FACTORY } from '../../core/application/services/ai-orchestration.interface';

@Injectable()
export class AIResponseDeliveryService implements IAIResponseDeliveryService {
  constructor(
    @Inject('IWhatsAppMessagingService')
    private readonly whatsappService: IWhatsAppMessagingService,
    @Inject('IWhatsAppTemplateRepository')
    private readonly templateRepository: IWhatsAppTemplateRepository,
    @Inject('IMessageRepository')
    private readonly messageRepository: IMessageRepository,
    @Inject('IChatRepository')
    private readonly chatRepository: IChatRepository,
    @Inject('IRealtimeNotifier')
    private readonly realtimeNotifier: IRealtimeNotifier,
    @Inject(I_AI_OUTBOUND_DRAFT_FACTORY)
    private readonly outboundDraftFactory: IAIOutboundDraftFactory,
  ) {}

  async deliver(input: AIResponseDeliveryInput): Promise<void> {
    const { whatsAppAccountId, chatId, customerPhone, response } = input;

    if (response.type === 'template' && response.template) {
      await this.deliverTemplate(input);
      return;
    }

    await this.deliverTextOrMedia(input);
  }

  private async deliverTemplate(input: AIResponseDeliveryInput): Promise<void> {
    const { whatsAppAccountId, chatId, customerPhone, response } = input;
    const template = response.template!;

    const componentsInfo =
      template.parameters.length > 0
        ? [
            {
              type: 'body',
              parameters: template.parameters.map((param) => ({
                type: 'text',
                text: param,
              })),
            },
          ]
        : [];

    const tplResults = await this.templateRepository.findAll({
      whatsAppAccountId,
      name: template.templateCode,
      page: 1,
      limit: 1,
    });

    const dbTemplate = tplResults.data.find((t) => t.name === template.templateCode);
    const languageCode = dbTemplate?.language || 'es';

    const result = await this.whatsappService.sendMessage(whatsAppAccountId, {
      to: customerPhone,
      type: 'template',
      template: {
        name: template.templateCode,
        languageCode,
        components: componentsInfo,
      },
    });

    const outMessage = Message.create({
      id: uuidv4(),
      chatId,
      waMessageId: result.waMessageId,
      direction: MessageDirection.OUTBOUND,
      type: MessageType.TEXT,
      content: this.outboundDraftFactory.templateAuditContent(
        template.templateCode,
        template.parameters,
      ),
      status: MessageStatus.SENT,
      sentByAI: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.persistAndNotify(whatsAppAccountId, outMessage);
  }

  private async deliverTextOrMedia(input: AIResponseDeliveryInput): Promise<void> {
    const { whatsAppAccountId, chatId, customerPhone, response } = input;

    const draft = this.outboundDraftFactory.fromAIResponse(response);
    const result = await this.whatsappService.sendMessage(whatsAppAccountId, {
      to: customerPhone,
      type: draft.messageType,
      content: draft.textContent,
      mediaUrl: draft.mediaUrl,
    });

    const outMessage = Message.create({
      id: uuidv4(),
      chatId,
      waMessageId: result.waMessageId,
      direction: MessageDirection.OUTBOUND,
      type: draft.mediaUrl
        ? draft.messageType === 'video'
          ? MessageType.VIDEO
          : MessageType.IMAGE
        : MessageType.TEXT,
      content: draft.textContent,
      mediaId: undefined,
      mediaUrl: draft.mediaUrl,
      status: MessageStatus.SENT,
      sentByAI: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.persistAndNotify(whatsAppAccountId, outMessage);
  }

  private async persistAndNotify(
    whatsAppAccountId: string,
    outMessage: Message,
  ): Promise<void> {
    await this.messageRepository.save(outMessage);

    const chat = await this.chatRepository.findById(outMessage.chatId);
    if (chat) {
      chat.updateLastMessage(
        outMessage.content ||
          (outMessage.mediaUrl ? `[${outMessage.type.toUpperCase()}]` : ''),
        false,
      );
      await this.chatRepository.update(chat);
      this.realtimeNotifier.emitChatUpdate(whatsAppAccountId, chat.toJSON());
    }

    this.realtimeNotifier.emitNewMessage(whatsAppAccountId, outMessage.toJSON());
  }
}
