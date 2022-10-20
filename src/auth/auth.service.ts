import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { IdentityJwtPayload } from './dto/identity-jwt-payload.interface';

const SALT_ROUNDS = 8;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUserByEmailAndPassword(
    email: string,
    password: string,
  ): Promise<User | undefined> {
    const user = await this.usersService.findByEmail(email);

    if (
      user &&
      (await AuthService.checkPassword(password, user.passwordHash))
    ) {
      const { passwordHash, ...result } = user;

      return result;
    }

    return undefined;
  }

  async login(identity: IdentityJwtPayload): Promise<string> {
    return this.jwtService.sign(identity);
  }

  protected static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  protected static async checkPassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
