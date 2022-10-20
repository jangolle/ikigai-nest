import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { CommandFactory } from 'nest-commander';

async function bootstrap() {
  await CommandFactory.run(AppModule, {
    logger: Logger.overrideLogger(['error', 'debug', 'warn']),
  });
}
bootstrap().catch(console.error);
