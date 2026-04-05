import { v4 as uuidv4 } from 'uuid';
import type { ITutorialRepository } from '../../../domain/repositories/tutorial.repository.interface';
import { TutorialModule } from '../../../domain/entities/tutorial.entity';

export interface CreateTutorialModuleParams {
  title: string;
  description: string;
}

export class CreateTutorialModuleUseCase {
  constructor(private readonly repository: ITutorialRepository) {}

  async execute(params: CreateTutorialModuleParams) {
    const module = TutorialModule.create({
      id: uuidv4(),
      title: params.title,
      description: params.description,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await this.repository.saveModule(module);
    return module;
  }
}
