const request = require('supertest');
const app = require('../app');
const { User } = require('../models');
const { hashPassword } = require('../helpers/bcryptjs');
const { createToken } = require('../helpers/jwt');

describe('UsersController', () => {
  let testUser, authToken;

  beforeEach(async () => {
    // Clean up database
    await User.destroy({ where: {}, truncate: true, cascade: true });

    // Get mocked functions from setup.js
    const bcryptMock = require('../helpers/bcryptjs');
    const jwtMock = require('../helpers/jwt');
    
    bcryptMock.hashPassword.mockReturnValue('hashedpassword');
    jwtMock.createToken.mockReturnValue('mock-jwt-token');

    // Create test user
    testUser = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashedpassword', // Already hashed for testing
      phone: '+6281234567890'
    });

  authToken = `Bearer uid:${testUser.id}`;
  });

  // No GET /api/users endpoint in current routes; skipping list/search tests

  describe('GET /api/users/profile', () => {
  it('should get user profile successfully', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', authToken)
    .expect(201);

      expect(response.body).toHaveProperty('id', testUser.id);
      expect(response.body).toHaveProperty('username', testUser.username);
      expect(response.body).toHaveProperty('email', testUser.email);
      expect(response.body).toHaveProperty('phone', testUser.phone);
      expect(response.body).not.toHaveProperty('password');
    });

    it('should handle profile object without toJSON method', async () => {
      const { User } = require('../models');
      const spy = jest.spyOn(User, 'findByPk').mockResolvedValue({
        id: 99,
        username: 'raw',
        email: 'raw@example.com',
        password: 'hashed'
      });
      const res = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer mock-jwt-token')
        .expect(201);
      expect(res.body).toHaveProperty('id', 99);
      expect(res.body).not.toHaveProperty('password');
      spy.mockRestore();
    });

    it('should return 401 without authorization token', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Access token is required');
    });
    
    it('should return 404 when profile not found', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer uid:9999`)
        .expect(404);
      
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('PUT /api/users/profile', () => {
    it('should update user profile successfully', async () => {
      const updateData = {
        username: 'updateduser',
        phone: '+6281234567999'
      };

      const response = await request(app)
  .put(`/api/users/${testUser.id}/update-profile`)
        .set('Authorization', authToken)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('id', testUser.id);
      expect(response.body).toHaveProperty('username', updateData.username);
      expect(response.body).toHaveProperty('phone', updateData.phone);
      expect(response.body).not.toHaveProperty('password');
    });

    it('should handle updateProfile object without toJSON', async () => {
        const { User } = require('../models');
        const spy = jest.spyOn(User, 'findByPk').mockResolvedValue({
          id: 7,
          username: 'nojson',
          email: 'nojson@example.com',
          password: 'hashed',
          update: jest.fn().mockResolvedValue()
        });
        const res = await request(app)
      .put('/api/users/7/update-profile')
      .set('Authorization', 'Bearer uid:7')
          .send({ username: 'nojson2' })
          .expect(200);
        expect(res.body).toHaveProperty('id', 7);
        expect(res.body).not.toHaveProperty('password');
        spy.mockRestore();
      });

    it('should return 400 for invalid email format', async () => {
      const updateData = {
        email: 'invalid-email'
      };

      const response = await request(app)
  .put(`/api/users/${testUser.id}/update-profile`)
        .set('Authorization', authToken)
        .send(updateData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 for duplicate email', async () => {
      // Create another user first
      await User.create({
        username: 'anotheruser',
        email: 'another@example.com',
        password: 'hashedpassword',
        phone: '+6281234567895'
      });

      const updateData = {
        email: 'another@example.com'
      };

      const response = await request(app)
  .put(`/api/users/${testUser.id}/update-profile`)
        .set('Authorization', authToken)
        .send(updateData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 401 without authorization token', async () => {
      const response = await request(app)
  .put(`/api/users/${testUser.id}/update-profile`)
        .send({ username: 'newname' })
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Access token is required');
    });
    
    it('should return 404 when updating non-existent user', async () => {
      const response = await request(app)
        .put(`/api/users/9999/update-profile`)
        .set('Authorization', `Bearer uid:9999`)
        .send({ username: 'nope' })
        .expect(404);
      expect(response.body).toHaveProperty('message');
    });
  });
});
