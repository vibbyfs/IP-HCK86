![Open in Visual Studio Code](https://classroom.github.com/assets/open-in-vscode-2e0aaae1b6195c2367325f4f02e2d04e9abb55f0b24a779b69b11b9e10269abc.svg)

## RESTful endpoints

Base URL: `/api`

---
### POST /auth/login

> User login to get access token

_Request Header_
```json
not needed
```

_Request Body_
```json
{
  "email": "<user email>",
  "password": "<user password>"
}
```

_Response (200)_
```json
{
  "access_token": "<jwt token>"
}
```

_Response (400 - Bad Request)_
```json
{
  "message": "Email is required."
}
{
  "message": "Password is required."
}
```

_Response (401 - Unauthorized)_
```json
{
  "message": "Invalid email or password."
}
```

---
### POST /auth/register

> Create new user

_Request Header_
```json
not needed
```

_Request Body_
```json
{
  "username": "<username>",
  "email": "<email>",
  "password": "<password>",
  "phone": "<phone, optional>",
  "timezone": "<IANA timezone, optional>"
}
```

_Response (201 - Created)_
```json
{
  "id": 1,
  "username": "alice",
  "email": "alice@mail.com",
  "phone": "-",
  "timezone": "Asia/Jakarta",
  "bio": null,
  "createdAt": "2025-08-22T00:00:00.000Z",
  "updatedAt": "2025-08-22T00:00:00.000Z"
}
```

_Response (400 - Bad Request)_
```json
{
  "message": "Username tidak boleh kosong."
}
{
  "message": "Username harus antara 3 sampai 50 karakter."
}
{
  "message": "Email tidak boleh kosong."
}
{
  "message": "Format email tidak valid."
}
{
  "message": "Email is already exists"
}
{
  "message": "Password tidak boleh kosong."
}
{
  "message": "Password minimal 8 karakter."
}
```

---
### POST /auth/login-google

> Login via Google OAuth to get access token

_Request Header_
```json
not needed
```

_Request Body_
```json
{
  "id_token": "<google id token>"
}
```

_Response (200)_
```json
{
  "access_token": "<jwt token>",
  "user": { "id": 1, "username": "alice", "email": "alice@mail.com" }
}
```

_Response (500 - Internal Server Error)_
```json
{ "message": "Internal server error" }
```

---
### GET /users/profile

> Get current user profile

_Request Header_
```json
{
  "Authorization": "Bearer <access token>"
}
```

_Request Body_
```json
not needed
```

_Response (201 - Created)_
```json
{
  "id": 1,
  "username": "alice",
  "email": "alice@mail.com",
  "phone": "-",
  "timezone": "Asia/Jakarta",
  "bio": null,
  "createdAt": "2025-08-22T00:00:00.000Z",
  "updatedAt": "2025-08-22T00:00:00.000Z"
}
```

_Response (401 - Unauthorized)_
```json
{ "message": "Invalid token" }
```

_Response (404 - Not Found)_
```json
{ "message": "Profile not found" }
```

---
### PUT /users/:id/update-profile

> Update user profile by ID

_Request Header_
```json
{
  "Authorization": "Bearer <access token>"
}
```

_Request Body_
```json
{
  "username": "alice-new",
  "email": "alice_new@mail.com",
  "password": "<new password>",
  "phone": "+62812xxx",
  "timezone": "Asia/Jakarta",
  "bio": "<optional bio>"
}
```

_Response (200)_
```json
{
  "id": 1,
  "username": "alice-new",
  "email": "alice_new@mail.com",
  "phone": "+62812xxx",
  "timezone": "Asia/Jakarta",
  "bio": "<optional bio>",
  "createdAt": "2025-08-22T00:00:00.000Z",
  "updatedAt": "2025-08-22T00:00:00.000Z"
}
```

_Response (400 - Bad Request)_
```json
{ "message": "Username tidak boleh kosong." }
{ "message": "Username harus antara 3 sampai 50 karakter." }
{ "message": "Email tidak boleh kosong." }
{ "message": "Format email tidak valid." }
{ "message": "Email is already exists" }
{ "message": "Password tidak boleh kosong." }
{ "message": "Password minimal 8 karakter." }
```

_Response (401 - Unauthorized)_
```json
{ "message": "Invalid token" }
```

_Response (404 - Not Found)_
```json
{ "message": "Data not found" }
```

---
### GET /friends

> List friends/requests

_Request Header_
```json
{ "Authorization": "Bearer <access token>" }
```

_Query params_
```json
{
  "search": "<username contains>",
  "status": "pending|accepted",
  "direction": "incoming|outgoing",
  "sort": "ASC|DESC"
}
```

_Response (200)_
```json
[
  {
    "id": 10,
    "status": "accepted",
    "direction": "incoming",
    "createdAt": "2025-08-22T00:00:00.000Z",
    "otherUser": { "id": 2, "username": "bob" }
  }
]
```

_Response (401 - Unauthorized)_
```json
{ "message": "Invalid token" }
```

---
### POST /friends/request

> Send friend request

_Request Header_
```json
{ "Authorization": "Bearer <access token>" }
```

_Request Body_
```json
{ "username": "<target username>" }
```

_Response (201 - Created)_
```json
{
  "id": 123,
  "UserId": 1,
  "FriendId": 2,
  "status": "pending",
  "createdAt": "2025-08-22T00:00:00.000Z",
  "updatedAt": "2025-08-22T00:00:00.000Z"
}
```

_Response (400 - Bad Request)_
```json
{ "message": "Username wajib diisi." }
{ "message": "Tidak dapat mengundang diri sendiri." }
{ "message": "Permintaan sudah pernah dibuat." }
```

_Response (404 - Not Found)_
```json
{ "message": "User tidak ditemukan." }
```

_Response (401 - Unauthorized)_
```json
{ "message": "Invalid token" }
```

---
### PUT /friends/:id/respond

> Accept or reject a friend request

_Request Header_
```json
{ "Authorization": "Bearer <access token>" }
```

_Request Body_
```json
{ "action": "accept" }
```

_Response (200)_
```json
{ "id": 123, "status": "accepted" }
```

_Alternative (200)_
```json
{ "id": 123, "status": "rejected" }
```

_Response (400 - Bad Request)_
```json
{ "message": "Undangan sudah diproses." }
{ "message": "Action tidak valid. Gunakan accept atau reject." }
```

_Response (403 - Forbidden)_
```json
{ "message": "Tidak berhak memproses undangan ini." }
```

_Response (404 - Not Found)_
```json
{ "message": "Undangan tidak ditemukan." }
```

_Response (401 - Unauthorized)_
```json
{ "message": "Invalid token" }
```

---
### DELETE /friends/:id/delete

> Delete friend relation

_Request Header_
```json
{ "Authorization": "Bearer <access token>" }
```

_Request Body_
```json
not needed
```

_Response (200)_
```json
{ "message": "Relasi pertemanan dihapus." }
```

_Response (403 - Forbidden)_
```json
{ "message": "Tidak berhak menghapus relasi ini." }
```

_Response (404 - Not Found)_
```json
{ "message": "Relasi tidak ditemukan." }
```

_Response (401 - Unauthorized)_
```json
{ "message": "Invalid token" }
```

---
### GET /reminders/actives

> List active reminders

_Request Header_
```json
{ "Authorization": "Bearer <access token>" }
```

_Query params_
```json
{ "search": "<text>", "filter": "<status>", "sort": "ASC|DESC" }
```

_Response (200)_
```json
[
  {
    "id": 55,
    "UserId": 1,
    "RecipientId": 1,
    "title": "Standup meeting",
    "dueAt": "2025-08-22T03:00:00.000Z",
    "repeat": "none",
    "repeatType": "once",
    "repeatInterval": null,
    "repeatEndDate": null,
    "isRecurring": false,
    "status": "scheduled",
    "formattedMessage": "Halo alice, waktunya Standup meeting! ✨",
    "createdAt": "2025-08-22T00:00:00.000Z",
    "updatedAt": "2025-08-22T00:00:00.000Z"
  }
]
```

_Response (401 - Unauthorized)_
```json
{ "message": "Invalid token" }
```

---
### PUT /reminders/cancel/:id

> Cancel a scheduled reminder

_Request Header_
```json
{ "Authorization": "Bearer <access token>" }
```

_Request Body_
```json
{ "status": "cancelled" }
```

_Response (200)_
```json
{ "message": "Reminder has been cancelled" }
```

_Response (400 - Bad Request)_
```json
{ "message": "Reminder is not active" }
```

_Response (404 - Not Found)_
```json
{ "message": "Reminder not found" }
```

_Response (401 - Unauthorized)_
```json
{ "message": "Invalid token" }
```

---
### DELETE /reminders/delete/:id

> Delete a reminder

_Request Header_
```json
{ "Authorization": "Bearer <access token>" }
```

_Request Body_
```json
not needed
```

_Response (200)_
```json
{ "message": "Reminder has been deleted" }
```

_Response (404 - Not Found)_
```json
{ "message": "Reminder not found" }
```

_Response (401 - Unauthorized)_
```json
{ "message": "Invalid token" }
```

---
### POST /wa/inbound

> WhatsApp inbound webhook (Twilio-like payload)

_Request Header_
```json
not needed
```

_Request Body_
```json
{ "Body": "<text message>", "From": "whatsapp:+62xxxx" }
```

_Response (200)_
```json
{ "ok": true }
```

_Notes_
- Jika nomor pengirim tidak terdaftar atau Body kosong, server tetap membalas 200 dengan `{ "ok": true }`.
- Pada error internal, server tetap membalas 200 `{ "ok": true }` dan mengirim pesan error ke pengguna via WhatsApp.

---
### Global Error

_Response (500 - Internal Server Error)_
```json
{ "message": "Internal server error" }
```
