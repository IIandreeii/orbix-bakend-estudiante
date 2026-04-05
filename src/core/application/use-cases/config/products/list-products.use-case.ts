import type {
  IProductRepository,
  ProductFilter,
  PaginatedProducts,
} from '../../../../domain/repositories/product.repository.interface';

export type ListProductsRequest = Partial<ProductFilter>;

export type ListProductsResponse = PaginatedProducts;

export class ListProductsUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(request: ListProductsRequest): Promise<ListProductsResponse> {
    return await this.productRepository.findAll({
      ...request,
      page: Number(request.page) || 1,
      limit: Number(request.limit) || 10,
    } as ProductFilter);
  }
}
