import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/services/prisma.service';
import { IdentityListener } from '../listeners/identity.listener';
import { IdentityService } from './identity.service';

describe('IdentityService', () => {
  let service: IdentityService;
  const prismaService = {};
  const eventEmitter = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IdentityService,
        PrismaService,
        EventEmitter2,
        IdentityListener,
      ],
    })
      .overrideProvider(IdentityListener)
      .useValue({})
      .overrideProvider(PrismaService)
      .useValue(prismaService)
      .overrideProvider(EventEmitter2)
      .useValue(eventEmitter)
      .compile();

    service = module.get<IdentityService>(IdentityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
