import type { Message } from '../../domain/entities/message.entity';
import type {
  AIMessageContext,
  AIResponse,
} from '../../domain/services/ai.interface';
import type { KnowledgeContext } from '../../domain/services/knowledge-retrieval.interface';

export interface IAISystemPromptBuilder {
  build(knowledge: KnowledgeContext): string;
}

export interface IAIHistoryMapper {
  map(messages: Message[]): AIMessageContext[];
}

export interface AIOutboundDraft {
  messageType: 'text' | 'image' | 'video';
  textContent: string;
  mediaUrl?: string;
}

export interface IAIOutboundDraftFactory {
  fromAIResponse(response: AIResponse): AIOutboundDraft;
  templateAuditContent(templateCode: string, parameters: string[]): string;
}

export interface AIResponseDeliveryInput {
  whatsAppAccountId: string;
  chatId: string;
  customerPhone: string;
  response: AIResponse;
}

export interface IAIResponseDeliveryService {
  deliver(input: AIResponseDeliveryInput): Promise<void>;
}

export const I_AI_SYSTEM_PROMPT_BUILDER = 'IAISystemPromptBuilder';
export const I_AI_HISTORY_MAPPER = 'IAIHistoryMapper';
export const I_AI_OUTBOUND_DRAFT_FACTORY = 'IAIOutboundDraftFactory';
export const I_AI_RESPONSE_DELIVERY_SERVICE = 'IAIResponseDeliveryService';
