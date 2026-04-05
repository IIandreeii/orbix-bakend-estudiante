import { ProcessAIResponseUseCase } from './process-ai-response.use-case';
import { AIConfig, AIModel, AIProvider } from '../../../domain/entities/ai-config.entity';
import { Message, MessageDirection, MessageStatus, MessageType } from '../../../domain/entities/message.entity';
import type { IAIConfigRepository } from '../../../domain/repositories/ai-config.repository.interface';
import type { IMessageRepository } from '../../../domain/repositories/message.repository.interface';
import type { IKnowledgeRetrievalService } from '../../../domain/services/knowledge-retrieval.interface';
import type { IAIResponseGenerator } from '../../services/ai-factory.interface';
import type { IRealtimeNotifier } from '../../services/realtime-notifier.interface';
import type { ILogger } from '../../services/logger.interface';
import type {
  IAIHistoryMapper,
  IAIResponseDeliveryService,
  IAISystemPromptBuilder,
} from '../../services/ai-orchestration.interface';

describe('ProcessAIResponseUseCase', () => {
  const makeAIConfig = () =>
    AIConfig.create({
      id: 'cfg-1',
      whatsAppAccountId: 'acc-1',
      provider: AIProvider.OPENAI,
      model: AIModel.GPT_4O,
      apiKey: 'sk-test',
      isAssistantEnabled: true,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    });

  const makeMessages = () => [
    Message.create({
      id: 'm1',
      chatId: 'chat-1',
      direction: MessageDirection.INBOUND,
      type: MessageType.TEXT,
      content: 'hola',
      status: MessageStatus.READ,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    }),
  ];

  const makeDeps = () => {
    const aiConfigRepository: jest.Mocked<IAIConfigRepository> = {
      findById: jest.fn(),
      findByWhatsAppAccountId: jest.fn().mockResolvedValue(makeAIConfig()),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const messageRepository: jest.Mocked<IMessageRepository> = {
      findById: jest.fn(),
      findByChatId: jest.fn().mockResolvedValue(makeMessages()),
      findPaginated: jest.fn(),
      findByWaMessageId: jest.fn(),
      save: jest.fn().mockResolvedValue(undefined),
      update: jest.fn(),
      searchGlobal: jest.fn(),
      findContextById: jest.fn(),
    };

    const knowledgeService: jest.Mocked<IKnowledgeRetrievalService> = {
      getKnowledgeContext: jest.fn().mockResolvedValue({
        storeInfo: 'store',
        productsInfo: 'products',
        quickResponsesInfo: 'faq',
        templatesInfo: 'templates',
      }),
    };

    const aiFactory: jest.Mocked<IAIResponseGenerator> = {
      generateResponse: jest.fn().mockResolvedValue({
        type: 'text',
        content: 'respuesta IA',
      }),
    };

    const realtimeNotifier: jest.Mocked<IRealtimeNotifier> = {
      emitNewMessage: jest.fn(),
      emitStatusUpdate: jest.fn(),
      emitChatUpdate: jest.fn(),
    };

    const logger: ILogger = {
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    const promptBuilder: jest.Mocked<IAISystemPromptBuilder> = {
      build: jest.fn().mockReturnValue('prompt-system'),
    };

    const historyMapper: jest.Mocked<IAIHistoryMapper> = {
      map: jest.fn().mockReturnValue([{ role: 'user', content: 'hola' }]),
    };

    const responseDelivery: jest.Mocked<IAIResponseDeliveryService> = {
      deliver: jest.fn().mockResolvedValue(undefined),
    };

    return {
      aiConfigRepository,
      messageRepository,
      knowledgeService,
      aiFactory,
      responseDelivery,
      realtimeNotifier,
      logger,
      promptBuilder,
      historyMapper,
    };
  };

  it('builds prompt/history and sends outbound AI text', async () => {
    const deps = makeDeps();

    const useCase = new ProcessAIResponseUseCase(
      deps.aiConfigRepository,
      deps.messageRepository,
      deps.knowledgeService,
      deps.aiFactory,
      deps.responseDelivery,
      deps.realtimeNotifier,
      deps.logger,
      deps.promptBuilder,
      deps.historyMapper,
    );

    await useCase.processMessage({
      whatsAppAccountId: 'acc-1',
      chatId: 'chat-1',
      customerPhone: '51999999999',
    });

    expect(deps.promptBuilder.build).toHaveBeenCalledTimes(1);
    expect(deps.historyMapper.map).toHaveBeenCalledTimes(1);
    expect(deps.aiFactory.generateResponse).toHaveBeenCalledTimes(1);
    expect(deps.responseDelivery.deliver).toHaveBeenCalledWith({
      whatsAppAccountId: 'acc-1',
      chatId: 'chat-1',
      customerPhone: '51999999999',
      response: { type: 'text', content: 'respuesta IA' },
    });
    expect(deps.messageRepository.save).not.toHaveBeenCalled();
  });

  it('logs error and saves failed message when ai provider crashes', async () => {
    const deps = makeDeps();
    deps.aiFactory.generateResponse.mockRejectedValueOnce(new Error('boom-ai'));

    const useCase = new ProcessAIResponseUseCase(
      deps.aiConfigRepository,
      deps.messageRepository,
      deps.knowledgeService,
      deps.aiFactory,
      deps.responseDelivery,
      deps.realtimeNotifier,
      deps.logger,
      deps.promptBuilder,
      deps.historyMapper,
    );

    await useCase.processMessage({
      whatsAppAccountId: 'acc-1',
      chatId: 'chat-1',
      customerPhone: '51999999999',
    });

    expect(deps.logger.error).toHaveBeenCalledWith(
      'Error processing Orchestrator AI message: boom-ai',
    );
    expect(deps.messageRepository.save).toHaveBeenCalled();
    expect(deps.realtimeNotifier.emitNewMessage).toHaveBeenCalled();
  });
});
