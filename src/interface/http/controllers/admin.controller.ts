import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '../../../core/domain/entities/user.entity';
import { ListPaymentsUseCase } from '../../../core/application/use-cases/auth/list-payments.use-case';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPERMASTER)
@Controller('admin')
export class AdminController {
  constructor(private readonly listPaymentsUseCase: ListPaymentsUseCase) {}

  @Get('payments')
  @ApiOperation({ summary: 'Listar todos los pagos realizados en la plataforma (Solo SUPERMASTER)' })
  async findAllPayments() {
    return await this.listPaymentsUseCase.execute();
  }
}
