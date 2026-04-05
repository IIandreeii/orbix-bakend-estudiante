import { DomainException } from '../exceptions/domain.exception';

export interface StoreProps {
  id: string;
  whatsAppAccountId: string;
  name: string;
  domain?: string;
  externalStoreId?: string;
  code?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Store {
  private constructor(private readonly props: StoreProps) {
    this.validate();
  }

  public static create(props: StoreProps): Store {
    return new Store(props);
  }

  private validate() {
    if (!this.props.name) {
      throw new DomainException('Store name is required');
    }
    if (!this.props.whatsAppAccountId) {
      throw new DomainException('WhatsApp Account ID is required');
    }
  }

  get id(): string {
    return this.props.id;
  }
  get whatsAppAccountId(): string {
    return this.props.whatsAppAccountId;
  }
  get name(): string {
    return this.props.name;
  }
  get domain(): string | undefined {
    return this.props.domain;
  }
  get externalStoreId(): string | undefined {
    return this.props.externalStoreId;
  }
  get code(): string | undefined {
    return this.props.code;
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

  public activate(): void {
    this.props.isActive = true;
  }
  public deactivate(): void {
    this.props.isActive = false;
  }

  public toJSON() {
    return {
      ...this.props,
    };
  }
}
