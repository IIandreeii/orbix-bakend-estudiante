import { NotFoundDomainException } from '../../../../domain/exceptions/domain.exception';
import type { IWhatsAppAccountRepository } from '../../../../domain/repositories/whatsapp-account.repository.interface';

export class GetWhatsAppAccountUseCase {
  constructor(private readonly repository: IWhatsAppAccountRepository) {}

  async execute(id: string) {
    const account = await this.repository.findById(id);
    if (!account) {
      throw new NotFoundDomainException('WhatsApp Account not found');
    }
    return account.toSafeJSON();
  }
}
