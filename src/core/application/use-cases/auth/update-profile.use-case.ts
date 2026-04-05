import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { User } from '../../../domain/entities/user.entity';
import { NotFoundDomainException } from '../../../domain/exceptions/domain.exception';

export interface UpdateProfileParams {
  userId: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  countryCode?: string;
}

export class UpdateProfileUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(params: UpdateProfileParams): Promise<User> {
    const user = await this.userRepository.findById(params.userId);
    if (!user) {
      throw new NotFoundDomainException('Usuario no encontrado');
    }

    const data = user.toJSON();
    const updated = User.create({
      ...data,
      firstName: params.firstName ?? data.firstName,
      lastName: params.lastName ?? data.lastName,
      phone: params.phone ?? data.phone,
      address: params.address ?? data.address,
      city: params.city ?? data.city,
      state: params.state ?? data.state,
      zipCode: params.zipCode ?? data.zipCode,
      countryCode: params.countryCode ?? data.countryCode,
      updatedAt: new Date(),
    });

    await this.userRepository.update(updated);
    return updated;
  }
}
