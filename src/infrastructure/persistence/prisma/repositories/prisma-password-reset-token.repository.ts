import { Injectable } from '@nestjs/common';
import { IPasswordResetTokenRepository } from '../../../../core/domain/repositories/password-reset-token.repository.interface';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaPasswordResetTokenRepository implements IPasswordResetTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async upsert(data: {
    email: string;
    token: string;
    expiresAt: Date;
  }): Promise<void> {
    await this.prisma.passwordResetToken.upsert({
      where: {
        email_token: {
          email: data.email,
          token: data.token,
        },
      },
      update: {
        token: data.token,
        expiresAt: data.expiresAt,
      },
      create: {
        email: data.email,
        token: data.token,
        expiresAt: data.expiresAt,
      },
    });
  }

  async findFirstByEmail(email: string): Promise<{
    email: string;
    token: string;
    expiresAt: Date;
  } | null> {
    return this.prisma.passwordResetToken.findFirst({
      where: { email },
    });
  }

  async findAllByEmail(
    email: string,
  ): Promise<Array<{ email: string; token: string; expiresAt: Date }>> {
    return this.prisma.passwordResetToken.findMany({
      where: { email },
    });
  }

  async deleteByEmail(email: string): Promise<void> {
    await this.prisma.passwordResetToken.deleteMany({
      where: { email },
    });
  }
}
