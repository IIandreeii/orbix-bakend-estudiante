import {
  IAgentOrchestrator,
  ProcessAIParams,
} from '../../../../core/domain/services/agent-orchestrator.interface';
import type { IKnowledgeRetrievalService } from '../../../../core/domain/services/knowledge-retrieval.interface';
import type {
  AIModelConfig,
  AIMessageContext,
} from '../../../../core/domain/services/ai.interface';
import type { IMessageRepository } from '../../../../core/domain/repositories/message.repository.interface';
import type { IAIConfigRepository } from '../../../../core/domain/repositories/ai-config.repository.interface';
import type { IAIResponseGenerator } from '../../services/ai-factory.interface';
import type {
  IAIHistoryMapper,
  IAIResponseDeliveryService,
  IAISystemPromptBuilder,
} from '../../services/ai-orchestration.interface';
import {
  MessageDirection,
  MessageStatus,
  MessageType,
  Message,
} from '../../../../core/domain/entities/message.entity';
import { v4 as uuidv4 } from 'uuid';
import type { IRealtimeNotifier } from '../../services/realtime-notifier.interface';
import type { ILogger } from '../../services/logger.interface';

export class ProcessAIResponseUseCase implements IAgentOrchestrator {
  constructor(
    private readonly aiConfigRepository: IAIConfigRepository,
    private readonly messageRepository: IMessageRepository,
    private readonly knowledgeService: IKnowledgeRetrievalService,
    private readonly aiFactory: IAIResponseGenerator,
    private readonly responseDelivery: IAIResponseDeliveryService,
    private readonly realtimeNotifier: IRealtimeNotifier,
    private readonly logger: ILogger,
    private readonly promptBuilder: IAISystemPromptBuilder,
    private readonly historyMapper: IAIHistoryMapper,
  ) {}

  async processMessage(params: ProcessAIParams): Promise<void> {
    const { whatsAppAccountId, chatId, customerPhone } = params;

    try {
      const aiConfig =
        await this.aiConfigRepository.findByWhatsAppAccountId(
          whatsAppAccountId,
        );
      if (!aiConfig || !aiConfig.isAssistantEnabled || !aiConfig.apiKey) {
        return;
      }

      const messages = await this.messageRepository.findByChatId(chatId, 10);
      if (messages.length === 0) return;

      const knowledge =
        await this.knowledgeService.getKnowledgeContext(whatsAppAccountId);

      const systemPrompt = this.promptBuilder.build(knowledge);

      const aiHistory: AIMessageContext[] = this.historyMapper.map(messages);

      const modelConfig: AIModelConfig = {
        provider: aiConfig.provider,
        apiKey: aiConfig.apiKey,
        model: aiConfig.model,
      };

      const aiResponse = await this.aiFactory.generateResponse(
        aiConfig.provider,
        modelConfig,
        systemPrompt,
        aiHistory,
      );

      await this.responseDelivery.deliver({
        whatsAppAccountId,
        chatId,
        customerPhone,
        response: aiResponse,
      });
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      this.logger.error(
        `Error processing Orchestrator AI message: ${errorMessage}`,
      );

      const failMessage = Message.create({
        id: uuidv4(),
        chatId,
        direction: MessageDirection.OUTBOUND,
        type: MessageType.TEXT,
        content: 'Error al procesar respuesta de IA.',
        status: MessageStatus.FAILED,
        sentByAI: true,
        errorDetails: errorMessage,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await this.messageRepository.save(failMessage);
      this.realtimeNotifier.emitNewMessage(
        whatsAppAccountId,
        failMessage.toJSON(),
      );
    }
  }
}
