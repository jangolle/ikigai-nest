import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOkResponse, ApiOperation, ApiProperty } from '@nestjs/swagger';

abstract class StatusResponse {
  @ApiProperty({ example: 'OK', type: String })
  status: 'OK';
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({
    summary: 'Simple healthcheck',
    description: 'Returns status of application',
  })
  @ApiOkResponse({ type: StatusResponse })
  @Get()
  async status(): Promise<StatusResponse> {
    return { status: await this.appService.getStatus() };
  }
}
