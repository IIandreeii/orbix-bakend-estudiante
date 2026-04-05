import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { IPasswordResetTokenRepository } from '../../../domain/repositories/password-reset-token.repository.interface';
import { IHashService } from '../../services/security.service.interface';
import { v4 as uuidv4 } from 'uuid';
import type { IAppConfig } from '../../services/app-config.interface';
import type { IMailer } from '../../services/mailer.interface';

export class ForgotPasswordUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordResetTokenRepository: IPasswordResetTokenRepository,
    private readonly hashService: IHashService,
    private readonly mailerService: IMailer,
    private readonly configService: IAppConfig,
  ) {}

  async execute(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) return;

    const rawToken = uuidv4();
    const hashedToken = await this.hashService.hash(rawToken);

    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await this.passwordResetTokenRepository.upsert({
      email,
      token: hashedToken,
      expiresAt,
    });

    const frontendUrl = this.configService.get('FRONTEND_URL');
    const resetUrl = `${frontendUrl}/reset-password?token=${rawToken}&email=${email}`;

    await this.mailerService.send({
      to: email,
      subject: 'Recuperación de Contraseña - Alibot',
      html: `
        <h1>Restablece tu Contraseña</h1>
        <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para establecer una nueva:</p>
        <a href="${resetUrl}">Restablecer Contraseña</a>
        <p>Este enlace expirará en 30 minutos.</p>
        <p>Si no solicitaste esto, puedes ignorar este correo.</p>
      `,
    });
  }
}
