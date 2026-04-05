import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsUUID,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import {
  AIProvider,
  AIModel,
} from '../../../../core/domain/entities/ai-config.entity';

export class UpdateAIConfigDto {
  @ApiProperty({ example: 'uuid-whatsapp-account' })
  @IsUUID()
  whatsAppAccountId: string;

  @ApiProperty({ enum: AIProvider })
  @IsEnum(AIProvider)
  provider: AIProvider;

  @ApiProperty({ enum: AIModel })
  @IsEnum(AIModel)
  model: AIModel;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  apiKey?: string;

  @ApiProperty({ default: true })
  @IsBoolean()
  isAssistantEnabled: boolean;
}
