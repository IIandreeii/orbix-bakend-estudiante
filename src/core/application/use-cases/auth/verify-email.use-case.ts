import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { IVerificationTokenRepository } from '../../../domain/repositories/verification-token.repository.interface';
import { IHashService } from '../../services/security.service.interface';
import { v4 as uuidv4 } from 'uuid';
import type { IAppConfig } from '../../services/app-config.interface';
import type { IMailer } from '../../services/mailer.interface';
import { UnauthorizedDomainException } from '../../../domain/exceptions/domain.exception';

export class SendVerificationEmailUseCase {
  constructor(
    private readonly verificationTokenRepository: IVerificationTokenRepository,
    private readonly hashService: IHashService,
    private readonly mailerService: IMailer,
    private readonly configService: IAppConfig,
  ) {}

  async execute(email: string): Promise<void> {
    const rawToken = uuidv4();
    const hashedToken = await this.hashService.hash(rawToken);

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await this.verificationTokenRepository.upsert({
      email,
      token: hashedToken,
      expiresAt,
    });

    const frontendUrl = this.configService.get('FRONTEND_URL');
    const verifyUrl = `${frontendUrl}/verify-email?token=${rawToken}&email=${email}`;

    await this.mailerService.send({
      to: email,
      subject: 'Verifica tu Correo - Alibot',
      html: `
        <h1>Verificación de Correo</h1>
        <p>Gracias por unirte a Alibot. Por favor, verifica tu correo haciendo clic en el siguiente enlace:</p>
        <a href="${verifyUrl}">Verificar Correo</a>
        <p>Este enlace expirará en 24 horas.</p>
      `,
    });
  }
}

export class VerifyEmailUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly verificationTokenRepository: IVerificationTokenRepository,
    private readonly hashService: IHashService,
  ) {}

  async execute(email: string, token: string): Promise<void> {
    const verificationTokens =
      await this.verificationTokenRepository.findAllByEmail(email);

    type VerificationToken = (typeof verificationTokens)[0];
    let validToken: VerificationToken | null = null;
    for (const t of verificationTokens) {
      const isValid = await this.hashService.compare(token, t.token);
      if (isValid && new Date() < t.expiresAt) {
        validToken = t;
        break;
      }
    }

    if (!validToken) {
      throw new UnauthorizedDomainException(
        'El enlace de verificación es inválido o ha expirado',
      );
    }

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedDomainException('Usuario no encontrado');
    }

    user.activate();

    await this.userRepository.update(user);

    await this.verificationTokenRepository.deleteAllByEmail(email);
  }
}
