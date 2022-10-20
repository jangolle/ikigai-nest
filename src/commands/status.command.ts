import { Command, CommandRunner } from 'nest-commander';
import { Logger, LoggerService } from '@nestjs/common';
import { AppService } from '../app.service';

@Command({ name: 'status' })
export class StatusCommand extends CommandRunner {
  private readonly logger: LoggerService = new Logger(StatusCommand.name);

  constructor(private readonly appService: AppService) {
    super();
  }

  async run(
    passedParams: string[],
    options?: Record<string, any>,
  ): Promise<void> {
    this.logger.debug(
      `Executing ${
        StatusCommand.name
      } with params '${passedParams}' and options ${JSON.stringify(options)}`,
    );

    console.log(await this.appService.getStatus());
  }
}
