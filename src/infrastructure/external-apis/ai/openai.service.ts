import { Injectable, Logger } from '@nestjs/common';
import {
  IAIService,
  AIModelConfig,
  AIMessageContext,
  AIResponse,
} from '../../../core/domain/services/ai.interface';
import OpenAI from 'openai';

@Injectable()
export class OpenAIService implements IAIService {
  private readonly logger = new Logger(OpenAIService.name);

  async generateResponse(
    config: AIModelConfig,
    systemPrompt: string,
    history: AIMessageContext[],
  ): Promise<AIResponse> {
    try {
      const openai = new OpenAI({ apiKey: config.apiKey });

      let modelId = 'gpt-4o-mini'; // default model if not recognized
      if (config.model === 'GPT_4O') {
        modelId = 'gpt-4o';
      } else if (config.model === 'GP_4_TURBO') {
        modelId = 'gpt-4-turbo';
      }

      const messages: Array<{
        role: 'system' | 'user' | 'assistant';
        content: string;
      }> = [
        { role: 'system', content: systemPrompt },
        ...history.map((h) => ({ role: h.role, content: h.content })),
      ];

      const response = await openai.chat.completions.create({
        model: modelId,
        messages,
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'whatsapp_response',
            schema: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  enum: ['text', 'template'],
                  description: 'Type of response to send.',
                },
                content: {
                  type: 'string',
                  description: 'Text body or caption. Required for text type.',
                },
                mediaUrl: {
                  type: ['string', 'null'],
                  description:
                    'IMAGE/VIDEO URL exactly as provided in context.',
                },
                mediaType: {
                  type: ['string', 'null'],
                  enum: ['image', 'video', 'null'],
                },
                templateCode: {
                  type: ['string', 'null'],
                },
                templateParameters: {
                  type: 'array',
                  items: { type: 'string' },
                },
              },
              required: [
                'type',
                'content',
                'mediaUrl',
                'mediaType',
                'templateCode',
                'templateParameters',
              ],
              additionalProperties: false,
            },
            strict: true,
          },
        },
      });

      const textResponse = response.choices[0].message.content?.trim();
      if (!textResponse) throw new Error('Empty response from AI');

      const jsonResponse = JSON.parse(textResponse);

      const aiResponse: AIResponse = {
        type: jsonResponse.type === 'template' ? 'template' : 'text',
      };

      if (aiResponse.type === 'text') {
        aiResponse.content = jsonResponse.content || '';
        aiResponse.mediaUrl =
          jsonResponse.mediaUrl && jsonResponse.mediaUrl !== 'null'
            ? jsonResponse.mediaUrl
            : undefined;
        aiResponse.mediaType =
          jsonResponse.mediaType === 'image' ||
          jsonResponse.mediaType === 'video'
            ? jsonResponse.mediaType
            : undefined;
      } else {
        aiResponse.template = {
          templateCode: jsonResponse.templateCode || '',
          parameters: jsonResponse.templateParameters || [],
        };
      }

      return aiResponse;
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      this.logger.error(`Error with OpenAI Service: ${errorMessage}`);
      throw new Error(`Failed to generate AI response: ${errorMessage}`);
    }
  }
}
