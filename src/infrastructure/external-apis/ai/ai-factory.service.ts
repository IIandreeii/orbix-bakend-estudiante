import { Injectable, Logger } from '@nestjs/common';
import {
  IAIService,
  AIModelConfig,
  AIMessageContext,
  AIResponse,
} from '../../../core/domain/services/ai.interface';
import { AIProvider } from '../../../core/domain/entities/ai-config.entity';
import { GeminiService } from './gemini.service';
import { OpenAIService } from './openai.service';
import type { IAIResponseGenerator } from '../../../core/application/services/ai-factory.interface';

@Injectable()
export class AIFactoryService implements IAIResponseGenerator {
  private readonly logger = new Logger(AIFactoryService.name);

  constructor(
    private readonly geminiService: GeminiService,
    private readonly openaiService: OpenAIService,
  ) {}

  async generateResponse(
    provider: AIProvider,
    config: AIModelConfig,
    systemPrompt: string,
    history: AIMessageContext[],
  ): Promise<AIResponse> {
    let aiService: IAIService;

    switch (provider) {
      case AIProvider.GOOGLE:
        aiService = this.geminiService;
        break;
      case AIProvider.OPENAI:
        aiService = this.openaiService;
        break;
      case AIProvider.ANTHROPIC:
        this.logger.warn(
          `Anthropic provider selected but not implemented yet. Falling back to Gemini.`,
        );
        aiService = this.geminiService;
        break;
      default:
        throw new Error(`Unsupported AI Provider: ${String(provider)}`);
    }

    this.logger.log(
      `Routing AI request to [${provider}] using model [${config.model}]`,
    );
    return await aiService.generateResponse(config, systemPrompt, history);
  }
}
