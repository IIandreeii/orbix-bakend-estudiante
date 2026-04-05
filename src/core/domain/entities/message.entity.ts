import { DomainException } from '../exceptions/domain.exception';

export enum MessageDirection {
  INBOUND = 'INBOUND',
  OUTBOUND = 'OUTBOUND',
}

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  AUDIO = 'AUDIO',
  VIDEO = 'VIDEO',
  DOCUMENT = 'DOCUMENT',
  TEMPLATE = 'TEMPLATE',
  STICKER = 'STICKER',
  REACTION = 'REACTION',
}

export enum MessageStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  FAILED = 'FAILED',
  DELETED = 'DELETED',
}

export interface MessageProps {
  id: string;
  chatId: string;
  waMessageId?: string;
  direction: MessageDirection;
  type: MessageType;
  content?: string;
  mediaId?: string;
  mediaUrl?: string;
  mimeType?: string;
  status: MessageStatus;
  sentByAI?: boolean;
  errorCode?: number;
  errorDetails?: string;
  quotedMessageId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Message {
  private constructor(private readonly props: MessageProps) {
    this.validate();
  }

  public static create(props: MessageProps): Message {
    return new Message(props);
  }

  private validate() {
    if (!this.props.chatId) {
      throw new DomainException('Chat ID is required');
    }
    if (!this.props.direction) {
      throw new DomainException('Direction is required');
    }
  }

  get id(): string {
    return this.props.id;
  }
  get chatId(): string {
    return this.props.chatId;
  }
  get waMessageId(): string | undefined {
    return this.props.waMessageId;
  }
  get direction(): MessageDirection {
    return this.props.direction;
  }
  get type(): MessageType {
    return this.props.type;
  }
  get content(): string | undefined {
    return this.props.content;
  }
  get mediaId(): string | undefined {
    return this.props.mediaId;
  }
  get mediaUrl(): string | undefined {
    return this.props.mediaUrl;
  }
  get mimeType(): string | undefined {
    return this.props.mimeType;
  }
  get status(): MessageStatus {
    return this.props.status;
  }
  get sentByAI(): boolean {
    return this.props.sentByAI || false;
  }
  get errorCode(): number | undefined {
    return this.props.errorCode;
  }
  get errorDetails(): string | undefined {
    return this.props.errorDetails;
  }
  get quotedMessageId(): string | undefined {
    return this.props.quotedMessageId;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public updateStatus(
    status: MessageStatus,
    errorCode?: number,
    errorDetails?: string,
  ) {
    this.props.status = status;
    this.props.errorCode = errorCode;
    this.props.errorDetails = errorDetails;
    this.props.updatedAt = new Date();
  }

  public markAsDeleted() {
    this.props.status = MessageStatus.DELETED;
    this.props.updatedAt = new Date();
  }

  public toJSON() {
    return {
      ...this.props,
    };
  }
}
