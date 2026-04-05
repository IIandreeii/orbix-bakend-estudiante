export enum PlanType {
  TRIAL = 'TRIAL',
  BASIC = 'BASIC',
  ADVANCED = 'ADVANCED',
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  CANCELED = 'CANCELED',
}

export interface SubscriptionProps {
  id: string;
  userId: string;
  planType: PlanType;
  status: SubscriptionStatus;
  startDate: Date;
  endDate: Date;
  whatsappLimit: number;
  advisorsLimit: number;
  shopsLimit: number;
  createdAt: Date;
  updatedAt: Date;
}

export class Subscription {
  private constructor(private readonly props: SubscriptionProps) {}

  public static create(props: SubscriptionProps): Subscription {
    return new Subscription(props);
  }

  public isExpired(): boolean {
    return new Date() > this.props.endDate;
  }

  public static getLimitsForPlan(plan: PlanType) {
    switch (plan) {
      case PlanType.TRIAL:
        return { whatsappLimit: 1, advisorsLimit: 10, shopsLimit: 1 };
      case PlanType.BASIC:
        return { whatsappLimit: 1, advisorsLimit: 10, shopsLimit: 5 };
      case PlanType.ADVANCED:
        return { whatsappLimit: -1, advisorsLimit: -1, shopsLimit: -1 };
    }
  }

  get id(): string {
    return this.props.id;
  }
  get userId(): string {
    return this.props.userId;
  }
  get planType(): PlanType {
    return this.props.planType;
  }
  get status(): SubscriptionStatus {
    return this.props.status;
  }
  get startDate(): Date {
    return this.props.startDate;
  }
  get endDate(): Date {
    return this.props.endDate;
  }
  get whatsappLimit(): number {
    return this.props.whatsappLimit;
  }
  get advisorsLimit(): number {
    return this.props.advisorsLimit;
  }
  get shopsLimit(): number {
    return this.props.shopsLimit;
  }

  public cancel(): void {
    this.props.status = SubscriptionStatus.CANCELED;
    this.props.updatedAt = new Date();
  }

  public toJSON() {
    return {
      ...this.props,
      isExpired: this.isExpired(),
    };
  }
}
