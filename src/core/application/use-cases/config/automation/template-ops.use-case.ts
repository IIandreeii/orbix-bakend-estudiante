import { NotFoundDomainException } from '../../../../domain/exceptions/domain.exception';
import type { IWhatsAppTemplateRepository } from '../../../../domain/repositories/whatsapp-template.repository.interface';
import {
  WhatsAppTemplate,
  TemplateType,
} from '../../../../domain/entities/whatsapp-template.entity';
import type { IWhatsAppMessagingService } from '../../../../domain/services/whatsapp-messaging.interface';

export interface UpdateTemplateRequest {
  id: string;
  name?: string;
  language?: string;
  templateType?: TemplateType;
  status?: string;
}

export class UpdateTemplateUseCase {
  constructor(
    private readonly repository: IWhatsAppTemplateRepository,
    private readonly messagingService: IWhatsAppMessagingService,
  ) {}

  async execute(request: UpdateTemplateRequest): Promise<void> {
    const existing = await this.repository.findById(request.id);
    if (!existing) {
      throw new NotFoundDomainException('Template not found');
    }

    let content = existing.content;

    // If name is changed, or we just want to force sync content
    const nameToSync = request.name || existing.name;
    const whatsAppAccountId = existing.whatsAppAccountId;

    const metaContent = await this.messagingService.getTemplateContent(
      whatsAppAccountId,
      nameToSync,
    );

    if (metaContent) {
      content = metaContent;
    }

    const updated = WhatsAppTemplate.create({
      ...existing.toJSON(),
      ...request,
      content,
      updatedAt: new Date(),
    });

    await this.repository.update(updated);
  }
}

export class DeleteTemplateUseCase {
  constructor(private readonly repository: IWhatsAppTemplateRepository) {}

  async execute(id: string): Promise<void> {
    const template = await this.repository.findById(id);
    if (!template) {
      throw new NotFoundDomainException('Template not found');
    }
    await this.repository.delete(id);
  }
}
