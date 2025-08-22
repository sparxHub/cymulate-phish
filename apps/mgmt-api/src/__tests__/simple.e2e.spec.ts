import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../app.module';

describe('Simple API Tests (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /', () => {
    it('should return Hello World', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect('Hello World!');
    });
  });

  describe('/auth endpoints', () => {
    it('should register a new user', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `user-${Date.now()}@example.com`,
          password: 'password123',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('token');
        });
    });

    it('should login existing user', async () => {
      const email = `login-${Date.now()}@example.com`;
      
      // Register first
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email,
          password: 'password123',
        });

      // Then login
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email,
          password: 'password123',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('token');
        });
    });

    it('should return 401 for invalid login', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });
  });

  describe('/attempts endpoints', () => {
    let authToken: string;

    beforeAll(async () => {
      const email = `attempts-${Date.now()}@example.com`;
      
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email,
          password: 'password123',
        });
      
      authToken = response.body.token;
    });

    it('should return 401 without auth token', () => {
      return request(app.getHttpServer())
        .get('/attempts')
        .expect(401);
    });

    it('should return attempts list with auth token', () => {
      return request(app.getHttpServer())
        .get('/attempts')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });
});
