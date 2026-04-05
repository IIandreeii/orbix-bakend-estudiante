import { IsEmail, IsString, IsEnum, IsNotEmpty, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '../../../../core/domain/entities/user.entity';

export class CreateSubAccountDto {
  @ApiProperty({ example: 'asesor1@empresa.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Juan' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Pérez' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: '123456', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ enum: Role, example: Role.ADVISER })
  @IsEnum(Role)
  role: Role;

  @ApiPropertyOptional({ example: '51999999999' })
  @IsString()
  @IsOptional()
  phone?: string;
}
