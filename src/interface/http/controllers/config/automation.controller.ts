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
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Role } from '../../../../core/domain/entities/user.entity';
import {
  CreateTemplateDto,
  UpdateTemplateDto,
  CreateQuickResponseDto,
  UpdateQuickResponseDto,
  AutomationFilterDto,
} from '../../dtos/config/automation-request.dto';
import {
  CreateTemplateUseCase,
  ListTemplatesUseCase,
} from '../../../../core/application/use-cases/config/automation/templates.use-case';
import {
  UpdateTemplateUseCase,
  DeleteTemplateUseCase,
} from '../../../../core/application/use-cases/config/automation/template-ops.use-case';
import {
  CreateQuickResponseUseCase,
  ListQuickResponsesUseCase,
} from '../../../../core/application/use-cases/config/automation/quick-responses.use-case';
import {
  UpdateQuickResponseUseCase,
  DeleteQuickResponseUseCase,
} from '../../../../core/application/use-cases/config/automation/quick-response-ops.use-case';

@ApiTags('config/automation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADVISER)
@Controller('config/automation')
export class AutomationController {
  constructor(
    private readonly createTemplate: CreateTemplateUseCase,
    private readonly listTemplates: ListTemplatesUseCase,
    private readonly updateTemplate: UpdateTemplateUseCase,
    private readonly deleteTemplate: DeleteTemplateUseCase,
    private readonly createQR: CreateQuickResponseUseCase,
    private readonly listQR: ListQuickResponsesUseCase,
    private readonly updateQR: UpdateQuickResponseUseCase,
    private readonly deleteQR: DeleteQuickResponseUseCase,
  ) {}

  @Post('templates')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Crear una nueva plantilla de WhatsApp' })
  async createTpl(@Body() dto: CreateTemplateDto) {
    return await this.createTemplate.execute(dto);
  }

  @Get('templates')
  @ApiOperation({ summary: 'Listar plantillas con filtros' })
  async findAllTpl(@Query() filter: AutomationFilterDto) {
    return await this.listTemplates.execute(filter);
  }

  @Put('templates/:id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Actualizar una plantilla' })
  async updateTpl(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTemplateDto,
  ) {
    await this.updateTemplate.execute({ id, ...dto });
    return { message: 'Plantilla actualizada' };
  }

  @Delete('templates/:id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Eliminar una plantilla' })
  async removeTpl(@Param('id', ParseUUIDPipe) id: string) {
    await this.deleteTemplate.execute(id);
    return { message: 'Plantilla eliminada' };
  }

  @Post('quick-responses')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Crear una respuesta rápida por keyword' })
  async createQuick(@Body() dto: CreateQuickResponseDto) {
    return await this.createQR.execute(dto);
  }

  @Get('quick-responses')
  @ApiOperation({ summary: 'Listar respuestas rápidas' })
  async findAllQR(@Query() filter: AutomationFilterDto) {
    return await this.listQR.execute(filter);
  }

  @Put('quick-responses/:id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Actualizar una respuesta rápida' })
  async updateQuick(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateQuickResponseDto,
  ) {
    await this.updateQR.execute({ id, ...dto });
    return { message: 'Respuesta rápida actualizada' };
  }

  @Delete('quick-responses/:id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Eliminar una respuesta rápida' })
  async removeQuick(@Param('id', ParseUUIDPipe) id: string) {
    await this.deleteQR.execute(id);
    return { message: 'Respuesta rápida eliminada' };
  }
}
