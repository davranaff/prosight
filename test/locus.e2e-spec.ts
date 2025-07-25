import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/main.module';

describe('LocusController (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let normalToken: string;
  let limitedToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Get tokens for different user roles
    const adminResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ username: 'admin', password: 'admin123' });
    adminToken = adminResponse.body.access_token;

    const normalResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ username: 'normal', password: 'normal123' });
    normalToken = normalResponse.body.access_token;

    const limitedResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ username: 'limited', password: 'limited123' });
    limitedToken = limitedResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Authentication', () => {
    it('should login admin user', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ username: 'admin', password: 'admin123' })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user.role).toBe('admin');
          expect(res.body.user.username).toBe('admin');
        });
    });

    it('should login normal user', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ username: 'normal', password: 'normal123' })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user.role).toBe('normal');
          expect(res.body.user.username).toBe('normal');
        });
    });

    it('should login limited user', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ username: 'limited', password: 'limited123' })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user.role).toBe('limited');
          expect(res.body.user.username).toBe('limited');
        });
    });

    it('should reject invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ username: 'invalid', password: 'invalid' })
        .expect(401);
    });

    it('should reject empty credentials', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({})
        .expect(401);
    });
  });

  describe('Locus API - Basic Access', () => {
    it('should return locus data for admin user', () => {
      return request(app.getHttpServer())
        .get('/api/v1/locus')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('pagination');
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.pagination).toHaveProperty('page');
          expect(res.body.pagination).toHaveProperty('limit');
          expect(res.body.pagination).toHaveProperty('total');
        });
    });

    it('should return locus data for normal user', () => {
      return request(app.getHttpServer())
        .get('/api/v1/locus')
        .set('Authorization', `Bearer ${normalToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('pagination');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('should return locus data for limited user', () => {
      return request(app.getHttpServer())
        .get('/api/v1/locus')
        .set('Authorization', `Bearer ${limitedToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('pagination');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('should reject request without token', () => {
      return request(app.getHttpServer()).get('/api/v1/locus').expect(401);
    });

    it('should reject request with invalid token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/locus')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('Locus API - Pagination', () => {
    it('should apply pagination parameters for admin', () => {
      return request(app.getHttpServer())
        .get('/api/v1/locus?page=1&limit=5')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.pagination.page).toBe(1);
          expect(res.body.pagination.limit).toBe(5);
          expect(res.body.data.length).toBeLessThanOrEqual(5);
        });
    });

    it('should apply pagination parameters for normal user', () => {
      return request(app.getHttpServer())
        .get('/api/v1/locus?page=2&limit=3')
        .set('Authorization', `Bearer ${normalToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.pagination.page).toBe(2);
          expect(res.body.pagination.limit).toBe(3);
          expect(res.body.data.length).toBeLessThanOrEqual(3);
        });
    });

    it('should apply pagination parameters for limited user', () => {
      return request(app.getHttpServer())
        .get('/api/v1/locus?page=1&limit=10')
        .set('Authorization', `Bearer ${limitedToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.pagination.page).toBe(1);
          expect(res.body.pagination.limit).toBe(10);
          expect(res.body.data.length).toBeLessThanOrEqual(10);
        });
    });

    it('should handle invalid pagination parameters', () => {
      return request(app.getHttpServer())
        .get('/api/v1/locus?page=0&limit=0')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);
    });
  });

  describe('Locus API - Sorting', () => {
    it('should apply sorting by ID ASC for admin', () => {
      return request(app.getHttpServer())
        .get('/api/v1/locus?sortBy=id&sortOrder=ASC&limit=5')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.length).toBeGreaterThan(0);
          if (res.body.data.length > 1) {
            expect(res.body.data[0].id).toBeLessThanOrEqual(
              res.body.data[1].id,
            );
          }
        });
    });

    it('should apply sorting by ID DESC for normal user', () => {
      return request(app.getHttpServer())
        .get('/api/v1/locus?sortBy=id&sortOrder=DESC&limit=5')
        .set('Authorization', `Bearer ${normalToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.length).toBeGreaterThan(0);
          if (res.body.data.length > 1) {
            expect(res.body.data[0].id).toBeGreaterThanOrEqual(
              res.body.data[1].id,
            );
          }
        });
    });

    it('should apply sorting by assemblyId for limited user', () => {
      return request(app.getHttpServer())
        .get('/api/v1/locus?sortBy=assemblyId&sortOrder=ASC&limit=5')
        .set('Authorization', `Bearer ${limitedToken}`)
        .expect(200);
    });

    it('should apply sorting by locusName for admin', () => {
      return request(app.getHttpServer())
        .get('/api/v1/locus?sortBy=locusName&sortOrder=ASC&limit=5')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('should apply sorting by chromosome for normal user', () => {
      return request(app.getHttpServer())
        .get('/api/v1/locus?sortBy=chromosome&sortOrder=ASC&limit=5')
        .set('Authorization', `Bearer ${normalToken}`)
        .expect(200);
    });
  });

  describe('Locus API - Filtering', () => {
    it('should filter by ID for admin', () => {
      return request(app.getHttpServer())
        .get('/api/v1/locus?id=1')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          if (res.body.data.length > 0) {
            expect(res.body.data[0].id).toBe(1);
          }
        });
    });

    it('should filter by assemblyId for normal user', () => {
      return request(app.getHttpServer())
        .get('/api/v1/locus?assemblyId=GRCh38')
        .set('Authorization', `Bearer ${normalToken}`)
        .expect(200)
        .expect((res) => {
          if (res.body.data.length > 0) {
            expect(res.body.data[0].assemblyId).toBe('GRCh38');
          }
        });
    });

    it('should filter by regionId array for limited user', () => {
      return request(app.getHttpServer())
        .get('/api/v1/locus?regionId=1&regionId=2')
        .set('Authorization', `Bearer ${limitedToken}`)
        .expect(200);
    });

    it('should filter by membershipStatus for admin', () => {
      return request(app.getHttpServer())
        .get('/api/v1/locus?membershipStatus=active')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });

  describe('Locus API - Sideloading', () => {
    it('should allow admin to use sideloading', () => {
      return request(app.getHttpServer())
        .get('/api/v1/locus?sideload=locusMembers&limit=5')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('included');
          expect(Array.isArray(res.body.included)).toBe(true);
        });
    });

    it('should prevent normal user from using sideloading', () => {
      return request(app.getHttpServer())
        .get('/api/v1/locus?sideload=locusMembers')
        .set('Authorization', `Bearer ${normalToken}`)
        .expect(500);
    });

    it('should prevent limited user from using sideloading', () => {
      return request(app.getHttpServer())
        .get('/api/v1/locus?sideload=locusMembers')
        .set('Authorization', `Bearer ${limitedToken}`)
        .expect(500);
    });

    it('should handle multiple sideload options for admin', () => {
      return request(app.getHttpServer())
        .get(
          '/api/v1/locus?sideload=locusMembers&sideload=locusMembers&limit=5',
        )
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });

  describe('Locus API - Combined Parameters', () => {
    it('should handle combined filtering, pagination and sorting for admin', () => {
      return request(app.getHttpServer())
        .get(
          '/api/v1/locus?assemblyId=GRCh38&page=1&limit=5&sortBy=id&sortOrder=ASC&sideload=locusMembers',
        )
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('pagination');
          expect(res.body).toHaveProperty('included');
          expect(res.body.pagination.page).toBe(1);
          expect(res.body.pagination.limit).toBe(5);
        });
    });

    it('should handle combined filtering, pagination and sorting for normal user', () => {
      return request(app.getHttpServer())
        .get(
          '/api/v1/locus?assemblyId=GRCh38&page=1&limit=5&sortBy=id&sortOrder=ASC',
        )
        .set('Authorization', `Bearer ${normalToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('pagination');
          expect(res.body.pagination.page).toBe(1);
          expect(res.body.pagination.limit).toBe(5);
        });
    });

    it('should handle combined filtering, pagination and sorting for limited user', () => {
      return request(app.getHttpServer())
        .get(
          '/api/v1/locus?regionId=1&page=1&limit=3&sortBy=chromosome&sortOrder=DESC',
        )
        .set('Authorization', `Bearer ${limitedToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('pagination');
          expect(res.body.pagination.page).toBe(1);
          expect(res.body.pagination.limit).toBe(3);
        });
    });
  });

  describe('Locus API - Edge Cases', () => {
    it('should handle very large limit for admin', () => {
      return request(app.getHttpServer())
        .get('/api/v1/locus?limit=1000')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('should handle very large limit for normal user', () => {
      return request(app.getHttpServer())
        .get('/api/v1/locus?limit=1000')
        .set('Authorization', `Bearer ${normalToken}`)
        .expect(200);
    });

    it('should handle very large limit for limited user', () => {
      return request(app.getHttpServer())
        .get('/api/v1/locus?limit=1000')
        .set('Authorization', `Bearer ${limitedToken}`)
        .expect(200);
    });

    it('should handle non-existent page', () => {
      return request(app.getHttpServer())
        .get('/api/v1/locus?page=999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.length).toBe(0);
        });
    });

    it('should handle invalid sort field', () => {
      return request(app.getHttpServer())
        .get('/api/v1/locus?sortBy=invalidField')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);
    });

    it('should handle invalid sort order', () => {
      return request(app.getHttpServer())
        .get('/api/v1/locus?sortOrder=INVALID')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);
    });
  });
});
