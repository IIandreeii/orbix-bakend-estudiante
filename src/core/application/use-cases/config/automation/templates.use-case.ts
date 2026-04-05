import type {
  IWhatsAppTemplateRepository,
  TemplateFilter,
  PaginatedTemplates,
} from '../../../../domain/repositories/whatsapp-template.repository.interface';
import {
  WhatsAppTemplate,
  TemplateType,
} from '../../../../domain/entities/whatsapp-template.entity';
import type { IWhatsAppMessagingService } from '../../../../domain/services/whatsapp-messaging.interface';
import { v4 as uuidv4 } from 'uuid';

export interface CreateTemplateRequest {
  whatsAppAccountId: string;
  name: string;
  language: string;
  templateType: TemplateType;
}

export class CreateTemplateUseCase {
  constructor(
    private readonly repository: IWhatsAppTemplateRepository,
    private readonly messagingService: IWhatsAppMessagingService,
  ) {}

  async execute(request: CreateTemplateRequest) {
    const content = await this.messagingService.getTemplateContent(
      request.whatsAppAccountId,
      request.name,
    );

    const template = WhatsAppTemplate.create({
      id: uuidv4(),
      ...request,
      content: content ?? undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.repository.save(template);
    return { id: template.id };
  }
}

export class ListTemplatesUseCase {
  constructor(private readonly repository: IWhatsAppTemplateRepository) {}

  async execute(filter: Partial<TemplateFilter>): Promise<PaginatedTemplates> {
    return await this.repository.findAll({
      ...filter,
      page: Number(filter.page) || 1,
      limit: Number(filter.limit) || 10,
    } as TemplateFilter);
  }
}
