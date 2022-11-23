import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { QueueName } from 'src/enums/queue-name.enum';
import { PrismaService } from 'src/services/prisma.service';
import { IdentityListener } from './listeners/identity.listener';
import { IdentityService } from './services/identity.service';
import { OtpService } from './services/otp.service';

@Module({
  imports: [BullModule.registerQueue({ name: QueueName.MAIL })],
  exports: [IdentityService, OtpService],
  providers: [IdentityService, OtpService, PrismaService, IdentityListener],
})
export class IdentityModule {}
