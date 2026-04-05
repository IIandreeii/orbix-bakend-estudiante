import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { SendVerificationEmailUseCase } from './verify-email.use-case';
import {
  BadRequestDomainException,
  NotFoundDomainException,
} from '../../../domain/exceptions/domain.exception';

export class ResendVerificationUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly sendVerificationEmail: SendVerificationEmailUseCase,
  ) {}

  async execute(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new NotFoundDomainException('Usuario no encontrado');
    }

    if (user.isActive) {
      throw new BadRequestDomainException('Esta cuenta ya ha sido verificada');
    }

    await this.sendVerificationEmail.execute(email);
  }
}
