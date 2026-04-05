import { Product } from '../entities/product.entity';

export interface ProductFilter {
  storeId?: string;
  name?: string;
  sku?: string;
  isActive?: boolean;
  page: number;
  limit: number;
}

export interface PaginatedProducts {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IProductRepository {
  findById(id: string): Promise<Product | null>;
  findAll(filter: ProductFilter): Promise<PaginatedProducts>;
  save(product: Product): Promise<void>;
  update(product: Product): Promise<void>;
  delete(id: string): Promise<void>;
}
