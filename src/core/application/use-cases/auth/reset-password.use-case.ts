import { IHashService } from '../../services/security.service.interface';
import { IAuthRepository } from '../../../domain/repositories/auth.repository.interface';
import { IRefreshTokenRepository } from '../../../domain/repositories/refresh-token.repository.interface';
import { IPasswordResetTokenRepository } from '../../../domain/repositories/password-reset-token.repository.interface';
import { UnauthorizedDomainException } from '../../../domain/exceptions/domain.exception';

export interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
}

export class ResetPasswordUseCase {
  constructor(
    private readonly authRepository: IAuthRepository,
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly passwordResetTokenRepository: IPasswordResetTokenRepository,
    private readonly hashService: IHashService,
  ) {}

  async execute(request: ResetPasswordRequest): Promise<void> {
    const { email, token, newPassword } = request;

    const resetTokens =
      await this.passwordResetTokenRepository.findAllByEmail(email);

    if (!resetTokens || resetTokens.length === 0) {
      throw new UnauthorizedDomainException('Solicitud inválida o expirada');
    }

    type ResetToken = (typeof resetTokens)[0];
    let validToken: ResetToken | null = null;
    for (const t of resetTokens) {
      const isValid = await this.hashService.compare(token, t.token);
      if (isValid && new Date() < t.expiresAt) {
        validToken = t;
        break;
      }
    }

    if (!validToken) {
      throw new UnauthorizedDomainException('Solicitud inválida o expirada');
    }

    const hashedPassword = await this.hashService.hash(newPassword);

    await this.authRepository.updateCredentialByEmail(
      'PASSWORD',
      email,
      hashedPassword,
    );
    await this.refreshTokenRepository.deleteAllByUserEmail(email);
    await this.passwordResetTokenRepository.deleteByEmail(email);
  }
}
