import { IChatRepository } from '../../../domain/repositories/chat.repository.interface';
import { DomainException } from '../../../domain/exceptions/domain.exception';
import { IRealtimeNotifier } from '../../services/realtime-notifier.interface';

export interface RemoveLabelRequest {
  chatId: string;
  labelId: string;
}

export class RemoveLabelUseCase {
  constructor(
    private readonly chatRepository: IChatRepository,
    private readonly realtimeNotifier: IRealtimeNotifier,
  ) {}

  async execute(request: RemoveLabelRequest): Promise<void> {
    const chat = await this.chatRepository.findById(request.chatId);
    if (!chat) {
      throw new DomainException('Chat not found');
    }

    await this.chatRepository.removeLabel(request.chatId, request.labelId);

    // Obtener el chat actualizado con las etiquetas para el socket
    const updatedChat = await this.chatRepository.findById(request.chatId);
    if (updatedChat) {
      this.realtimeNotifier.emitChatUpdate(
        chat.whatsAppAccountId,
        updatedChat.toJSON(),
      );
    }
  }
}
