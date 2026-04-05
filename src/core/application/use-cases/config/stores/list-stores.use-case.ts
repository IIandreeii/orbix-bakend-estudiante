import type {
  IStoreRepository,
  StoreFilter,
  PaginatedStores,
} from '../../../../domain/repositories/store.repository.interface';

export class ListStoresUseCase {
  constructor(private readonly repository: IStoreRepository) {}

  async execute(filter: Partial<StoreFilter>): Promise<PaginatedStores> {
    return await this.repository.findAll({
      ...filter,
      page: Number(filter.page) || 1,
      limit: Number(filter.limit) || 10,
    } as StoreFilter);
  }
}
