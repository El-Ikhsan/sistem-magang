# Sistem Pendaftaran Magang Backend

Backend system untuk pendaftaran magang mahasiswa dengan Express.js, MySQL, dan MinIO.

## 🚀 Fitur Utama

- **Autentikasi & Otorisasi**: JWT dengan role admin dan peserta
- **Pendaftaran Magang**: Submit aplikasi dengan upload dokumen
- **Logbook Harian**: Sistem logbook dengan validasi admin
- **Sertifikat**: Generate dan download sertifikat
- **File Storage**: MinIO untuk penyimpanan file
- **Database**: MySQL dengan Knex.js query builder

## 📋 Prerequisites

- Node.js >= 16.x
- MySQL >= 8.0
- MinIO Server

## 🛠️ Installation

1. Clone repository
```bash
git clone <repository-url>
cd sistem-magang-backend
```

2. Install dependencies
```bash
npm install
```

3. Setup environment variables
```bash
cp .env.example .env
# Edit .env file dengan konfigurasi yang sesuai
```

4. Run database migrations
```bash
npm run migrate:latest
```

5. Seed admin user
```bash
npx knex seed:run
```

6. Start MinIO server (jika belum running)
```bash
# Download dan jalankan MinIO server
# https://min.io/download
```

7. Start development server
```bash
npm run dev
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register peserta baru
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get profile user
- `PUT /api/auth/me` - Update profile user

### Pendaftaran Magang
- `POST /api/pendaftaran` - Submit pendaftaran (peserta only)
- `GET /api/pendaftaran/me` - Get pendaftaran sendiri (peserta only)
- `GET /api/pendaftaran` - Get semua pendaftaran (admin only)
- `PUT /api/pendaftaran/:id/verify` - Verify pendaftaran (admin only)

### Logbook
- `POST /api/logbook` - Create logbook entry (peserta only)
- `GET /api/logbook/me` - Get logbook sendiri (peserta only)
- `PUT /api/logbook/:id` - Update logbook entry (peserta only)
- `GET /api/logbook` - Get semua logbook (admin only)
- `PUT /api/logbook/:id/validate` - Validate logbook (admin only)

## 🗄️ Database Schema

### Users Table
```sql
- id (primary key)
- name (varchar)
- email (varchar, unique)
- password (varchar)
- role (enum: admin, peserta)
- phone, university, major, npm (optional fields)
- status (enum: active, inactive)
- created_at, updated_at
```

### Pendaftaran Table
```sql
- id (primary key)
- user_id (foreign key to users)
- motivation_letter (text)
- start_date, end_date (dates)
- ktp_file_path, cv_file_path, certificate_file_path (varchar)
- status (enum: pending, approved, rejected)
- admin_notes (text)
- approved_by (foreign key to users)
- approved_at, created_at, updated_at
```

### Logbook Table
```sql
- id (primary key)
- user_id (foreign key to users)
- tanggal (date)
- kegiatan (varchar)
- deskripsi (text)
- jam_mulai, jam_selesai (time)
- status (enum: pending, validated, rejected)
- admin_feedback (text)
- validated_by (foreign key to users)
- validated_at, created_at, updated_at
```

### Sertifikat Table
```sql
- id (primary key)
- user_id (foreign key to users)
- certificate_number (varchar, unique)
- file_url (varchar)
- description (text)
- issued_date (date)
- issued_by (foreign key to users)
- created_at, updated_at
```

## 🔐 Authentication

Sistem menggunakan JWT tokens dengan format:
```json
{
  "id": "user_id",
  "email": "user_email",
  "role": "admin|peserta"
}
```

Header format:
```
Authorization: Bearer <jwt_token>
```

## 🏗️ Struktur Project

```
├── app.js                 # Main application
├── knexfile.js           # Knex configuration
├── config/               # Configuration files
│   ├── database.js
│   ├── minio.js
│   └── jwt.js
├── database/
│   ├── migrations/       # Database migrations
│   └── seeds/           # Database seeds
├── src/
│   ├── controllers/     # Route controllers
│   ├── middlewares/     # Custom middlewares
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   └── validators/      # Request validators
```

## 🚦 Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## 📝 Development

### Add Migration
```bash
npm run migrate:make migration_name
```

### Rollback Migration
```bash
npm run migrate:rollback
```

### Run Tests
```bash
npm test
```

## 🔧 Configuration

### Environment Variables
```
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=sistem_magang

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d

# MinIO
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=internship-files

# Server
PORT=3000
NODE_ENV=development
```

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

This project is licensed under the ISC License.