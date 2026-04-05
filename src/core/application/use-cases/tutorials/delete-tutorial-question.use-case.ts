import type { ITutorialRepository } from '../../../domain/repositories/tutorial.repository.interface';

export class DeleteTutorialQuestionUseCase {
  constructor(private readonly repository: ITutorialRepository) {}

  async execute(id: string) {
    await this.repository.deleteQuestion(id);
  }
}
