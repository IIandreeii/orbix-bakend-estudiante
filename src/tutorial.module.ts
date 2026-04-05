import { Module, Provider } from '@nestjs/common';
import { PrismaModule } from './infrastructure/persistence/prisma/prisma.module';
import { SecurityModule } from './infrastructure/security/security.module';

// Repositorio
import { PrismaTutorialRepository } from './infrastructure/persistence/prisma/repositories/prisma-tutorial.repository';
import type { ITutorialRepository } from './core/domain/repositories/tutorial.repository.interface';

// Controladores
import { TutorialController } from './interface/http/controllers/tutorials/tutorial.controller';
import { AdminTutorialController } from './interface/http/controllers/tutorials/admin-tutorial.controller';

// Casos de Uso
import { ListTutorialModulesUseCase } from './core/application/use-cases/tutorials/list-tutorial-modules.use-case';
import { CreateTutorialModuleUseCase } from './core/application/use-cases/tutorials/create-tutorial-module.use-case';
import { UpdateTutorialModuleUseCase } from './core/application/use-cases/tutorials/update-tutorial-module.use-case';
import { DeleteTutorialModuleUseCase } from './core/application/use-cases/tutorials/delete-tutorial-module.use-case';
import { ListTutorialQuestionsUseCase } from './core/application/use-cases/tutorials/list-tutorial-questions.use-case';
import { CreateTutorialQuestionUseCase } from './core/application/use-cases/tutorials/create-tutorial-question.use-case';
import { UpdateTutorialQuestionUseCase } from './core/application/use-cases/tutorials/update-tutorial-question.use-case';
import { DeleteTutorialQuestionUseCase } from './core/application/use-cases/tutorials/delete-tutorial-question.use-case';

const useCases: Provider[] = [
  {
    provide: ListTutorialModulesUseCase,
    inject: ['ITutorialRepository'],
    useFactory: (repo: ITutorialRepository) => new ListTutorialModulesUseCase(repo),
  },
  {
    provide: CreateTutorialModuleUseCase,
    inject: ['ITutorialRepository'],
    useFactory: (repo: ITutorialRepository) => new CreateTutorialModuleUseCase(repo),
  },
  {
    provide: UpdateTutorialModuleUseCase,
    inject: ['ITutorialRepository'],
    useFactory: (repo: ITutorialRepository) => new UpdateTutorialModuleUseCase(repo),
  },
  {
    provide: DeleteTutorialModuleUseCase,
    inject: ['ITutorialRepository'],
    useFactory: (repo: ITutorialRepository) => new DeleteTutorialModuleUseCase(repo),
  },
  {
    provide: ListTutorialQuestionsUseCase,
    inject: ['ITutorialRepository'],
    useFactory: (repo: ITutorialRepository) => new ListTutorialQuestionsUseCase(repo),
  },
  {
    provide: CreateTutorialQuestionUseCase,
    inject: ['ITutorialRepository'],
    useFactory: (repo: ITutorialRepository) => new CreateTutorialQuestionUseCase(repo),
  },
  {
    provide: UpdateTutorialQuestionUseCase,
    inject: ['ITutorialRepository'],
    useFactory: (repo: ITutorialRepository) => new UpdateTutorialQuestionUseCase(repo),
  },
  {
    provide: DeleteTutorialQuestionUseCase,
    inject: ['ITutorialRepository'],
    useFactory: (repo: ITutorialRepository) => new DeleteTutorialQuestionUseCase(repo),
  },
];

@Module({
  imports: [PrismaModule, SecurityModule],
  controllers: [TutorialController, AdminTutorialController],
  providers: [
    {
      provide: 'ITutorialRepository',
      useClass: PrismaTutorialRepository,
    },
    ...useCases,
  ],
  exports: [...useCases],
})
export class TutorialSectionModule {}
