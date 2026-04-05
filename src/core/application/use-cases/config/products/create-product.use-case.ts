import type { IProductRepository } from '../../../../domain/repositories/product.repository.interface';
import { Product } from '../../../../domain/entities/product.entity';
import { v4 as uuidv4 } from 'uuid';

export interface CreateProductRequest {
  storeId: string;
  externalProductId?: string;
  name: string;
  description?: string;
  price?: number;
  currency?: string;
  stock?: number;
  sku?: string;
  imageUrl?: string;
  videoUrl?: string;
}

export interface CreateProductResponse {
  id: string;
  name: string;
}

export class CreateProductUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(request: CreateProductRequest): Promise<CreateProductResponse> {
    const product = Product.create({
      id: uuidv4(),
      ...request,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.productRepository.save(product);

    return {
      id: product.id,
      name: product.name,
    };
  }
}
