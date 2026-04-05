import { DomainException } from '../exceptions/domain.exception';

export interface LabelProps {
  id: string;
  whatsAppAccountId: string;
  name: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Label {
  private constructor(private readonly props: LabelProps) {
    this.validate();
  }

  public static create(props: LabelProps): Label {
    return new Label(props);
  }

  private validate() {
    if (this.props.name.length < 1 || this.props.name.length > 50) {
      throw new DomainException(
        'Label name must be between 1 and 50 characters',
      );
    }
    const hexColorRegex = /^#([A-Fa-f0-9]{3}){1,2}$/;
    if (!hexColorRegex.test(this.props.color)) {
      throw new DomainException('Invalid hexadecimal color format');
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
  get color(): string {
    return this.props.color;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public update(props: Partial<Pick<LabelProps, 'name' | 'color'>>): void {
    if (props.name) this.props.name = props.name;
    if (props.color) this.props.color = props.color;
    this.props.updatedAt = new Date();
    this.validate();
  }

  public toJSON() {
    return {
      id: this.id,
      whatsAppAccountId: this.whatsAppAccountId,
      name: this.name,
      color: this.color,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
