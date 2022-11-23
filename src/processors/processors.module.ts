import { Module } from '@nestjs/common';
import { MailModule } from 'src/modules/mail/mail.module';
import { MailProcessor } from './impl/mail.processor';

@Module({
  imports: [MailModule],
  providers: [MailProcessor],
})
export class ProcessorsModule {}
