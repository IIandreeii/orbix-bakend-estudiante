import { DomainException } from '../exceptions/domain.exception';

export enum AIProvider {
  OPENAI = 'OPENAI',
  GOOGLE = 'GOOGLE',
  ANTHROPIC = 'ANTHROPIC',
}

export enum AIModel {
  GPT_4O = 'GPT_4O',
  GP_4_TURBO = 'GP_4_TURBO',
  GPT_3_5_TURBO = 'GPT_3_5_TURBO',
  GEMINI_2_0_FLASH = 'GEMINI_2_0_FLASH',
  GEMINI_2_0_FLASH_LITE = 'GEMINI_2_0_FLASH_LITE',
  GEMINI_2_5_FLASH = 'GEMINI_2_5_FLASH',
  CLAUDE_3_5_SONNET = 'CLAUDE_3_5_SONNET',
}

export interface AIConfigProps {
  id: string;
  whatsAppAccountId: string;
  provider: AIProvider;
  model: AIModel;
  apiKey?: string;
  isAssistantEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class AIConfig {
  private constructor(private readonly props: AIConfigProps) {
    this.validate();
  }

  public static create(props: AIConfigProps): AIConfig {
    return new AIConfig(props);
  }

  private validate() {
    if (!this.props.whatsAppAccountId) {
      throw new DomainException('WhatsApp Account ID is required');
    }
    if (!this.props.provider) {
      throw new DomainException('Provider is required');
    }
    if (!this.props.model) {
      throw new DomainException('Model is required');
    }
  }

  get id(): string {
    return this.props.id;
  }
  get whatsAppAccountId(): string {
    return this.props.whatsAppAccountId;
  }
  get provider(): AIProvider {
    return this.props.provider;
  }
  get model(): AIModel {
    return this.props.model;
  }
  get apiKey(): string | undefined {
    return this.props.apiKey;
  }
  get isAssistantEnabled(): boolean {
    return this.props.isAssistantEnabled;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public toJSON() {
    return {
      ...this.props,
    };
  }

  public toSafeJSON() {
    const { apiKey: _apiKey, ...safe } = this.props;
    return safe;
  }
}
