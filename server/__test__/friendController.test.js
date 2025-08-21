const request = require('supertest');
const app = require('../app');
const { User, Friend } = require('../models');

describe('FriendController', () => {
  let testUser1, testUser2;

  beforeEach(async () => {
    await Friend.destroy({ where: {}, truncate: true, cascade: true });
    await User.destroy({ where: {}, truncate: true, cascade: true });

    testUser1 = await User.create({
      username: 'user1',
      email: 'user1@example.com',
      password: 'hashedpassword', // Already hashed for testing
      phone: '+6281234567890'
    });

    testUser2 = await User.create({
      username: 'user2',
      email: 'user2@example.com',
      password: 'hashedpassword',
      phone: '+6281234567891'
    });
  });

  describe('GET /api/friends', () => {
    it('should get friends list successfully', async () => {
      await Friend.create({
        UserId: testUser1.id,
        FriendId: testUser2.id,
        status: 'accepted'
      });

      const response = await request(app)
        .get('/api/friends')
        .set('Authorization', 'Bearer mock-jwt-token')
        .expect(200);

  expect(Array.isArray(response.body)).toBe(true);
    });

    it('should filter by direction incoming and search', async () => {
      // user2 invited user1 (incoming to user1)
      await Friend.create({ UserId: testUser2.id, FriendId: testUser1.id, status: 'pending' });

      const res = await request(app)
        .get('/api/friends?direction=incoming&search=user2&sort=ASC')
        .set('Authorization', `Bearer uid:${testUser1.id}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0]).toHaveProperty('direction', 'incoming');
      expect(res.body[0].otherUser.username).toBe('user2');
    });

    it('should filter by direction outgoing', async () => {
      await Friend.create({ UserId: testUser1.id, FriendId: testUser2.id, status: 'pending' });
      const res = await request(app)
        .get('/api/friends?direction=outgoing')
        .set('Authorization', `Bearer uid:${testUser1.id}`)
        .expect(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0]).toHaveProperty('direction', 'outgoing');
    });

    it('should return 401 without authorization token', async () => {
      const response = await request(app)
        .get('/api/friends')
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Access token is required');
    });
  });

  describe('POST /api/friends/request', () => {
    it('should send friend request successfully', async () => {
      const requestData = {
        username: testUser2.username
      };

      const response = await request(app)
        .post('/api/friends/request')
        .set('Authorization', `Bearer uid:${testUser1.id}`)
        .send(requestData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('UserId', testUser1.id);
      expect(response.body).toHaveProperty('FriendId', testUser2.id);
      expect(response.body).toHaveProperty('status', 'pending');
    });

    it('should return 400 when username is missing', async () => {
      const response = await request(app)
        .post('/api/friends/request')
        .set('Authorization', 'Bearer mock-jwt-token')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Username wajib diisi.');
    });

    it('should return 404 when target user not found', async () => {
      const res = await request(app)
        .post('/api/friends/request')
        .set('Authorization', `Bearer uid:${testUser1.id}`)
        .send({ username: 'notexists' })
        .expect(404);
      expect(res.body.message).toContain('User tidak ditemukan');
    });

    it('should return 400 when sending duplicate request', async () => {
      await Friend.create({ UserId: testUser1.id, FriendId: testUser2.id, status: 'pending' });
      const res = await request(app)
        .post('/api/friends/request')
        .set('Authorization', `Bearer uid:${testUser1.id}`)
        .send({ username: testUser2.username })
        .expect(400);
      expect(res.body.message).toContain('Permintaan sudah pernah dibuat');
    });

    it('should return 400 when inviting self', async () => {
      const res = await request(app)
        .post('/api/friends/request')
        .set('Authorization', `Bearer uid:${testUser1.id}`)
        .send({ username: testUser1.username })
        .expect(400);
      expect(res.body.message).toContain('Tidak dapat mengundang diri sendiri');
    });
  });

  describe('PUT /api/friends/:id/respond', () => {
    it('should accept a friend request and create reciprocal relation', async () => {
      const pending = await Friend.create({
        UserId: testUser1.id,
        FriendId: testUser2.id,
        status: 'pending'
      });

      const res = await request(app)
        .put(`/api/friends/${pending.id}/respond`)
        .set('Authorization', `Bearer uid:${testUser2.id}`)
        .send({ action: 'accept' })
        .expect(200);

      expect(res.body).toHaveProperty('id', pending.id);
      expect(res.body).toHaveProperty('status', 'accepted');

      const all = await Friend.findAll({ order: [['id', 'ASC']] });
      // should have 2 accepted relations (both directions)
      expect(all.length).toBe(2);
      expect(all.every(f => f.status === 'accepted')).toBe(true);
    });

      it('should update reciprocal relation when exists and not accepted', async () => {
        const pending = await Friend.create({ UserId: testUser1.id, FriendId: testUser2.id, status: 'pending' });
        // reciprocal exists but pending → should be updated to accepted
        await Friend.create({ UserId: testUser2.id, FriendId: testUser1.id, status: 'pending' });

        const res = await request(app)
          .put(`/api/friends/${pending.id}/respond`)
          .set('Authorization', `Bearer uid:${testUser2.id}`)
          .send({ action: 'accept' })
          .expect(200);
        expect(res.body.status).toBe('accepted');
        const all = await Friend.findAll({ order: [['id', 'ASC']] });
        expect(all.length).toBe(2);
        expect(all.every(f => f.status === 'accepted')).toBe(true);
      });

    it('should reject a friend request and remove it', async () => {
      const pending = await Friend.create({
        UserId: testUser1.id,
        FriendId: testUser2.id,
        status: 'pending'
      });

      const res = await request(app)
        .put(`/api/friends/${pending.id}/respond`)
        .set('Authorization', `Bearer uid:${testUser2.id}`)
        .send({ action: 'reject' })
        .expect(200);

      expect(res.body).toHaveProperty('status', 'rejected');
      const exists = await Friend.findByPk(pending.id);
      expect(exists).toBeNull();
    });

    it('should return 400 for invalid action', async () => {
      const pending = await Friend.create({
        UserId: testUser1.id,
        FriendId: testUser2.id,
        status: 'pending'
      });

      const res = await request(app)
        .put(`/api/friends/${pending.id}/respond`)
        .set('Authorization', `Bearer uid:${testUser2.id}`)
        .send({ action: 'maybe' })
        .expect(400);

      expect(res.body).toHaveProperty('message');
    });

    it('should return 403 when non-receiver tries to respond', async () => {
      const pending = await Friend.create({
        UserId: testUser1.id,
        FriendId: testUser2.id,
        status: 'pending'
      });

      const res = await request(app)
        .put(`/api/friends/${pending.id}/respond`)
        .set('Authorization', `Bearer uid:${testUser1.id}`)
        .send({ action: 'accept' })
        .expect(403);

      expect(res.body).toHaveProperty('message');
    });
  });

  describe('DELETE /api/friends/:id/delete', () => {
    it('should delete friend relation (both directions)', async () => {
      const a = await Friend.create({ UserId: testUser1.id, FriendId: testUser2.id, status: 'accepted' });
      await Friend.create({ UserId: testUser2.id, FriendId: testUser1.id, status: 'accepted' });

      const res = await request(app)
        .delete(`/api/friends/${a.id}/delete`)
        .set('Authorization', `Bearer uid:${testUser1.id}`)
        .expect(200);

      expect(res.body).toHaveProperty('message', 'Relasi pertemanan dihapus.');
      const remaining = await Friend.findAll();
      expect(remaining.length).toBe(0);
    });

    it('should return 404 when relation not found', async () => {
      const res = await request(app)
        .delete(`/api/friends/999/delete`)
        .set('Authorization', `Bearer uid:${testUser1.id}`)
        .expect(404);
      expect(res.body.message).toContain('Relasi tidak ditemukan');
    });

    it('should return 403 when deleting relation as a stranger', async () => {
      const a = await Friend.create({ UserId: testUser1.id, FriendId: testUser2.id, status: 'accepted' });
      // use a valid password length to satisfy model validation
      const stranger = await User.create({ username: 'stranger', email: 'stranger@example.com', password: 'hashedpassword', phone: '+6280000000001' });
      const res = await request(app)
        .delete(`/api/friends/${a.id}/delete`)
        .set('Authorization', `Bearer uid:${stranger.id}`)
        .expect(403);
      expect(res.body.message).toContain('Tidak berhak');
    });

    it('should handle database error on getFriends gracefully (500)', async () => {
      const spy = jest.spyOn(Friend, 'findAll').mockRejectedValueOnce(new Error('DB error'));
      const res = await request(app)
        .get('/api/friends')
        .set('Authorization', `Bearer uid:${testUser1.id}`)
        .expect(500);
      expect(res.body).toHaveProperty('message');
      spy.mockRestore();
    });
  });
});
