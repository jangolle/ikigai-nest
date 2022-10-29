import { NestFactory } from '@nestjs/core';
import { AppModule, JobsAppModule, Mode } from './app.module';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppWorker } from './app.worker';
import { PrismaService } from './services/prisma.service';
import { AppConfig } from './config/app.config';

const runtimeMode: Mode = <Mode>(process.env.APP_MODE || Mode.SERVER);

async function bootstrap() {
  // TODO: manage log levels with configurations
  const logger = new Logger('Main');
  logger.localInstance.log(`Runtime mode: ${runtimeMode}`);
  let app = undefined;

  switch (runtimeMode) {
    case Mode.SERVER:
      app = await NestFactory.create(AppModule, {
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

      const configService = app.get<ConfigService<AppConfig>>(ConfigService);
      const port = configService.get<number>('APP_PORT', { infer: true });
      const swaggerPath = configService.get<string>('SWAGGER_PATH', {
        infer: true,
      });

      //config swagger
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
      SwaggerModule.setup(swaggerPath as string, app, document);

      logger.localInstance.log(`Server starting on port ${port}`);
      logger.localInstance.log(
        `API docs is available on http://localhost:${port}/${swaggerPath}`,
      );

      await app.listen(port);
      break;
    case Mode.JOBS:
      app = await NestFactory.createApplicationContext(JobsAppModule, {
        logger,
      });
      await app.get(PrismaService).enableShutdownHooks(app);
      app.enableShutdownHooks();
      logger.localInstance.log('App starting as worker');
      await app.get(AppWorker).run();
      break;
    default:
      logger.error(`Unsupported runtime mode '${runtimeMode}'`);
      break;
  }
}

bootstrap().catch(console.error);
