import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateChatDto {
  @ApiPropertyOptional({
    example: 'Juan Pérez Editado',
    description: 'Nombre del cliente',
  })
  @IsString()
  @IsOptional()
  customerName?: string;
}
