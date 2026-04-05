export interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

export interface IMailer {
  send(mail: MailOptions): Promise<void>;
}

export const I_MAILER = 'IMailer';
