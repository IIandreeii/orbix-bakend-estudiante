import { Module, Provider } from '@nestjs/common';
import { PrismaModule } from './infrastructure/persistence/prisma/prisma.module';
import { SecurityModule } from './infrastructure/security/security.module';

// Controllers
import { SubAccountController } from './interface/http/controllers/users/sub-account.controller';

// Use Cases
import { CreateSubAccountUseCase } from './core/application/use-cases/users/create-sub-account.use-case';
import { ListSubAccountsUseCase } from './core/application/use-cases/users/list-sub-accounts.use-case';
import { UpdateSubAccountUseCase } from './core/application/use-cases/users/update-sub-account.use-case';
import { DeleteSubAccountUseCase } from './core/application/use-cases/users/delete-sub-account.use-case';

import type { IUserRepository } from './core/domain/repositories/user.repository.interface';
import type { ISubscriptionRepository } from './core/domain/repositories/subscription.repository.interface';

const useCases: Provider[] = [
  {
    provide: CreateSubAccountUseCase,
    inject: ['IUserRepository', 'ISubscriptionRepository'],
    useFactory: (userRepo: IUserRepository, subRepo: ISubscriptionRepository) =>
      new CreateSubAccountUseCase(userRepo, subRepo),
  },
  {
    provide: ListSubAccountsUseCase,
    inject: ['IUserRepository'],
    useFactory: (userRepo: IUserRepository) => new ListSubAccountsUseCase(userRepo),
  },
  {
    provide: UpdateSubAccountUseCase,
    inject: ['IUserRepository'],
    useFactory: (userRepo: IUserRepository) => new UpdateSubAccountUseCase(userRepo),
  },
  {
    provide: DeleteSubAccountUseCase,
    inject: ['IUserRepository'],
    useFactory: (userRepo: IUserRepository) => new DeleteSubAccountUseCase(userRepo),
  },
];

@Module({
  imports: [PrismaModule, SecurityModule],
  controllers: [SubAccountController],
  providers: [...useCases],
  exports: [...useCases],
})
export class UserModule {}
