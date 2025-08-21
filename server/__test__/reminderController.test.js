const request = require('supertest');
const app = require('../app');
const { User, Reminder } = require('../models');
const scheduler = require('../services/scheduler');

describe('ReminderController', () => {
  let testUser;

  beforeEach(async () => {
    await Reminder.destroy({ where: {}, truncate: true, cascade: true });
    await User.destroy({ where: {}, truncate: true, cascade: true });

    // Setup mock for scheduler
    scheduler.cancelReminder.mockClear();
    scheduler.cancelReminder.mockResolvedValue();

    testUser = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashedpassword', // Already hashed for testing
      phone: '+6281234567890'
    });
  });

  describe('GET /api/reminders/actives', () => {
    it('should get all reminders successfully', async () => {
      await Reminder.create({
        UserId: testUser.id,
        title: 'Test reminder',
        dueAt: new Date('2025-12-01T10:00:00Z'),
        status: 'scheduled'
      });

      const response = await request(app)
        .get('/api/reminders/actives')
  .set('Authorization', `Bearer uid:${testUser.id}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return 401 without authorization token', async () => {
      const response = await request(app)
  .get('/api/reminders/actives')
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Access token is required');
    });
    it('should support search, filter and sort', async () => {
      const r1 = await Reminder.create({ UserId: testUser.id, title: 'meeting with team', dueAt: new Date(), status: 'scheduled' });
      const r2 = await Reminder.create({ UserId: testUser.id, title: 'buy milk', dueAt: new Date(), status: 'cancelled' });

      const res1 = await request(app)
        .get('/api/reminders/actives?search=meeting&sort=ASC')
        .set('Authorization', `Bearer uid:${testUser.id}`)
        .expect(200);
      expect(res1.body.some(r => r.id === r1.id)).toBe(true);

      const res2 = await request(app)
        .get('/api/reminders/actives?filter=cancelled')
        .set('Authorization', `Bearer uid:${testUser.id}`)
        .expect(200);
      expect(res2.body.some(r => r.id === r2.id)).toBe(true);
    });
  });

  describe('PUT /api/reminders/cancel/:id', () => {
    it('should cancel reminder successfully', async () => {
      const reminder = await Reminder.create({
        UserId: testUser.id,
        title: 'Test reminder',
        dueAt: new Date('2025-12-01T10:00:00Z'),
        status: 'scheduled'
      });

      const response = await request(app)
        .put(`/api/reminders/cancel/${reminder.id}`)
  .set('Authorization', `Bearer uid:${testUser.id}`)
        .send({ status: 'cancelled' })
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Reminder has been cancelled');
    });

    it('should return 404 for non-existent reminder', async () => {
      const response = await request(app)
        .put('/api/reminders/cancel/999')
  .set('Authorization', `Bearer uid:${testUser.id}`)
        .send({ status: 'cancelled' })
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Reminder not found');
    });
  });

  describe('DELETE /api/reminders/delete/:id', () => {
    it('should delete reminder successfully', async () => {
      const reminder = await Reminder.create({
        UserId: testUser.id,
        title: 'Delete me',
        dueAt: new Date('2025-12-01T10:00:00Z'),
        status: 'scheduled'
      });

      const res = await request(app)
        .delete(`/api/reminders/delete/${reminder.id}`)
        .set('Authorization', `Bearer uid:${testUser.id}`)
        .expect(200);
      expect(res.body).toHaveProperty('message', 'Reminder has been deleted');
    });

    it('should return 404 for non-existent reminder', async () => {
      const res = await request(app)
        .delete('/api/reminders/delete/999')
        .set('Authorization', `Bearer uid:${testUser.id}`)
        .expect(404);
      expect(res.body).toHaveProperty('message', 'Reminder not found');
    });
  });

  describe('DELETE /api/reminders/delete/:id', () => {
    it('should delete reminder successfully', async () => {
      const reminder = await Reminder.create({
        UserId: testUser.id,
        title: 'Delete me',
        dueAt: new Date('2025-12-01T10:00:00Z'),
        status: 'scheduled'
      });

      const response = await request(app)
        .delete(`/api/reminders/delete/${reminder.id}`)
        .set('Authorization', `Bearer uid:${testUser.id}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Reminder has been deleted');
      const exists = await Reminder.findByPk(reminder.id);
      expect(exists).toBeNull();
    });

    it('should return 404 for non-existent reminder', async () => {
      const response = await request(app)
        .delete('/api/reminders/delete/999')
        .set('Authorization', `Bearer uid:${testUser.id}`)
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Reminder not found');
    });
  });
});
