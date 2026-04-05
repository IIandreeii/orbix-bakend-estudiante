import type { IWhatsAppAccountRepository } from '../../../../domain/repositories/whatsapp-account.repository.interface';
import {
  WhatsAppAccount,
  WhatsAppAccountProps,
} from '../../../../domain/entities/whatsapp-account.entity';
import type { IWhatsAppMessagingService } from '../../../../domain/services/whatsapp-messaging.interface';
import { v4 as uuidv4 } from 'uuid';
import type { ILogger } from '../../../services/logger.interface';

export interface CreateWhatsAppAccountRequest {
  userId: string;
  phoneNumber: string;
  metaPhoneNumberId: string;
  wabaId?: string;
  accessToken: string;
  nickname?: string;
  pin?: string;
}

export class CreateWhatsAppAccountUseCase {
  constructor(
    private readonly repository: IWhatsAppAccountRepository,
    private readonly messagingService: IWhatsAppMessagingService,
    private readonly logger: ILogger,
  ) {}

  async execute(request: CreateWhatsAppAccountRequest) {
    const account = WhatsAppAccount.create({
      id: uuidv4(),
      ...request,
      isActive: true,
      isWebhookConnected: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as WhatsAppAccountProps);

    await this.repository.save(account);

    if (request.wabaId) {
      this.messagingService
        .subscribeAccount(request.wabaId, request.accessToken)
        .then(async (success) => {
          if (success) {
            this.logger.log(
              `Meta Webhook Subscribed successfully for ${account.id}`,
            );
            await this.repository.updateWebhookStatus(account.id, true);
          }
        })
        .catch((err) => {
          this.logger.error(
            `Meta Autoconfig [Subscription] Error for ${account.id}: ${(err as Error).message}`,
          );
        });
    }

    this.messagingService
      .registerPhoneNumber(
        request.metaPhoneNumberId,
        request.accessToken,
        request.pin,
      )
      .catch((err) => {
        this.logger.error(
          `Meta Autoconfig [Registration] Error for ${account.id}: ${(err as Error).message}`,
        );
      });

    return { id: account.id };
  }
}
