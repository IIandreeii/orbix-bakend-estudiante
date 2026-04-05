import { AIConfig } from '../entities/ai-config.entity';

export interface IAIConfigRepository {
  findById(id: string): Promise<AIConfig | null>;
  findByWhatsAppAccountId(whatsAppAccountId: string): Promise<AIConfig | null>;
  save(config: AIConfig): Promise<void>;
  update(config: AIConfig): Promise<void>;
  delete(id: string): Promise<void>;
}
