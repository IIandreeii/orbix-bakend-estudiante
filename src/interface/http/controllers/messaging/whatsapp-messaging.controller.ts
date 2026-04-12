import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  Patch,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

import { SendMessageDto } from '../../dtos/messaging/send-message.dto';
import { CreateChatDto } from '../../dtos/messaging/create-chat.dto';
import { UpdateChatDto } from '../../dtos/messaging/update-chat.dto';
import { UpdateTemplateDto } from '../../dtos/config/automation-request.dto';

import { SendMessageUseCase } from '../../../../core/application/use-cases/messaging/send-message.use-case';
import { MarkChatAsReadUseCase } from '../../../../core/application/use-cases/messaging/mark-chat-as-read.use-case';
import { ListChatsUseCase } from '../../../../core/application/use-cases/messaging/list-chats.use-case';
import { ListMessagesUseCase } from '../../../../core/application/use-cases/messaging/list-messages.use-case';
import { SearchMessagesUseCase } from '../../../../core/application/use-cases/messaging/search-messages.use-case';
import { GetMessageContextUseCase } from '../../../../core/application/use-cases/messaging/get-message-context.use-case';
import { CreateChatUseCase } from '../../../../core/application/use-cases/messaging/create-chat.use-case';
import { UpdateChatUseCase } from '../../../../core/application/use-cases/messaging/update-chat.use-case';
import { ListTemplatesUseCase } from '../../../../core/application/use-cases/messaging/list-templates.use-case';
import { UpdateTemplateUseCase } from '../../../../core/application/use-cases/messaging/update-template.use-case';

@ApiTags('messaging/whatsapp')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('messaging/whatsapp')
export class WhatsAppMessagingController {
  constructor(
    private readonly sendMessageUseCase: SendMessageUseCase,
    private readonly markChatAsReadUseCase: MarkChatAsReadUseCase,
    private readonly listChatsUseCase: ListChatsUseCase,
    private readonly listMessagesUseCase: ListMessagesUseCase,
    private readonly searchMessagesUseCase: SearchMessagesUseCase,
    private readonly getMessageContextUseCase: GetMessageContextUseCase,
    private readonly createChatUseCase: CreateChatUseCase,
    private readonly updateChatUseCase: UpdateChatUseCase,

    private readonly listTemplatesUseCase: ListTemplatesUseCase,
    private readonly updateTemplateUseCase: UpdateTemplateUseCase,
  ) {}

  @Get(':whatsAppAccountId/chats')
  @ApiOperation({ summary: 'Listar chats de una cuenta de WhatsApp' })
  async getChats(
    @Param('whatsAppAccountId', ParseUUIDPipe) whatsAppAccountId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.listChatsUseCase.execute({
      whatsAppAccountId,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      search: search || undefined,
    });
  }

  @Post(':whatsAppAccountId/chats')
  @ApiOperation({ summary: 'Crear chat' })
  async createChat(
    @Param('whatsAppAccountId', ParseUUIDPipe) whatsAppAccountId: string,
    @Body() dto: CreateChatDto,
  ) {
    return this.createChatUseCase.execute({
      whatsAppAccountId,
      ...dto,
    });
  }

  @Patch('chats/:chatId')
  @ApiOperation({ summary: 'Actualizar chat' })
  async updateChat(
    @Param('chatId', ParseUUIDPipe) chatId: string,
    @Body() dto: UpdateChatDto,
  ) {
    return this.updateChatUseCase.execute({
      chatId,
      ...dto,
    });
  }

  @Get('chats/:chatId/messages')
  @ApiOperation({ summary: 'Listar mensajes' })
  async getMessages(
    @Param('chatId', ParseUUIDPipe) chatId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.listMessagesUseCase.execute({
      chatId,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 30,
      search: search || undefined,
    });
  }

  @Patch('chats/:chatId/read')
  @ApiOperation({ summary: 'Marcar como leído' })
  async markAsRead(@Param('chatId', ParseUUIDPipe) chatId: string) {
    await this.markChatAsReadUseCase.execute({ chatId });
    return { success: true };
  }

  @Post(':whatsAppAccountId/send')
  @ApiOperation({ summary: 'Enviar mensaje' })
  async send(
    @Param('whatsAppAccountId', ParseUUIDPipe) whatsAppAccountId: string,
    @Body() dto: SendMessageDto,
  ) {
    await this.sendMessageUseCase.execute({
      whatsAppAccountId,
      ...dto,
    });
    return { success: true };
  }



  

  

  @Get(':whatsAppAccountId/templates')
  @ApiOperation({ summary: 'Listar plantillas' })
  async getTemplates(
    @Param('whatsAppAccountId', ParseUUIDPipe) whatsAppAccountId: string,
  ) {
    return this.listTemplatesUseCase.execute({ whatsAppAccountId });
  }



  @Patch(':whatsAppAccountId/templates/:templateId')
  @ApiOperation({ summary: 'Actualizar plantilla' })
  async updateTemplate(
    @Param('whatsAppAccountId', ParseUUIDPipe) whatsAppAccountId: string,
    @Param('templateId') templateId: string,
    @Body() dto: UpdateTemplateDto,
  ) {
    return this.updateTemplateUseCase.execute({
      whatsAppAccountId,
      templateId,
      ...dto,
    });
  }
}