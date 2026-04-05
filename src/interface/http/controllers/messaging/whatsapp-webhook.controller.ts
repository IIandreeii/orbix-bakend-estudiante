import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  Logger,
  Inject,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { ReceiveMessageUseCase } from '../../../../core/application/use-cases/messaging/receive-message.use-case';
import { HandleMessageStatusUseCase } from '../../../../core/application/use-cases/messaging/handle-message-status.use-case';
import type { IWhatsAppAccountRepository } from '../../../../core/domain/repositories/whatsapp-account.repository.interface';
import { translateMetaError } from '../../../../infrastructure/external-apis/whatsapp/whatsapp-error.messages';

@ApiTags('webhooks/whatsapp')
@Controller('webhooks/whatsapp')
export class WhatsAppWebhookController {
  private readonly logger = new Logger(WhatsAppWebhookController.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly receiveMessageUseCase: ReceiveMessageUseCase,
    private readonly handleMessageStatusUseCase: HandleMessageStatusUseCase,
    @Inject('IWhatsAppAccountRepository')
    private readonly accountRepository: IWhatsAppAccountRepository,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Verificación del Webhook de WhatsApp' })
  verify(
    @Query()
    query: {
      'hub.mode'?: string;
      'hub.verify_token'?: string;
      'hub.challenge'?: string;
    },
  ) {
    const mode = query['hub.mode'];
    const token = query['hub.verify_token'];
    const challenge = query['hub.challenge'];

    const verifyToken =
      this.configService.get<string>('WHATSAPP_VERIFY_TOKEN') ||
      'orbix_secret';

    if (mode && token) {
      if (mode === 'subscribe' && token === verifyToken) {
        this.logger.log('Webhook verificado correctamente');
        return challenge;
      }
    }
    return 'Forbidden';
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Recepción de eventos de WhatsApp' })
  async handle(@Body() body: unknown) {
    if (!this.isWhatsAppWebhook(body)) {
      return { status: 'ignored' };
    }
    if (body.object === 'whatsapp_business_account') {
      for (const entry of body.entry) {
        for (const change of entry.changes) {
          if (change.value.messages) {
            for (const message of change.value.messages) {
              const contact = change.value.contacts?.[0];
              const phoneId = change.value.metadata.phone_number_id;

              await this.processMessage(phoneId, contact, message);
            }
          }

          if (change.value.statuses) {
            for (const status of change.value.statuses) {
              await this.processStatus(status);
            }
          }

          if (change.value.errors) {
            for (const error of change.value.errors) {
              this.logger.error(`General WABA Error: ${JSON.stringify(error)}`);
            }
          }
        }
      }
    }
    return { status: 'ok' };
  }

  private async processMessage(
    phoneId: string,
    contact: WhatsAppContact | undefined,
    message: WhatsAppMessage,
  ) {
    try {
      const account = await this.accountRepository.findByMetaId(phoneId);
      if (!account) {
        this.logger.warn(
          `Received message for unknown Meta Phone ID: ${phoneId}`,
        );
        return;
      }

      const type = message.type;
      let content: string | undefined;
      let mediaId: string | undefined;
      let mimeType: string | undefined;
      let quotedMessageId: string | undefined;

      if (message.context) {
        quotedMessageId = message.context.message_id;
      }

      if (type === 'text') {
        content = message.text?.body;
      } else if (type === 'reaction') {
        content = message.reaction?.emoji;
        quotedMessageId = message.reaction?.message_id;
      } else if (
        ['image', 'video', 'audio', 'document', 'sticker'].includes(type)
      ) {
        const mediaPayload = message[type as keyof WhatsAppMessage] as
          | { id?: string; mime_type?: string; caption?: string }
          | undefined;
        mediaId = mediaPayload?.id;
        mimeType = mediaPayload?.mime_type;
        content = mediaPayload?.caption || undefined;
      }

      await this.receiveMessageUseCase.execute({
        whatsAppAccountId: account.id,
        from: message.from,
        customerName: contact?.profile?.name,
        waMessageId: message.id,
        type,
        content,
        mediaId,
        mimeType,
        quotedMessageId,
        timestamp: message.timestamp,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Error processing webhook message: ${errorMessage}`);
    }
  }

  private async processStatus(status: WhatsAppStatus) {
    try {
      const { id: waMessageId, status: statusType, errors } = status;

      let errorCode: number | undefined;
      let errorDetails: string | undefined;

      if (errors && errors.length > 0) {
        const error = errors[0];
        errorCode = error.code;
        const subcode = error.error_subcode;
        const details = error.error_data?.details || error.details || '';
        const message = translateMetaError(
          errorCode || 0,
          error.message || error.title || 'Error desconocido',
        );

        errorDetails = `Error de WhatsApp (${errorCode}${subcode ? ':' + subcode : ''}): ${message}${details ? ' - ' + details : ''}`;
      }

      await this.handleMessageStatusUseCase.execute({
        waMessageId,
        status: statusType,
        errorCode,
        errorDetails,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Error processing webhook status: ${errorMessage}`);
    }
  }

  private isWhatsAppWebhook(body: unknown): body is WhatsAppWebhookPayload {
    return (
      typeof body === 'object' &&
      body !== null &&
      'object' in body &&
      'entry' in body
    );
  }
}

interface WhatsAppWebhookPayload {
  object: string;
  entry: Array<{
    changes: Array<{
      value: {
        messages?: WhatsAppMessage[];
        statuses?: WhatsAppStatus[];
        errors?: Array<{
          code?: number;
          error_subcode?: number;
          error_data?: { details?: string };
          details?: string;
          message?: string;
          title?: string;
        }>;
        contacts?: WhatsAppContact[];
        metadata: { phone_number_id: string };
      };
    }>;
  }>;
}

interface WhatsAppContact {
  profile?: { name?: string };
}

interface WhatsAppMessage {
  id: string;
  from: string;
  timestamp: string;
  type: string;
  text?: { body?: string };
  reaction?: { emoji?: string; message_id?: string };
  context?: { message_id?: string };
  image?: { id?: string; mime_type?: string; caption?: string };
  video?: { id?: string; mime_type?: string; caption?: string };
  audio?: { id?: string; mime_type?: string; caption?: string };
  document?: { id?: string; mime_type?: string; caption?: string };
  sticker?: { id?: string; mime_type?: string; caption?: string };
}

interface WhatsAppStatus {
  id: string;
  status: string;
  errors?: Array<{
    code?: number;
    error_subcode?: number;
    error_data?: { details?: string };
    details?: string;
    message?: string;
    title?: string;
  }>;
  context?: { id?: string };
}
