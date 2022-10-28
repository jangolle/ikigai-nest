import {
  Body,
  ConflictException,
  Controller,
  Get,
  HttpCode,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthenticatedRequest } from './dto/authenticated-request.interface';
import { RegistrationDto } from './dto/registration.dto';
import { RegistrationValidationPipe } from './validation.pipe';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { IdentitySafe } from 'src/modules/identity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/me')
  async me(@Request() req: AuthenticatedRequest): Promise<IdentitySafe> {
    return req.user;
  }

  @UseGuards(LocalAuthGuard)
  @Post('/sign-in')
  async login(@Request() req: AuthenticatedRequest) {
    const { id, email } = req.user;

    return {
      token: await this.authService.login({
        sub: id,
        email,
      }),
    };
  }

  @Post('/sign-up')
  async register(
    @Body(RegistrationValidationPipe) registrationDto: RegistrationDto,
  ) {
    try {
      const { id } = await this.authService.registerByEmailAndPassword(
        registrationDto.email,
        registrationDto.password,
      );

      return { id };
    } catch (error) {
      throw new ConflictException('Identity already registered');
    }
  }
}
