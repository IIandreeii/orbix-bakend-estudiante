import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsUUID,
  IsNumber,
  IsBoolean,
  IsNotEmpty,
} from 'class-validator';

export class CreateStoreDto {
  @ApiProperty({ example: 'uuid-whatsapp-account' })
  @IsUUID()
  whatsAppAccountId: string;

  @ApiProperty({ example: 'Mi Tienda Shopify' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'mi-tienda.com' })
  @IsString()
  @IsOptional()
  domain?: string;

  @ApiPropertyOptional({ example: '123456789' })
  @IsString()
  @IsOptional()
  externalStoreId?: string;

  @ApiPropertyOptional({ example: 'code_abc_123' })
  @IsString()
  @IsOptional()
  code?: string;
}

export class UpdateStoreDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  domain?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  externalStoreId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  code?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class StoreFilterDto {
  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  whatsAppAccountId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  limit?: number = 10;
}
