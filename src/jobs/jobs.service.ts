import { Injectable, Logger, LoggerService } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AppService } from '../app.service';

@Injectable()
export class JobsService {
  private readonly logger: LoggerService = new Logger(JobsService.name);

  constructor(private readonly appService: AppService) {}

  // showcase for crontab usages - remove from real application
  @Cron(CronExpression.EVERY_5_SECONDS)
  async healthcheck() {
    this.logger.log(`Status: ${await this.appService.getStatus()}`);
  }
}
