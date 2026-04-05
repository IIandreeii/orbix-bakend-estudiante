import type { Chat } from '../../domain/entities/chat.entity';
import type { Message } from '../../domain/entities/message.entity';
import type { SendMessageOptions } from '../../domain/services/whatsapp-messaging.interface';

export interface IMessageContentResolver {
  resolve(
    whatsAppAccountId: string,
    options: SendMessageOptions,
  ): Promise<string>;
}

export interface IOutboundMessageDispatcher {
  dispatch(chat: Chat, options: SendMessageOptions): Promise<void>;
}

export interface InboundMediaProcessInput {
  whatsAppAccountId: string;
  waMessageId: string;
  mediaId?: string;
  mimeType?: string;
}

export interface IInboundMediaProcessor {
  process(input: InboundMediaProcessInput): Promise<string | undefined>;
}

export interface InboundMessagePostProcessInput {
  whatsAppAccountId: string;
  waMessageId: string;
  customerPhone: string;
  chat: Chat;
  message: Message;
}

export interface IInboundMessagePostProcessor {
  process(input: InboundMessagePostProcessInput): Promise<void>;
}

export const I_MESSAGE_CONTENT_RESOLVER = 'IMessageContentResolver';
export const I_OUTBOUND_MESSAGE_DISPATCHER = 'IOutboundMessageDispatcher';
export const I_INBOUND_MEDIA_PROCESSOR = 'IInboundMediaProcessor';
export const I_INBOUND_MESSAGE_POST_PROCESSOR = 'IInboundMessagePostProcessor';
