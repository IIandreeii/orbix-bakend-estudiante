import { NotFoundDomainException } from '../../../../domain/exceptions/domain.exception';
import type { IProductRepository } from '../../../../domain/repositories/product.repository.interface';

export class DeleteProductUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(id: string): Promise<void> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundDomainException('Product not found');
    }
    await this.productRepository.delete(id);
  }
}
