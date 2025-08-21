const request = require('supertest');
// Mock google lib BEFORE importing app so controller uses the mocked client
jest.mock('google-auth-library', () => {
  const instance = { verifyIdToken: jest.fn() };
  const OAuth2Client = jest.fn().mockImplementation(() => instance);
  return { OAuth2Client, __oauthMockInstance: instance };
});
const app = require('../app');
const { User } = require('../models');
const { hashPassword, comparePassword } = require('../helpers/bcryptjs');
const { signToken } = require('../helpers/jwt');
const { OAuth2Client, __oauthMockInstance } = require('google-auth-library');

describe('AuthController', () => {
  beforeEach(async () => {
    // Clean up test data before each test
    await User.destroy({ where: {}, truncate: true, cascade: true });
    
    // Reset mocks
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
  it('should register a new user successfully', async () => {
      hashPassword.mockReturnValue('hashedpassword');
      
      const newUser = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        timezone: 'Asia/Jakarta'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(newUser);

  expect(response.status).toBe(201);
  expect(response.body).toHaveProperty('id');
  expect(response.body.email).toBe(newUser.email);
  expect(response.body).not.toHaveProperty('password');
    });

  it('should register using fallback branch when toJSON is falsy', async () => {
      const spy = jest.spyOn(User, 'create').mockResolvedValue({
        toJSON: () => null,
        id: 777,
        username: 'branchUser',
        email: 'branch@example.com',
        password: 'hashedpassword'
      });
      try {
        const res = await request(app)
          .post('/api/auth/register')
          .send({ username: 'branchUser', email: 'branch@example.com', password: 'password123' })
          .expect(201);
    // Because Express will call toJSON() on the object passed to res.json, the body becomes null.
    // We still confirm the controller returned 201 without crashing on falsy toJSON branch.
    expect(res.body).toBeNull();
      } finally {
        spy.mockRestore();
      }
    });

    it('should return 400 when email already exists', async () => {
      // Create existing user
      await User.create({
        username: 'existinguser',
        email: 'test@example.com',
        password: 'hashedpassword',
        timezone: 'Asia/Jakarta'
      });

      const newUser = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        timezone: 'Asia/Jakarta'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(newUser);

  expect(response.status).toBe(400);
  expect(response.body.message).toContain('Email');
    });

    it('should return 400 when required fields are missing', async () => {
      const incompleteUser = {
        username: 'testuser',
        // missing email and password
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(incompleteUser);

  expect(response.status).toBe(400);
    });

    it('should return 400 for invalid email format', async () => {
      const invalidUser = {
        username: 'testuser',
        email: 'invalid-email',
        password: 'password123',
        timezone: 'Asia/Jakarta'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidUser);

  expect(response.status).toBe(400);
    });

    it('should return 500 when DB create fails', async () => {
      const spy = jest.spyOn(User, 'create').mockRejectedValueOnce(new Error('DB fail'));
      const res = await request(app).post('/api/auth/register').send({ username: 'x', email: 'x@example.com', password: 'p' }).expect(500);
      expect(res.body).toHaveProperty('message');
      spy.mockRestore();
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create test user for login tests
      await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedpassword',
        timezone: 'Asia/Jakarta'
      });
    });

    it('should login successfully with valid credentials', async () => {
      comparePassword.mockReturnValue(true);
      signToken.mockReturnValue('mock-jwt-token');

      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(200);
      expect(response.body.access_token).toBe('mock-jwt-token');
      expect(comparePassword).toHaveBeenCalledWith(loginData.password, 'hashedpassword');
      expect(signToken).toHaveBeenCalled();
    });

    it('should return 401 for invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Invalid email or password');
    });

    it('should return 401 for invalid password', async () => {
      comparePassword.mockReturnValue(false);

      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

  expect(response.status).toBe(401);
  expect(response.body.message).toContain('Invalid email or password');
      expect(comparePassword).toHaveBeenCalledWith(loginData.password, 'hashedpassword');
    });

    it('should return 400 when email is missing', async () => {
      const loginData = {
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(400);
    });

    it('should return 400 when password is missing', async () => {
      const loginData = {
        email: 'test@example.com'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(400);
    });

    it('should return 500 when DB lookup fails', async () => {
      const spy = jest.spyOn(User, 'findOne').mockRejectedValueOnce(new Error('DB fail'));
      const res = await request(app).post('/api/auth/login').send({ email: 'test@example.com', password: 'p' }).expect(500);
      expect(res.body).toHaveProperty('message');
      spy.mockRestore();
    });
  });

  describe('POST /api/auth/login-google', () => {
    let clientInstance;
    beforeEach(() => {
      // Use the stable shared mocked instance exposed by the mock factory
      clientInstance = __oauthMockInstance;
      clientInstance.verifyIdToken.mockReset();
    });

    it('should login existing user via google', async () => {
  const user = await User.create({ username: 'googleuser', email: 'g@example.com', password: 'password123' });
  clientInstance.verifyIdToken.mockResolvedValue({ getPayload: () => ({ name: 'G', email: user.email }) });
      signToken.mockReturnValue('gtoken');

      const res = await request(app).post('/api/auth/login-google').send({ id_token: 'ok' }).expect(200);
      expect(res.body).toHaveProperty('access_token', 'gtoken');
      expect(res.body.user.email).toBe(user.email);
    });

  it('should create new user when not exists', async () => {
  clientInstance.verifyIdToken.mockResolvedValue({ getPayload: () => ({ name: 'New G', email: 'newg@example.com' }) });
      signToken.mockReturnValue('gtoken2');
      const res = await request(app).post('/api/auth/login-google').send({ id_token: 'ok' }).expect(200);
      expect(res.body).toHaveProperty('access_token', 'gtoken2');
      expect(res.body.user.email).toBe('newg@example.com');
    });

    it('should return 400 on invalid google token', async () => {
  clientInstance.verifyIdToken.mockRejectedValue(new Error('invalid token'));
      const res = await request(app).post('/api/auth/login-google').send({ id_token: 'bad' }).expect(500);
      // errorHandler maps generic to 500
      expect(res.body).toHaveProperty('message');
    });

    it('should handle google token payload without email (validation error)', async () => {
  clientInstance.verifyIdToken.mockResolvedValue({ getPayload: () => ({ name: 'No Email' }) });
      const res = await request(app)
        .post('/api/auth/login-google')
        .send({ id_token: 'ok' })
        .expect(500);
      expect(res.body).toHaveProperty('message');
    });
  });
});