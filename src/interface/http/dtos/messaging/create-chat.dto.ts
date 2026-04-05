import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateChatDto {
  @ApiProperty({
    example: '51999999999',
    description: 'Número de teléfono del cliente con código de país',
  })
  @IsString()
  @IsNotEmpty()
  customerPhone: string;

  @ApiPropertyOptional({
    example: 'Juan Pérez',
    description: 'Nombre opcional del cliente',
  })
  @IsString()
  @IsOptional()
  customerName?: string;
}
