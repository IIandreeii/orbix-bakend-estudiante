import type { IWhatsAppTemplateRepository } from '../../../domain/repositories/whatsapp-template.repository.interface';
import type { IWhatsAppMessagingService } from '../../../domain/services/whatsapp-messaging.interface';

export interface UpdateTemplateRequest {
  whatsAppAccountId: string;
  templateId: string;
  category?: string;
  components?: any[];
  language?: string;
}

export class UpdateTemplateUseCase {
  constructor(
    private readonly templateRepository: IWhatsAppTemplateRepository,
    private readonly whatsAppService: IWhatsAppMessagingService,
  ) {}

  async execute(request: UpdateTemplateRequest): Promise<void> {
    const { whatsAppAccountId, templateId, ...updateData } = request;

    const template = await this.templateRepository.findById(templateId);

    if (!template) {
      throw new Error(`Template not found with ID: ${templateId}`);
    }

    await this.whatsAppService.updateTemplate(
      whatsAppAccountId,
      templateId,
      updateData,
    );

    Object.assign(template, {
      ...updateData,
      updatedAt: new Date(),
    });

    await this.templateRepository.update(template);
  }
}