import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { User } from '../../../domain/entities/user.entity';

export class ListSubAccountsUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(parentId: string): Promise<User[]> {
    return await this.userRepository.findByParentId(parentId);
  }
}
