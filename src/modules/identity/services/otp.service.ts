import { Injectable } from '@nestjs/common';
import { Otp, Prisma } from '@prisma/client';
import { PrismaService } from 'src/services/prisma.service';

type OtpWithIdentity = Prisma.OtpGetPayload<{ include: { identity: true } }>;

@Injectable()
export class OtpService {
  constructor(private readonly prisma: PrismaService) {}

  async findOtpWithIdentity(
    where: Prisma.OtpWhereUniqueInput,
  ): Promise<OtpWithIdentity | null> {
    return this.prisma.otp.findUnique({ where, include: { identity: true } });
  }

  async createOtp(data: Prisma.OtpCreateInput): Promise<Otp> {
    return this.prisma.otp.create({ data, include: { identity: true } });
  }

  async updateOtp(
    data: Prisma.OtpUpdateInput,
    where: Prisma.OtpWhereUniqueInput,
  ): Promise<Otp> {
    return this.prisma.otp.update({ data, where });
  }
}
