import { NotFoundDomainException } from '../../../../domain/exceptions/domain.exception';
import type { IWhatsAppAccountRepository } from '../../../../domain/repositories/whatsapp-account.repository.interface';

export class DeleteWhatsAppAccountUseCase {
  constructor(private readonly repository: IWhatsAppAccountRepository) {}

  async execute(id: string): Promise<void> {
    const account = await this.repository.findById(id);
    if (!account) {
      throw new NotFoundDomainException('WhatsApp Account not found');
    }
    await this.repository.delete(id);
  }
}
