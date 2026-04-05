import { ILabelRepository } from '../../../domain/repositories/label.repository.interface';
import { Label, LabelProps } from '../../../domain/entities/label.entity';
import { v4 as uuidv4 } from 'uuid';

export interface CreateLabelRequest {
  whatsAppAccountId: string;
  name: string;
  color: string;
}

export class CreateLabelUseCase {
  constructor(private readonly labelRepository: ILabelRepository) {}

  async execute(request: CreateLabelRequest): Promise<LabelProps> {
    const label = Label.create({
      id: uuidv4(),
      whatsAppAccountId: request.whatsAppAccountId,
      name: request.name,
      color: request.color,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.labelRepository.save(label);

    return label.toJSON();
  }
}
