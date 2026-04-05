import { WhatsAppAccount } from '../entities/whatsapp-account.entity';

export interface IWhatsAppAccountRepository {
  findById(id: string): Promise<WhatsAppAccount | null>;
  findByUserId(userId: string): Promise<WhatsAppAccount[]>;
  findByMetaId(metaId: string): Promise<WhatsAppAccount | null>;
  save(account: WhatsAppAccount): Promise<void>;
  update(account: WhatsAppAccount): Promise<void>;
  updateWebhookStatus(id: string, isConnected: boolean): Promise<void>;
  delete(id: string): Promise<void>;
}
