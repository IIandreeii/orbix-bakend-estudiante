import { Injectable, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import type { IWhatsAppAccountRepository } from '../../../core/domain/repositories/whatsapp-account.repository.interface';
import {
  IWhatsAppMessagingService,
  SendMessageOptions,
  WhatsAppResponse,
} from '../../../core/domain/services/whatsapp-messaging.interface';
import { translateMetaError } from './whatsapp-error.messages';

type WhatsAppSendMessageResponse = {
  messages: Array<{ id: string }>;
};

type WhatsAppMediaUrlResponse = {
  url: string;
};

type WhatsAppSuccessResponse = {
  success: boolean;
};

type WhatsAppTemplateComponent = {
  type?: string;
  text?: string;
};

type WhatsAppTemplateResponse = {
  data?: Array<{ components?: WhatsAppTemplateComponent[] }>;
};

@Injectable()
export class WhatsAppCloudApiService implements IWhatsAppMessagingService {
  private readonly logger = new Logger(WhatsAppCloudApiService.name);
  private readonly baseUrl: string;

  constructor(
    @Inject('IWhatsAppAccountRepository')
    private readonly accountRepository: IWhatsAppAccountRepository,
    private readonly configService: ConfigService,
  ) {
    const apiBase =
      this.configService.get<string>('WHATSAPP_API_BASE_URL') ||
      'https://graph.facebook.com';
    const apiVersion =
      this.configService.get<string>('WHATSAPP_API_VERSION') || 'v21.0';
    this.baseUrl = `${apiBase}/${apiVersion}`;
  }

  private formatMetaError(error: unknown): string {
    const err = error as {
      response?: {
        data?: {
          error?: {
            code?: number;
            error_subcode?: number;
            error_data?: { details?: string };
            details?: string;
            message?: string;
          };
        };
      };
      message?: string;
    };
    if (err.response?.data?.error) {
      const errorData = err.response.data.error;
      const code = errorData.code;
      const subcode = errorData.error_subcode;
      const details = errorData.error_data?.details || errorData.details || '';
      const message = translateMetaError(
        code || 0,
        errorData.message || err.message || 'Error desconocido',
      );
      return `Error de WhatsApp (${code}${subcode ? ':' + subcode : ''}): ${message}${details ? ' - ' + details : ''}`;
    }
    return err.message || 'Error desconocido';
  }

  async sendMessage(
    whatsAppAccountId: string,
    options: SendMessageOptions,
  ): Promise<WhatsAppResponse> {
    const account = await this.accountRepository.findById(whatsAppAccountId);
    if (!account) {
      throw new Error('WhatsApp account not found');
    }

    const { to, content, mediaUrl, mediaId, quotedMessageId } = options;
    const type = options.type || 'text';
    const url = `${this.baseUrl}/${account.metaPhoneNumberId}/messages`;

    this.logger.log(
      `[WhatsAppService] Preparando envio a: ${to} desde ID: ${account.metaPhoneNumberId}`,
    );

    const data: Record<string, unknown> = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type,
    };

    if (quotedMessageId) {
      data.context = { message_id: quotedMessageId };
    }

    if (type === 'text') {
      data.text = { body: content };
    } else if (type === 'reaction') {
      data.reaction = { message_id: quotedMessageId, emoji: content };
    } else if (type === 'template' && options.template) {
      data.template = {
        name: options.template.name,
        language: { code: options.template.languageCode },
        components: options.template.components,
      };
    } else {
      const mediaData: { id?: string; link?: string; caption?: string } =
        mediaId ? { id: mediaId } : { link: mediaUrl };
      if (content) {
        mediaData.caption = content;
      }
      data[type] = mediaData;
    }

    this.logger.log(
      `[WhatsAppService] Payload hacia Meta: ${JSON.stringify(data)}`,
    );

    try {
      const response = await axios.post<WhatsAppSendMessageResponse>(
        url,
        data,
        {
          headers: {
            Authorization: `Bearer ${account.accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.log(
        `[WhatsAppService] Respuesta de Meta: ${JSON.stringify(response.data)}`,
      );
      const messageId = response.data.messages?.[0]?.id;
      if (!messageId) {
        throw new Error('WhatsApp API response missing message id');
      }
      this.logger.log(
        `[WhatsAppService] Mensaje aceptado por Meta. ID: ${messageId}`,
      );

      return {
        waMessageId: messageId,
        status: 'sent',
      };
    } catch (error) {
      const fullErrorMessage = this.formatMetaError(error);
      this.logger.error(`Error sending message: ${fullErrorMessage}`);

      const err = error as {
        response?: { data?: { error?: { code?: number } } };
      };
      if (err.response) {
        this.logger.error(
          `[WhatsAppService] Error en Meta API: ${JSON.stringify(err.response.data?.error || err.response.data)}`,
        );
        const enhancedError = new Error(fullErrorMessage);
        (enhancedError as { code?: number }).code =
          err.response.data?.error?.code;
        throw enhancedError;
      } else {
        this.logger.error(
          `[WhatsAppService] Error de red/u otro: ${error instanceof Error ? error.message : String(error)}`,
        );
        throw error;
      }
    }
  }

  async markMessageAsRead(
    whatsAppAccountId: string,
    waMessageId: string,
  ): Promise<boolean> {
    const account = await this.accountRepository.findById(whatsAppAccountId);
    if (!account) return false;

    const url = `${this.baseUrl}/${account.metaPhoneNumberId}/messages`;

    try {
      await axios.post(
        url,
        {
          messaging_product: 'whatsapp',
          status: 'read',
          message_id: waMessageId,
        },
        {
          headers: {
            Authorization: `Bearer ${account.accessToken}`,
          },
        },
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Error marking message as read: ${this.formatMetaError(error)}`,
      );
      return false;
    }
  }

  async getMediaUrl(
    whatsAppAccountId: string,
    mediaId: string,
  ): Promise<string> {
    const account = await this.accountRepository.findById(whatsAppAccountId);
    if (!account) {
      throw new Error('WhatsApp account not found');
    }

    const url = `${this.configService.get<string>('WHATSAPP_API_BASE_URL') || 'https://graph.facebook.com'}/${this.configService.get<string>('WHATSAPP_API_VERSION') || 'v21.0'}/${mediaId}`;

    try {
      const response = await axios.get<WhatsAppMediaUrlResponse>(url, {
        headers: {
          Authorization: `Bearer ${account.accessToken}`,
        },
      });

      return response.data.url;
    } catch (error) {
      this.logger.error(
        `Error getting media URL: ${this.formatMetaError(error)}`,
      );
      throw new Error(this.formatMetaError(error));
    }
  }

  async subscribeAccount(
    wabaId: string,
    accessToken: string,
  ): Promise<boolean> {
    const url = `${this.baseUrl}/${wabaId}/subscribed_apps`;
    const webhookUrl = this.configService.get<string>('WHATSAPP_WEBHOOK_URL');
    const verifyToken = this.configService.get<string>('WHATSAPP_VERIFY_TOKEN');

    try {
      const response = await axios.post<WhatsAppSuccessResponse>(
        url,
        {
          override_callback_uri: webhookUrl,
          verify_token: verifyToken,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      return response.data.success === true;
    } catch (error) {
      this.logger.error(
        `Error subscribing WABA to app: ${this.formatMetaError(error)}`,
      );
      return false;
    }
  }

  async registerPhoneNumber(
    phoneNumberId: string,
    accessToken: string,
    pin: string = '123456',
  ): Promise<boolean> {
    const url = `${this.baseUrl}/${phoneNumberId}/register`;
    try {
      const response = await axios.post<WhatsAppSuccessResponse>(
        url,
        {
          messaging_product: 'whatsapp',
          pin: pin,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );
      return response.data.success === true;
    } catch (error) {
      this.logger.error(
        `Error registering phone number: ${this.formatMetaError(error)}`,
      );
      return false;
    }
  }

  async getTemplateContent(
    whatsAppAccountId: string,
    templateName: string,
  ): Promise<string | null> {
    const account = await this.accountRepository.findById(whatsAppAccountId);
    if (!account || !account.wabaId) {
      this.logger.warn(
        `Account or WABA ID not found for: ${whatsAppAccountId}`,
      );
      return null;
    }

    const url = `${this.baseUrl}/${account.wabaId}/message_templates`;

    try {
      const response = await axios.get<WhatsAppTemplateResponse>(url, {
        params: { name: templateName },
        headers: {
          Authorization: `Bearer ${account.accessToken}`,
        },
      });

      const template = response.data.data?.[0];
      if (!template) return null;

      const bodyComponent = template.components?.find((c) => c.type === 'BODY');
      return bodyComponent?.text || null;
    } catch (error) {
      this.logger.error(
        `Error fetching template content from Meta: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return null;
    }
  }async updateTemplate(
    whatsAppAccountId: string,
    templateId: string,
    data: any,
  ): Promise<void> {
    const account = await this.accountRepository.findById(whatsAppAccountId);
    if (!account) {
      throw new Error('WhatsApp account not found');
    }

    const url = `${this.baseUrl}/${templateId}`;

    this.logger.log(`[WhatsAppService] Actualizando plantilla ${templateId} en Meta...`);

    try {
      await axios.post(
        url,
        data,
        {
          headers: {
            Authorization: `Bearer ${account.accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );
      this.logger.log(`[WhatsAppService] Plantilla ${templateId} actualizada con éxito en Meta.`);
    } catch (error) {
      const fullErrorMessage = this.formatMetaError(error);
      this.logger.error(`Error updating template: ${fullErrorMessage}`);
      throw new Error(fullErrorMessage);
    }
  }
}
