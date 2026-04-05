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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Role } from '../../../../core/domain/entities/user.entity';
import {
  CreateProductDto,
  UpdateProductDto,
  ProductFilterDto,
} from '../../dtos/config/product-request.dto';
import {
  PaginatedProductResponseDto,
  ProductResponseDto,
} from '../../dtos/config/product-response.dto';

import { CreateProductUseCase } from '../../../../core/application/use-cases/config/products/create-product.use-case';
import { UpdateProductUseCase } from '../../../../core/application/use-cases/config/products/update-product.use-case';
import { DeleteProductUseCase } from '../../../../core/application/use-cases/config/products/delete-product.use-case';
import { ListProductsUseCase } from '../../../../core/application/use-cases/config/products/list-products.use-case';
import { GetProductUseCase } from '../../../../core/application/use-cases/config/products/get-product.use-case';

@ApiTags('config/products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADVISER)
@Controller('config/products')
export class ProductController {
  constructor(
    private readonly createProduct: CreateProductUseCase,
    private readonly updateProduct: UpdateProductUseCase,
    private readonly deleteProduct: DeleteProductUseCase,
    private readonly listProducts: ListProductsUseCase,
    private readonly getProduct: GetProductUseCase,
  ) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Crear un nuevo producto' })
  @ApiResponse({ status: 201, description: 'Producto creado' })
  async create(@Body() dto: CreateProductDto) {
    return await this.createProduct.execute(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar productos con paginación y filtros' })
  @ApiResponse({ status: 200, type: PaginatedProductResponseDto })
  async findAll(@Query() filter: ProductFilterDto) {
    return await this.listProducts.execute(filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un producto por ID' })
  @ApiResponse({ status: 200, type: ProductResponseDto })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.getProduct.execute(id);
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Actualizar un producto' })
  @ApiResponse({ status: 200, description: 'Producto actualizado' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
  ) {
    await this.updateProduct.execute({ id, ...dto });
    return { message: 'Producto actualizado con éxito' };
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Eliminar un producto (borrado lógico)' })
  @ApiResponse({ status: 200, description: 'Producto eliminado' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.deleteProduct.execute(id);
    return { message: 'Producto eliminado con éxito' };
  }
}
