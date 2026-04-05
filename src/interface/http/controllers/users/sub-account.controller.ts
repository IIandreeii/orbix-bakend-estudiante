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
import { CreateSubAccountDto } from '../../dtos/auth/create-sub-account.dto';
import { UpdateSubAccountDto } from '../../dtos/auth/update-sub-account.dto';
import { CreateSubAccountUseCase } from '../../../../core/application/use-cases/users/create-sub-account.use-case';
import { ListSubAccountsUseCase } from '../../../../core/application/use-cases/users/list-sub-accounts.use-case';
import { UpdateSubAccountUseCase } from '../../../../core/application/use-cases/users/update-sub-account.use-case';
import { DeleteSubAccountUseCase } from '../../../../core/application/use-cases/users/delete-sub-account.use-case';
import type { AuthenticatedRequest } from '../../interfaces/authenticated-request.interface';

@ApiTags('users/sub-accounts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.MASTER, Role.ADMIN)
@Controller('users/sub-accounts')
export class SubAccountController {
  constructor(
    private readonly createUseCase: CreateSubAccountUseCase,
    private readonly listUseCase: ListSubAccountsUseCase,
    private readonly updateUseCase: UpdateSubAccountUseCase,
    private readonly deleteUseCase: DeleteSubAccountUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo asesor o administrador secundario' })
  async create(
    @Body() dto: CreateSubAccountDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return await this.createUseCase.execute({
      ...dto,
      parentId: req.user.sub,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Listar equipo de trabajo (asesores/admins)' })
  async findAll(@Req() req: AuthenticatedRequest) {
    return await this.listUseCase.execute(req.user.sub);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar información de un miembro del equipo' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSubAccountDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return await this.updateUseCase.execute({
      id,
      ...dto,
      requesterId: req.user.sub,
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un miembro del equipo' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    await this.deleteUseCase.execute(id, req.user.sub);
    return { message: 'Miembro del equipo eliminado correctamente' };
  }
}
