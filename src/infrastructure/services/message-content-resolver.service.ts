import { Injectable, Inject } from '@nestjs/common';
import type {
  IMessageContentResolver,
} from '../../core/application/services/messaging-flow.interface';
import type {
  SendMessageOptions,
  TemplateOptions,
} from '../../core/domain/services/whatsapp-messaging.interface';
import type { IWhatsAppTemplateRepository } from '../../core/domain/repositories/whatsapp-template.repository.interface';

@Injectable()
export class MessageContentResolverService implements IMessageContentResolver {
  constructor(
    @Inject('IWhatsAppTemplateRepository')
    private readonly templateRepository: IWhatsAppTemplateRepository,
  ) {}

  async resolve(
    whatsAppAccountId: string,
    options: SendMessageOptions,
  ): Promise<string> {
    const { content, template } = options;
    const type = options.type || 'text';

    if (type === 'template' && template) {
      const tpl = await this.templateRepository.findByName(
        whatsAppAccountId,
        template.name,
      );
      if (tpl && tpl.content) {
        let translatedText = tpl.content;
        const bodyComponent = this.getTemplateBodyComponent(template);
        if (bodyComponent) {
          bodyComponent.parameters.forEach((param, index) => {
            const value = param.text || param.payload || `{{${index + 1}}}`;
            translatedText = translatedText.replace(`{{${index + 1}}}`, value);
          });
        }
        return translatedText;
      }
      return '';
    }

    if (content && typeof content === 'string') {
      return content;
    }

    if (type === 'text') {
      return '';
    }

    return '';
  }

  private getTemplateBodyComponent(template: TemplateOptions): {
    parameters: Array<{ text?: string; payload?: string }>;
  } | null {
    if (!template.components) return null;

    for (const component of template.components) {
      if (
        typeof component === 'object' &&
        component &&
        'type' in component &&
        typeof (component as { type?: string }).type === 'string' &&
        (component as { type?: string }).type?.toLowerCase() === 'body' &&
        'parameters' in component &&
        Array.isArray((component as { parameters?: unknown }).parameters)
      ) {
        return {
          parameters: (
            component as {
              parameters: Array<{ text?: string; payload?: string }>;
            }
          ).parameters,
        };
      }
    }

    return null;
  }
}
