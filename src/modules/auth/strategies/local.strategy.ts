import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { IdentitySafe } from 'src/modules/identity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super();
  }

  async validate(username: string, password: string): Promise<IdentitySafe> {
    const identity = await this.authService.validateIdentityByEmailAndPassword(
      username,
      password,
    );
    if (!identity) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return identity;
  }
}
