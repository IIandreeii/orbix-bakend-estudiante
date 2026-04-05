import { NotFoundDomainException } from '../../../../domain/exceptions/domain.exception';
import type { IStoreRepository } from '../../../../domain/repositories/store.repository.interface';

export class DeleteStoreUseCase {
  constructor(private readonly repository: IStoreRepository) {}

  async execute(id: string): Promise<void> {
    const store = await this.repository.findById(id);
    if (!store) {
      throw new NotFoundDomainException('Store not found');
    }
    await this.repository.delete(id);
  }
}
