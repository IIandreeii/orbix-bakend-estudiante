import { Injectable } from '@nestjs/common';
import type { IAIHistoryMapper } from '../../core/application/services/ai-orchestration.interface';
import type { AIMessageContext } from '../../core/domain/services/ai.interface';
import {
  Message,
  MessageDirection,
  MessageType,
} from '../../core/domain/entities/message.entity';

@Injectable()
export class AIHistoryMapper implements IAIHistoryMapper {
  map(messages: Message[]): AIMessageContext[] {
    return messages
      .filter((msg) => msg.type !== MessageType.REACTION)
      .map((msg) => ({
        role:
          msg.direction === MessageDirection.INBOUND ? 'user' : 'assistant',
        content:
          msg.type === MessageType.TEXT
            ? msg.content || ''
            : `[Aviso: El usuario envio un mensaje de tipo ${msg.type}${msg.content ? ': ' + msg.content : ''}]`,
        mediaUrl: msg.mediaUrl || undefined,
        mimeType: msg.mimeType || undefined,
      }));
  }
}
