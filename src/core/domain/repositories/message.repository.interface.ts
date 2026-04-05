import { Message } from '../entities/message.entity';
import { PaginatedResult } from './chat.repository.interface';
import { ChatLabelInfo } from '../entities/chat.entity';

export interface FindMessagesQuery {
  chatId: string;
  page?: number;
  limit?: number;
  search?: string;
  beforeId?: string;
  afterId?: string;
}

export interface SearchGlobalMessagesQuery {
  whatsAppAccountId: string;
  search: string;
  labelId?: string;
  page?: number;
  limit?: number;
}

export interface MessageWithChat {
  id: string;
  chatId: string;
  waMessageId?: string;
  direction: Message['direction'];
  type: Message['type'];
  content?: string;
  mediaId?: string;
  mediaUrl?: string;
  mimeType?: string;
  status: Message['status'];
  sentByAI?: boolean;
  errorCode?: number;
  errorDetails?: string;
  quotedMessageId?: string;
  createdAt: Date;
  updatedAt: Date;
  chat: {
    customerName?: string;
    customerPhone: string;
    labels?: ChatLabelInfo[];
  };
}

export interface MessageContextResult {
  targetMessage: Message;
  messages: Message[];
  hasMoreBefore: boolean;
  hasMoreAfter: boolean;
}

export interface IMessageRepository {
  findById(id: string): Promise<Message | null>;
  findByChatId(chatId: string, limit?: number): Promise<Message[]>;
  findPaginated(query: FindMessagesQuery): Promise<PaginatedResult<Message>>;
  findByWaMessageId(waMessageId: string): Promise<Message | null>;
  save(message: Message): Promise<void>;
  update(message: Message): Promise<void>;
  searchGlobal(
    query: SearchGlobalMessagesQuery,
  ): Promise<PaginatedResult<MessageWithChat>>;
  findContextById(
    messageId: string,
    limit?: number,
  ): Promise<MessageContextResult | null>;
}
