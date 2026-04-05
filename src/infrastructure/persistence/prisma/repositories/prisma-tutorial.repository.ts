import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ITutorialRepository } from '../../../../core/domain/repositories/tutorial.repository.interface';
import { TutorialModule, TutorialQuestion } from '../../../../core/domain/entities/tutorial.entity';
import { TutorialModule as PrismaTutorialModule, TutorialQuestion as PrismaTutorialQuestion } from '@prisma/client';

@Injectable()
export class PrismaTutorialRepository implements ITutorialRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapModuleToDomain(item: PrismaTutorialModule): TutorialModule {
    return TutorialModule.create({
      id: item.id,
      title: item.title,
      description: item.description,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    });
  }

  private mapQuestionToDomain(item: PrismaTutorialQuestion): TutorialQuestion {
    return TutorialQuestion.create({
      id: item.id,
      moduleId: item.moduleId,
      question: item.question,
      answer: item.answer,
      videoUrl: item.videoUrl ?? undefined,
      documentUrl: item.documentUrl ?? undefined,
      imageUrl: item.imageUrl ?? undefined,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    });
  }

  async findAllModules(): Promise<TutorialModule[]> {
    const modules = await this.prisma.tutorialModule.findMany({
      orderBy: { createdAt: 'asc' },
    });
    return modules.map((m) => this.mapModuleToDomain(m));
  }

  async findModuleById(id: string): Promise<TutorialModule | null> {
    const module = await this.prisma.tutorialModule.findUnique({ where: { id } });
    return module ? this.mapModuleToDomain(module) : null;
  }

  async saveModule(module: TutorialModule): Promise<void> {
    const data = module.toJSON();
    await this.prisma.tutorialModule.create({
      data: {
        id: data.id,
        title: data.title,
        description: data.description,
      },
    });
  }

  async updateModule(module: TutorialModule): Promise<void> {
    const data = module.toJSON();
    await this.prisma.tutorialModule.update({
      where: { id: data.id },
      data: {
        title: data.title,
        description: data.description,
      },
    });
  }

  async deleteModule(id: string): Promise<void> {
    await this.prisma.tutorialModule.delete({ where: { id } });
  }

  async findQuestionsByModuleId(moduleId: string): Promise<TutorialQuestion[]> {
    const questions = await this.prisma.tutorialQuestion.findMany({
      where: { moduleId },
      orderBy: { createdAt: 'asc' },
    });
    return questions.map((q) => this.mapQuestionToDomain(q));
  }

  async findQuestionById(id: string): Promise<TutorialQuestion | null> {
    const question = await this.prisma.tutorialQuestion.findUnique({ where: { id } });
    return question ? this.mapQuestionToDomain(question) : null;
  }

  async saveQuestion(question: TutorialQuestion): Promise<void> {
    const data = question.toJSON();
    await this.prisma.tutorialQuestion.create({
      data: {
        id: data.id,
        moduleId: data.moduleId,
        question: data.question,
        answer: data.answer,
        videoUrl: data.videoUrl,
        documentUrl: data.documentUrl,
        imageUrl: data.imageUrl,
      },
    });
  }

  async updateQuestion(question: TutorialQuestion): Promise<void> {
    const data = question.toJSON();
    await this.prisma.tutorialQuestion.update({
      where: { id: data.id },
      data: {
        question: data.question,
        answer: data.answer,
        videoUrl: data.videoUrl,
        documentUrl: data.documentUrl,
        imageUrl: data.imageUrl,
      },
    });
  }

  async deleteQuestion(id: string): Promise<void> {
    await this.prisma.tutorialQuestion.delete({ where: { id } });
  }
}
