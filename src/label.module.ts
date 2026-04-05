import { Module } from '@nestjs/common';
import { LabelController } from './interface/http/controllers/label.controller';
import { CreateLabelUseCase } from './core/application/use-cases/labels/create-label.use-case';
import { UpdateLabelUseCase } from './core/application/use-cases/labels/update-label.use-case';
import { DeleteLabelUseCase } from './core/application/use-cases/labels/delete-label.use-case';
import { ListLabelsUseCase } from './core/application/use-cases/labels/list-labels.use-case';
import { AssignLabelUseCase } from './core/application/use-cases/labels/assign-label.use-case';
import { RemoveLabelUseCase } from './core/application/use-cases/labels/remove-label.use-case';
import { PrismaModule } from './infrastructure/persistence/prisma/prisma.module';
import { MessagingModule } from './messaging.module';
import { PrismaLabelRepository } from './infrastructure/persistence/prisma/repositories/prisma-label.repository';
import { PrismaChatRepository } from './infrastructure/persistence/prisma/repositories/prisma-chat.repository';
import { I_LABEL_REPOSITORY } from './core/domain/repositories/label.repository.interface';
import { I_CHAT_REPOSITORY } from './core/domain/repositories/chat.repository.interface';
import { I_REALTIME_NOTIFIER } from './core/application/services/realtime-notifier.interface';

@Module({
  imports: [PrismaModule, MessagingModule],
  controllers: [LabelController],
  providers: [
    {
      provide: I_LABEL_REPOSITORY,
      useClass: PrismaLabelRepository,
    },
    {
      provide: I_CHAT_REPOSITORY,
      useClass: PrismaChatRepository,
    },
    {
      provide: CreateLabelUseCase,
      inject: [I_LABEL_REPOSITORY],
      useFactory: (repo) => new CreateLabelUseCase(repo),
    },
    {
      provide: UpdateLabelUseCase,
      inject: [I_LABEL_REPOSITORY],
      useFactory: (repo) => new UpdateLabelUseCase(repo),
    },
    {
      provide: DeleteLabelUseCase,
      inject: [I_LABEL_REPOSITORY],
      useFactory: (repo) => new DeleteLabelUseCase(repo),
    },
    {
      provide: ListLabelsUseCase,
      inject: [I_LABEL_REPOSITORY],
      useFactory: (repo) => new ListLabelsUseCase(repo),
    },
    {
      provide: AssignLabelUseCase,
      inject: [I_CHAT_REPOSITORY, I_LABEL_REPOSITORY, I_REALTIME_NOTIFIER],
      useFactory: (chatRepo, labelRepo, notifier) =>
        new AssignLabelUseCase(chatRepo, labelRepo, notifier),
    },
    {
      provide: RemoveLabelUseCase,
      inject: [I_CHAT_REPOSITORY, I_REALTIME_NOTIFIER],
      useFactory: (repo, notifier) => new RemoveLabelUseCase(repo, notifier),
    },
  ],
  exports: [I_LABEL_REPOSITORY],
})
export class LabelModule {}
