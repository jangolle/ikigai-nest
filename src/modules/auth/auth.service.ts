import { Injectable } from '@nestjs/common';
import { IdentityService } from 'src/modules/identity/services/identity.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { IdentityJwtPayload } from './dto/identity-jwt-payload.interface';
import { IdentitySafe } from 'src/modules/identity';
import { OtpService } from '../identity/services/otp.service';

const SALT_ROUNDS = 8;

@Injectable()
export class AuthService {
  constructor(
    private readonly identityService: IdentityService,
    private readonly otpService: OtpService,
    private readonly jwtService: JwtService,
  ) {}

  async validateIdentityByEmailAndPassword(
    email: string,
    password: string,
  ): Promise<IdentitySafe | null> {
    const identity = await this.identityService.findIdentity({ email });

    if (
      identity &&
      (await AuthService.checkPassword(password, identity.passwordHash))
    ) {
      const { passwordHash, ...result } = identity;

      return result;
    }

    return null;
  }

  async validateIdentityByOtp(otp: string): Promise<IdentitySafe | null> {
    const otpEntity = await this.otpService.findOtpWithIdentity({ id: otp });

    if (
      !otpEntity ||
      !otpEntity.identity ||
      otpEntity.isActivated ||
      otpEntity.expiredAt.getTime() < new Date().getTime()
    ) {
      return null;
    }

    await this.otpService.updateOtp({ isActivated: true }, { id: otp });

    const { passwordHash, ...result } = otpEntity.identity;

    return result;
  }

  async registerByEmailAndPassword(
    email: string,
    password: string,
  ): Promise<IdentitySafe> {
    const { passwordHash, ...identity } =
      await this.identityService.createIdentity({
        email,
        passwordHash: await AuthService.hashPassword(password),
      });

    return identity;
  }

  async verifyEmail(identity: IdentitySafe): Promise<boolean> {
    const { isEmailVerified } = await this.identityService.updateIdentity(
      { id: identity.id },
      { isEmailVerified: true },
    );

    return isEmailVerified;
  }

  async login(identity: IdentityJwtPayload): Promise<string> {
    return this.jwtService.sign(identity);
  }

  public static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  protected static async checkPassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
