import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  async getStatus(): Promise<'OK'> {
    return 'OK';
  }
}
