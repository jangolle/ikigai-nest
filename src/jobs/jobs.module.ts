import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { AppService } from '../app.service';

@Module({
  providers: [JobsService, AppService],
})
export class JobsModule {}
