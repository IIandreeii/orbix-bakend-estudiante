import type { IMessageRepository } from '../../../domain/repositories/message.repository.interface';
import { MessageStatus } from '../../../domain/entities/message.entity';
import type { IChatRepository } from '../../../domain/repositories/chat.repository.interface';
import type { ILogger } from '../../services/logger.interface';
import type { IRealtimeNotifier } from '../../services/realtime-notifier.interface';

export interface HandleMessageStatusRequest {
  waMessageId: string;
  status: string;
  errorCode?: number;
  errorDetails?: string;
}

export class HandleMessageStatusUseCase {
  constructor(
    private readonly messageRepository: IMessageRepository,
    private readonly chatRepository: IChatRepository,
    private readonly realtimeNotifier: IRealtimeNotifier,
    private readonly logger: ILogger,
  ) {}

  async execute(request: HandleMessageStatusRequest): Promise<void> {
    const message = await this.messageRepository.findByWaMessageId(
      request.waMessageId,
    );

    if (!message) {
      this.logger.warn(
        `Received status update for unknown message: ${request.waMessageId}`,
      );
      return;
    }

    let domainStatus: MessageStatus;

    switch (request.status) {
      case 'delivered':
        domainStatus = MessageStatus.DELIVERED;
        break;
      case 'read':
        domainStatus = MessageStatus.READ;
        break;
      case 'failed':
        domainStatus = MessageStatus.FAILED;
        break;
      case 'sent':
      default:
        domainStatus = MessageStatus.SENT;
        break;
    }

    message.updateStatus(domainStatus, request.errorCode, request.errorDetails);

    await this.messageRepository.update(message);

    if (domainStatus === MessageStatus.FAILED) {
      this.logger.error(
        `Message ${request.waMessageId} FAILED. Code: ${request.errorCode}, Details: ${request.errorDetails}`,
      );
    } else {
      this.logger.log(
        `Message ${request.waMessageId} status updated to: ${domainStatus}`,
      );
    }

    const chat = await this.chatRepository.findById(message.chatId);
    if (chat) {
      this.realtimeNotifier.emitStatusUpdate(chat.whatsAppAccountId, {
        waMessageId: message.waMessageId,
        status: domainStatus,
        chatId: chat.id,
        errorCode: request.errorCode,
        errorDetails: request.errorDetails,
      });
    }
  }
}
