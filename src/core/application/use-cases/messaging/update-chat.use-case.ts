import type { IChatRepository } from '../../../domain/repositories/chat.repository.interface';
import { Chat } from '../../../domain/entities/chat.entity';
import { NotFoundDomainException } from '../../../domain/exceptions/domain.exception';

export interface UpdateChatParams {
  chatId: string;
  customerName?: string;
}

export class UpdateChatUseCase {
  constructor(private readonly chatRepository: IChatRepository) {}

  async execute(params: UpdateChatParams): Promise<Chat> {
    const chat = await this.chatRepository.findById(params.chatId);
    if (!chat) {
      throw new NotFoundDomainException('Chat no encontrado');
    }

    const data = chat.toJSON();
    const updated = Chat.create({
      ...data,
      customerName: params.customerName !== undefined ? params.customerName : data.customerName,
      updatedAt: new Date()
    });

    await this.chatRepository.update(updated);
    return updated;
  }
}
