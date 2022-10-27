import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOkResponse, ApiOperation, ApiProperty } from '@nestjs/swagger';
import { AuthenticatedRequest } from './auth/dto/authenticated-request.interface';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { IdentitySafe } from './modules/identity';

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

  @UseGuards(JwtAuthGuard)
  @Get('/me')
  async me(@Request() req: AuthenticatedRequest): Promise<IdentitySafe> {
    return req.identity;
  }
}
