import { ILabelRepository } from '../../../domain/repositories/label.repository.interface';
import { DomainException } from '../../../domain/exceptions/domain.exception';
import { LabelProps } from '../../../domain/entities/label.entity';

export interface UpdateLabelRequest {
  id: string;
  name?: string;
  color?: string;
}

export class UpdateLabelUseCase {
  constructor(private readonly labelRepository: ILabelRepository) {}

  async execute(request: UpdateLabelRequest): Promise<LabelProps> {
    const label = await this.labelRepository.findById(request.id);
    if (!label) {
      throw new DomainException('Label not found');
    }

    label.update({
      name: request.name,
      color: request.color,
    });

    await this.labelRepository.update(label);

    return label.toJSON();
  }
}
