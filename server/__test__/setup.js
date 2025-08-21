// Force test environment before importing anything
process.env.NODE_ENV = 'test';
process.env.SCHEDULER_ENABLED = 'false'; // Disable scheduler in tests

// Mock external services globally BEFORE importing models
jest.mock('../helpers/bcryptjs', () => ({
  hashPassword: jest.fn(),
  comparePassword: jest.fn(),
}));

jest.mock('../helpers/jwt', () => ({
  createToken: jest.fn(),
  signToken: jest.fn(),
  verifyToken: jest.fn(),
}));

jest.mock('../services/waOutbound', () => ({
  sendMessage: jest.fn(),
}));

jest.mock('../services/scheduler', () => ({
  scheduleReminder: jest.fn(),
  cancelReminder: jest.fn(),
}));

jest.mock('../services/ai', () => ({
  extract: jest.fn(),
  generateReply: jest.fn(),
}));

// Mock authentication middleware BEFORE importing models
jest.mock('../middleware/authentication', () => {
  return (req, res, next) => {
    // Mock user berdasarkan token
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Access token is required' });
    }

    // Dukungan format dinamis: 'Bearer uid:<number>' atau 'Bearer mock-jwt-token-<number>'
    const m1 = authHeader.match(/^Bearer\s+uid:(\d+)$/);
    const m2 = authHeader.match(/^Bearer\s+mock-jwt-token-(\d+)$/);
    if (m1 || m2) {
      const id = parseInt((m1?.[1] || m2?.[1]), 10);
      if (Number.isInteger(id) && id > 0) {
        req.user = { id };
        return next();
      }
    }

    // Fallback mapping lama untuk kompatibilitas
    const mockUsers = {
      'Bearer mock-jwt-token': { id: 1 },
      'Bearer mock-jwt-token-user1': { id: 1 },
      'Bearer mock-jwt-token-user2': { id: 2 },
      'Bearer mock-jwt-token-user3': { id: 3 }
    };
    const fallback = mockUsers[authHeader];
    if (!fallback) {
      return res.status(401).json({ message: 'Invalid access token' });
    }
    req.user = fallback;
    next();
  };
});

const { sequelize } = require('../models');

// Setup global test environment
beforeAll(async () => {
  try {
    console.log('Setting up test environment...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection established');
    
    // Reset sequences to avoid ID conflicts
    await sequelize.query('ALTER SEQUENCE "Users_id_seq" RESTART WITH 1');
    await sequelize.query('ALTER SEQUENCE "Friends_id_seq" RESTART WITH 1');
    await sequelize.query('ALTER SEQUENCE "Reminders_id_seq" RESTART WITH 1');
    
    console.log('Test database ready');
  } catch (error) {
    console.error('Error setting up test environment:', error);
    throw error;
  }
});

// Cleanup after tests
afterAll(async () => {
  try {
    console.log('Cleaning up test environment...');
    await sequelize.close();
    console.log('Test environment cleanup completed');
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
});
