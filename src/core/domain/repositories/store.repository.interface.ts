import { Store } from '../entities/store.entity';

export interface StoreFilter {
  whatsAppAccountId?: string;
  name?: string;
  domain?: string;
  page: number;
  limit: number;
}

export interface PaginatedStores {
  data: Store[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IStoreRepository {
  findById(id: string): Promise<Store | null>;
  findAll(filter: StoreFilter): Promise<PaginatedStores>;
  save(store: Store): Promise<void>;
  update(store: Store): Promise<void>;
  findByDomain(domain: string): Promise<Store | null>;
  delete(id: string): Promise<void>;
}
