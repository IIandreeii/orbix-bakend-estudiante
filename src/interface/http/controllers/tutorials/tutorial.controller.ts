import { Controller, Get, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { ListTutorialModulesUseCase } from '../../../../core/application/use-cases/tutorials/list-tutorial-modules.use-case';
import { ListTutorialQuestionsUseCase } from '../../../../core/application/use-cases/tutorials/list-tutorial-questions.use-case';

@ApiTags('tutorials')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tutorials')
export class TutorialController {
  constructor(
    private readonly listModules: ListTutorialModulesUseCase,
    private readonly listQuestions: ListTutorialQuestionsUseCase,
  ) {}

  @Get('modules')
  @ApiOperation({ summary: 'Listar todos los módulos de tutoriales' })
  async findAllModules() {
    return await this.listModules.execute();
  }

  @Get('modules/:id/questions')
  @ApiOperation({ summary: 'Listar preguntas de un módulo específico' })
  async findQuestionsByModule(@Param('id', ParseUUIDPipe) id: string) {
    return await this.listQuestions.execute(id);
  }
}
