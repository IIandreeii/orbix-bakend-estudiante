import { DomainException } from '../exceptions/domain.exception';

export interface ChatLabelInfo {
  id: string;
  name: string;
  color: string;
}

export interface ChatProps {
  id: string;
  whatsAppAccountId: string;
  customerPhone: string;
  customerName?: string;
  unreadCount: number;
  lastMessageContent?: string;
  labels?: ChatLabelInfo[];
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class Chat {
  private constructor(private readonly props: ChatProps) {
    this.validate();
  }

  public static create(props: ChatProps): Chat {
    return new Chat(props);
  }

  private validate() {
    if (!this.props.whatsAppAccountId) {
      throw new DomainException('WhatsApp Account ID is required');
    }
    if (!this.props.customerPhone) {
      throw new DomainException('Customer phone is required');
    }
  }

  get id(): string {
    return this.props.id;
  }
  get whatsAppAccountId(): string {
    return this.props.whatsAppAccountId;
  }
  get customerPhone(): string {
    return this.props.customerPhone;
  }
  get customerName(): string | undefined {
    return this.props.customerName;
  }
  get unreadCount(): number {
    return this.props.unreadCount;
  }
  get lastMessageContent(): string | undefined {
    return this.props.lastMessageContent;
  }
  get labels(): ChatLabelInfo[] {
    return this.props.labels || [];
  }
  get lastMessageAt(): Date {
    return this.props.lastMessageAt;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public updateLastMessage(content: string, isIncoming: boolean) {
    this.props.lastMessageContent = content;
    this.props.lastMessageAt = new Date();
    this.props.updatedAt = new Date();
    if (isIncoming) {
      this.props.unreadCount += 1;
    }
  }

  public markAsRead() {
    this.props.unreadCount = 0;
    this.props.updatedAt = new Date();
  }

  public toJSON() {
    return {
      ...this.props,
    };
  }
}
