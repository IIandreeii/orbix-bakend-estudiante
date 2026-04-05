import { HandleMessageStatusUseCase } from './handle-message-status.use-case';
import { Message, MessageDirection, MessageStatus, MessageType } from '../../../domain/entities/message.entity';
import type { IMessageRepository } from '../../../domain/repositories/message.repository.interface';
import type { IChatRepository } from '../../../domain/repositories/chat.repository.interface';
import type { IRealtimeNotifier } from '../../services/realtime-notifier.interface';
import type { ILogger } from '../../services/logger.interface';

describe('HandleMessageStatusUseCase', () => {
  const makeMessage = () =>
    Message.create({
      id: 'msg-1',
      chatId: 'chat-1',
      waMessageId: 'wa-1',
      direction: MessageDirection.OUTBOUND,
      type: MessageType.TEXT,
      content: 'Hola',
      status: MessageStatus.SENT,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    });

  const makeLogger = (): ILogger => ({
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  });

  const makeDeps = () => {
    const message = makeMessage();

    const messageRepository: jest.Mocked<IMessageRepository> = {
      findById: jest.fn(),
      findByChatId: jest.fn(),
      findPaginated: jest.fn(),
      findByWaMessageId: jest.fn().mockResolvedValue(message),
      save: jest.fn(),
      update: jest.fn().mockResolvedValue(undefined),
      searchGlobal: jest.fn(),
      findContextById: jest.fn(),
    };

    const chatRepository: jest.Mocked<IChatRepository> = {
      findById: jest.fn().mockResolvedValue({
        id: 'chat-1',
        whatsAppAccountId: 'acc-1',
      } as never),
      findByCustomerPhone: jest.fn(),
      findByWhatsAppAccountId: jest.fn(),
      findPaginated: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      addLabel: jest.fn(),
      removeLabel: jest.fn(),
    };

    const realtimeNotifier: jest.Mocked<IRealtimeNotifier> = {
      emitNewMessage: jest.fn(),
      emitStatusUpdate: jest.fn(),
      emitChatUpdate: jest.fn(),
    };

    const logger = makeLogger();

    return { messageRepository, chatRepository, realtimeNotifier, logger };
  };

  it('updates message status and emits realtime update', async () => {
    const { messageRepository, chatRepository, realtimeNotifier, logger } =
      makeDeps();
    const useCase = new HandleMessageStatusUseCase(
      messageRepository,
      chatRepository,
      realtimeNotifier,
      logger,
    );

    await useCase.execute({
      waMessageId: 'wa-1',
      status: 'read',
    });

    expect(messageRepository.update).toHaveBeenCalledTimes(1);
    expect(logger.log).toHaveBeenCalledWith(
      'Message wa-1 status updated to: READ',
    );
    expect(realtimeNotifier.emitStatusUpdate).toHaveBeenCalledWith('acc-1', {
      waMessageId: 'wa-1',
      status: MessageStatus.READ,
      chatId: 'chat-1',
      errorCode: undefined,
      errorDetails: undefined,
    });
  });

  it('logs warning and exits when message does not exist', async () => {
    const { messageRepository, chatRepository, realtimeNotifier, logger } =
      makeDeps();
    messageRepository.findByWaMessageId.mockResolvedValueOnce(null);

    const useCase = new HandleMessageStatusUseCase(
      messageRepository,
      chatRepository,
      realtimeNotifier,
      logger,
    );

    await useCase.execute({
      waMessageId: 'wa-missing',
      status: 'delivered',
    });

    expect(logger.warn).toHaveBeenCalledWith(
      'Received status update for unknown message: wa-missing',
    );
    expect(messageRepository.update).not.toHaveBeenCalled();
    expect(realtimeNotifier.emitStatusUpdate).not.toHaveBeenCalled();
  });
});
