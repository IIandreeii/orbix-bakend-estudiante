import { DomainException } from '../exceptions/domain.exception';

export interface WhatsAppAccountProps {
  id: string;
  userId: string;
  phoneNumber: string;
  metaPhoneNumberId: string;
  wabaId?: string;
  accessToken: string;
  pin?: string;
  isActive: boolean;
  isWebhookConnected: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class WhatsAppAccount {
  private constructor(private readonly props: WhatsAppAccountProps) {
    this.validate();
  }

  public static create(props: WhatsAppAccountProps): WhatsAppAccount {
    return new WhatsAppAccount(props);
  }

  private validate() {
    if (!this.props.phoneNumber) {
      throw new DomainException('Phone number is required');
    }
    if (!this.props.metaPhoneNumberId) {
      throw new DomainException('Meta Phone Number ID is required');
    }
    if (!this.props.accessToken) {
      throw new DomainException('Access Token is required');
    }
  }

  get id(): string {
    return this.props.id;
  }
  get userId(): string {
    return this.props.userId;
  }
  get phoneNumber(): string {
    return this.props.phoneNumber;
  }
  get metaPhoneNumberId(): string {
    return this.props.metaPhoneNumberId;
  }
  get wabaId(): string | undefined {
    return this.props.wabaId;
  }
  get accessToken(): string {
    return this.props.accessToken;
  }
  get pin(): string | undefined {
    return this.props.pin;
  }
  get isActive(): boolean {
    return this.props.isActive;
  }
  get isWebhookConnected(): boolean {
    return this.props.isWebhookConnected;
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

  public toSafeJSON() {
    const { accessToken: _accessToken, pin: _pin, ...safe } = this.props;
    return safe;
  }
}
