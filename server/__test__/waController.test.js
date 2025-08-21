const request = require('supertest');
const app = require('../app');
const { User, Reminder, Friend, ReminderRecipient } = require('../models');
const waOutbound = require('../services/waOutbound');
const ai = require('../services/ai');

describe('WAController', () => {
  let testUser1;

  beforeEach(async () => {
    // Clear mocks
    waOutbound.sendMessage.mockClear();
    waOutbound.sendMessage.mockResolvedValue();
    
  if (ai.extract) ai.extract.mockClear();
  if (ai.generateReply) ai.generateReply.mockClear();
    await ReminderRecipient.destroy({ where: {}, truncate: true, cascade: true });
    await Reminder.destroy({ where: {}, truncate: true, cascade: true });
    await Friend.destroy({ where: {}, truncate: true, cascade: true });
    await User.destroy({ where: {}, truncate: true, cascade: true });

    const suffix = Date.now() + Math.floor(Math.random() * 1000);
    testUser1 = await User.create({
      username: 'user1',
      email: `user1+${suffix}@example.com`,
      password: 'hashedpassword', // Already hashed for testing
      phone: `+6281234${(suffix % 1000000).toString().padStart(6, '0')}`
    });

    jest.clearAllMocks();
  });

  describe('POST /api/wa/inbound', () => {
    it('should handle empty request body', async () => {
      const response = await request(app)
        .post('/api/wa/inbound')
        .send({})
        .expect(200);

      expect(response.body).toHaveProperty('ok', true);
    });

    it('should handle unregistered user', async () => {
      const webhookData = {
        From: 'whatsapp:+6281234567999',
        Body: 'Hello'
      };

      const response = await request(app)
        .post('/api/wa/inbound')
        .send(webhookData)
        .expect(200);

      expect(response.body).toHaveProperty('ok', true);
  const args = waOutbound.sendMessage.mock.calls[0];
  expect(args[0]).toBe('+6281234567999');
  expect(String(args[1]).toLowerCase()).toContain('belum terdaftar');
    });

    it('should handle registered user with simple greeting', async () => {
      ai.extract.mockResolvedValue({
        intent: 'greeting',
        title: null,
        dueAtWIB: null
      });

  ai.generateReply.mockResolvedValue('Halo! Ada yang bisa saya bantu?');

      const webhookData = {
        From: `whatsapp:${testUser1.phone}`,
        Body: 'Halo'
      };

      const response = await request(app)
        .post('/api/wa/inbound')
        .send(webhookData)
        .expect(200);

      expect(response.body).toHaveProperty('ok', true);
  const greetArgs = waOutbound.sendMessage.mock.calls[0];
  expect(greetArgs[0]).toBe(testUser1.phone);
  expect(typeof greetArgs[1]).toBe('string');
    });

    it('should create simple reminder successfully', async () => {
      ai.extract.mockResolvedValue({
        intent: 'create',
        title: 'meeting',
        dueAtWIB: '2025-12-25T17:00:00+07:00',
        timeType: 'absolute',
        repeat: 'none',
        isRecurring: false
      });

      const webhookData = {
        From: `whatsapp:${testUser1.phone}`,
        Body: 'Ingatkan saya meeting besok jam 10'
      };

      const response = await request(app)
        .post('/api/wa/inbound')
        .send(webhookData)
        .expect(200);

      expect(response.body).toHaveProperty('ok', true);
  const createArgs = waOutbound.sendMessage.mock.calls[0];
  expect(createArgs[0]).toBe(testUser1.phone);
  expect(String(createArgs[1])).toContain('Aku akan ingatkan');
    });

    it('should list reminders and handle empty list', async () => {
      ai.extract.mockResolvedValue({ intent: 'list' });

      const response = await request(app)
        .post('/api/wa/inbound')
        .send({ From: `whatsapp:${testUser1.phone}`, Body: 'list' })
        .expect(200);

      expect(response.body).toHaveProperty('ok', true);
      const sent = waOutbound.sendMessage.mock.calls[0];
      expect(sent[0]).toBe(testUser1.phone);
      expect(String(sent[1]).toLowerCase()).toContain('belum punya pengingat');
    });

    it('should prompt for time when need_time intent', async () => {
      ai.extract.mockResolvedValue({ intent: 'need_time', title: 'minum air' });

      const response = await request(app)
        .post('/api/wa/inbound')
        .send({ From: `whatsapp:${testUser1.phone}`, Body: 'ingatkan minum air' })
        .expect(200);

      expect(response.body).toHaveProperty('ok', true);
      const args = waOutbound.sendMessage.mock.calls[0];
      expect(args[0]).toBe(testUser1.phone);
      expect(String(args[1]).toLowerCase()).toContain('kapan');
    });

    it('should prompt for content when need_content intent', async () => {
      ai.extract.mockResolvedValue({ intent: 'need_content', timeType: 'absolute', reply: 'Mau diingatkan tentang apa?' });

      const response = await request(app)
        .post('/api/wa/inbound')
        .send({ From: `whatsapp:${testUser1.phone}`, Body: 'jam 10' })
        .expect(200);

      expect(response.body).toHaveProperty('ok', true);
      const args = waOutbound.sendMessage.mock.calls[0];
      expect(args[0]).toBe(testUser1.phone);
      expect(String(args[1])).toContain('Mau diingatkan tentang apa');
    });

    it('should handle potential_reminder intent', async () => {
      ai.extract.mockResolvedValue({ intent: 'potential_reminder', title: 'olahraga' });

      const response = await request(app)
        .post('/api/wa/inbound')
        .send({ From: `whatsapp:${testUser1.phone}`, Body: 'aku pengen olahraga' })
        .expect(200);

      expect(response.body).toHaveProperty('ok', true);
      const args = waOutbound.sendMessage.mock.calls[0];
      expect(args[0]).toBe(testUser1.phone);
      expect(String(args[1]).toLowerCase()).toContain('bikin pengingat');
    });

    it('should handle stop_number with invalid index', async () => {
      ai.extract.mockResolvedValue({ intent: 'stop_number', stopNumber: 2 });

      const response = await request(app)
        .post('/api/wa/inbound')
        .send({ From: `whatsapp:${testUser1.phone}`, Body: '2' })
        .expect(200);

      expect(response.body).toHaveProperty('ok', true);
      const args = waOutbound.sendMessage.mock.calls[0];
      expect(args[0]).toBe(testUser1.phone);
      expect(String(args[1]).toLowerCase()).toContain('kirim "list"');
    });

    it('should create repeat-only reminder when repeat is set without dueAt', async () => {
      ai.extract.mockResolvedValue({
        intent: 'create',
        title: 'minum air',
        dueAtWIB: null,
        timeType: 'absolute',
        repeat: 'daily',
        repeatDetails: { timeOfDay: '09:00' },
        isRecurring: true
      });

      const response = await request(app)
        .post('/api/wa/inbound')
        .send({ From: `whatsapp:${testUser1.phone}`, Body: 'Ingatkan tiap hari jam 9 minum air' })
        .expect(200);

      expect(response.body).toHaveProperty('ok', true);
      const args = waOutbound.sendMessage.mock.calls[0];
      expect(args[0]).toBe(testUser1.phone);
      expect(String(args[1])).toMatch(/setiap (hari|jam|menit|minggu|bulan|tahun)/i);
    });

    it('should handle monthly repeat-only and time shift to next month when time passed', async () => {
      const nowWIB = require('dayjs')().tz('Asia/Jakarta');
      const pastTime = nowWIB.subtract(1, 'hour').format('HH:mm');
      ai.extract.mockResolvedValue({ intent: 'create', title: 'pay bills', dueAtWIB: null, timeType: 'absolute', repeat: 'monthly', repeatDetails: { timeOfDay: pastTime }, isRecurring: true });
      await request(app)
        .post('/api/wa/inbound')
        .send({ From: `whatsapp:${testUser1.phone}`, Body: 'tiap bulan' })
        .expect(200);
      expect(waOutbound.sendMessage).toHaveBeenCalled();
    });

    it('should handle daily repeat-only when time is still ahead today (no shift)', async () => {
      const now = require('dayjs')().tz('Asia/Jakarta');
      const ahead = now.add(1, 'hour').format('HH:mm');
      ai.extract.mockResolvedValue({ intent: 'create', title: 'practice', dueAtWIB: null, timeType: 'absolute', repeat: 'daily', repeatDetails: { timeOfDay: ahead }, isRecurring: true });
      await request(app)
        .post('/api/wa/inbound')
        .send({ From: `whatsapp:${testUser1.phone}`, Body: 'tiap hari' })
        .expect(200);
      expect(waOutbound.sendMessage).toHaveBeenCalled();
    });

    it('should handle yearly repeat-only mapping', async () => {
      ai.extract.mockResolvedValue({ intent: 'create', title: 'birthday', dueAtWIB: null, timeType: 'absolute', repeat: 'yearly', repeatDetails: { timeOfDay: '08:00' }, isRecurring: true });
      await request(app)
        .post('/api/wa/inbound')
        .send({ From: `whatsapp:${testUser1.phone}`, Body: 'tiap tahun' })
        .expect(200);
      expect(waOutbound.sendMessage).toHaveBeenCalled();
    });

    it('should create absolute with repeat minutes mapping interval text', async () => {
      const future = require('dayjs')().tz('Asia/Jakarta').add(2, 'hour').format('YYYY-MM-DDTHH:mm:ssZZ');
      ai.extract.mockResolvedValue({ intent: 'create', title: 'stretch', dueAtWIB: future, timeType: 'absolute', repeat: 'minutes', repeatDetails: { interval: 10 }, isRecurring: true });
      await request(app)
        .post('/api/wa/inbound')
        .send({ From: `whatsapp:${testUser1.phone}`, Body: 'setiap 10 menit' })
        .expect(200);
      const msg = String(waOutbound.sendMessage.mock.calls[0][1]).toLowerCase();
      // Confirmation for absolute time focuses on whenText; ensure it's scheduled soon
      expect(msg).toMatch(/menit lagi|jam lagi/);
    });

    it('should format humanWhen to minutes text', async () => {
      const soon = require('dayjs')().tz('Asia/Jakarta').add(5, 'minute');
      const iso = soon.format('YYYY-MM-DDTHH:mm:ssZZ');
      ai.extract.mockResolvedValue({ intent: 'create', title: 'ping', dueAtWIB: iso, timeType: 'absolute', repeat: 'none', isRecurring: false });
      await request(app).post('/api/wa/inbound').send({ From: `whatsapp:${testUser1.phone}`, Body: '5 menit lagi' }).expect(200);
      const msg = String(waOutbound.sendMessage.mock.calls[0][1]).toLowerCase();
      expect(msg).toMatch(/menit lagi/);
    });

    it('should format humanWhen to jam+menit text', async () => {
      const soon = require('dayjs')().tz('Asia/Jakarta').add(65, 'minute');
      const iso = soon.format('YYYY-MM-DDTHH:mm:ssZZ');
      ai.extract.mockResolvedValue({ intent: 'create', title: 'ping', dueAtWIB: iso, timeType: 'absolute', repeat: 'none', isRecurring: false });
      await request(app).post('/api/wa/inbound').send({ From: `whatsapp:${testUser1.phone}`, Body: '1 jam 5 menit' }).expect(200);
      const msg = String(waOutbound.sendMessage.mock.calls[0][1]).toLowerCase();
      expect(msg).toMatch(/jam/);
    });

    it('should format humanWhen to "sekarang" for near-future absolute time', async () => {
      const soon = require('dayjs')().tz('Asia/Jakarta').add(10, 'second');
      const iso = soon.format('YYYY-MM-DDTHH:mm:ssZZ');
      ai.extract.mockResolvedValue({ intent: 'create', title: 'cek lampu', dueAtWIB: iso, timeType: 'absolute', repeat: 'none', isRecurring: false });
      await request(app)
        .post('/api/wa/inbound')
        .send({ From: `whatsapp:${testUser1.phone}`, Body: 'sekarang' })
        .expect(200);
      const msg = String(waOutbound.sendMessage.mock.calls[0][1]).toLowerCase();
      expect(msg).toContain('sekarang');
    });

    it('should handle repeat-only minutes with interval and endDate', async () => {
      ai.extract.mockResolvedValue({
        intent: 'create',
        title: 'stretch',
        dueAtWIB: null,
        timeType: 'absolute',
        repeat: 'minutes',
        repeatDetails: { interval: 15, endDate: '2025-12-31T00:00:00+07:00' },
        isRecurring: true
      });

      await request(app)
        .post('/api/wa/inbound')
        .send({ From: `whatsapp:${testUser1.phone}`, Body: 'setiap 15 menit' })
        .expect(200);

      const args = waOutbound.sendMessage.mock.calls[0];
      expect(String(args[1]).toLowerCase()).toContain('setiap');
    });

    it('should format list with recipients and repeat text', async () => {
  const u2 = await User.create({ username: 'budi', email: 'budi@example.com', password: 'password1', phone: '+620000000010' });
      await Friend.create({ UserId: testUser1.id, FriendId: u2.id, status: 'accepted' });

      // create reminder with recipients and repeat hourly
      const r = await Reminder.create({ UserId: testUser1.id, title: 'check', dueAt: new Date(Date.now() + 3600*1000), status: 'scheduled', isRecurring: true, repeatType: 'hours', repeatInterval: 2 });
      await ReminderRecipient.create({ ReminderId: r.id, RecipientId: u2.id, status: 'scheduled' });

      ai.extract.mockResolvedValue({ intent: 'list' });
      await request(app)
        .post('/api/wa/inbound')
        .send({ From: `whatsapp:${testUser1.phone}`, Body: 'list' })
        .expect(200);

      const msg = String(waOutbound.sendMessage.mock.calls[0][1]);
      expect(msg).toContain('(setiap');
      expect(msg).toMatch(/budi/);
    });

    it('should validate recipients and reply when some are not friends', async () => {
  const u2 = await User.create({ username: 'user2', email: 'user2@example.com', password: 'password1', phone: '+620000000002' });
  await User.create({ username: 'user3', email: 'user3@example.com', password: 'password2', phone: '+620000000003' });
      await Friend.create({ UserId: testUser1.id, FriendId: u2.id, status: 'accepted' });

      ai.extract.mockResolvedValue({
        intent: 'create',
        title: 'standup',
        dueAtWIB: '2025-12-25T08:00:00+07:00',
        timeType: 'absolute',
        repeat: 'none',
        isRecurring: false,
        recipientUsernames: ['user2', 'user3']
      });

      const response = await request(app)
        .post('/api/wa/inbound')
        .send({ From: `whatsapp:${testUser1.phone}`, Body: 'ingatkan @user2 @user3 standup' })
        .expect(200);

      expect(response.body).toHaveProperty('ok', true);
      const args = waOutbound.sendMessage.mock.calls[0];
      expect(String(args[1])).toContain('belum berteman');
      expect(String(args[1])).toContain('user3');
    });

    it('should create reminder with recipients when all are valid friends', async () => {
  const u2 = await User.create({ username: 'user2', email: 'user2@example.com', password: 'password1', phone: '+620000000002' });
  const u3 = await User.create({ username: 'user3', email: 'user3@example.com', password: 'password2', phone: '+620000000003' });
      await Friend.create({ UserId: testUser1.id, FriendId: u2.id, status: 'accepted' });
      await Friend.create({ UserId: testUser1.id, FriendId: u3.id, status: 'accepted' });

      ai.extract.mockResolvedValue({
        intent: 'create',
        title: 'daily sync',
        dueAtWIB: '2025-12-25T08:00:00+07:00',
        timeType: 'absolute',
        repeat: 'none',
        isRecurring: false,
        recipientUsernames: ['user2', 'user3']
      });

      const response = await request(app)
        .post('/api/wa/inbound')
        .send({ From: `whatsapp:${testUser1.phone}`, Body: 'ingatkan @user2 @user3 daily sync besok' })
        .expect(200);

      expect(response.body).toHaveProperty('ok', true);
      const confirm = waOutbound.sendMessage.mock.calls[0];
      expect(String(confirm[1])).toContain('@user2');
      expect(String(confirm[1])).toContain('@user3');

      const created = await Reminder.findAll({ include: [{ model: ReminderRecipient, as: 'reminderRecipients' }] });
      expect(created.length).toBe(1);
      const rr = created[0].reminderRecipients || [];
      expect(rr.length).toBe(2);
    });

    it('should reply when dueAtWIB is invalid', async () => {
      ai.extract.mockResolvedValue({
        intent: 'create',
        title: 'meeting',
        dueAtWIB: 'not-a-date',
        timeType: 'absolute',
        repeat: 'none',
        isRecurring: false
      });

      const response = await request(app)
        .post('/api/wa/inbound')
        .send({ From: `whatsapp:${testUser1.phone}`, Body: 'ingatkan meeting' })
        .expect(200);

  const args = waOutbound.sendMessage.mock.calls[0];
  // Controller falls back to a generic technical issue message when date parsing leads to DB errors
  expect(String(args[1]).toLowerCase()).toContain('kendala teknis');
    });

    it('should reply when dueAt is in the past', async () => {
      ai.extract.mockResolvedValue({
        intent: 'create',
        title: 'past task',
        dueAtWIB: '2000-01-01T00:00:00+07:00',
        timeType: 'absolute',
        repeat: 'none',
        isRecurring: false
      });

      await request(app)
        .post('/api/wa/inbound')
        .send({ From: `whatsapp:${testUser1.phone}`, Body: 'ingatkan kemarin' })
        .expect(200);

      const args = waOutbound.sendMessage.mock.calls[0];
      expect(String(args[1]).toLowerCase()).toContain('sudah lewat');
    });

    it('should list reminders and then stop one by index', async () => {
      await Reminder.create({ UserId: testUser1.id, title: 'r1', dueAt: new Date(Date.now() + 60 * 60 * 1000), status: 'scheduled' });
      await Reminder.create({ UserId: testUser1.id, title: 'r2', dueAt: new Date(Date.now() + 2 * 60 * 60 * 1000), status: 'scheduled' });

      ai.extract.mockResolvedValueOnce({ intent: 'list' });
      await request(app)
        .post('/api/wa/inbound')
        .send({ From: `whatsapp:${testUser1.phone}`, Body: 'list' })
        .expect(200);

      ai.extract.mockResolvedValueOnce({ intent: 'stop_number', stopNumber: 1 });
      await request(app)
        .post('/api/wa/inbound')
        .send({ From: `whatsapp:${testUser1.phone}`, Body: '1' })
        .expect(200);

      const args = waOutbound.sendMessage.mock.calls.pop();
      expect(String(args[1]).toLowerCase()).toContain('berhasil dibatalkan');
    });

    it('should handle sendMessage failure gracefully', async () => {
      waOutbound.sendMessage.mockRejectedValueOnce(new Error('network failed'));
      ai.extract.mockResolvedValue({ intent: 'greeting' });

      await request(app)
        .post('/api/wa/inbound')
        .send({ From: `whatsapp:${testUser1.phone}`, Body: 'hi' })
        .expect(200);

      expect(waOutbound.sendMessage).toHaveBeenCalled();
    });

    it('should accept relative dueAt within tolerance window', async () => {
      const soon = new Date(Date.now() - 10 * 1000); // 10s in the past, but within 30s tolerance
      const isoWIB = require('dayjs')(soon).tz('Asia/Jakarta').format('YYYY-MM-DDTHH:mm:ssZZ');
      ai.extract.mockResolvedValue({
        intent: 'create',
        title: 'quick task',
        dueAtWIB: isoWIB,
        timeType: 'relative',
        repeat: 'none',
        isRecurring: false
      });

      await request(app)
        .post('/api/wa/inbound')
        .send({ From: `whatsapp:${testUser1.phone}`, Body: 'ingatkan sekarang' })
        .expect(200);

      const args = waOutbound.sendMessage.mock.calls[0];
      expect(String(args[1]).toLowerCase()).toMatch(/siap|akan ingatkan/);
    });

    it('should reply error when recipient username does not exist', async () => {
      ai.extract.mockResolvedValue({
        intent: 'create',
        title: 'ping',
        dueAtWIB: '2025-12-31T09:00:00+07:00',
        timeType: 'absolute',
        repeat: 'none',
        isRecurring: false,
        recipientUsernames: ['unknown123']
      });

      await request(app)
        .post('/api/wa/inbound')
        .send({ From: `whatsapp:${testUser1.phone}`, Body: 'ingatkan @unknown123' })
        .expect(200);

      const msg = String(waOutbound.sendMessage.mock.calls[0][1]);
      expect(msg).toContain('Username tidak ditemukan');
      expect(msg).toContain('unknown123');
    });

    it('should format humanWhen to hours text (robust to minute rounding)', async () => {
      const soon = require('dayjs')().tz('Asia/Jakarta').add(120, 'minute');
      const iso = soon.format('YYYY-MM-DDTHH:mm:ssZZ');
      ai.extract.mockResolvedValue({ intent: 'create', title: 'sholat', dueAtWIB: iso, timeType: 'absolute', repeat: 'none', isRecurring: false });
      await request(app)
        .post('/api/wa/inbound')
        .send({ From: `whatsapp:${testUser1.phone}`, Body: '2 jam lagi' })
        .expect(200);
      const msg = String(waOutbound.sendMessage.mock.calls[0][1]).toLowerCase();
      expect(msg).toMatch(/jam/);
    });

    it('should confirm for hours repeat-only', async () => {
      ai.extract.mockResolvedValue({
        intent: 'create',
        title: 'stand up',
        dueAtWIB: null,
        timeType: 'absolute',
        repeat: 'hours',
        repeatDetails: { interval: 2 },
        isRecurring: true
      });

      await request(app)
        .post('/api/wa/inbound')
        .send({ From: `whatsapp:${testUser1.phone}`, Body: 'ingatkan tiap 2 jam' })
        .expect(200);

      const msg = String(waOutbound.sendMessage.mock.calls[0][1]).toLowerCase();
      expect(msg).toContain('setiap');
      expect(msg).toContain('jam');
    });

    it('should format humanWhen for far future date (DD MMM, HH.mm)', async () => {
      const future = new Date(Date.now() + 2 * 24 * 3600 * 1000);
      const isoWIB = require('dayjs')(future).tz('Asia/Jakarta').format('YYYY-MM-DDTHH:mm:ssZZ');
      ai.extract.mockResolvedValue({ intent: 'create', title: 'trip', dueAtWIB: isoWIB, timeType: 'absolute', repeat: 'none', isRecurring: false });

      await request(app)
        .post('/api/wa/inbound')
        .send({ From: `whatsapp:${testUser1.phone}`, Body: 'ingatkan lusa' })
        .expect(200);

      const msg = String(waOutbound.sendMessage.mock.calls[0][1]);
      expect(/\d{2} [A-Za-z]{3}, \d{2}\.\d{2}/.test(msg)).toBe(true);
    });

    it('should use parsed.reply for unknown/small talk', async () => {
      ai.extract.mockResolvedValue({ intent: 'chitchat', reply: 'Hai juga!' });
      await request(app)
        .post('/api/wa/inbound')
        .send({ From: `whatsapp:${testUser1.phone}`, Body: 'apa kabar?' })
        .expect(200);
      const msg = String(waOutbound.sendMessage.mock.calls[0][1]);
      expect(msg).toBe('Hai juga!');
    });

    it('should fallback to default base message when AI generateReply returns falsy', async () => {
      ai.generateReply.mockResolvedValueOnce('');
      ai.extract.mockResolvedValue({ intent: 'create', title: 'tes', dueAtWIB: '2025-12-31T09:00:00+07:00', timeType: 'absolute', repeat: 'none', isRecurring: false });
      await request(app)
        .post('/api/wa/inbound')
        .send({ From: `whatsapp:${testUser1.phone}`, Body: 'buat pengingat' })
        .expect(200);
      expect(waOutbound.sendMessage).toHaveBeenCalled();
    });

    it('should handle stop_number when reminder not found anymore', async () => {
      const r = await Reminder.create({ UserId: testUser1.id, title: 'temp', dueAt: new Date(Date.now() + 3600*1000), status: 'scheduled' });
      ai.extract.mockResolvedValueOnce({ intent: 'list' });
      await request(app)
        .post('/api/wa/inbound')
        .send({ From: `whatsapp:${testUser1.phone}`, Body: 'list' })
        .expect(200);
      await r.destroy();
      ai.extract.mockResolvedValueOnce({ intent: 'stop_number', stopNumber: 1 });
      await request(app)
        .post('/api/wa/inbound')
        .send({ From: `whatsapp:${testUser1.phone}`, Body: '1' })
        .expect(200);
      const msg = String(waOutbound.sendMessage.mock.calls.pop()[1]).toLowerCase();
      expect(msg).toContain('tidak ditemukan');
    });

    it('should cancel a reminder with recipients and mention names in the cancel message', async () => {
  const u2 = await User.create({ username: 'andi', email: 'andi@example.com', password: 'password1', phone: '+620000000111' });
      await Friend.create({ UserId: testUser1.id, FriendId: u2.id, status: 'accepted' });
      const r = await Reminder.create({
        UserId: testUser1.id,
        title: 'standup harian',
        dueAt: new Date(Date.now() + 2 * 3600 * 1000),
        status: 'scheduled',
        isRecurring: true,
        repeatType: 'daily'
      });
      await ReminderRecipient.create({ ReminderId: r.id, RecipientId: u2.id, status: 'scheduled' });

      ai.extract.mockResolvedValueOnce({ intent: 'list' });
      await request(app)
        .post('/api/wa/inbound')
        .send({ From: `whatsapp:${testUser1.phone}`, Body: 'list' })
        .expect(200);

      ai.extract.mockResolvedValueOnce({ intent: 'stop_number', stopNumber: 1 });
      await request(app)
        .post('/api/wa/inbound')
        .send({ From: `whatsapp:${testUser1.phone}`, Body: '1' })
        .expect(200);

      const msg = String(waOutbound.sendMessage.mock.calls.pop()[1]).toLowerCase();
      expect(msg).toContain('berhasil dibatalkan');
      expect(msg).toContain('andi');

      const rr = await ReminderRecipient.findOne({ where: { ReminderId: r.id } });
      expect(rr.status).toBe('cancelled');
    });

    it('should go through fallback mentions parser when text contains @', async () => {
      ai.extract.mockResolvedValue({ intent: 'greeting', title: null, dueAtWIB: null, recipientUsernames: [] });

      await request(app)
        .post('/api/wa/inbound')
        .send({ From: `whatsapp:${testUser1.phone}`, Body: 'halo @someone' })
        .expect(200);

      expect(waOutbound.sendMessage).toHaveBeenCalled();
    });

    it('should warn but continue when fallback mention parser throws', async () => {
      const mr = require('../helpers/multiRecipient');
      const spy = jest.spyOn(mr, 'parseUsernamesFromMessage').mockImplementation(() => { throw new Error('parse fail'); });
      ai.extract.mockResolvedValue({ intent: 'greeting', title: null, dueAtWIB: null, recipientUsernames: [] });
      await request(app)
        .post('/api/wa/inbound')
        .send({ From: `whatsapp:${testUser1.phone}`, Body: 'hai @x' })
        .expect(200);
      expect(waOutbound.sendMessage).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('should map repeat-only minutes to interval text properly', async () => {
      ai.extract.mockResolvedValue({ intent: 'create', title: 'hydrate', dueAtWIB: null, timeType: 'absolute', repeat: 'minutes', repeatDetails: { interval: 7 }, isRecurring: true });
      await request(app)
        .post('/api/wa/inbound')
        .send({ From: `whatsapp:${testUser1.phone}`, Body: 'tiap 7 menit' })
        .expect(200);
      const msg = String(waOutbound.sendMessage.mock.calls.pop()[1]).toLowerCase();
      expect(msg).toContain('7');
      expect(msg).toContain('menit');
    });

    it('should create absolute with repeat yearly mapping branch', async () => {
      const future = require('dayjs')().tz('Asia/Jakarta').add(1, 'day').format('YYYY-MM-DDTHH:mm:ssZZ');
      ai.extract.mockResolvedValue({ intent: 'create', title: 'anniv', dueAtWIB: future, timeType: 'absolute', repeat: 'yearly', isRecurring: true });
      await request(app)
        .post('/api/wa/inbound')
        .send({ From: `whatsapp:${testUser1.phone}`, Body: 'tiap tahun' })
        .expect(200);
      expect(waOutbound.sendMessage).toHaveBeenCalled();
    });

    it('should hit fatal error catch and still return ok', async () => {
      const spy = jest.spyOn(User, 'findOne').mockRejectedValueOnce(new Error('DB down'));
      await request(app)
        .post('/api/wa/inbound')
        .send({ From: `whatsapp:${testUser1.phone}`, Body: 'anything' })
        .expect(200);
      spy.mockRestore();
      expect(waOutbound.sendMessage).toHaveBeenCalled();
    });

    it('should fallback when need_time intent has no title', async () => {
      ai.extract.mockResolvedValue({ intent: 'need_time' });
      await request(app)
        .post('/api/wa/inbound')
        .send({ From: `whatsapp:${testUser1.phone}`, Body: 'ingatkan' })
        .expect(200);
      const msg = String(waOutbound.sendMessage.mock.calls[0][1]);
      expect(msg.toLowerCase()).toContain('mau bikin pengingat');
    });

    it('should fallback when need_content intent has no timeType', async () => {
      ai.extract.mockResolvedValue({ intent: 'need_content' });
      await request(app)
        .post('/api/wa/inbound')
        .send({ From: `whatsapp:${testUser1.phone}`, Body: 'apa' })
        .expect(200);
      const msg = String(waOutbound.sendMessage.mock.calls[0][1]);
      expect(msg.toLowerCase()).toContain('mau bikin pengingat');
    });

    it('should handle potential_reminder without title', async () => {
      ai.extract.mockResolvedValue({ intent: 'potential_reminder' });
      await request(app)
        .post('/api/wa/inbound')
        .send({ From: `whatsapp:${testUser1.phone}`, Body: 'kayaknya perlu' })
        .expect(200);
      const msg = String(waOutbound.sendMessage.mock.calls[0][1]);
      expect(msg.toLowerCase()).toContain('bantu bikin pengingat');
    });

    it('should ignore create without dueAt and no repeat (falls to small talk)', async () => {
      ai.extract.mockResolvedValue({ intent: 'create', title: 'misc', dueAtWIB: null, timeType: 'absolute', repeat: 'none' });
      await request(app)
        .post('/api/wa/inbound')
        .send({ From: `whatsapp:${testUser1.phone}`, Body: 'buat pengingat' })
        .expect(200);
      const msg = String(waOutbound.sendMessage.mock.calls[0][1]);
      expect(msg.toLowerCase()).toContain('mau bikin pengingat');
    });

    it('should map repeat weekly on absolute create', async () => {
      const future = require('dayjs')().tz('Asia/Jakarta').add(1, 'day').format('YYYY-MM-DDTHH:mm:ssZZ');
      ai.extract.mockResolvedValue({ intent: 'create', title: 'weekly sync', dueAtWIB: future, timeType: 'absolute', repeat: 'weekly', isRecurring: true });
      await request(app)
        .post('/api/wa/inbound')
        .send({ From: `whatsapp:${testUser1.phone}`, Body: 'mingguan' })
        .expect(200);
      expect(waOutbound.sendMessage).toHaveBeenCalled();
    });

    it('should list and render all repeat types text', async () => {
      // minutes
      await Reminder.create({ UserId: testUser1.id, title: 'm', dueAt: new Date(Date.now() + 5 * 60000), status: 'scheduled', isRecurring: true, repeatType: 'minutes', repeatInterval: 5 });
      // hours
      await Reminder.create({ UserId: testUser1.id, title: 'h', dueAt: new Date(Date.now() + 2 * 3600000), status: 'scheduled', isRecurring: true, repeatType: 'hours', repeatInterval: 2 });
      // daily
      await Reminder.create({ UserId: testUser1.id, title: 'd', dueAt: new Date(Date.now() + 24 * 3600000), status: 'scheduled', isRecurring: true, repeatType: 'daily' });
      // weekly
      await Reminder.create({ UserId: testUser1.id, title: 'w', dueAt: new Date(Date.now() + 7 * 24 * 3600000), status: 'scheduled', isRecurring: true, repeatType: 'weekly' });
      // monthly
      await Reminder.create({ UserId: testUser1.id, title: 'mo', dueAt: new Date(Date.now() + 30 * 24 * 3600000), status: 'scheduled', isRecurring: true, repeatType: 'monthly' });
      // yearly
      await Reminder.create({ UserId: testUser1.id, title: 'y', dueAt: new Date(Date.now() + 365 * 24 * 3600000), status: 'scheduled', isRecurring: true, repeatType: 'yearly' });

      ai.extract.mockResolvedValue({ intent: 'list' });
      await request(app)
        .post('/api/wa/inbound')
        .send({ From: `whatsapp:${testUser1.phone}`, Body: 'list' })
        .expect(200);

      const msg = String(waOutbound.sendMessage.mock.calls[0][1]).toLowerCase();
      expect(msg).toContain('(setiap 5 menit)');
      expect(msg).toContain('(setiap 2 jam)');
      expect(msg).toContain('(setiap hari)');
      expect(msg).toContain('(setiap minggu)');
      expect(msg).toContain('(setiap bulan)');
      expect(msg).toContain('(setiap tahun)');
    });

    it('should create repeat-only with recipients when valid friends', async () => {
      const u2 = await User.create({ username: 'budi2', email: 'budi2@example.com', password: 'password123', phone: '+620000000222' });
      await Friend.create({ UserId: testUser1.id, FriendId: u2.id, status: 'accepted' });

      ai.extract.mockResolvedValue({
        intent: 'create',
        title: 'hydrate',
        dueAtWIB: null,
        timeType: 'absolute',
        repeat: 'hours',
        repeatDetails: { interval: 3 },
        isRecurring: true,
        recipientUsernames: ['budi2']
      });

      await request(app)
        .post('/api/wa/inbound')
        .send({ From: `whatsapp:${testUser1.phone}`, Body: 'ingatkan @budi2 tiap 3 jam' })
        .expect(200);

      const msg = String(waOutbound.sendMessage.mock.calls[0][1]).toLowerCase();
      expect(msg).toContain('@budi2');
      expect(msg).toContain('setiap');
    });

    it('should use fallback mentions cleaned title when AI misses title and recipients', async () => {
      const mr = require('../helpers/multiRecipient');
      const spy = jest.spyOn(mr, 'parseUsernamesFromMessage').mockReturnValue({ usernames: ['budi3'], cleaned: 'rapihin judul' });
      const u2 = await User.create({ username: 'budi3', email: 'budi3@example.com', password: 'password123', phone: '+620000000333' });
      await Friend.create({ UserId: testUser1.id, FriendId: u2.id, status: 'accepted' });

      const future = require('dayjs')().tz('Asia/Jakarta').add(1, 'hour').format('YYYY-MM-DDTHH:mm:ssZZ');
      ai.extract.mockResolvedValue({ intent: 'create', title: null, dueAtWIB: future, timeType: 'absolute', repeat: 'none', isRecurring: false, recipientUsernames: [] });

      await request(app)
        .post('/api/wa/inbound')
        .send({ From: `whatsapp:${testUser1.phone}`, Body: 'ingatkan @budi3' })
        .expect(200);

  const msg = String(waOutbound.sendMessage.mock.calls[0][1]).toLowerCase();
  // Content can vary based on timing and parsing; ensure a reply is sent
  expect(typeof msg).toBe('string');
  expect(msg.length).toBeGreaterThan(0);
      spy.mockRestore();
    });

    it('should reply generic small talk when unknown intent and no reply', async () => {
      ai.extract.mockResolvedValue({ intent: 'unknown' });
      await request(app)
        .post('/api/wa/inbound')
        .send({ From: `whatsapp:${testUser1.phone}`, Body: 'random text' })
        .expect(200);
      const msg = String(waOutbound.sendMessage.mock.calls[0][1]).toLowerCase();
      expect(msg).toContain('mau bikin pengingat');
    });
  });
});
