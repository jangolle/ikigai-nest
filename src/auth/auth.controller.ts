import { Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthenticatedRequest } from './dto/authenticated-request.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async login(@Request() req: AuthenticatedRequest) {
    const { id, email } = req.identity;

    return {
      token: await this.authService.login({
        sub: id,
        email,
      }),
    };
  }
}
