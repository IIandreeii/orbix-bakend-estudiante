import { NotFoundDomainException } from '../../../../domain/exceptions/domain.exception';
import type { IWhatsAppAccountRepository } from '../../../../domain/repositories/whatsapp-account.repository.interface';
import {
  WhatsAppAccount,
  WhatsAppAccountProps,
} from '../../../../domain/entities/whatsapp-account.entity';
import type { IWhatsAppMessagingService } from '../../../../domain/services/whatsapp-messaging.interface';
import type { ILogger } from '../../../services/logger.interface';

export interface UpdateWhatsAppAccountRequest {
  id: string;
  phoneNumber?: string;
  metaPhoneNumberId?: string;
  wabaId?: string;
  accessToken?: string;
  isActive?: boolean;
  pin?: string;
}

export class UpdateWhatsAppAccountUseCase {
  constructor(
    private readonly repository: IWhatsAppAccountRepository,
    private readonly messagingService: IWhatsAppMessagingService,
    private readonly logger: ILogger,
  ) {}

  async execute(request: UpdateWhatsAppAccountRequest): Promise<void> {
    const existing = await this.repository.findById(request.id);
    if (!existing) {
      throw new NotFoundDomainException('WhatsApp Account not found');
    }

    const updateData = { ...request };
    if (updateData.accessToken === '' || updateData.accessToken === null)
      delete updateData.accessToken;
    if (updateData.pin === '' || updateData.pin === null) delete updateData.pin;

    const updated = WhatsAppAccount.create({
      ...existing.toJSON(),
      ...updateData,
      updatedAt: new Date(),
    } as WhatsAppAccountProps);

    await this.repository.update(updated);

    const finalWabaId = request.wabaId || existing.wabaId;
    const finalAccessToken = request.accessToken || existing.accessToken;
    const finalMetaPhoneNumberId =
      request.metaPhoneNumberId || existing.metaPhoneNumberId;
    const finalPin = request.pin || existing.pin;

    if (finalWabaId && finalAccessToken) {
      this.messagingService
        .subscribeAccount(finalWabaId, finalAccessToken)
        .then(async (success) => {
          if (success) {
            this.logger.log(
              `Meta Webhook Subscribed successfully for ${updated.id} (updated)`,
            );
            await this.repository.updateWebhookStatus(updated.id, true);
          }
        })
        .catch((err) => {
          this.logger.error(
            `Meta Autoconfig [Subscription] Error for ${updated.id} during update: ${(err as Error).message}`,
          );
        });
    }

    if (finalAccessToken) {
      this.messagingService
        .registerPhoneNumber(finalMetaPhoneNumberId, finalAccessToken, finalPin)
        .catch((err) => {
          this.logger.error(
            `Meta Autoconfig [Registration] Error for ${updated.id} during update: ${(err as Error).message}`,
          );
        });
    }
  }
}
