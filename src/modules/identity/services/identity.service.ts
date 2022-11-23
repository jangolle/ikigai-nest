import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Identity, Prisma } from '@prisma/client';
import { PrismaService } from 'src/services/prisma.service';
import { IdentityCreated } from '../events/identity-created.event';

@Injectable()
export class IdentityService {
  constructor(
    private readonly prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async findIdentity(
    where: Prisma.IdentityWhereUniqueInput,
  ): Promise<Identity | null> {
    return this.prisma.identity.findUnique({ where });
  }

  async updateIdentity(
    where: Prisma.IdentityWhereUniqueInput,
    data: Prisma.IdentityUpdateInput,
  ): Promise<Identity> {
    return this.prisma.identity.update({ where, data });
  }

  async createIdentity(data: Prisma.IdentityCreateInput): Promise<Identity> {
    const identity = await this.prisma.identity.create({ data });

    const { passwordHash, ...safe } = identity;
    this.eventEmitter.emit(IdentityCreated.NAME, new IdentityCreated(safe));

    return identity;
  }
}
