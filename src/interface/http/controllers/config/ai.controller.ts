import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Role } from '../../../../core/domain/entities/user.entity';
import { UpdateAIConfigDto } from '../../dtos/config/ai-request.dto';
import { UpdateAIConfigUseCase } from '../../../../core/application/use-cases/config/ai/update-ai-config.use-case';
import {
  GetAIConfigUseCase,
  DeleteAIConfigUseCase,
} from '../../../../core/application/use-cases/config/ai/ai-config-ops.use-case';

@ApiTags('config/ai')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADVISER)
@Controller('config/ai')
export class AIController {
  constructor(
    private readonly updateConfig: UpdateAIConfigUseCase,
    private readonly getConfig: GetAIConfigUseCase,
    private readonly deleteConfig: DeleteAIConfigUseCase,
  ) {}

  @Put('settings')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Actualizar configuración del proveedor de IA' })
  async updateSettings(@Body() dto: UpdateAIConfigDto) {
    return await this.updateConfig.execute(dto);
  }

  @Get('settings/:whatsAppAccountId')
  @ApiOperation({
    summary: 'Obtener configuración de IA por cuenta de WhatsApp',
  })
  async findSettings(@Param('whatsAppAccountId', ParseUUIDPipe) id: string) {
    return await this.getConfig.executeByWhatsAppAccount(id);
  }

  @Delete('settings/:id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Eliminar configuración de IA' })
  async removeSettings(@Param('id', ParseUUIDPipe) id: string) {
    await this.deleteConfig.execute(id);
    return { message: 'Configuración eliminada' };
  }
}
