import type {
  IQuickResponseRepository,
  QuickResponseFilter,
  PaginatedQuickResponses,
} from '../../../../domain/repositories/quick-response.repository.interface';
import { QuickResponse } from '../../../../domain/entities/quick-response.entity';
import { v4 as uuidv4 } from 'uuid';

export interface CreateQuickResponseRequest {
  whatsAppAccountId: string;
  keyword: string;
  responseMessage: string;
  imageUrl?: string;
  videoUrl?: string;
  isConfirmed?: boolean;
  isInformative?: boolean;
}

export class CreateQuickResponseUseCase {
  constructor(private readonly repository: IQuickResponseRepository) {}

  async execute(request: CreateQuickResponseRequest) {
    const qr = QuickResponse.create({
      id: uuidv4(),
      ...request,
      isConfirmed: request.isConfirmed ?? false,
      isInformative: request.isInformative ?? true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.repository.save(qr);
    return { id: qr.id };
  }
}

export class ListQuickResponsesUseCase {
  constructor(private readonly repository: IQuickResponseRepository) {}

  async execute(
    filter: Partial<QuickResponseFilter>,
  ): Promise<PaginatedQuickResponses> {
    return await this.repository.findAll({
      ...filter,
      page: Number(filter.page) || 1,
      limit: Number(filter.limit) || 10,
    } as QuickResponseFilter);
  }
}
