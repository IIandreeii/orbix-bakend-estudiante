import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../../core/domain/entities/user.entity';

export class MessageResponseDto {
  @ApiProperty({ example: 'Operation successful' })
  message: string;
}

export class UserResponseDto {
  @ApiProperty({ example: 'uuid-v4-identifier' })
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'John' })
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  lastName: string;

  @ApiProperty({ example: 'John Doe' })
  fullName: string;

  @ApiProperty({ example: '+123456789' })
  phone?: string;

  @ApiProperty({ example: '123 Main St' })
  address?: string;

  @ApiProperty({ example: 'New York' })
  city?: string;

  @ApiProperty({ example: '10001' })
  zipCode?: string;

  @ApiProperty({ example: 'US' })
  countryCode?: string;

  @ApiProperty({ enum: Role, example: Role.MASTER })
  role: Role;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2023-10-27T10:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2023-10-27T10:00:00Z' })
  updatedAt: Date;
}

export class ErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({ example: '2023-10-27T10:00:00.000Z' })
  timestamp: string;

  @ApiProperty({ example: '/api/v1/resource' })
  path: string;

  @ApiProperty({ example: 'Error message description' })
  message: string;
}

export class AuthResponseDto {
  @ApiProperty()
  user: UserResponseDto;

  @ApiProperty({ description: 'AccessToken is also sent via HttpOnly cookie' })
  accessToken: string;

  @ApiProperty({ description: 'RefreshToken is also sent via HttpOnly cookie' })
  refreshToken: string;
}
