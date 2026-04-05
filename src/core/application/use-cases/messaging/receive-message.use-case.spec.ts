import { ReceiveMessageUseCase } from './receive-message.use-case';
import { Chat } from '../../../domain/entities/chat.entity';
import type { IChatRepository } from '../../../domain/repositories/chat.repository.interface';
import type { IMessageRepository } from '../../../domain/repositories/message.repository.interface';
import type { IWhatsAppMessagingService } from '../../../domain/services/whatsapp-messaging.interface';
import type { IStorageService } from '../../../domain/services/storage.interface';
import type { IWhatsAppAccountRepository } from '../../../domain/repositories/whatsapp-account.repository.interface';
import type { IAgentOrchestrator } from '../../../domain/services/agent-orchestrator.interface';
import type { IRealtimeNotifier } from '../../services/realtime-notifier.interface';
import type { ILogger } from '../../services/logger.interface';
import type {
  IInboundMediaProcessor,
  IInboundMessagePostProcessor,
} from '../../services/messaging-flow.interface';

describe('ReceiveMessageUseCase', () => {
  const makeChat = () =>
    Chat.create({
      id: 'chat-1',
      whatsAppAccountId: 'acc-1',
      customerPhone: '51999999999',
      customerName: 'Cliente',
      unreadCount: 0,
      lastMessageContent: 'prev',
      lastMessageAt: new Date('2026-01-01T00:00:00.000Z'),
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    });

  const makeDeps = () => {
    const chatRepository: jest.Mocked<IChatRepository> = {
      findById: jest.fn(),
      findByCustomerPhone: jest.fn(),
      findByWhatsAppAccountId: jest.fn(),
      findPaginated: jest.fn(),
      save: jest.fn().mockResolvedValue(undefined),
      update: jest.fn().mockResolvedValue(undefined),
      addLabel: jest.fn(),
      removeLabel: jest.fn(),
    };

    const messageRepository: jest.Mocked<IMessageRepository> = {
      findById: jest.fn(),
      findByChatId: jest.fn(),
      findPaginated: jest.fn(),
      findByWaMessageId: jest.fn(),
      save: jest.fn().mockResolvedValue(undefined),
      update: jest.fn(),
      searchGlobal: jest.fn(),
      findContextById: jest.fn(),
    };

    const whatsappService: jest.Mocked<IWhatsAppMessagingService> = {
      sendMessage: jest.fn(),
      markMessageAsRead: jest.fn().mockResolvedValue(true),
      getMediaUrl: jest.fn(),
      subscribeAccount: jest.fn(),
      registerPhoneNumber: jest.fn(),
      getTemplateContent: jest.fn(),
    };

    const storageService: jest.Mocked<IStorageService> = {
      uploadFile: jest.fn(),
      downloadWhatsAppMedia: jest.fn(),
    };

    const accountRepository: jest.Mocked<IWhatsAppAccountRepository> = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findByMetaId: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      updateWebhookStatus: jest.fn(),
      delete: jest.fn(),
    };

    const agentOrchestrator: jest.Mocked<IAgentOrchestrator> = {
      processMessage: jest.fn().mockResolvedValue(undefined),
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

    const mediaProcessor: jest.Mocked<IInboundMediaProcessor> = {
      process: jest.fn().mockResolvedValue(undefined),
    };

    const postProcessor: jest.Mocked<IInboundMessagePostProcessor> = {
      process: jest.fn().mockResolvedValue(undefined),
    };

    return {
      chatRepository,
      messageRepository,
      whatsappService,
      storageService,
      accountRepository,
      agentOrchestrator,
      realtimeNotifier,
      logger,
      mediaProcessor,
      postProcessor,
    };
  };

  it('stores inbound message and triggers notifier + orchestrator', async () => {
    const deps = makeDeps();
    deps.chatRepository.findByCustomerPhone.mockResolvedValue(makeChat());
    deps.messageRepository.findByWaMessageId.mockResolvedValue(null);

    const useCase = new ReceiveMessageUseCase(
      deps.chatRepository,
      deps.messageRepository,
      deps.mediaProcessor,
      deps.postProcessor,
    );

    await useCase.execute({
      whatsAppAccountId: 'acc-1',
      from: '51999999999',
      waMessageId: 'wa-in-1',
      type: 'text',
      content: 'hola',
      timestamp: '1735689600',
    });

    expect(deps.messageRepository.save).toHaveBeenCalledTimes(1);
    expect(deps.postProcessor.process).toHaveBeenCalledTimes(1);
  });

  it('returns early when message already exists', async () => {
    const deps = makeDeps();
    deps.chatRepository.findByCustomerPhone.mockResolvedValue(makeChat());
    deps.messageRepository.findByWaMessageId.mockResolvedValue({} as never);

    const useCase = new ReceiveMessageUseCase(
      deps.chatRepository,
      deps.messageRepository,
      deps.mediaProcessor,
      deps.postProcessor,
    );

    await useCase.execute({
      whatsAppAccountId: 'acc-1',
      from: '51999999999',
      waMessageId: 'wa-existing',
      type: 'text',
      content: 'duplicado',
      timestamp: '1735689600',
    });

    expect(deps.messageRepository.save).not.toHaveBeenCalled();
    expect(deps.postProcessor.process).not.toHaveBeenCalled();
  });
});
