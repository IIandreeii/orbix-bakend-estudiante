import { Chat } from '../entities/chat.entity';

export interface FindChatsQuery {
  whatsAppAccountId: string;
  page?: number;
  limit?: number;
  search?: string; // buscar por nombre o teléfono del cliente
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IChatRepository {
  findById(id: string): Promise<Chat | null>;
  findByCustomerPhone(
    whatsAppAccountId: string,
    customerPhone: string,
  ): Promise<Chat | null>;
  findByWhatsAppAccountId(whatsAppAccountId: string): Promise<Chat[]>;
  findPaginated(query: FindChatsQuery): Promise<PaginatedResult<Chat>>;
  save(chat: Chat): Promise<void>;
  update(chat: Chat): Promise<void>;
  addLabel(chatId: string, labelId: string): Promise<void>;
  removeLabel(chatId: string, labelId: string): Promise<void>;
}

export const I_CHAT_REPOSITORY = 'IChatRepository';
