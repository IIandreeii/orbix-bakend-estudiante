import { Injectable, Inject } from '@nestjs/common';
import { IAIConfigRepository } from '../../../../core/domain/repositories/ai-config.repository.interface';
import {
  AIConfig,
  AIProvider,
  AIModel,
} from '../../../../core/domain/entities/ai-config.entity';
import { PrismaService } from '../prisma.service';
import { AIConfig as PrismaAIConfig } from '@prisma/client';
import { EncryptionService } from '../../../security/encryption.service';

@Injectable()
export class PrismaAIConfigRepository implements IAIConfigRepository {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('IEncryptionService')
    private readonly encryptionService: EncryptionService,
  ) {}

  private mapToDomain(prismaConfig: PrismaAIConfig): AIConfig {
    return AIConfig.create({
      id: prismaConfig.id,
      whatsAppAccountId: prismaConfig.whatsAppAccountId,
      provider: prismaConfig.provider as AIProvider,
      model: prismaConfig.model as AIModel,
      apiKey: prismaConfig.apiKey
        ? this.encryptionService.decrypt(prismaConfig.apiKey)
        : undefined,
      isAssistantEnabled: prismaConfig.isAssistantEnabled,
      createdAt: prismaConfig.createdAt,
      updatedAt: prismaConfig.updatedAt,
    });
  }

  async findById(id: string): Promise<AIConfig | null> {
    const config = await this.prisma.aIConfig.findUnique({
      where: { id },
    });
    return config ? this.mapToDomain(config) : null;
  }

  async findByWhatsAppAccountId(
    whatsAppAccountId: string,
  ): Promise<AIConfig | null> {
    const config = await this.prisma.aIConfig.findUnique({
      where: { whatsAppAccountId },
    });
    return config ? this.mapToDomain(config) : null;
  }

  async save(config: AIConfig): Promise<void> {
    const data = config.toJSON();
    await this.prisma.aIConfig.create({
      data: {
        id: data.id,
        whatsAppAccountId: data.whatsAppAccountId,
        provider: data.provider,
        model: data.model,
        apiKey: data.apiKey
          ? this.encryptionService.encrypt(data.apiKey)
          : null,
        isAssistantEnabled: data.isAssistantEnabled,
      },
    });
  }

  async update(config: AIConfig): Promise<void> {
    const data = config.toJSON();
    await this.prisma.aIConfig.update({
      where: { id: data.id },
      data: {
        provider: data.provider,
        model: data.model,
        apiKey: data.apiKey
          ? this.encryptionService.encrypt(data.apiKey)
          : null,
        isAssistantEnabled: data.isAssistantEnabled,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.aIConfig.delete({
      where: { id },
    });
  }
}
