import type { ITutorialRepository } from '../../../domain/repositories/tutorial.repository.interface';

export class ListTutorialModulesUseCase {
  constructor(private readonly repository: ITutorialRepository) {}

  async execute() {
    return await this.repository.findAllModules();
  }
}
