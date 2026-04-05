import type { IChatRepository } from '../../../domain/repositories/chat.repository.interface';

export interface ListChatsRequest {
  whatsAppAccountId: string;
  page?: number;
  limit?: number;
  search?: string;
}

export class ListChatsUseCase {
  constructor(private readonly chatRepository: IChatRepository) {}

  async execute(request: ListChatsRequest) {
    return this.chatRepository.findPaginated({
      whatsAppAccountId: request.whatsAppAccountId,
      page: request.page || 1,
      limit: request.limit || 20,
      search: request.search || undefined,
    });
  }
}
