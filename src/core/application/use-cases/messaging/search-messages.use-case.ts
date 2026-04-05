import type { IMessageRepository } from '../../../domain/repositories/message.repository.interface';

export interface SearchMessagesRequest {
  whatsAppAccountId: string;
  search: string;
  labelId?: string;
  page?: number;
  limit?: number;
}

export class SearchMessagesUseCase {
  constructor(private readonly messageRepository: IMessageRepository) {}

  async execute(request: SearchMessagesRequest) {
    if (!request.search && !request.labelId) {
      return {
        data: [],
        total: 0,
        page: 1,
        limit: request.limit || 20,
        totalPages: 0,
      };
    }

    return this.messageRepository.searchGlobal({
      whatsAppAccountId: request.whatsAppAccountId,
      search: request.search,
      labelId: request.labelId,
      page: request.page || 1,
      limit: request.limit || 20,
    });
  }
}
