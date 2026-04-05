import { NotFoundDomainException } from '../../../../domain/exceptions/domain.exception';
import type { IAIConfigRepository } from '../../../../domain/repositories/ai-config.repository.interface';

export class GetAIConfigUseCase {
  constructor(private readonly repository: IAIConfigRepository) {}

  async executeByWhatsAppAccount(whatsAppAccountId: string) {
    const config =
      await this.repository.findByWhatsAppAccountId(whatsAppAccountId);
    if (!config) {
      throw new NotFoundDomainException('AI Config not found for this account');
    }
    return config.toSafeJSON();
  }
}

export class DeleteAIConfigUseCase {
  constructor(private readonly repository: IAIConfigRepository) {}

  async execute(id: string): Promise<void> {
    const config = await this.repository.findById(id);
    if (!config) {
      throw new NotFoundDomainException('AI Config not found');
    }
    await this.repository.delete(id);
  }
}
