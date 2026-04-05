import { IChatRepository } from '../../../domain/repositories/chat.repository.interface';
import { ILabelRepository } from '../../../domain/repositories/label.repository.interface';
import { DomainException } from '../../../domain/exceptions/domain.exception';
import { IRealtimeNotifier } from '../../services/realtime-notifier.interface';

export interface AssignLabelRequest {
  chatId: string;
  labelId: string;
}

export class AssignLabelUseCase {
  constructor(
    private readonly chatRepository: IChatRepository,
    private readonly labelRepository: ILabelRepository,
    private readonly realtimeNotifier: IRealtimeNotifier,
  ) {}

  async execute(request: AssignLabelRequest): Promise<void> {
    const chat = await this.chatRepository.findById(request.chatId);
    if (!chat) {
      throw new DomainException('Chat not found');
    }

    const label = await this.labelRepository.findById(request.labelId);
    if (!label) {
      throw new DomainException('Label not found');
    }

    if (label.whatsAppAccountId !== chat.whatsAppAccountId) {
      throw new DomainException(
        'Label does not belong to the same WhatsApp account as the chat',
      );
    }

    await this.chatRepository.addLabel(request.chatId, request.labelId);

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
