import type { IMessageRepository } from '../../../domain/repositories/message.repository.interface';

export interface ListMessagesRequest {
  chatId: string;
  page?: number;
  limit?: number;
  search?: string;
  beforeId?: string;
  afterId?: string;
}

export class ListMessagesUseCase {
  constructor(private readonly messageRepository: IMessageRepository) {}

  async execute(request: ListMessagesRequest) {
    return this.messageRepository.findPaginated({
      chatId: request.chatId,
      page: request.page || 1,
      limit: request.limit || 30,
      search: request.search || undefined,
      beforeId: request.beforeId,
      afterId: request.afterId,
    });
  }
}
