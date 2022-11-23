import { Module, ModuleMetadata } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { AppController } from 'src/app.controller';
import { AppService } from 'src/app.service';
import appConfig from 'src/config/app.config';
import { StatusCommand } from 'src/commands/status.command';
import { AppWorker } from 'src/app.worker';
import { JobsModule } from 'src/jobs/jobs.module';
import { AuthModule } from 'src/modules/auth/auth.module';
import { IdentityModule } from 'src/modules/identity/identity.module';
import { PrismaService } from 'src/services/prisma.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BullModule } from '@nestjs/bull';
import { BullService } from './services/bull.service';
import { MailModule } from './modules/mail/mail.module';
import { QueueName } from './enums/queue-name.enum';
import { ProcessorsModule } from './processors/processors.module';

export enum Mode {
  SERVER = 'server',
  JOBS = 'jobs',
  PROCESSORS = 'processors',
}

export interface EnvironmentVariables {
  NODE_ENV: 'development' | 'production' | 'test';
  APP_PORT: number;
  CLIENT_URL: string;
  APP_MODE: Mode;
  SWAGGER_PATH: string;
  POSTMARK_SERVER_TOKEN: string;
  MAILER_DOMAIN: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  MYSQL_HOST: string;
  MYSQL_PORT: number;
  MYSQL_USER: string;
  MYSQL_PASSWORD: string;
  MYSQL_DB_NAME: string;
  MYSQL_TEST_DB_NAME: string;
  REDIS_HOST: string;
  REDIS_PORT: number;
  REDIS_PASSWORD: string;
}

// TODO: move to configs or something
export const registeredQueues: QueueName[] = [QueueName.MAIL];

const prismaService = {
  provide: PrismaService,
  useFactory: (configService: ConfigService<EnvironmentVariables>) => {
    // TODO: resolve with proper log management
    return new PrismaService({
      log:
        configService.get('NODE_ENV') === 'development'
          ? ['query', 'info', 'error', 'warn']
          : ['error', 'warn'],
    });
  },
  inject: [ConfigService],
};

const metadata: ModuleMetadata = {
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        APP_PORT: Joi.number().port().required(),
        CLIENT_URL: Joi.string().uri().required(),
        APP_MODE: Joi.string()
          .valid(Mode.SERVER, Mode.JOBS, Mode.PROCESSORS)
          .default(Mode.SERVER),
        SWAGGER_PATH: Joi.string().required(),
        // TODO: make vendors optional and more modular
        POSTMARK_SERVER_TOKEN: Joi.string().required(),
        MAILER_DOMAIN: Joi.string().default('ikigai.nest'),
        MYSQL_HOST: Joi.string().required(),
        MYSQL_PORT: Joi.number().port().required(),
        MYSQL_USER: Joi.string().required(),
        MYSQL_PASSWORD: Joi.string().required(),
        MYSQL_DB_NAME: Joi.string().required(),
        MYSQL_TEST_DB_NAME: Joi.string().required(),
        DATABASE_URL: Joi.string().required(),
        DATABASE_TEST_URL: Joi.string().required(),
        REDIS_HOST: Joi.string().required(),
        REDIS_PORT: Joi.number().port().required(),
        REDIS_PASSWORD: Joi.string().required(),
        JWT_SECRET: Joi.string().min(8).required(),
        JWT_EXPIRES_IN: Joi.string()
          .pattern(/^\d+([smhdwy])$/)
          .required(),
      }),
    }),
    BullModule.forRootAsync({
      useFactory: (configService: ConfigService<EnvironmentVariables>) => ({
        redis: {
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
          password: configService.get('REDIS_PASSWORD'),
        },
      }),
      inject: [ConfigService],
    }),
    ...registeredQueues.map((name) => BullModule.registerQueue({ name })),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    AuthModule,
    IdentityModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [AppService, prismaService, BullService, StatusCommand],
};

@Module(metadata)
export class AppModule {}

@Module({
  ...metadata,
  imports: [...metadata.imports, JobsModule],
  providers: [...metadata.providers, AppWorker],
})
export class JobsAppModule {}

@Module({
  ...metadata,
  imports: [...metadata.imports, ProcessorsModule],
  providers: [...metadata.providers, AppWorker],
})
export class ProcessorsAppModule {}
