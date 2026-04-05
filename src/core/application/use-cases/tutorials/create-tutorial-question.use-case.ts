import { v4 as uuidv4 } from 'uuid';
import type { ITutorialRepository } from '../../../domain/repositories/tutorial.repository.interface';
import { TutorialQuestion } from '../../../domain/entities/tutorial.entity';

export interface CreateTutorialQuestionParams {
  moduleId: string;
  question: string;
  answer: string;
  videoUrl?: string;
  documentUrl?: string;
  imageUrl?: string;
}

export class CreateTutorialQuestionUseCase {
  constructor(private readonly repository: ITutorialRepository) {}

  async execute(params: CreateTutorialQuestionParams) {
    const question = TutorialQuestion.create({
      id: uuidv4(),
      moduleId: params.moduleId,
      question: params.question,
      answer: params.answer,
      videoUrl: params.videoUrl,
      documentUrl: params.documentUrl,
      imageUrl: params.imageUrl,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await this.repository.saveQuestion(question);
    return question;
  }
}
