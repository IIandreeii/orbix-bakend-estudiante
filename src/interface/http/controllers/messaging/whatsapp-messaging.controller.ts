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
import { SendMessageUseCase } from '../../../../core/application/use-cases/messaging/send-message.use-case';
import { MarkChatAsReadUseCase } from '../../../../core/application/use-cases/messaging/mark-chat-as-read.use-case';
import { ListChatsUseCase } from '../../../../core/application/use-cases/messaging/list-chats.use-case';
import { ListMessagesUseCase } from '../../../../core/application/use-cases/messaging/list-messages.use-case';
import { SearchMessagesUseCase } from '../../../../core/application/use-cases/messaging/search-messages.use-case';
import { GetMessageContextUseCase } from '../../../../core/application/use-cases/messaging/get-message-context.use-case';
import { CreateChatUseCase } from '../../../../core/application/use-cases/messaging/create-chat.use-case';
import { UpdateChatUseCase } from '../../../../core/application/use-cases/messaging/update-chat.use-case';
import { CreateChatDto } from '../../dtos/messaging/create-chat.dto';
import { UpdateChatDto } from '../../dtos/messaging/update-chat.dto';

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
  ) {}

  @Get(':whatsAppAccountId/chats')
  @ApiOperation({
    summary: 'Listar chats de una cuenta de WhatsApp (paginado + búsqueda)',
  })
  async getChats(
    @Param('whatsAppAccountId', ParseUUIDPipe) whatsAppAccountId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return await this.listChatsUseCase.execute({
      whatsAppAccountId,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      search: search || undefined,
    });
  }

  @Post(':whatsAppAccountId/chats')
  @ApiOperation({ summary: 'Crear un nuevo chat manualmente' })
  async createChat(
    @Param('whatsAppAccountId', ParseUUIDPipe) whatsAppAccountId: string,
    @Body() dto: CreateChatDto,
  ) {
    return await this.createChatUseCase.execute({
      whatsAppAccountId,
      ...dto,
    });
  }

  @Patch('chats/:chatId')
  @ApiOperation({ summary: 'Editar información de un chat' })
  async updateChat(
    @Param('chatId', ParseUUIDPipe) chatId: string,
    @Body() dto: UpdateChatDto,
  ) {
    return await this.updateChatUseCase.execute({
      chatId,
      ...dto,
    });
  }

  @Get('chats/:chatId/messages')
  @ApiOperation({ summary: 'Listar mensajes de un chat' })
  async getMessages(
    @Param('chatId', ParseUUIDPipe) chatId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('before_id') beforeId?: string,
    @Query('after_id') afterId?: string,
  ) {
    return await this.listMessagesUseCase.execute({
      chatId,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 30,
      search: search || undefined,
      beforeId,
      afterId,
    });
  }

  @Patch('chats/:chatId/read')
  @ApiOperation({ summary: 'Marcar chat como leído' })
  async markAsRead(@Param('chatId', ParseUUIDPipe) chatId: string) {
    await this.markChatAsReadUseCase.execute({ chatId });
    return { success: true };
  }

  @Get(':whatsAppAccountId/search-messages')
  @ApiOperation({
    summary: 'Buscar mensajes en todo el historial de la cuenta',
  })
  async searchMessages(
    @Param('whatsAppAccountId', ParseUUIDPipe) whatsAppAccountId: string,
    @Query('search') search?: string,
    @Query('labelId') labelId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return await this.searchMessagesUseCase.execute({
      whatsAppAccountId,
      search: search || '',
      labelId,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get('messages/jump/:messageId')
  @ApiOperation({
    summary:
      'Saltar al contexto de un mensaje específico (mensajes de alrededor)',
  })
  async jumpToMessage(
    @Param('messageId', ParseUUIDPipe) messageId: string,
    @Query('limit') limit?: string,
  ) {
    return await this.getMessageContextUseCase.execute({
      messageId,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Post(':whatsAppAccountId/send')
  @ApiOperation({ summary: 'Enviar un mensaje (texto o media)' })
  async send(
    @Param('whatsAppAccountId', ParseUUIDPipe) whatsAppAccountId: string,
    @Body() dto: SendMessageDto,
  ) {
    await this.sendMessageUseCase.execute({
      whatsAppAccountId,
      ...dto,
    });
    return { success: true, message: 'Mensaje enviado correctamente' };
  }
}
