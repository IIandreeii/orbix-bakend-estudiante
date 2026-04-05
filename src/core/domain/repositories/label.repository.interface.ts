import { Label } from '../entities/label.entity';
import { PaginatedResult } from './chat.repository.interface';
export type { PaginatedResult };

export interface FindLabelsQuery {
  whatsAppAccountId: string;
  page?: number;
  limit?: number;
  search?: string;
}

export interface ILabelRepository {
  findById(id: string): Promise<Label | null>;
  findByWhatsAppAccountId(whatsAppAccountId: string): Promise<Label[]>;
  findPaginated(query: FindLabelsQuery): Promise<PaginatedResult<Label>>;
  save(label: Label): Promise<void>;
  update(label: Label): Promise<void>;
  delete(id: string): Promise<void>;
}

export const I_LABEL_REPOSITORY = 'ILabelRepository';
