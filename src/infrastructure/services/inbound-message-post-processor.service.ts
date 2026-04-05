import { Injectable, Inject } from '@nestjs/common';
import type {
  IInboundMessagePostProcessor,
  InboundMessagePostProcessInput,
} from '../../core/application/services/messaging-flow.interface';
import type { IWhatsAppMessagingService } from '../../core/domain/services/whatsapp-messaging.interface';
import type { IRealtimeNotifier } from '../../core/application/services/realtime-notifier.interface';
import type { IAgentOrchestrator } from '../../core/domain/services/agent-orchestrator.interface';
import type { ILogger } from '../../core/application/services/logger.interface';
import { I_LOGGER } from '../../core/application/services/logger.interface';

@Injectable()
export class InboundMessagePostProcessorService
  implements IInboundMessagePostProcessor
{
  constructor(
    @Inject('IWhatsAppMessagingService')
    private readonly whatsappService: IWhatsAppMessagingService,
    @Inject('IRealtimeNotifier')
    private readonly realtimeNotifier: IRealtimeNotifier,
    @Inject('IAgentOrchestrator')
    private readonly agentOrchestrator: IAgentOrchestrator,
    @Inject(I_LOGGER)
    private readonly logger: ILogger,
  ) {}

  async process(input: InboundMessagePostProcessInput): Promise<void> {
    const { whatsAppAccountId, waMessageId, customerPhone, chat, message } =
      input;

    await this.whatsappService
      .markMessageAsRead(whatsAppAccountId, waMessageId)
      .catch((error) => {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        this.logger.error(
          `Failed to mark message as read on Meta: ${errorMessage}`,
        );
      });

    this.realtimeNotifier.emitNewMessage(whatsAppAccountId, message.toJSON());
    this.realtimeNotifier.emitChatUpdate(whatsAppAccountId, chat.toJSON());

    this.agentOrchestrator
      .processMessage({
        whatsAppAccountId,
        chatId: chat.id,
        customerPhone,
      })
      .catch((error) => {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        this.logger.error(`Error triggering AI orchestrator: ${errorMessage}`);
      });
  }
}
