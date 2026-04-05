import { DomainException } from '../exceptions/domain.exception';

export enum TemplateType {
  AGENCY = 'AGENCY',
  GENERIC = 'GENERIC',
  CASH_ON_DELIVERY = 'CASH_ON_DELIVERY',
}

export interface WhatsAppTemplateProps {
  id: string;
  whatsAppAccountId: string;
  name: string;
  code?: string;
  language: string;
  status?: string;
  templateType?: TemplateType;
  content?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class WhatsAppTemplate {
  private constructor(private readonly props: WhatsAppTemplateProps) {
    this.validate();
  }

  public static create(props: WhatsAppTemplateProps): WhatsAppTemplate {
    return new WhatsAppTemplate(props);
  }

  private validate() {
    if (!this.props.name) {
      throw new DomainException('Template name is required');
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
  get code(): string | undefined {
    return this.props.code;
  }
  get language(): string {
    return this.props.language;
  }
  get status(): string | undefined {
    return this.props.status;
  }
  get templateType(): TemplateType | undefined {
    return this.props.templateType;
  }
  get content(): string | undefined {
    return this.props.content;
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
