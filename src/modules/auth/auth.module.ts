import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { IdentityModule } from '../identity/identity.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { OtpStrategy } from './strategies/otp.strategy';

// TODO: organize app -> module -> service configs
@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', { infer: true }),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', {
            infer: true,
          }),
        },
      }),
      inject: [ConfigService],
    }),
    IdentityModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, OtpStrategy],
})
export class AuthModule {}
