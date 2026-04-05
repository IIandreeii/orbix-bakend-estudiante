import { Injectable } from '@nestjs/common';
import { IRefreshTokenRepository } from '../../../../core/domain/repositories/refresh-token.repository.interface';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaRefreshTokenRepository implements IRefreshTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    token: string;
    userId: string;
    expiresAt: Date;
  }): Promise<void> {
    await this.prisma.refreshToken.create({
      data,
    });
  }

  findByUserId(userId: string): Promise<
    Array<{
      token: string;
      userId: string;
      isRevoked: boolean;
      expiresAt: Date;
      user: { id: string; email: string; role: string };
    }>
  > {
    return this.prisma.refreshToken.findMany({
      where: { userId },
      include: {
        user: {
          select: { id: true, email: true, role: true },
        },
      },
    });
  }

  async deleteByToken(token: string): Promise<void> {
    await this.prisma.refreshToken.delete({
      where: { token },
    });
  }

  async deleteAllByToken(token: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { token },
    });
  }

  async deleteAllByUserEmail(email: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: {
        user: { email },
      },
    });
  }

  async revokeAndRotate(
    oldToken: string,
    newData: { token: string; userId: string; expiresAt: Date },
  ): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.refreshToken.delete({ where: { token: oldToken } }),
      this.prisma.refreshToken.create({ data: newData }),
    ]);
  }
}
