import { Injectable } from '@nestjs/common';
import {
  IProductRepository,
  ProductFilter,
  PaginatedProducts,
} from '../../../../core/domain/repositories/product.repository.interface';
import { Product } from '../../../../core/domain/entities/product.entity';
import { PrismaService } from '../prisma.service';
import { Product as PrismaProduct, Prisma } from '@prisma/client';

@Injectable()
export class PrismaProductRepository implements IProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapToDomain(prismaProduct: PrismaProduct): Product {
    return Product.create({
      id: prismaProduct.id,
      storeId: prismaProduct.storeId,
      externalProductId: prismaProduct.externalProductId ?? undefined,
      name: prismaProduct.name,
      description: prismaProduct.description ?? undefined,
      price: prismaProduct.price ? Number(prismaProduct.price) : undefined,
      currency: prismaProduct.currency ?? undefined,
      stock: prismaProduct.stock ?? undefined,
      sku: prismaProduct.sku ?? undefined,
      imageUrl: prismaProduct.imageUrl ?? undefined,
      videoUrl: prismaProduct.videoUrl ?? undefined,
      isActive: prismaProduct.isActive,
      createdAt: prismaProduct.createdAt,
      updatedAt: prismaProduct.updatedAt,
    });
  }

  async findById(id: string): Promise<Product | null> {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });
    return product ? this.mapToDomain(product) : null;
  }

  async findAll(filter: ProductFilter): Promise<PaginatedProducts> {
    const { storeId, name, sku, isActive, page, limit } = filter;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      ...(storeId && { storeId }),
      ...(name && { name: { contains: name } }),
      ...(sku && { sku: { contains: sku } }),
      ...(isActive !== undefined ? { isActive } : { isActive: true }),
    };

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: data.map((d) => this.mapToDomain(d)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async save(product: Product): Promise<void> {
    const data = product.toJSON();
    await this.prisma.product.create({
      data: {
        id: data.id,
        storeId: data.storeId,
        externalProductId: data.externalProductId,
        name: data.name,
        description: data.description,
        price: data.price,
        currency: data.currency,
        stock: data.stock,
        sku: data.sku,
        imageUrl: data.imageUrl,
        videoUrl: data.videoUrl,
        isActive: data.isActive,
      },
    });
  }

  async update(product: Product): Promise<void> {
    const data = product.toJSON();
    await this.prisma.product.update({
      where: { id: data.id },
      data: {
        externalProductId: data.externalProductId,
        name: data.name,
        description: data.description,
        price: data.price,
        currency: data.currency,
        stock: data.stock,
        sku: data.sku,
        imageUrl: data.imageUrl,
        videoUrl: data.videoUrl,
        isActive: data.isActive,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
