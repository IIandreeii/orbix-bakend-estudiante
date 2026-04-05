import { DomainException } from '../exceptions/domain.exception';

export interface QuickResponseProps {
  id: string;
  whatsAppAccountId: string;
  keyword: string;
  responseMessage: string;
  imageUrl?: string;
  videoUrl?: string;
  isConfirmed: boolean;
  isInformative: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class QuickResponse {
  private constructor(private readonly props: QuickResponseProps) {
    this.validate();
  }

  public static create(props: QuickResponseProps): QuickResponse {
    return new QuickResponse(props);
  }

  private validate() {
    if (!this.props.keyword) {
      throw new DomainException('Keyword is required');
    }
    if (!this.props.responseMessage) {
      throw new DomainException('Response message is required');
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
  get keyword(): string {
    return this.props.keyword;
  }
  get responseMessage(): string {
    return this.props.responseMessage;
  }
  get imageUrl(): string | undefined {
    return this.props.imageUrl;
  }
  get videoUrl(): string | undefined {
    return this.props.videoUrl;
  }
  get isConfirmed(): boolean {
    return this.props.isConfirmed;
  }
  get isInformative(): boolean {
    return this.props.isInformative;
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
