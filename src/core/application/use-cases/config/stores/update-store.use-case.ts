import { NotFoundDomainException } from '../../../../domain/exceptions/domain.exception';
import type { IStoreRepository } from '../../../../domain/repositories/store.repository.interface';
import { Store, StoreProps } from '../../../../domain/entities/store.entity';

export interface UpdateStoreRequest {
  id: string;
  name?: string;
  domain?: string;
  externalStoreId?: string;
  code?: string;
  isActive?: boolean;
}

export class UpdateStoreUseCase {
  constructor(private readonly repository: IStoreRepository) {}

  async execute(request: UpdateStoreRequest): Promise<void> {
    const existingStore = await this.repository.findById(request.id);
    if (!existingStore) {
      throw new NotFoundDomainException('Store not found');
    }

    const updatedStore = Store.create({
      ...existingStore.toJSON(),
      ...request,
      updatedAt: new Date(),
    } as StoreProps);

    await this.repository.update(updatedStore);
  }
}
