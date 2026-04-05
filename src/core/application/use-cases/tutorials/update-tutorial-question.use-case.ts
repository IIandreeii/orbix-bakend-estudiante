import type { ITutorialRepository } from '../../../domain/repositories/tutorial.repository.interface';
import { TutorialQuestion } from '../../../domain/entities/tutorial.entity';
import { NotFoundDomainException } from '../../../domain/exceptions/domain.exception';

export interface UpdateTutorialQuestionParams {
  id: string;
  question?: string;
  answer?: string;
  videoUrl?: string;
  documentUrl?: string;
  imageUrl?: string;
}

export class UpdateTutorialQuestionUseCase {
  constructor(private readonly repository: ITutorialRepository) {}

  async execute(params: UpdateTutorialQuestionParams) {
    const question = await this.repository.findQuestionById(params.id);
    if (!question) throw new NotFoundDomainException('Pregunta no encontrada');

    const data = question.toJSON();
    const updated = TutorialQuestion.create({
      ...data,
      question: params.question ?? data.question,
      answer: params.answer ?? data.answer,
      videoUrl: params.videoUrl ?? data.videoUrl,
      documentUrl: params.documentUrl ?? data.documentUrl,
      imageUrl: params.imageUrl ?? data.imageUrl,
      updatedAt: new Date(),
    });

    await this.repository.updateQuestion(updated);
    return updated;
  }
}
