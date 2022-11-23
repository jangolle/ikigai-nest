import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import * as moment from 'moment';
import { AppModule } from 'src/app.module';
import { AsyncLock, resetDb, sleep } from './bootstrap/db';
import { PrismaService } from 'src/services/prisma.service';
import { AuthService } from 'src/modules/auth/auth.service';
import { Job } from 'bull';
import { MailProcessor } from 'src/processors/impl/mail.processor';
import { EmailSendOptions } from 'lib/@ikigai/mail';

const TIMEOUT = 20000;
const its = (name: string, fn?: jest.ProvidesCallback) => it(name, fn, TIMEOUT);

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let mailQueueMock = {
    add: jest.fn(async (...args: any[]): Promise<Job> => {
      return <Job>{ id: 42 };
    }),
  };

  beforeAll(async () => {
    resetDb();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider('BullQueue_mail')
      .useValue(mailQueueMock)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    app.enableCors();
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

    prisma = app.get<PrismaService>(PrismaService);

    await app.init();
  }, TIMEOUT);

  afterAll(async () => {
    await app.close();
  }, TIMEOUT);

  describe('Sign Up (POST /v1/auth/sign-up)', () => {
    its('should fail with invalid data', async () => {
      await request(app.getHttpServer())
        .post('/v1/auth/sign-up')
        .send({ password: '12345' })
        .expect(400)
        .expect((res) =>
          expect(res.body).toEqual(
            expect.objectContaining({
              error: 'Bad Request',
            }),
          ),
        );

      expect(mailQueueMock.add.mock.calls.length).toEqual(0);
    });

    its('should fail for existent credentials', async () => {
      const credentials = {
        email: 'duplicate@mail.com',
        password: '12345678',
      };

      await prisma.identity.create({
        data: {
          email: credentials.email,
          passwordHash: 'ffffff',
        },
      });

      await request(app.getHttpServer())
        .post('/v1/auth/sign-up')
        .send(credentials)
        .expect(409)
        .expect((res) =>
          expect(res.body).toEqual(
            expect.objectContaining({
              error: 'Conflict',
            }),
          ),
        );

      expect(mailQueueMock.add.mock.calls.length).toEqual(0);
    });

    its(
      'should create and return ID of proper idenity; create otp; send email with otp url',
      async () => {
        const credentials = {
          email: 'unique@mail.com',
          password: '12345678',
        };

        const lock = new AsyncLock();

        await request(app.getHttpServer())
          .post('/v1/auth/sign-up')
          .send(credentials)
          .expect(201)
          .expect(async ({ body }) => {
            const { id } = body;

            const identity = await prisma.identity.findUniqueOrThrow({
              where: { id },
            });

            expect(identity.email).toEqual(credentials.email);

            lock.releaseOn(async () => {
              if (mailQueueMock.add.mock.calls.length === 0) {
                return false;
              }

              const [lastOtp] = await prisma.otp.findMany({
                where: { identityId: id },
              });

              expect(lastOtp.isActivated).toEqual(false);

              expect(mailQueueMock.add.mock.calls.length).toEqual(1);
              const [addArgs] = mailQueueMock.add.mock.calls;
              const [process, sendOptions] = addArgs as [
                string,
                EmailSendOptions,
              ];

              expect(process).toEqual(MailProcessor.PROCESS);
              expect(sendOptions.routing).toEqual({ to: credentials.email });
              expect(sendOptions.content.template.context).toEqual(
                expect.objectContaining({
                  actionUrl: expect.stringContaining(`=${lastOtp.id}`),
                }),
              );
              // TODO: add content and template verification after config or registry provided

              return true;
            });
          });

        await lock.hold();
      },
    );
  });

  describe('Verify email (POST /v1/auth/verify-email)', () => {
    const credentials = {
      email: 'verify.email@mail.com',
      password: '12345678',
    };
    let validOtp: string;
    let expiredOtp: string;
    let usedOtp: string;

    beforeAll(async () => {
      // prepare identity
      const identity = await prisma.identity.create({
        data: {
          email: credentials.email,
          passwordHash: await AuthService.hashPassword(credentials.password),
        },
      });

      // prepare otp for identity
      validOtp = (
        await prisma.otp.create({
          data: {
            expiredAt: moment().add(1, 'd').toDate(),
            identity: { connect: { id: identity.id } },
          },
          include: { identity: true },
        })
      ).id;

      // prepare expired otp for identity
      expiredOtp = (
        await prisma.otp.create({
          data: {
            expiredAt: moment().subtract(1, 'd').toDate(),
            identity: { connect: { id: identity.id } },
          },
          include: { identity: true },
        })
      ).id;

      // prepare expired otp for identity
      usedOtp = (
        await prisma.otp.create({
          data: {
            expiredAt: moment().add(1, 'd').toDate(),
            isActivated: true,
            identity: { connect: { id: identity.id } },
          },
          include: { identity: true },
        })
      ).id;
    });

    its('should fail with invalid otp', () => {
      return request(app.getHttpServer())
        .post('/v1/auth/verify-email')
        .query({ otp: 'invalid-otp' })
        .expect(401)
        .expect(async (res) => {
          expect(res.body).toEqual(
            expect.objectContaining({
              error: 'Unauthorized',
            }),
          );

          const idenity = await prisma.identity.findUniqueOrThrow({
            where: { email: credentials.email },
          });
          expect(idenity.isEmailVerified).toEqual(false);
        });
    });

    its('should fail with expired otp', () => {
      return request(app.getHttpServer())
        .post('/v1/auth/verify-email')
        .query({ otp: expiredOtp })
        .expect(401)
        .expect(async (res) => {
          expect(res.body).toEqual(
            expect.objectContaining({
              error: 'Unauthorized',
            }),
          );

          const idenity = await prisma.identity.findUniqueOrThrow({
            where: { email: credentials.email },
          });
          expect(idenity.isEmailVerified).toEqual(false);
        });
    });

    its('should fail with used otp', () => {
      return request(app.getHttpServer())
        .post('/v1/auth/verify-email')
        .query({ otp: usedOtp })
        .expect(401)
        .expect(async (res) => {
          expect(res.body).toEqual(
            expect.objectContaining({
              error: 'Unauthorized',
            }),
          );

          const idenity = await prisma.identity.findUniqueOrThrow({
            where: { email: credentials.email },
          });
          expect(idenity.isEmailVerified).toEqual(false);
        });
    });

    its(
      'should verify user email successfully and mark otp token as used',
      () => {
        return request(app.getHttpServer())
          .post('/v1/auth/verify-email')
          .query({ otp: validOtp })
          .expect(201)
          .expect(async (res) => {
            expect(res.body).toEqual({ success: true });

            const idenity = await prisma.identity.findUniqueOrThrow({
              where: { email: credentials.email },
            });
            expect(idenity.isEmailVerified).toEqual(true);

            const otp = await prisma.otp.findUniqueOrThrow({
              where: { id: validOtp },
            });
            expect(otp.isActivated).toEqual(true);
          });
      },
    );
  });

  describe('Sign In (POST /v1/auth/sign-in)', () => {
    const credentials = {
      email: 'john.doe@mail.com',
      password: '12345678',
    };

    beforeAll(async () => {
      await prisma.identity.create({
        data: {
          email: credentials.email,
          passwordHash: await AuthService.hashPassword(credentials.password),
        },
      });
    });

    its('should fail with invalid credentials', async () => {
      return request(app.getHttpServer())
        .post('/v1/auth/sign-in')
        .send({ email: credentials.email, password: '87654321' })
        .expect(401)
        .expect((res) =>
          expect(res.body).toEqual(
            expect.objectContaining({
              error: 'Unauthorized',
            }),
          ),
        );
    });

    its(
      'should return proper jwt token that will authorized GET /v1/auth/me',
      () => {
        return request(app.getHttpServer())
          .post('/v1/auth/sign-in')
          .send({ email: credentials.email, password: credentials.password })
          .expect(201)
          .expect(async ({ body }) => {
            expect(body).toEqual({ token: expect.anything() });

            const { token } = body;

            request(app.getHttpServer())
              .get('/v1/auth/me')
              .set('Authorization', `Bearer ${token}`)
              .expect(200)
              .expect(({ body }) => {
                expect(body.email).toEqual(credentials.email);
              });
          });
      },
    );
  });

  describe('Identity profile (GET /v1/auth/me)', () => {
    its('should fail Unauthorized without token', () => {
      return request(app.getHttpServer())
        .get('/v1/auth/me')
        .expect(401)
        .expect((res) =>
          expect(res.body).toEqual(
            expect.objectContaining({
              message: 'Unauthorized',
            }),
          ),
        );
    });

    its('should fail Unauthorized with invalid token', () => {
      return request(app.getHttpServer())
        .get('/v1/auth/me')
        .set('Authorization', `Bearer invalid-token`)
        .expect(401)
        .expect((res) =>
          expect(res.body).toEqual(
            expect.objectContaining({
              message: 'Unauthorized',
            }),
          ),
        );
    });
  });
});
