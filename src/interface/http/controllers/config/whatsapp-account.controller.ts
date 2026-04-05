import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Role } from '../../../../core/domain/entities/user.entity';
import {
  CreateWhatsAppAccountDto,
  UpdateWhatsAppAccountDto,
} from '../../dtos/config/whatsapp-account-request.dto';
import { CreateWhatsAppAccountUseCase } from '../../../../core/application/use-cases/config/whatsapp/create-whatsapp-account.use-case';
import { ListWhatsAppAccountsUseCase } from '../../../../core/application/use-cases/config/whatsapp/list-whatsapp-accounts.use-case';
import { UpdateWhatsAppAccountUseCase } from '../../../../core/application/use-cases/config/whatsapp/update-whatsapp-account.use-case';
import { DeleteWhatsAppAccountUseCase } from '../../../../core/application/use-cases/config/whatsapp/delete-whatsapp-account.use-case';
import { GetWhatsAppAccountUseCase } from '../../../../core/application/use-cases/config/whatsapp/get-whatsapp-account.use-case';
import type { AuthenticatedRequest } from '../../interfaces/authenticated-request.interface';

@ApiTags('config/whatsapp')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADVISER)
@Controller('config/whatsapp')
export class WhatsAppAccountController {
  constructor(
    private readonly createUseCase: CreateWhatsAppAccountUseCase,
    private readonly listUseCase: ListWhatsAppAccountsUseCase,
    private readonly updateUseCase: UpdateWhatsAppAccountUseCase,
    private readonly deleteUseCase: DeleteWhatsAppAccountUseCase,
    private readonly getUseCase: GetWhatsAppAccountUseCase,
  ) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Vincular una nueva cuenta de WhatsApp' })
  async create(
    @Body() dto: CreateWhatsAppAccountDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return await this.createUseCase.execute({
      ...dto,
      userId: req.user.sub,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Listar mis cuentas de WhatsApp' })
  async findAll(@Req() req: AuthenticatedRequest) {
    return await this.listUseCase.execute(req.user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de una cuenta de WhatsApp' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.getUseCase.execute(id);
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Actualizar vinculación de WhatsApp' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateWhatsAppAccountDto,
  ) {
    await this.updateUseCase.execute({ id, ...dto });
    return { message: 'Cuenta actualizada correctamente' };
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Eliminar vinculación de WhatsApp' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.deleteUseCase.execute(id);
    return { message: 'Cuenta eliminada correctamente' };
  }
}
