import { Injectable, Inject } from '@nestjs/common';
import type { IInboundMediaProcessor } from '../../core/application/services/messaging-flow.interface';
import type { IWhatsAppMessagingService } from '../../core/domain/services/whatsapp-messaging.interface';
import type { IStorageService } from '../../core/domain/services/storage.interface';
import type { IWhatsAppAccountRepository } from '../../core/domain/repositories/whatsapp-account.repository.interface';
import type { ILogger } from '../../core/application/services/logger.interface';
import { I_LOGGER } from '../../core/application/services/logger.interface';

@Injectable()
export class InboundMediaProcessorService implements IInboundMediaProcessor {
  constructor(
    @Inject('IWhatsAppMessagingService')
    private readonly whatsappService: IWhatsAppMessagingService,
    @Inject('IStorageService')
    private readonly storageService: IStorageService,
    @Inject('IWhatsAppAccountRepository')
    private readonly accountRepository: IWhatsAppAccountRepository,
    @Inject(I_LOGGER)
    private readonly logger: ILogger,
  ) {}

  async process(input: {
    whatsAppAccountId: string;
    waMessageId: string;
    mediaId?: string;
    mimeType?: string;
  }): Promise<string | undefined> {
    const { whatsAppAccountId, waMessageId, mediaId, mimeType } = input;

    if (!mediaId || !whatsAppAccountId) {
      return undefined;
    }

    try {
      const account = await this.accountRepository.findById(whatsAppAccountId);
      if (!account) {
        return undefined;
      }

      const mediaUrl = await this.whatsappService.getMediaUrl(
        whatsAppAccountId,
        mediaId,
      );
      const buffer = await this.storageService.downloadWhatsAppMedia(
        mediaUrl,
        account.accessToken,
      );

      const fileName = `${whatsAppAccountId}/${waMessageId}.${mimeType?.split('/')[1] || 'bin'}`;
      return await this.storageService.uploadFile(
        buffer,
        fileName,
        mimeType || 'application/octet-stream',
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to process media: ${message}`);
      return undefined;
    }
  }
}
