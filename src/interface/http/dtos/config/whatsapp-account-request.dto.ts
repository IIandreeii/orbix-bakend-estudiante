import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateWhatsAppAccountDto {
  @ApiProperty({ example: '51999888777' })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({ example: '1029384756' })
  @IsString()
  @IsNotEmpty()
  metaPhoneNumberId: string;

  @ApiPropertyOptional({ example: '987654321' })
  @IsString()
  @IsOptional()
  wabaId?: string;

  @ApiProperty({ example: 'EAAB...' })
  @IsString()
  @IsNotEmpty()
  accessToken: string;

  @ApiPropertyOptional({ example: '123456' })
  @IsString()
  @IsOptional()
  pin?: string;
}

export class UpdateWhatsAppAccountDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  metaPhoneNumberId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  accessToken?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  wabaId?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  pin?: string;
}
