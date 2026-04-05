import { NotFoundDomainException } from '../../../../domain/exceptions/domain.exception';
import type { IQuickResponseRepository } from '../../../../domain/repositories/quick-response.repository.interface';
import { QuickResponse } from '../../../../domain/entities/quick-response.entity';

export interface UpdateQuickResponseRequest {
  id: string;
  keyword?: string;
  responseMessage?: string;
  imageUrl?: string;
  videoUrl?: string;
  isActive?: boolean;
  isConfirmed?: boolean;
  isInformative?: boolean;
}

export class UpdateQuickResponseUseCase {
  constructor(private readonly repository: IQuickResponseRepository) {}

  async execute(request: UpdateQuickResponseRequest): Promise<void> {
    const existing = await this.repository.findById(request.id);
    if (!existing) {
      throw new NotFoundDomainException('Quick Response not found');
    }

    const updated = QuickResponse.create({
      ...existing.toJSON(),
      ...request,
      updatedAt: new Date(),
    });

    await this.repository.update(updated);
  }
}

export class DeleteQuickResponseUseCase {
  constructor(private readonly repository: IQuickResponseRepository) {}

  async execute(id: string): Promise<void> {
    const qr = await this.repository.findById(id);
    if (!qr) {
      throw new NotFoundDomainException('Quick Response not found');
    }
    await this.repository.delete(id);
  }
}
