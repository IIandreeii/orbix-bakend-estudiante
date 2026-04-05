import { ILabelRepository } from '../../../domain/repositories/label.repository.interface';
import { DomainException } from '../../../domain/exceptions/domain.exception';

export class DeleteLabelUseCase {
  constructor(private readonly labelRepository: ILabelRepository) {}

  async execute(id: string): Promise<void> {
    const label = await this.labelRepository.findById(id);
    if (!label) {
      throw new DomainException('Label not found');
    }

    await this.labelRepository.delete(id);
  }
}
