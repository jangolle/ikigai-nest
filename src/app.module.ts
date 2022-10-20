import { Module, ModuleMetadata } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import appConfig from './config/app.config';
import * as Joi from 'joi';
import { StatusCommand } from './commands/status.command';
import { AppWorker } from './app.worker';
import { ScheduleModule } from '@nestjs/schedule';
import { JobsModule } from './jobs/jobs.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

export enum Mode {
  SERVER = 'server',
  JOBS = 'jobs',
}

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
        APP_MODE: Joi.string()
          .valid(Mode.SERVER, Mode.JOBS)
          .default(Mode.SERVER),
        SWAGGER_PATH: Joi.string().required(),
        MYSQL_HOST: Joi.string().required(),
        MYSQL_PORT: Joi.number().port().required(),
        MYSQL_USER: Joi.string().required(),
        MYSQL_PASSWORD: Joi.string().required(),
        MYSQL_DB_NAME: Joi.string().required(),
        MYSQL_TEST_DB_NAME: Joi.string().required(),
        JWT_SECRET: Joi.string().min(8).required(),
        JWT_EXPIRES_IN: Joi.string()
          .pattern(/^\d+([smhdwy])$/)
          .required(),
      }),
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService, StatusCommand],
};

@Module(metadata)
export class AppModule {}

@Module({
  ...metadata,
  imports: [...metadata.imports, JobsModule],
  providers: [...metadata.providers, AppWorker],
})
export class JobsAppModule {}
