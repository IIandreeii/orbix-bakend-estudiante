import { SendMessageUseCase } from './send-message.use-case';
import { Chat } from '../../../domain/entities/chat.entity';
import type { IChatRepository } from '../../../domain/repositories/chat.repository.interface';
import type { IMessageRepository } from '../../../domain/repositories/message.repository.interface';
import type { IWhatsAppMessagingService } from '../../../domain/services/whatsapp-messaging.interface';
import type { IQuickResponseRepository } from '../../../domain/repositories/quick-response.repository.interface';
import type { IWhatsAppTemplateRepository } from '../../../domain/repositories/whatsapp-template.repository.interface';
import type { IRealtimeNotifier } from '../../services/realtime-notifier.interface';
import { DomainException } from '../../../domain/exceptions/domain.exception';
import type {
  IMessageContentResolver,
  IOutboundMessageDispatcher,
} from '../../services/messaging-flow.interface';

describe('SendMessageUseCase', () => {
  const makeChat = () =>
    Chat.create({
      id: 'chat-1',
      whatsAppAccountId: 'acc-1',
      customerPhone: '51999999999',
      unreadCount: 0,
      lastMessageContent: 'anterior',
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
      save: jest.fn(),
      update: jest.fn(),
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

    const messagingService: jest.Mocked<IWhatsAppMessagingService> = {
      sendMessage: jest.fn().mockResolvedValue({
        waMessageId: 'wa-1',
        status: 'sent',
      }),
      markMessageAsRead: jest.fn(),
      getMediaUrl: jest.fn(),
      subscribeAccount: jest.fn(),
      registerPhoneNumber: jest.fn(),
      getTemplateContent: jest.fn(),
    };

    const quickResponseRepository: jest.Mocked<IQuickResponseRepository> = {
      findById: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByKeyword: jest.fn(),
    };

    const templateRepository: jest.Mocked<IWhatsAppTemplateRepository> = {
      findById: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByName: jest.fn(),
    };

    const realtimeNotifier: jest.Mocked<IRealtimeNotifier> = {
      emitNewMessage: jest.fn(),
      emitStatusUpdate: jest.fn(),
      emitChatUpdate: jest.fn(),
    };

    const contentResolver: jest.Mocked<IMessageContentResolver> = {
      resolve: jest.fn().mockResolvedValue('Hola cliente'),
    };

    const outboundDispatcher: jest.Mocked<IOutboundMessageDispatcher> = {
      dispatch: jest.fn().mockResolvedValue(undefined),
    };

    return {
      chatRepository,
      messageRepository,
      messagingService,
      quickResponseRepository,
      templateRepository,
      realtimeNotifier,
      contentResolver,
      outboundDispatcher,
    };
  };

  it('sends a text message and emits realtime events', async () => {
    const deps = makeDeps();
    deps.chatRepository.findByCustomerPhone.mockResolvedValue(makeChat());

    const useCase = new SendMessageUseCase(
      deps.chatRepository,
      deps.quickResponseRepository,
      deps.templateRepository,
      deps.contentResolver,
      deps.outboundDispatcher,
    );

    await useCase.execute({
      whatsAppAccountId: 'acc-1',
      to: '51999999999',
      type: 'text',
      content: 'Hola cliente',
    });

    expect(deps.outboundDispatcher.dispatch).toHaveBeenCalledTimes(1);
  });

  it('throws when quick response key does not exist', async () => {
    const deps = makeDeps();
    deps.quickResponseRepository.findByKeyword.mockResolvedValue(null);

    const useCase = new SendMessageUseCase(
      deps.chatRepository,
      deps.quickResponseRepository,
      deps.templateRepository,
      deps.contentResolver,
      deps.outboundDispatcher,
    );

    await expect(
      useCase.execute({
        whatsAppAccountId: 'acc-1',
        to: '51999999999',
        quickResponseKey: 'missing-key',
      }),
    ).rejects.toBeInstanceOf(DomainException);

    expect(deps.outboundDispatcher.dispatch).not.toHaveBeenCalled();
  });
});
