import {
  BeforeApplicationShutdown,
  Injectable,
  Logger,
  LoggerService,
  ShutdownSignal,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

@Injectable()
export class AppWorker implements BeforeApplicationShutdown {
  private readonly logger: LoggerService = new Logger(AppWorker.name);
  private isRunning = false;
  private tickMs: number;

  constructor(
    private readonly configService: ConfigService<{
      worker: { tickMs: number };
    }>,
  ) {
    this.tickMs = this.configService.get('worker.tickMs', { infer: true });
  }

  async run(): Promise<void> {
    this.logger.log('running');
    this.isRunning = true;

    while (this.isRunning) {
      await sleep(this.tickMs);
    }
  }

  beforeApplicationShutdown(signal?: ShutdownSignal): any {
    this.logger.log(`shutting down with signal ${signal}`);
    this.isRunning = false;
  }
}
