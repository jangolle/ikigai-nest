import {
  BeforeApplicationShutdown,
  Injectable,
  Logger,
  LoggerService,
  ShutdownSignal,
} from '@nestjs/common';

const TICK_MS = 1000;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

@Injectable()
export class AppWorker implements BeforeApplicationShutdown {
  private readonly logger: LoggerService = new Logger(AppWorker.name);
  private isRunning = false;

  async run(): Promise<void> {
    this.logger.log('running');
    this.isRunning = true;

    while (this.isRunning) {
      await sleep(TICK_MS);
    }
  }

  beforeApplicationShutdown(signal?: ShutdownSignal): any {
    this.logger.log(`shutting down with signal ${signal}`);
    this.isRunning = false;
  }
}
