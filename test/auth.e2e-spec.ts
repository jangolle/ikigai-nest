import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { resetDb } from './bootstrap/db';
import { PrismaService } from 'src/services/prisma.service';
import { AuthService } from 'src/auth/auth.service';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    resetDb();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    app.enableCors();
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

    prisma = app.get<PrismaService>(PrismaService);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Sign Up (POST /v1/auth/sign-up)', () => {
    it('should fail with invalid data', async () => {
      return request(app.getHttpServer())
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
    });

    it('should fail for existent credentials', async () => {
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

      return request(app.getHttpServer())
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
    });

    it('should create and return ID of proper idenity', async () => {
      const credentials = {
        email: 'unique@mail.com',
        password: '12345678',
      };

      return await request(app.getHttpServer())
        .post('/v1/auth/sign-up')
        .send(credentials)
        .expect(201)
        .expect(async ({ body }) => {
          const { id } = body;

          const identity = await prisma.identity.findUniqueOrThrow({
            where: { id },
          });

          expect(identity.email).toEqual(credentials.email);
        });
    });
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

    it('should fail with invalid credentials', async () => {
      return request(app.getHttpServer())
        .post('/v1/auth/sign-in')
        .send({ username: credentials.email, password: '87654321' })
        .expect(401)
        .expect((res) =>
          expect(res.body).toEqual(
            expect.objectContaining({
              error: 'Unauthorized',
            }),
          ),
        );
    });

    it('should return proper jwt token that will authorized GET /v1/auth/me', () => {
      return request(app.getHttpServer())
        .post('/v1/auth/sign-in')
        .send({ username: credentials.email, password: credentials.password })
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
    });
  });

  describe('Identity profile (GET /v1/auth/me)', () => {
    it('should fail Unauthorized without token', () => {
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

    it('should fail Unauthorized with invalid token', () => {
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
