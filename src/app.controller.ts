import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOkResponse, ApiOperation, ApiProperty } from '@nestjs/swagger';
import { User } from './users/entities/user.entity';
import { UserAuthenticatedRequest } from './auth/dto/user-authenticated-request.interface';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

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
  async me(@Request() req: UserAuthenticatedRequest): Promise<User> {
    return req.user;
  }
}
