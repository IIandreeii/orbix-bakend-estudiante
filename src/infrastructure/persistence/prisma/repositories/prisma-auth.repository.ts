import { Injectable } from '@nestjs/common';
import { IAuthRepository } from '../../../../core/domain/repositories/auth.repository.interface';
import { PrismaService } from '../prisma.service';
import { AuthStrategy } from '@prisma/client';

@Injectable()
export class PrismaAuthRepository implements IAuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findCredentialByUserId(
    userId: string,
    strategy: string,
  ): Promise<{ credential: string | null } | null> {
    return this.prisma.userAuth.findFirst({
      where: { userId, strategy: strategy as AuthStrategy },
      select: { credential: true },
    });
  }

  async updateCredentialByEmail(
    strategy: string,
    email: string,
    credential: string,
  ): Promise<void> {
    await this.prisma.userAuth.updateMany({
      where: { identifier: email, strategy: strategy as AuthStrategy },
      data: { credential },
    });
  }

  async createAuth(data: {
    userId: string;
    strategy: string;
    identifier: string;
    credential: string;
  }): Promise<void> {
    await this.prisma.userAuth.create({
      data: {
        ...data,
        strategy: data.strategy as AuthStrategy,
      },
    });
  }
}
