import { Injectable, Inject } from '@nestjs/common';
import { IWhatsAppAccountRepository } from '../../../../core/domain/repositories/whatsapp-account.repository.interface';
import { WhatsAppAccount } from '../../../../core/domain/entities/whatsapp-account.entity';
import { PrismaService } from '../prisma.service';
import { WhatsAppAccount as PrismaWhatsAppAccount } from '@prisma/client';
import { EncryptionService } from '../../../security/encryption.service';

@Injectable()
export class PrismaWhatsAppAccountRepository implements IWhatsAppAccountRepository {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('IEncryptionService')
    private readonly encryptionService: EncryptionService,
  ) {}

  private mapToDomain(prismaAccount: PrismaWhatsAppAccount): WhatsAppAccount {
    return WhatsAppAccount.create({
      id: prismaAccount.id,
      userId: prismaAccount.userId,
      phoneNumber: prismaAccount.phoneNumber,
      metaPhoneNumberId: prismaAccount.metaPhoneNumberId,
      wabaId: prismaAccount.wabaId ?? undefined,
      accessToken: this.encryptionService.decrypt(prismaAccount.accessToken),
      pin: prismaAccount.pin
        ? this.encryptionService.decrypt(prismaAccount.pin)
        : undefined,
      isActive: prismaAccount.isActive,
      isWebhookConnected: prismaAccount.isWebhookConnected,
      createdAt: prismaAccount.createdAt,
      updatedAt: prismaAccount.updatedAt,
    });
  }

  async findById(id: string): Promise<WhatsAppAccount | null> {
    const account = await this.prisma.whatsAppAccount.findUnique({
      where: { id },
    });
    return account ? this.mapToDomain(account) : null;
  }

  async findByUserId(userId: string): Promise<WhatsAppAccount[]> {
    const accounts = await this.prisma.whatsAppAccount.findMany({
      where: { userId },
    });
    return accounts.map((acc) => this.mapToDomain(acc));
  }

  async findByMetaId(metaId: string): Promise<WhatsAppAccount | null> {
    const account = await this.prisma.whatsAppAccount.findUnique({
      where: { metaPhoneNumberId: metaId },
    });
    return account ? this.mapToDomain(account) : null;
  }

  async save(account: WhatsAppAccount): Promise<void> {
    const data = account.toJSON();
    await this.prisma.whatsAppAccount.create({
      data: {
        id: data.id,
        userId: data.userId,
        phoneNumber: data.phoneNumber,
        metaPhoneNumberId: data.metaPhoneNumberId,
        wabaId: data.wabaId,
        accessToken: this.encryptionService.encrypt(data.accessToken),
        pin: data.pin ? this.encryptionService.encrypt(data.pin) : null,
        isActive: data.isActive,
        isWebhookConnected: data.isWebhookConnected,
      },
    });
  }

  async update(account: WhatsAppAccount): Promise<void> {
    const data = account.toJSON();
    await this.prisma.whatsAppAccount.update({
      where: { id: data.id },
      data: {
        phoneNumber: data.phoneNumber,
        metaPhoneNumberId: data.metaPhoneNumberId,
        wabaId: data.wabaId,
        accessToken: this.encryptionService.encrypt(data.accessToken),
        pin: data.pin ? this.encryptionService.encrypt(data.pin) : null,
        isActive: data.isActive,
        isWebhookConnected: data.isWebhookConnected,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.whatsAppAccount.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async updateWebhookStatus(id: string, isConnected: boolean): Promise<void> {
    await this.prisma.whatsAppAccount.update({
      where: { id },
      data: { isWebhookConnected: isConnected },
    });
  }
}
