import { Injectable } from '@nestjs/common';
import { IVerificationTokenRepository } from '../../../../core/domain/repositories/verification-token.repository.interface';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaVerificationTokenRepository implements IVerificationTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async upsert(data: {
    email: string;
    token: string;
    expiresAt: Date;
  }): Promise<void> {
    await this.prisma.verificationToken.upsert({
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

  async findAllByEmail(
    email: string,
  ): Promise<Array<{ token: string; expiresAt: Date }>> {
    return this.prisma.verificationToken.findMany({
      where: { email },
      select: { token: true, expiresAt: true },
    });
  }

  async deleteAllByEmail(email: string): Promise<void> {
    await this.prisma.verificationToken.deleteMany({
      where: { email },
    });
  }
}
