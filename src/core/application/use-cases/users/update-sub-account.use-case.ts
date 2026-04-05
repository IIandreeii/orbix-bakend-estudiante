import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { User, Role } from '../../../domain/entities/user.entity';
import { NotFoundDomainException, ForbiddenDomainException } from '../../../domain/exceptions/domain.exception';

export interface UpdateSubAccountParams {
  id: string;
  requesterId: string;
  firstName?: string;
  lastName?: string;
  role?: Role;
  isActive?: boolean;
  phone?: string;
}

export class UpdateSubAccountUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(params: UpdateSubAccountParams): Promise<User> {
    const user = await this.userRepository.findById(params.id);
    if (!user) {
      throw new NotFoundDomainException('Sub-cuenta no encontrada');
    }

    if (user.parentId !== params.requesterId) {
      throw new ForbiddenDomainException('No tienes permiso para actualizar este usuario');
    }

    const data = user.toJSON();
    const updated = User.create({
      ...data,
      firstName: params.firstName ?? data.firstName,
      lastName: params.lastName ?? data.lastName,
      role: params.role ?? data.role,
      isActive: params.isActive ?? data.isActive,
      phone: params.phone ?? data.phone,
      updatedAt: new Date(),
    });

    await this.userRepository.update(updated);
    return updated;
  }
}
