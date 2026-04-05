export interface TutorialModuleProps {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export class TutorialModule {
  private constructor(private readonly props: TutorialModuleProps) {}

  public static create(props: TutorialModuleProps): TutorialModule {
    return new TutorialModule(props);
  }

  get id(): string { return this.props.id; }
  get title(): string { return this.props.title; }
  get description(): string { return this.props.description; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  public toJSON() {
    return { ...this.props };
  }
}

export interface TutorialQuestionProps {
  id: string;
  moduleId: string;
  question: string;
  answer: string;
  videoUrl?: string;
  documentUrl?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class TutorialQuestion {
  private constructor(private readonly props: TutorialQuestionProps) {}

  public static create(props: TutorialQuestionProps): TutorialQuestion {
    return new TutorialQuestion(props);
  }

  get id(): string { return this.props.id; }
  get moduleId(): string { return this.props.moduleId; }
  get question(): string { return this.props.question; }
  get answer(): string { return this.props.answer; }
  get videoUrl(): string | undefined { return this.props.videoUrl; }
  get documentUrl(): string | undefined { return this.props.documentUrl; }
  get imageUrl(): string | undefined { return this.props.imageUrl; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  public toJSON() {
    return { ...this.props };
  }
}
