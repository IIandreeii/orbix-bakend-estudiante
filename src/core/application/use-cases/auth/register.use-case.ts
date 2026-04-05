import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import type { IHashService } from '../../services/security.service.interface';
import { ConflictDomainException } from '../../../domain/exceptions/domain.exception';
import { User, Role } from '../../../domain/entities/user.entity';
import { v4 as uuidv4 } from 'uuid';
import { SendVerificationEmailUseCase } from './verify-email.use-case';
import type { ISubscriptionRepository } from '../../../domain/repositories/subscription.repository.interface';
import {
  Subscription,
  PlanType,
  SubscriptionStatus,
} from '../../../domain/entities/subscription.entity';

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  city?: string;
  zipCode?: string;
  countryCode?: string;
}

export class RegisterUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly hashService: IHashService,
    private readonly sendVerificationEmail: SendVerificationEmailUseCase,
    private readonly subscriptionRepository: ISubscriptionRepository,
  ) {}

  async execute(request: RegisterRequest): Promise<any> {
    const existingUser = await this.userRepository.findByEmail(request.email);
    if (existingUser) {
      if (!existingUser.isActive) {
        throw new ConflictDomainException(
          'El usuario ya está registrado pero su cuenta aún no ha sido verificada. Por favor, revisa tu correo electrónico.',
        );
      }
      throw new ConflictDomainException(
        'El usuario ya existe con este correo electrónico',
      );
    }

    const hashedPassword = await this.hashService.hash(request.password);
    const userId = uuidv4();

    const user = User.create({
      id: userId,
      email: request.email,
      firstName: request.firstName,
      lastName: request.lastName,
      phone: request.phone,
      address: request.address,
      city: request.city,
      zipCode: request.zipCode,
      countryCode: request.countryCode,
      role: Role.MASTER,
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.userRepository.createWithPassword(
      user,
      hashedPassword,
      'PASSWORD',
    );

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 7);

    const limits = Subscription.getLimitsForPlan(PlanType.TRIAL);

    const subscription = Subscription.create({
      id: uuidv4(),
      userId: user.id,
      planType: PlanType.TRIAL,
      status: SubscriptionStatus.ACTIVE,
      startDate,
      endDate,
      ...limits,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.subscriptionRepository.save(subscription);

    await this.sendVerificationEmail.execute(request.email);

    return user.toJSON();
  }
}
