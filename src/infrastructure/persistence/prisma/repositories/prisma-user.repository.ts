import { Injectable } from '@nestjs/common';
import { IUserRepository } from '../../../../core/domain/repositories/user.repository.interface';
import { User, Role } from '../../../../core/domain/entities/user.entity';
import { AuthStrategy } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { User as PrismaUser } from '@prisma/client';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapToDomain(prismaUser: PrismaUser): User {
    return User.create({
      id: prismaUser.id,
      email: prismaUser.email,
      firstName: prismaUser.firstName,
      lastName: prismaUser.lastName,
      phone: prismaUser.phone ?? undefined,
      address: prismaUser.address ?? undefined,
      city: prismaUser.city ?? undefined,
      zipCode: prismaUser.zipCode ?? undefined,
      countryCode: prismaUser.countryCode ?? undefined,
      role: prismaUser.role as Role,
      isActive: prismaUser.isActive,
      parentId: prismaUser.parentId ?? undefined,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    });
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? this.mapToDomain(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user ? this.mapToDomain(user) : null;
  }

  async save(user: User): Promise<void> {
    const data = user.toJSON();
    await this.prisma.user.create({
      data: {
        id: data.id,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        address: data.address,
        city: data.city,
        zipCode: data.zipCode,
        countryCode: data.countryCode,
        role: data.role,
        isActive: data.isActive,
        parentId: data.parentId,
      },
    });
  }

  async update(user: User): Promise<void> {
    const data = user.toJSON();
    await this.prisma.user.update({
      where: { id: data.id },
      data: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        address: data.address,
        city: data.city,
        zipCode: data.zipCode,
        countryCode: data.countryCode,
        role: data.role,
        isActive: data.isActive,
        parentId: data.parentId,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async findByParentId(parentId: string): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: { parentId, isActive: true },
    });
    return users.map((u) => this.mapToDomain(u));
  }

  async createWithPassword(
    user: User,
    hashedPassword: string,
    strategy: string,
  ): Promise<void> {
    const data = user.toJSON();
    await this.prisma.$transaction(async (tx) => {
      await tx.user.create({
        data: {
          id: data.id,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          address: data.address,
          city: data.city,
          zipCode: data.zipCode,
          countryCode: data.countryCode,
          role: data.role,
          isActive: data.isActive,
          parentId: data.parentId,
        },
      });

      await tx.userAuth.create({
        data: {
          userId: data.id,
          strategy: strategy as AuthStrategy,
          identifier: data.email,
          credential: hashedPassword,
        },
      });
    });
  }
}
