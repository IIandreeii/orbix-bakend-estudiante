import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsEnum,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import { TemplateType } from '../../../../core/domain/entities/whatsapp-template.entity';

export class CreateTemplateDto {
  @ApiProperty({ example: 'uuid-whatsapp-account' })
  @IsUUID()
  whatsAppAccountId: string;

  @ApiProperty({ example: 'header_order_confirmation' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'es' })
  @IsString()
  @IsOptional()
  language: string = 'es';

  @ApiProperty({ enum: TemplateType })
  @IsEnum(TemplateType)
  templateType: TemplateType;
}

export class UpdateTemplateDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  language?: string;

  @ApiPropertyOptional({ enum: TemplateType })
  @IsEnum(TemplateType)
  @IsOptional()
  templateType?: TemplateType;
}

export class CreateQuickResponseDto {
  @ApiProperty({ example: 'uuid-whatsapp-account' })
  @IsUUID()
  whatsAppAccountId: string;

  @ApiProperty({ example: 'comprar' })
  @IsString()
  @IsNotEmpty()
  keyword: string;

  @ApiProperty({ example: 'Perfecto, ¿qué producto deseas adquirir?' })
  @IsString()
  @IsNotEmpty()
  responseMessage: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsOptional()
  videoUrl?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isConfirmed?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isInformative?: boolean;
}

export class UpdateQuickResponseDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  keyword?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  responseMessage?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  videoUrl?: string;

  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isConfirmed?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isInformative?: boolean;
}

export class AutomationFilterDto {
  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  whatsAppAccountId?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  limit?: number = 10;
}
