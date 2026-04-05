import type { ITutorialRepository } from '../../../domain/repositories/tutorial.repository.interface';

export class ListTutorialQuestionsUseCase {
  constructor(private readonly repository: ITutorialRepository) {}

  async execute(moduleId: string) {
    return await this.repository.findQuestionsByModuleId(moduleId);
  }
}
