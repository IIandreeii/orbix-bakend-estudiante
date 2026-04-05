import { DomainException } from '../exceptions/domain.exception';

export enum Role {
  MASTER = 'MASTER',
  SUPERMASTER = 'SUPERMASTER',
  ADMIN = 'ADMIN',
  ADVISER = 'ADVISER',
}

export interface UserProps {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  countryCode?: string;
  role: Role;
  isActive: boolean;
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  private constructor(private readonly props: UserProps) {
    this.validate();
  }

  public static create(props: UserProps): User {
    return new User(props);
  }

  private validate() {
    if (!this.props.email.includes('@')) {
      throw new DomainException('Invalid email format');
    }
    if (this.props.firstName.length < 2) {
      throw new DomainException('First name too short');
    }
    if (this.props.lastName.length < 2) {
      throw new DomainException('Last name too short');
    }
  }

  get id(): string {
    return this.props.id;
  }
  get email(): string {
    return this.props.email;
  }
  get firstName(): string {
    return this.props.firstName;
  }
  get lastName(): string {
    return this.props.lastName;
  }
  get fullName(): string {
    return `${this.props.firstName} ${this.props.lastName}`;
  }
  get phone(): string | undefined {
    return this.props.phone;
  }
  get address(): string | undefined {
    return this.props.address;
  }
  get city(): string | undefined {
    return this.props.city;
  }
  get state(): string | undefined {
    return this.props.state;
  }
  get zipCode(): string | undefined {
    return this.props.zipCode;
  }
  get countryCode(): string | undefined {
    return this.props.countryCode;
  }
  get role(): Role {
    return this.props.role;
  }
  get isActive(): boolean {
    return this.props.isActive;
  }
  get parentId(): string | undefined {
    return this.props.parentId;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public activate(): void {
    this.props.isActive = true;
    this.props.updatedAt = new Date();
  }

  public toJSON() {
    return {
      id: this.id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      fullName: this.fullName,
      phone: this.phone,
      address: this.address,
      city: this.city,
      state: this.state,
      zipCode: this.zipCode,
      countryCode: this.countryCode,
      role: this.role,
      isActive: this.isActive,
      parentId: this.parentId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
