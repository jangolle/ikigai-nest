import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  EmailSender,
  EmailSendOptions,
  SendEmailResult,
} from 'lib/@ikigai/mail';
import { AppConfig, BrandBook } from 'src/config/app.config';

@Injectable()
export class MailService implements EmailSender {
  private readonly logger: LoggerService = new Logger(MailService.name);
  private readonly commonContext: BrandBook;

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService<AppConfig>,
  ) {
    this.commonContext = this.configService.get('brandBook');
  }

  async sendEmail(options: EmailSendOptions): Promise<SendEmailResult | null> {
    try {
      const {
        routing,
        content: { subject, template },
      } = options;

      return await this.mailerService.sendMail({
        ...routing,
        subject,
        template: template.name,
        context: { ...template.context, common: this.commonContext },
      });
    } catch (err) {
      this.logger.error(err);

      throw err;
    }
  }
}
