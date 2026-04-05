import { Controller, Post, Put, Delete, Body, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Role } from '../../../../core/domain/entities/user.entity';
import { 
  CreateTutorialModuleDto, 
  UpdateTutorialModuleDto, 
  CreateTutorialQuestionDto, 
  UpdateTutorialQuestionDto 
} from '../../dtos/tutorials/tutorial.dto';

import { CreateTutorialModuleUseCase } from '../../../../core/application/use-cases/tutorials/create-tutorial-module.use-case';
import { UpdateTutorialModuleUseCase } from '../../../../core/application/use-cases/tutorials/update-tutorial-module.use-case';
import { DeleteTutorialModuleUseCase } from '../../../../core/application/use-cases/tutorials/delete-tutorial-module.use-case';

import { CreateTutorialQuestionUseCase } from '../../../../core/application/use-cases/tutorials/create-tutorial-question.use-case';
import { UpdateTutorialQuestionUseCase } from '../../../../core/application/use-cases/tutorials/update-tutorial-question.use-case';
import { DeleteTutorialQuestionUseCase } from '../../../../core/application/use-cases/tutorials/delete-tutorial-question.use-case';

@ApiTags('admin/tutorials')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPERMASTER)
@Controller('admin/tutorials')
export class AdminTutorialController {
  constructor(
    private readonly createModule: CreateTutorialModuleUseCase,
    private readonly updateModule: UpdateTutorialModuleUseCase,
    private readonly deleteModule: DeleteTutorialModuleUseCase,
    private readonly createQuestion: CreateTutorialQuestionUseCase,
    private readonly updateQuestion: UpdateTutorialQuestionUseCase,
    private readonly deleteQuestion: DeleteTutorialQuestionUseCase,
  ) {}

  @Post('modules')
  @ApiOperation({ summary: 'Crear un nuevo módulo de tutoriales (Solo SUPERMASTER)' })
  async createMod(@Body() dto: CreateTutorialModuleDto) {
    return await this.createModule.execute(dto);
  }

  @Put('modules/:id')
  @ApiOperation({ summary: 'Actualizar un módulo de tutoriales (Solo SUPERMASTER)' })
  async updateMod(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateTutorialModuleDto) {
    return await this.updateModule.execute({ id, ...dto });
  }

  @Delete('modules/:id')
  @ApiOperation({ summary: 'Eliminar un módulo de tutoriales (Solo SUPERMASTER)' })
  async deleteMod(@Param('id', ParseUUIDPipe) id: string) {
    await this.deleteModule.execute(id);
    return { success: true };
  }

  @Post('questions')
  @ApiOperation({ summary: 'Añadir una pregunta a un módulo (Solo SUPERMASTER)' })
  async createQuest(@Body() dto: CreateTutorialQuestionDto) {
    return await this.createQuestion.execute(dto);
  }

  @Put('questions/:id')
  @ApiOperation({ summary: 'Actualizar una pregunta (Solo SUPERMASTER)' })
  async updateQuest(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateTutorialQuestionDto) {
    return await this.updateQuestion.execute({ id, ...dto });
  }

  @Delete('questions/:id')
  @ApiOperation({ summary: 'Eliminar una pregunta (Solo SUPERMASTER)' })
  async deleteQuest(@Param('id', ParseUUIDPipe) id: string) {
    await this.deleteQuestion.execute(id);
    return { success: true };
  }
}
