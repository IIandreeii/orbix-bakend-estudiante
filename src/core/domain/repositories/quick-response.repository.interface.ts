import { QuickResponse } from '../entities/quick-response.entity';

export interface QuickResponseFilter {
  whatsAppAccountId?: string;
  keyword?: string;
  isActive?: boolean;
  page: number;
  limit: number;
}

export interface PaginatedQuickResponses {
  data: QuickResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IQuickResponseRepository {
  findById(id: string): Promise<QuickResponse | null>;
  findAll(filter: QuickResponseFilter): Promise<PaginatedQuickResponses>;
  save(qr: QuickResponse): Promise<void>;
  update(qr: QuickResponse): Promise<void>;
  delete(id: string): Promise<void>;
  findByKeyword(
    whatsAppAccountId: string,
    keyword: string,
  ): Promise<QuickResponse | null>;
}
