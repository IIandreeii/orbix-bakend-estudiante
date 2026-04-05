import type { IChatRepository } from '../../../domain/repositories/chat.repository.interface';
import type { IRealtimeNotifier } from '../../services/realtime-notifier.interface';

export interface MarkChatAsReadRequest {
  chatId: string;
}

export class MarkChatAsReadUseCase {
  constructor(
    private readonly chatRepository: IChatRepository,
    private readonly realtimeNotifier: IRealtimeNotifier,
  ) {}

  async execute(request: MarkChatAsReadRequest): Promise<void> {
    const chat = await this.chatRepository.findById(request.chatId);
    if (!chat) return;

    chat.markAsRead();
    await this.chatRepository.update(chat);

    this.realtimeNotifier.emitChatUpdate(chat.whatsAppAccountId, chat.toJSON());
  }
}
