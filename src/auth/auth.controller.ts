import { Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { UserAuthenticatedRequest } from './dto/user-authenticated-request.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async login(@Request() req: UserAuthenticatedRequest) {
    const { id, email } = req.user;

    return {
      token: await this.authService.login({
        sub: id,
        email,
      }),
    };
  }
}
