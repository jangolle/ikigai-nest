import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from '../auth.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { IdentitySafe } from 'src/modules/identity';
import { Strategy } from 'lib/passport-otp';

@Injectable()
export class OtpStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super();
  }

  async validate(otp: string): Promise<IdentitySafe> {
    const identity = await this.authService.validateIdentityByOtp(otp);
    if (!identity) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    return identity;
  }
}
