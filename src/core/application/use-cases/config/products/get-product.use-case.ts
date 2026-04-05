import { NotFoundDomainException } from '../../../../domain/exceptions/domain.exception';
import type { IProductRepository } from '../../../../domain/repositories/product.repository.interface';

export class GetProductUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(id: string) {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundDomainException('Product not found');
    }
    return product.toJSON();
  }
}
