import { Injectable, Logger } from '@nestjs/common';
import {
  IAIService,
  AIModelConfig,
  AIMessageContext,
  AIResponse,
} from '../../../core/domain/services/ai.interface';
import { GoogleGenerativeAI, Schema, SchemaType } from '@google/generative-ai';
import axios from 'axios';

@Injectable()
export class GeminiService implements IAIService {
  private readonly logger = new Logger(GeminiService.name);

  async generateResponse(
    config: AIModelConfig,
    systemPrompt: string,
    history: AIMessageContext[],
  ): Promise<AIResponse> {
    try {
      const genAI = new GoogleGenerativeAI(config.apiKey);

      let modelId = 'gemini-1.5-flash';
      if (config.model === 'GEMINI_1_5_PRO') {
        modelId = 'gemini-1.5-pro';
      } else if (config.model === 'GEMINI_2_0_FLASH') {
        modelId = 'gemini-2.0-flash';
      } else if (config.model === 'GEMINI_2_0_FLASH_LITE') {
        modelId = 'gemini-2.0-flash-lite-preview-02-05';
      } else if (config.model === 'GEMINI_2_5_FLASH') {
        // En tu tabla aparece 2.5, por si acaso lo mapeamos a 2.0 que es el actual
        modelId = 'gemini-2.0-flash';
      }

      const model = genAI.getGenerativeModel({ model: modelId });

      const responseSchema: Schema = {
        type: SchemaType.OBJECT,
        properties: {
          type: {
            type: SchemaType.STRING,
            description:
              "Must be 'text' for a normal reply or 'template' if you decide to trigger an official WhatsApp Template.",
          },
          content: {
            type: SchemaType.STRING,
            description:
              "The text message to send to the user if type is 'text'.",
          },
          mediaUrl: {
            type: SchemaType.STRING,
            description:
              "The absolute URL of the product image or video if you want to show it. Use only from the 'ImgUrl' or 'VideoUrl' provided in context.",
          },
          mediaType: {
            type: SchemaType.STRING,
            description: "Must be 'image' or 'video' if mediaUrl is provided.",
          },
          templateCode: {
            type: SchemaType.STRING,
            description:
              "The official template name to trigger if type is 'template'.",
          },
          templateParameters: {
            type: SchemaType.ARRAY,
            description:
              'Array of string values replacing template placeholders {{1}}, {{2}}, etc.',
            items: {
              type: SchemaType.STRING,
            },
          },
        },
        required: ['type'],
      };

      const chatOptions = {
        systemInstruction: { parts: [{ text: systemPrompt }], role: 'system' },
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: responseSchema,
        },
      };

      const chatHistory = await Promise.all(
        history.slice(0, -1).map(async (h) => {
          const parts: Array<
            | { text: string }
            | { inlineData: { data: string; mimeType: string } }
          > = [{ text: h.content }];

          if (
            h.mediaUrl &&
            h.role === 'user' &&
            (h.mimeType?.startsWith('image/') || h.mimeType === 'image')
          ) {
            try {
              const imageData = await this.fetchImageAsBase64(h.mediaUrl);
              parts.push(imageData);
            } catch (err) {
              const errorMessage =
                err instanceof Error ? err.message : String(err);
              this.logger.warn(
                `Failed to fetch history image: ${errorMessage}`,
              );
            }
          }

          return {
            role: h.role === 'assistant' ? 'model' : 'user',
            parts,
          };
        }),
      );

      while (chatHistory.length > 0 && chatHistory[0].role !== 'user') {
        chatHistory.shift();
      }

      const chat = model.startChat({
        ...chatOptions,
        history: chatHistory,
      });

      const latestMessage = history[history.length - 1];
      const latestParts: Array<
        { text: string } | { inlineData: { data: string; mimeType: string } }
      > = [{ text: latestMessage.content }];

      if (
        latestMessage.mediaUrl &&
        (latestMessage.mimeType?.startsWith('image/') ||
          latestMessage.mimeType === 'image')
      ) {
        try {
          const imageData = await this.fetchImageAsBase64(
            latestMessage.mediaUrl,
          );
          latestParts.push(imageData);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : String(err);
          this.logger.warn(`Failed to fetch latest image: ${errorMessage}`);
        }
      }

      const result = await chat.sendMessage(latestParts);
      const textResponse = result.response.text();

      const jsonResponse = JSON.parse(textResponse) as {
        type?: string;
        content?: string;
        mediaUrl?: string;
        mediaType?: string;
        templateCode?: string;
        templateParameters?: string[];
      };

      const aiResponse: AIResponse = {
        type: jsonResponse.type === 'template' ? 'template' : 'text',
      };

      if (aiResponse.type === 'text') {
        aiResponse.content = jsonResponse.content || '';
        aiResponse.mediaUrl = jsonResponse.mediaUrl || undefined;
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
      this.logger.error(`Error with Gemini Service: ${errorMessage}`);
      throw new Error(`Failed to generate AI response: ${errorMessage}`);
    }
  }

  private async fetchImageAsBase64(
    url: string,
  ): Promise<{ inlineData: { data: string; mimeType: string } }> {
    const response = await axios.get<ArrayBuffer>(url, {
      responseType: 'arraybuffer',
    });
    const contentType = String(
      response.headers['content-type'] || 'image/jpeg',
    );
    const base64 = Buffer.from(response.data).toString('base64');
    return {
      inlineData: {
        data: base64,
        mimeType: contentType,
      },
    };
  }
}
