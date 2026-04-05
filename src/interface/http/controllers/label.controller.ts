import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateLabelUseCase } from '../../../core/application/use-cases/labels/create-label.use-case';
import { UpdateLabelUseCase } from '../../../core/application/use-cases/labels/update-label.use-case';
import { DeleteLabelUseCase } from '../../../core/application/use-cases/labels/delete-label.use-case';
import { ListLabelsUseCase } from '../../../core/application/use-cases/labels/list-labels.use-case';
import { AssignLabelUseCase } from '../../../core/application/use-cases/labels/assign-label.use-case';
import { RemoveLabelUseCase } from '../../../core/application/use-cases/labels/remove-label.use-case';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiCookieAuth } from '@nestjs/swagger';
import {
  CreateLabelDto,
  UpdateLabelDto,
  AssignLabelDto,
} from '../dto/label/label.dto';

@ApiTags('labels')
@Controller('labels')
@UseGuards(JwtAuthGuard)
@ApiCookieAuth()
export class LabelController {
  constructor(
    private readonly createLabelUseCase: CreateLabelUseCase,
    private readonly updateLabelUseCase: UpdateLabelUseCase,
    private readonly deleteLabelUseCase: DeleteLabelUseCase,
    private readonly listLabelsUseCase: ListLabelsUseCase,
    private readonly assignLabelUseCase: AssignLabelUseCase,
    private readonly removeLabelUseCase: RemoveLabelUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva etiqueta' })
  async create(@Body() dto: CreateLabelDto) {
    return await this.createLabelUseCase.execute(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar etiquetas de una cuenta de WhatsApp' })
  async list(
    @Query('whatsAppAccountId') whatsAppAccountId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return await this.listLabelsUseCase.execute({
      whatsAppAccountId,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      search,
    });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar una etiqueta existente' })
  async update(@Param('id') id: string, @Body() dto: UpdateLabelDto) {
    return await this.updateLabelUseCase.execute({ id, ...dto });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una etiqueta' })
  async delete(@Param('id') id: string) {
    await this.deleteLabelUseCase.execute(id);
    return { success: true };
  }

  @Post('chats/:chatId/assign')
  @ApiOperation({ summary: 'Asignar una etiqueta a un chat' })
  async assign(@Param('chatId') chatId: string, @Body() dto: AssignLabelDto) {
    await this.assignLabelUseCase.execute({ chatId, labelId: dto.labelId });
    return { success: true };
  }

  @Post('chats/:chatId/unassign')
  @ApiOperation({ summary: 'Quitar una etiqueta de un chat' })
  async unassign(@Param('chatId') chatId: string, @Body() dto: AssignLabelDto) {
    await this.removeLabelUseCase.execute({ chatId, labelId: dto.labelId });
    return { success: true };
  }
}
