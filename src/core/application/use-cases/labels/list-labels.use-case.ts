import {
  ILabelRepository,
  PaginatedResult,
} from '../../../domain/repositories/label.repository.interface';
import { LabelProps } from '../../../domain/entities/label.entity';

export interface ListLabelsRequest {
  whatsAppAccountId: string;
  page?: number;
  limit?: number;
  search?: string;
}

export class ListLabelsUseCase {
  constructor(private readonly labelRepository: ILabelRepository) {}

  async execute(
    request: ListLabelsRequest,
  ): Promise<PaginatedResult<LabelProps>> {
    const result = await this.labelRepository.findPaginated({
      whatsAppAccountId: request.whatsAppAccountId,
      page: request.page || 1,
      limit: request.limit || 20,
      search: request.search,
    });

    return {
      ...result,
      data: result.data.map((label) => label.toJSON()),
    };
  }
}
