import type { IAIConfigRepository } from '../../../../domain/repositories/ai-config.repository.interface';
import {
  AIConfig,
  AIProvider,
  AIModel,
} from '../../../../domain/entities/ai-config.entity';
import { v4 as uuidv4 } from 'uuid';

export interface UpdateAIConfigRequest {
  whatsAppAccountId: string;
  provider: AIProvider;
  model: AIModel;
  apiKey?: string;
  isAssistantEnabled: boolean;
}

export class UpdateAIConfigUseCase {
  constructor(private readonly repository: IAIConfigRepository) {}

  async execute(request: UpdateAIConfigRequest) {
    let config = await this.repository.findByWhatsAppAccountId(
      request.whatsAppAccountId,
    );

    if (!config) {
      config = AIConfig.create({
        id: uuidv4(),
        ...request,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await this.repository.save(config);
    } else {
      const updateData = { ...request };
      if (!updateData.apiKey || updateData.apiKey.trim() === '') {
        delete updateData.apiKey;
      }

      const updated = AIConfig.create({
        ...config.toJSON(),
        ...updateData,
        updatedAt: new Date(),
      });
      await this.repository.update(updated);
    }

    return config.toSafeJSON();
  }
}
