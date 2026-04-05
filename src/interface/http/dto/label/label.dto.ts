import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsHexColor,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateLabelDto {
  @ApiProperty({ example: 'Ventas' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @ApiProperty({ example: '#ff0000' })
  @IsHexColor()
  @IsNotEmpty()
  color: string;

  @ApiProperty({ example: 'uuid-of-whatsapp-account' })
  @IsString()
  @IsNotEmpty()
  whatsAppAccountId: string;
}

export class UpdateLabelDto {
  @ApiPropertyOptional({ example: 'Ventas Actualizado' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  name?: string;

  @ApiPropertyOptional({ example: '#00ff00' })
  @IsHexColor()
  @IsOptional()
  color?: string;
}

export class AssignLabelDto {
  @ApiProperty({ example: 'uuid-of-label' })
  @IsString()
  @IsNotEmpty()
  labelId: string;
}
