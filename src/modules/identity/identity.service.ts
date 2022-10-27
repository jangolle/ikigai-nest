import { Injectable } from '@nestjs/common';
import { Identity, Prisma } from '@prisma/client';
import { PrismaService } from '../../services/prisma.service';

@Injectable()
export class IdentityService {
  constructor(private readonly prisma: PrismaService) {}

  async findIdentity(
    where: Prisma.IdentityWhereUniqueInput,
  ): Promise<Identity | null> {
    return this.prisma.identity.findUnique({ where });
  }
}
