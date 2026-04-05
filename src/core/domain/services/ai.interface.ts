import { AIProvider } from '../entities/ai-config.entity';

export interface AIMessageContext {
  role: 'user' | 'assistant';
  content: string;
  mediaUrl?: string;
  mimeType?: string;
}

export interface AITemplateCall {
  templateCode: string;
  parameters: string[];
}

export interface AIResponse {
  type: 'text' | 'template';
  content?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  template?: AITemplateCall;
}

export interface AIModelConfig {
  provider: AIProvider;
  apiKey: string;
  model: string;
}

export interface IAIService {
  generateResponse(
    config: AIModelConfig,
    systemPrompt: string,
    history: AIMessageContext[],
  ): Promise<AIResponse>;
}
