import { DomainException } from '../exceptions/domain.exception';

export interface ProductProps {
  id: string;
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
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Product {
  private constructor(private readonly props: ProductProps) {
    this.validate();
  }

  public static create(props: ProductProps): Product {
    return new Product(props);
  }

  private validate() {
    if (!this.props.name) {
      throw new DomainException('Product name is required');
    }
    if (!this.props.storeId) {
      throw new DomainException('Store ID is required');
    }
  }

  get id(): string {
    return this.props.id;
  }
  get storeId(): string {
    return this.props.storeId;
  }
  get externalProductId(): string | undefined {
    return this.props.externalProductId;
  }
  get name(): string {
    return this.props.name;
  }
  get description(): string | undefined {
    return this.props.description;
  }
  get price(): number | undefined {
    return this.props.price;
  }
  get currency(): string | undefined {
    return this.props.currency;
  }
  get stock(): number | undefined {
    return this.props.stock;
  }
  get sku(): string | undefined {
    return this.props.sku;
  }
  get imageUrl(): string | undefined {
    return this.props.imageUrl;
  }
  get videoUrl(): string | undefined {
    return this.props.videoUrl;
  }
  get isActive(): boolean {
    return this.props.isActive;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public toJSON() {
    return {
      ...this.props,
    };
  }
}
