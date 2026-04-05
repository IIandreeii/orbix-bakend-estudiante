import type { ITutorialRepository } from '../../../domain/repositories/tutorial.repository.interface';
import { TutorialModule } from '../../../domain/entities/tutorial.entity';
import { NotFoundDomainException } from '../../../domain/exceptions/domain.exception';

export interface UpdateTutorialModuleParams {
  id: string;
  title?: string;
  description?: string;
}

export class UpdateTutorialModuleUseCase {
  constructor(private readonly repository: ITutorialRepository) {}

  async execute(params: UpdateTutorialModuleParams) {
    const module = await this.repository.findModuleById(params.id);
    if (!module) throw new NotFoundDomainException('Módulo no encontrado');

    const data = module.toJSON();
    const updated = TutorialModule.create({
      ...data,
      title: params.title ?? data.title,
      description: params.description ?? data.description,
      updatedAt: new Date(),
    });

    await this.repository.updateModule(updated);
    return updated;
  }
}
