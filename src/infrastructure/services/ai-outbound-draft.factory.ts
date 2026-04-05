import { Injectable } from '@nestjs/common';
import type {
  AIOutboundDraft,
  IAIOutboundDraftFactory,
} from '../../core/application/services/ai-orchestration.interface';
import type { AIResponse } from '../../core/domain/services/ai.interface';

@Injectable()
export class AIOutboundDraftFactory implements IAIOutboundDraftFactory {
  fromAIResponse(response: AIResponse): AIOutboundDraft {
    const mediaUrl = response.mediaUrl;
    const mediaType = response.mediaType || 'image';
    const textContent =
      response.content || (mediaUrl ? '' : 'Hubo un error al generar mi respuesta.');

    return {
      messageType: mediaUrl ? mediaType : 'text',
      textContent,
      mediaUrl,
    };
  }

  templateAuditContent(templateCode: string, parameters: string[]): string {
    return `[Plantilla IA: ${templateCode}] Params: ${parameters.join(', ')}`;
  }
}
