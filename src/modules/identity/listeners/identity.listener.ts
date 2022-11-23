import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { Queue } from 'bull';
import { EmailSendOptions } from 'lib/@ikigai/mail';
import * as moment from 'moment';
import { AppConfig } from 'src/config/app.config';
import { QueueName } from 'src/enums/queue-name.enum';
import { IdentitySafe } from 'src/modules/identity';
import { IdentityCreated } from 'src/modules/identity/events/identity-created.event';
import { OtpService } from 'src/modules/identity/services/otp.service';
import { WelcomeTemplate } from 'src/modules/mail/templates/welcome.template';
import { MailProcessor } from 'src/processors/impl/mail.processor';

@Injectable()
export class IdentityListener {
  private readonly logger: LoggerService = new Logger(IdentityListener.name);

  constructor(
    @InjectQueue(QueueName.MAIL) private readonly mailQueue: Queue,
    private readonly otpService: OtpService,
    private readonly configService: ConfigService<AppConfig>,
  ) {}

  @OnEvent(IdentityCreated.NAME, { async: true })
  async handleIdentityCreated(event: IdentityCreated): Promise<void> {
    this.logger.debug(`handleIdentityCreated(): ${JSON.stringify(event)}`);

    try {
      const { identity } = event;

      if (identity.email && !identity.isEmailVerified) {
        await this.enqueueSendVerificationEmail(identity);
      }
    } catch (err) {
      this.logger.error(err);
    }
  }

  private async enqueueSendVerificationEmail(
    identity: IdentitySafe,
  ): Promise<void> {
    const clientUrl =
      this.configService.get<AppConfig['clientUrl']>('clientUrl');
    const { value, units } =
      this.configService.get<AppConfig['otpTTL']>('otpTTL');

    const otp = await this.otpService.createOtp({
      expiredAt: moment().add(value, units).toDate(),
      identity: { connect: { id: identity.id } },
    });

    // TODO: types and configs for client emails and subjects
    const job = await this.mailQueue.add(MailProcessor.PROCESS, <
      EmailSendOptions
    >{
      routing: { to: identity.email },
      content: {
        subject: 'Verify your email',
        template: new WelcomeTemplate({
          actionUrl: `${clientUrl}/verify-email?otp=${otp.id}`,
        }),
      },
    });

    this.logger.debug(`Job enqueued successfully: ${JSON.stringify(job)}`);
  }
}
