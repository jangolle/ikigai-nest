import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IdentityJwtPayload } from '../dto/identity-jwt-payload.interface';
import { IdentityService } from '../../identity/identity.service';
import { IdentitySafe } from 'src/modules/identity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly identityService: IdentityService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: IdentityJwtPayload): Promise<IdentitySafe> {
    const { sub } = payload;

    const identity = await this.identityService.findIdentity({ id: sub });

    if (!identity) {
      throw new UnauthorizedException('Invalid auth token');
    }

    const { passwordHash, ...result } = identity;

    return result;
  }
}
