import { IsString, IsNotEmpty, IsOptional, IsUrl, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendMessageDto {
  @ApiProperty({ example: '51987654321' })
  @IsString()
  @IsNotEmpty()
  to: string;

  @ApiProperty({
    enum: [
      'text',
      'image',
      'audio',
      'video',
      'document',
      'template',
      'sticker',
      'reaction',
    ],
    default: 'text',
    required: false,
  })
  @IsIn([
    'text',
    'image',
    'audio',
    'video',
    'document',
    'template',
    'sticker',
    'reaction',
  ])
  @IsOptional()
  type?:
    | 'text'
    | 'image'
    | 'audio'
    | 'video'
    | 'document'
    | 'template'
    | 'sticker'
    | 'reaction';

  @ApiProperty({
    required: false,
    description: 'ID of the message to reply to',
  })
  @IsString()
  @IsOptional()
  quotedMessageId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  template?: {
    name: string;
    languageCode?: string;
    components?: Array<{
      type?: string;
      parameters?: Array<{ text?: string; payload?: string }>;
    }>;
  };

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({ required: false })
  @IsUrl()
  @IsOptional()
  mediaUrl?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  mediaId?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  mimeType?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  quickResponseKey?: string;
}
