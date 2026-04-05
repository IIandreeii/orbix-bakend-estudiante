import { NotFoundDomainException } from '../../../../domain/exceptions/domain.exception';
import type { IProductRepository } from '../../../../domain/repositories/product.repository.interface';
import {
  Product,
  ProductProps,
} from '../../../../domain/entities/product.entity';

export interface UpdateProductRequest {
  id: string;
  externalProductId?: string;
  name?: string;
  description?: string;
  price?: number;
  currency?: string;
  stock?: number;
  sku?: string;
  imageUrl?: string;
  videoUrl?: string;
  isActive?: boolean;
}

export class UpdateProductUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(request: UpdateProductRequest): Promise<void> {
    const existingProduct = await this.productRepository.findById(request.id);
    if (!existingProduct) {
      throw new NotFoundDomainException('Product not found');
    }

    const updatedProduct = Product.create({
      ...existingProduct.toJSON(),
      ...request,
      updatedAt: new Date(),
    } as ProductProps);

    await this.productRepository.update(updatedProduct);
  }
}
