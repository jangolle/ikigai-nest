import { Module } from '@nestjs/common';
import { PrismaService } from 'src/services/prisma.service';
import { IdentityService } from './identity.service';

@Module({
  exports: [IdentityService],
  providers: [IdentityService, PrismaService],
})
export class IdentityModule {}
