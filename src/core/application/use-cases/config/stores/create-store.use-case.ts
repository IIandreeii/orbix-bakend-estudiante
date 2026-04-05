import type { IStoreRepository } from '../../../../domain/repositories/store.repository.interface';
import { Store } from '../../../../domain/entities/store.entity';
import { v4 as uuidv4 } from 'uuid';

export interface CreateStoreRequest {
  whatsAppAccountId: string;
  name: string;
  domain?: string;
  externalStoreId?: string;
  code?: string;
}

export class CreateStoreUseCase {
  constructor(private readonly repository: IStoreRepository) {}

  async execute(request: CreateStoreRequest) {
    const store = Store.create({
      id: uuidv4(),
      ...request,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.repository.save(store);
    return { id: store.id, name: store.name };
  }
}
