import { NestFactory } from '@nestjs/core';
import {
  AppModule,
  JobsAppModule,
  Mode,
  ProcessorsAppModule,
  registeredQueues,
} from './app.module';
import {
  INestApplication,
  Logger,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppWorker } from './app.worker';
import { PrismaService } from './services/prisma.service';
import { AppConfig } from './config/app.config';
import { ExpressAdapter } from '@bull-board/express';
import { createBullBoard } from '@bull-board/api';
import { Queue } from 'bull';
import { BaseAdapter } from '@bull-board/api/dist/src/queueAdapters/base';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { BullService } from './services/bull.service';

const runtimeMode: Mode = <Mode>(process.env.APP_MODE || Mode.SERVER);

const applySwagger = (
  path: string,
  app: INestApplication,
  configService: ConfigService,
): void => {
  const swaggerConfig = configService.get<AppConfig['swagger']>('swagger');
  const config = new DocumentBuilder()
    .addBearerAuth()
    .setTitle(swaggerConfig.title)
    .setDescription(swaggerConfig.description)
    .setVersion(swaggerConfig.version)
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    include: [AppModule],
    deepScanRoutes: true,
  });
  // TODO: add auth and users
  SwaggerModule.setup(path as string, app, document);
};

const applyBullBoard = (
  path: string,
  app: INestApplication,
  configService?: ConfigService,
): void => {
  const bullService = app.get(BullService);
  for (let i = 0; i < registeredQueues.length; i++) {
    bullService.addQueue(app.get<Queue>(`BullQueue_${registeredQueues[i]}`));
  }
  bullService.freez();
  const serverAdapter = new ExpressAdapter().setBasePath(path);
  createBullBoard({
    queues: [...bullService.getQueues()].reduce((acc: BaseAdapter[], val) => {
      acc.push(new BullAdapter(val));
      return acc;
    }, []),
    serverAdapter,
  });
  // TODO: add auth and users
  app.use(path, serverAdapter.getRouter());
};

async function bootstrap() {
  // TODO: manage log levels with configurations
  const logger = new Logger('Main');
  logger.localInstance.log(`Runtime mode: ${runtimeMode}`);

  switch (runtimeMode) {
    case Mode.SERVER:
      const app = await NestFactory.create(AppModule, {
        logger,
      });
      // TODO: move this to nest middleware
      app.use((req: any, res: any, next: () => void) => {
        logger.debug(
          `Incoming request ${req.method} ${req.path}:`,
          JSON.stringify({
            headers: req.headers,
            query: req.query,
            body: req.body,
          }),
        );

        next();
      });
      app.useGlobalPipes(new ValidationPipe({ transform: true }));
      app.enableCors();
      app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
      await app.get(PrismaService).enableShutdownHooks(app);

      const configService = app.get<ConfigService>(ConfigService);
      const port = configService.get<number>('APP_PORT', { infer: true });
      const swaggerPath = configService.get<string>('SWAGGER_PATH');
      const bullBoardPath = configService.get<string>('BULL_BOARD_PATH');

      applySwagger(swaggerPath, app, configService);
      applyBullBoard(bullBoardPath, app);

      logger.localInstance.log(`Server starting on port ${port}`);
      logger.localInstance.log(
        `Swagger is available on http://localhost:${port}${swaggerPath}`,
      );
      logger.localInstance.log(
        `Bull board is available on http://localhost:${port}${bullBoardPath}`,
      );

      await app.listen(port);
      break;
    case Mode.JOBS:
      const workerApp = await NestFactory.createApplicationContext(
        JobsAppModule,
        {
          logger,
        },
      );
      await workerApp.get(PrismaService).enableShutdownHooks(workerApp);
      workerApp.enableShutdownHooks();
      logger.localInstance.log('App starting as jobs worker');
      await workerApp.get(AppWorker).run();
      break;
    case Mode.PROCESSORS:
      const processorsApp = await NestFactory.createApplicationContext(
        ProcessorsAppModule,
        {
          logger,
        },
      );
      await processorsApp.get(PrismaService).enableShutdownHooks(processorsApp);
      processorsApp.enableShutdownHooks();
      logger.localInstance.log('App starting as processors worker');
      await processorsApp.get(AppWorker).run();
      break;
    default:
      logger.error(`Unsupported runtime mode '${runtimeMode}'`);
      break;
  }
}

bootstrap().catch(console.error);
