import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/services/prisma.service';
import { IdentityModule } from 'src/modules/identity/identity.module';

describe('AuthService', () => {
  let service: AuthService;
  const prismaService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [IdentityModule],
      providers: [AuthService, JwtService],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaService)
      .compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
