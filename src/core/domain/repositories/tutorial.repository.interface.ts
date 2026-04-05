import { TutorialModule, TutorialQuestion } from '../entities/tutorial.entity';

export interface ITutorialRepository {
  // Modules
  findAllModules(): Promise<TutorialModule[]>;
  findModuleById(id: string): Promise<TutorialModule | null>;
  saveModule(module: TutorialModule): Promise<void>;
  updateModule(module: TutorialModule): Promise<void>;
  deleteModule(id: string): Promise<void>;

  // Questions
  findQuestionsByModuleId(moduleId: string): Promise<TutorialQuestion[]>;
  findQuestionById(id: string): Promise<TutorialQuestion | null>;
  saveQuestion(question: TutorialQuestion): Promise<void>;
  updateQuestion(question: TutorialQuestion): Promise<void>;
  deleteQuestion(id: string): Promise<void>;
}
