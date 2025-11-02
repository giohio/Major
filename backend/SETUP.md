# Backend Setup Instructions

## 📋 Yêu cầu hệ thống

- Python 3.9+
- PostgreSQL 12+
- pip

## 🚀 Cài đặt

### 1. Cài đặt PostgreSQL

**Windows:**
```bash
# Download from: https://www.postgresql.org/download/windows/
# Hoặc dùng Chocolatey:
choco install postgresql
```

### 2. Tạo Database

```bash
# Mở psql hoặc pgAdmin
psql -U postgres

# Tạo database
CREATE DATABASE mindcare_db;

# Kiểm tra
\l
```

### 3. Setup Backend

```bash
# Di chuyển vào thư mục backend
cd backend

# Tạo môi trường ảo
python -m venv venv

# Kích hoạt môi trường ảo
# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# Windows CMD:
venv\Scripts\activate.bat

# Cài đặt dependencies
pip install -r requirements.txt

# Copy file .env
copy .env.example .env
```

### 4. Cấu hình file .env

Mở file `.env` và cập nhật:

```bash
# Database - Thay đổi password của bạn
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/mindcare_db
POSTGRES_PASSWORD=YOUR_PASSWORD

# JWT Secret Keys - QUAN TRỌNG: Thay đổi trong production
SECRET_KEY=your-unique-secret-key-at-least-32-characters-long
JWT_SECRET_KEY=your-unique-jwt-secret-key-at-least-32-chars

# Google AI API Key (nếu có)
GOOGLE_API_KEY=your-google-ai-api-key
```

### 5. Chạy Migrations

```bash
# Khởi tạo migrations (nếu chưa có)
flask db init

# Tạo migration cho models
flask db migrate -m "Initial models"

# Áp dụng migrations
flask db upgrade
```

### 6. Seed dữ liệu mẫu

```bash
# Chạy seed data
python -m app.seeds.seed_data
```

Hoặc trong Python shell:

```python
from app import create_app
from app.seeds.seed_data import run_seeds

app = create_app()
with app.app_context():
    run_seeds()
```

### 7. Chạy server

```bash
# Development mode
python wsgi.py

# Hoặc dùng flask run
flask run

# Server sẽ chạy tại: http://127.0.0.1:5000
```

## 📝 Tài khoản test

### Admin
- **Email:** admin@mindcare.ai
- **Password:** Admin@123456

### Users
- **Email:** user1@example.com | **Password:** User@123456
- **Email:** user2@example.com | **Password:** User@123456
- **Email:** user3@example.com | **Password:** User@123456

### Doctors
- **Email:** doctor1@mindcare.ai | **Password:** Doctor@123456
- **Email:** doctor2@mindcare.ai | **Password:** Doctor@123456
- **Email:** doctor3@mindcare.ai | **Password:** Doctor@123456

## 🔌 API Endpoints

### Authentication

```bash
# Register
POST /api/auth/register
Content-Type: application/json
{
  "email": "user@example.com",
  "password": "User@123456",
  "full_name": "Nguyễn Văn A",
  "phone": "0912345678",
  "role": "user"
}

# Login
POST /api/auth/login
Content-Type: application/json
{
  "email": "user@example.com",
  "password": "User@123456"
}

# Get current user
GET /api/auth/me
Authorization: Bearer {access_token}

# Change password
POST /api/auth/change-password
Authorization: Bearer {access_token}
Content-Type: application/json
{
  "old_password": "User@123456",
  "new_password": "NewPassword@123"
}

# Refresh token
POST /api/auth/refresh
Authorization: Bearer {refresh_token}

# Logout
POST /api/auth/logout
Authorization: Bearer {access_token}
```

## 🗄️ Database Models

### User
- Base model cho tất cả users
- Roles: user, doctor, admin
- Subscription plans: free, personal, family

### DoctorProfile
- Thông tin bác sĩ (license, specialization, etc.)
- Relationship: One-to-One với User

### ChatSession & ChatMessage
- Lưu trữ các cuộc trò chuyện với AI
- Emotion detection & sentiment analysis

### EmotionLog
- Theo dõi cảm xúc của user theo thời gian
- Intensity scoring (1-10)

### Alert
- Cảnh báo sức khỏe tinh thần
- Severity levels: low, medium, high, critical

### Appointment
- Quản lý lịch hẹn với bác sĩ
- Status: scheduled, completed, cancelled, no_show

### Exercise
- Bài tập sức khỏe tinh thần
- Categories: breathing, meditation, journaling, CBT, etc.

## 🛠️ Troubleshooting

### Lỗi kết nối PostgreSQL

```bash
# Kiểm tra PostgreSQL đang chạy
# Windows:
Get-Service -Name postgresql*

# Nếu chưa chạy:
Start-Service postgresql-x64-14
```

### Lỗi migration

```bash
# Reset migrations
flask db downgrade
flask db upgrade

# Hoặc xóa database và tạo lại
DROP DATABASE mindcare_db;
CREATE DATABASE mindcare_db;
flask db upgrade
```

### Lỗi import bcrypt

```bash
# Cài lại bcrypt
pip uninstall flask-bcrypt bcrypt
pip install flask-bcrypt
```

## 📚 Tài liệu tham khảo

- [Flask Documentation](https://flask.palletsprojects.com/)
- [Flask-SQLAlchemy](https://flask-sqlalchemy.palletsprojects.com/)
- [Flask-JWT-Extended](https://flask-jwt-extended.readthedocs.io/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## 🔄 Development Workflow

```bash
# 1. Activate venv
.\venv\Scripts\Activate.ps1

# 2. Make model changes in app/models/models.py

# 3. Create migration
flask db migrate -m "Description of changes"

# 4. Review migration file in migrations/versions/

# 5. Apply migration
flask db upgrade

# 6. Test changes
python wsgi.py
```

## 🎯 Next Steps

1. ✅ PostgreSQL setup
2. ✅ Models created
3. ✅ Auth routes implemented
4. ✅ Seed data ready
5. ⏳ Connect frontend to backend
6. ⏳ Add more API endpoints (doctors, appointments, chat, etc.)
7. ⏳ Implement Google AI integration
8. ⏳ Add email verification
9. ⏳ Deploy to production
