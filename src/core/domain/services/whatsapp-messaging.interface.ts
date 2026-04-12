export interface TemplateOptions {
  name: string;
  languageCode?: string;
  components?: Array<{
    type?: string;
    parameters?: Array<{ text?: string; payload?: string }>;
  }>;
}

export interface SendMessageOptions {
  to: string;
  type?:
    | 'text'
    | 'image'
    | 'audio'
    | 'video'
    | 'document'
    | 'template'
    | 'sticker'
    | 'reaction';
  content?: string;
  mediaUrl?: string;
  mediaId?: string;
  mimeType?: string;
  template?: TemplateOptions;
  quotedMessageId?: string;
}

export interface WhatsAppResponse {
  waMessageId: string;
  status: string;
}

export interface IWhatsAppMessagingService {
  sendMessage(
    whatsAppAccountId: string,
    options: SendMessageOptions,
  ): Promise<WhatsAppResponse>;
  markMessageAsRead(
    whatsAppAccountId: string,
    waMessageId: string,
  ): Promise<boolean>;
  getMediaUrl(whatsAppAccountId: string, mediaId: string): Promise<string>;
  subscribeAccount(wabaId: string, accessToken: string): Promise<boolean>;
  registerPhoneNumber(
    phoneNumberId: string,
    accessToken: string,
    pin?: string,
  ): Promise<boolean>;
  getTemplateContent(
    whatsAppAccountId: string,
    templateName: string,
  ): Promise<string | null>;
  updateTemplate(
    whatsAppAccountId: string,
    templateId: string,
    data: any,
  ): Promise<void>;
}
