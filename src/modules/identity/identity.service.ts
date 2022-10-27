import { Injectable } from '@nestjs/common';
import { Identity, Prisma } from '@prisma/client';
import { PrismaService } from '../../services/prisma.service';

@Injectable()
export class IdentityService {
  constructor(private readonly prisma: PrismaService) {}

  async findIdentity(
    where: Prisma.IdentityWhereUniqueInput,
  ): Promise<Identity | null> {
    this.prisma.identity.create;
    return this.prisma.identity.findUnique({ where });
  }

  async createIdentity(data: Prisma.IdentityCreateInput): Promise<Identity> {
    return this.prisma.identity.create({ data });
  }
}
