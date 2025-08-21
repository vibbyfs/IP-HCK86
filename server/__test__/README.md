# Testing Guide untuk Aplikasi Node.js

## 📋 Overview
File pengujian menggunakan Jest dan Supertest untuk setiap controller di aplikasi Node.js telah berhasil dibuat dengan struktur lengkap dan konfigurasi yang tepat.

## 📁 Struktur File Test
```
server/
├── __test__/
│   ├── setup.js                    # Konfigurasi global test
│   ├── authController.test.js      # Test untuk authentication
│   ├── usersController.test.js     # Test untuk user management  
│   ├── friendController.test.js    # Test untuk friend system
│   ├── reminderController.test.js  # Test untuk reminder system
│   └── waController.test.js        # Test untuk WhatsApp webhook
├── jest.config.js                  # Konfigurasi Jest
└── package.json                    # Dependencies & scripts
```

## 🛠️ Yang Sudah Disiapkan

### 1. Database Test
- Database: `phase_new_test` (PostgreSQL)
- Auto-sync dan cleanup untuk isolasi test
- Menggunakan database real (bukan mock)

### 2. Dependencies Installed
```json
{
  "devDependencies": {
    "jest": "^29.5.0",
    "supertest": "^6.3.3"
  },
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch", 
    "test:coverage": "jest --coverage"
  }
}
```

### 3. Mock Services
- Authentication middleware
- bcryptjs helpers (hash/compare)
- JWT helpers (createToken)
- WhatsApp API (waOutbound)
- AI services (extractReminder, generateResponse)
- Scheduler services

## 📊 Test Coverage yang Dibuat

### AuthController Tests
✅ **POST /api/auth/register**
- Register user berhasil
- Validasi missing fields
- Duplicate email handling

✅ **POST /api/auth/login** 
- Login berhasil dengan kredensial valid
- Missing email/password validation
- Invalid credentials handling

### UsersController Tests
✅ **GET /api/users**
- List semua users
- Authorization check

✅ **GET /api/users/profile**
- Get profile user
- Authorization check

### FriendController Tests
✅ **GET /api/friends**
- List friends dengan relasi
- Authorization check

✅ **POST /api/friends/send-request**
- Send friend request berhasil
- Username missing validation

### ReminderController Tests
✅ **GET /api/reminders**
- List reminders user
- Authorization check

✅ **PUT /api/reminders/:id/cancel**
- Cancel reminder berhasil
- 404 untuk reminder tidak ada

### WAController Tests
✅ **POST /api/wa/inbound**
- Handle empty request body
- Handle unregistered user
- Handle registered user with greeting
- Create reminder via WhatsApp

## 🚀 Cara Menjalankan

### Setup Database Test
Database test sudah dibuat dan migrasi sudah dijalankan:
```bash
# Database dan migrasi sudah ready
Database phase_new_test created
Migrations executed successfully
```

### Menjalankan Test
```bash
# Jalankan semua test
npm test

# Jalankan test dengan coverage
npm run test:coverage

# Jalankan test specific file
npm test -- __test__/authController.test.js

# Watch mode untuk development
npm run test:watch
```

## 📝 Contoh Test Implementation

### Authentication Test
```javascript
describe('POST /api/auth/register', () => {
  it('should register a new user successfully', async () => {
    hashPassword.mockReturnValue('hashedpassword');

    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      phone: '+6281234567890'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body).not.toHaveProperty('password');
  });
});
```

### Authorization Test
```javascript
it('should return 401 without authorization token', async () => {
  const response = await request(app)
    .get('/api/users')
    .expect(401);

  expect(response.body).toHaveProperty('message', 'Access token is required');
});
```

## 🔧 Fitur Test

### 1. Database Operations
- Real PostgreSQL database untuk testing
- Automatic cleanup setiap test (`beforeEach`)
- Foreign key constraints preservation

### 2. Mock Strategy
- External services di-mock untuk isolasi
- Authentication middleware di-mock
- Predictable mock responses

### 3. Validation Testing
- Input validation (missing fields, invalid format)
- Authorization checks (protected endpoints)
- Error responses (400, 401, 404, 500)

### 4. Response Testing
- Status code validation
- JSON structure validation
- Data integrity checks
- Security (password tidak di-expose)

## ⚠️ Known Issues & Solutions

### Database Setup Issues
Jika ada masalah dengan database concurrent access:
```bash
# Reset database test
npx sequelize-cli db:drop --env test
npx sequelize-cli db:create --env test
npx sequelize-cli db:migrate --env test
```

### Test Isolation
Setiap test file menggunakan:
- `beforeEach` untuk cleanup database
- Mock reset untuk isolated state
- Predictable test data

## ✨ Best Practices Applied

1. **Test Isolation**: Setiap test independent
2. **Descriptive Names**: Test names yang clear dan specific
3. **Proper Mocking**: External dependencies di-mock
4. **Error Testing**: Comprehensive error scenario coverage
5. **Authorization Testing**: Protected endpoint validation
6. **Database Cleanup**: Proper setup/teardown

## 📈 Test Results

Saat dijalankan, test suite akan memberikan:
- Coverage report untuk setiap controller
- Detailed test results dengan pass/fail status
- Database operation logs
- Mock service interaction verification

File test ini siap digunakan dan dapat di-extend sesuai kebutuhan development lebih lanjut.
