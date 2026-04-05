import type {
  AIModelConfig,
  AIMessageContext,
} from '../../domain/services/ai.interface';
import type { AIProvider } from '../../domain/entities/ai-config.entity';
import type { AIResponse } from '../../domain/services/ai.interface';

export interface IAIResponseGenerator {
  generateResponse(
    provider: AIProvider,
    config: AIModelConfig,
    systemPrompt: string,
    history: AIMessageContext[],
  ): Promise<AIResponse>;
}

export const I_AI_RESPONSE_GENERATOR = 'IAIResponseGenerator';
