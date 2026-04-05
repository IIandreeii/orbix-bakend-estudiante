import {
  WhatsAppTemplate,
  TemplateType,
} from '../entities/whatsapp-template.entity';

export interface TemplateFilter {
  whatsAppAccountId?: string;
  name?: string;
  templateType?: TemplateType;
  page: number;
  limit: number;
}

export interface PaginatedTemplates {
  data: WhatsAppTemplate[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IWhatsAppTemplateRepository {
  findById(id: string): Promise<WhatsAppTemplate | null>;
  findAll(filter: TemplateFilter): Promise<PaginatedTemplates>;
  save(template: WhatsAppTemplate): Promise<void>;
  update(template: WhatsAppTemplate): Promise<void>;
  delete(id: string): Promise<void>;
  findByName(
    whatsAppAccountId: string,
    name: string,
  ): Promise<WhatsAppTemplate | null>;
}
