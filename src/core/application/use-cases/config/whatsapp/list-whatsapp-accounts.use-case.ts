import type { IWhatsAppAccountRepository } from '../../../../domain/repositories/whatsapp-account.repository.interface';
import type { IUserRepository } from '../../../../domain/repositories/user.repository.interface';
import { Role } from '../../../../domain/entities/user.entity';

export class ListWhatsAppAccountsUseCase {
  constructor(
    private readonly repository: IWhatsAppAccountRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(userId: string) {
    const user = await this.userRepository.findById(userId);
    
    // Si el usuario es Asesor o Admin secundario y tiene un padre, 
    // consultamos las cuentas del padre (cuenta principal).
    const targetUserId = (user && user.parentId && (user.role === Role.ADVISER || user.role === Role.ADMIN))
      ? user.parentId 
      : userId;

    const data = await this.repository.findByUserId(targetUserId);
    return data.map((d) => d.toSafeJSON());
  }
}
