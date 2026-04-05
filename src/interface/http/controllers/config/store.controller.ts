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
  CreateStoreDto,
  UpdateStoreDto,
  StoreFilterDto,
} from '../../dtos/config/store-request.dto';
import { CreateStoreUseCase } from '../../../../core/application/use-cases/config/stores/create-store.use-case';
import { ListStoresUseCase } from '../../../../core/application/use-cases/config/stores/list-stores.use-case';
import { UpdateStoreUseCase } from '../../../../core/application/use-cases/config/stores/update-store.use-case';
import { DeleteStoreUseCase } from '../../../../core/application/use-cases/config/stores/delete-store.use-case';
import { GetStoreUseCase } from '../../../../core/application/use-cases/config/stores/get-store.use-case';

@ApiTags('config/stores')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADVISER)
@Controller('config/stores')
export class StoreController {
  constructor(
    private readonly createStore: CreateStoreUseCase,
    private readonly listStores: ListStoresUseCase,
    private readonly updateStore: UpdateStoreUseCase,
    private readonly deleteStore: DeleteStoreUseCase,
    private readonly getStore: GetStoreUseCase,
  ) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Crear una nueva tienda vinculada a un número' })
  async create(@Body() dto: CreateStoreDto) {
    return await this.createStore.execute(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar tiendas con paginación' })
  async findAll(@Query() filter: StoreFilterDto) {
    return await this.listStores.execute(filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de una tienda' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.getStore.execute(id);
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Actualizar una tienda' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStoreDto,
  ) {
    await this.updateStore.execute({ id, ...dto });
    return { message: 'Tienda actualizada con éxito' };
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Eliminar una tienda' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.deleteStore.execute(id);
    return { message: 'Tienda eliminada con éxito' };
  }
}
