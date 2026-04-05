import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcryptjs';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { User, Role } from '../../../domain/entities/user.entity';
import type { ISubscriptionRepository } from '../../../domain/repositories/subscription.repository.interface';
import {
  BadRequestDomainException,
  ConflictDomainException,
  ForbiddenDomainException
} from '../../../domain/exceptions/domain.exception';

export interface CreateSubAccountParams {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: Role;
  phone?: string;
  parentId: string;
}

export class CreateSubAccountUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly subscriptionRepository: ISubscriptionRepository,
  ) { }

  async execute(params: CreateSubAccountParams): Promise<User> {
    const existing = await this.userRepository.findByEmail(params.email);
    if (existing) {
      throw new ConflictDomainException('El correo ya está registrado');
    }

    // Verificar límites de suscripción del master
    const subscription = await this.subscriptionRepository.findByUserId(params.parentId);
    if (!subscription) {
      throw new BadRequestDomainException('El usuario principal no tiene una suscripción activa');
    }

    const currentSubAccounts = await this.userRepository.findByParentId(params.parentId);
    if (currentSubAccounts.length >= subscription.advisorsLimit) {
      throw new ForbiddenDomainException(`Has alcanzado el límite de asesores de tu plan (${subscription.advisorsLimit})`);
    }

    if (params.role === Role.SUPERMASTER) {
      throw new ForbiddenDomainException('No puedes crear un usuario con rol SUPERMASTER');
    }

    const hashedPassword = await bcrypt.hash(params.password, 10);

    const user = User.create({
      id: uuidv4(),
      email: params.email,
      firstName: params.firstName,
      lastName: params.lastName,
      role: params.role,
      phone: params.phone,
      isActive: true,
      parentId: params.parentId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.userRepository.createWithPassword(user, hashedPassword, 'PASSWORD');
    return user;
  }



}
