import { Process, Processor } from '@nestjs/bull';
import { Logger, LoggerService } from '@nestjs/common';
import { Job } from 'bull';
import { EmailSendOptions } from 'lib/@ikigai/mail';
import { QueueName } from 'src/enums/queue-name.enum';
import { MailService } from 'src/modules/mail/mail.service';

@Processor(QueueName.MAIL)
export class MailProcessor {
  // TODO: expose to config level
  public static readonly PROCESS = 'sending';
  private readonly logger: LoggerService = new Logger(MailProcessor.name);

  constructor(private readonly mailService: MailService) {}

  @Process(MailProcessor.PROCESS)
  async handle(job: Job<EmailSendOptions>) {
    this.logger.debug(
      `Processing: ${JSON.stringify({
        id: job.id,
        name: job.name,
        data: job.data,
      })}`,
    );

    try {
      const result = await this.mailService.sendEmail(job.data);
      this.logger.debug(`Send result: ${JSON.stringify(result)}`);
    } catch (err) {
      this.logger.error(err);
      await job.moveToFailed({ message: err.message }, true);
    }
  }
}
