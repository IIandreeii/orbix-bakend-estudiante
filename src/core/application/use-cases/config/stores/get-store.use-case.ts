import { NotFoundDomainException } from '../../../../domain/exceptions/domain.exception';
import type { IStoreRepository } from '../../../../domain/repositories/store.repository.interface';

export class GetStoreUseCase {
  constructor(private readonly repository: IStoreRepository) {}

  async execute(id: string) {
    const store = await this.repository.findById(id);
    if (!store) {
      throw new NotFoundDomainException('Store not found');
    }
    return store.toJSON();
  }
}
