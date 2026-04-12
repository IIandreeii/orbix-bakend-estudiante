import type { IWhatsAppTemplateRepository } from '../../../domain/repositories/whatsapp-template.repository.interface';

export interface ListTemplatesRequest {
  whatsAppAccountId: string;
  page?: number;
  limit?: number;
}

export class ListTemplatesUseCase {
  constructor(
    private readonly templateRepository: IWhatsAppTemplateRepository,
  ) {}

  async execute(request: ListTemplatesRequest) {
    return this.templateRepository.findAll({
      whatsAppAccountId: request.whatsAppAccountId,
      page: request.page || 1,
      limit: request.limit || 10,
    });
  }
}