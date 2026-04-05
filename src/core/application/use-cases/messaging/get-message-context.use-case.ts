import type {
  IMessageRepository,
  MessageContextResult,
} from '../../../domain/repositories/message.repository.interface';

export interface GetMessageContextRequest {
  messageId: string;
  limit?: number;
}

export class GetMessageContextUseCase {
  constructor(private readonly messageRepository: IMessageRepository) {}

  async execute(
    request: GetMessageContextRequest,
  ): Promise<MessageContextResult | null> {
    return this.messageRepository.findContextById(
      request.messageId,
      request.limit || 20,
    );
  }
}
