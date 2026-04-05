import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { NotFoundDomainException, ForbiddenDomainException } from '../../../domain/exceptions/domain.exception';

export class DeleteSubAccountUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(id: string, requesterId: string): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundDomainException('Sub-cuenta no encontrada');
    }

    if (user.parentId !== requesterId) {
      throw new ForbiddenDomainException('No tienes permiso para eliminar este usuario');
    }

    await this.userRepository.delete(id);
  }
}
