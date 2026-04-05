import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import type {
  IMailer,
  MailOptions,
} from '../../core/application/services/mailer.interface';

@Injectable()
export class MailerAdapter implements IMailer {
  constructor(private readonly mailerService: MailerService) {}

  async send(mail: MailOptions): Promise<void> {
    await this.mailerService.sendMail({
      to: mail.to,
      subject: mail.subject,
      html: mail.html,
    });
  }
}
