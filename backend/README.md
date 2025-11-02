# 🧠 MindCare AI Backend

Backend REST API cho ứng dụng sức khỏe tinh thần MindCare AI, được xây dựng với Flask, PostgreSQL và JWT authentication.

## ✨ Tính năng

- 🔐 Authentication & Authorization (JWT)
- 👥 Multi-role system (User, Doctor, Admin)
- 💬 AI Chat với emotion detection
- 📊 Emotion logging & tracking
- 📅 Appointment booking system
- 🧘 Mental health exercises library
- 🚨 Alert system cho sức khỏe tinh thần
- 💳 Subscription management

## 🛠️ Tech Stack

- **Framework:** Flask 3.0
- **Database:** PostgreSQL 12+
- **ORM:** Flask-SQLAlchemy 3.1
- **Migration:** Flask-Migrate 4.0
- **Authentication:** Flask-JWT-Extended 4.6
- **Password Hashing:** Flask-Bcrypt 1.0
- **CORS:** Flask-Cors 4.0
- **AI:** Google Generative AI (Gemini)

## 🚀 Quick Start

### Setup tự động (Khuyến nghị)

```powershell
# 1. Chạy setup script
cd backend
.\setup.ps1

# 2. Chỉnh sửa file .env với thông tin của bạn

# 3. Tạo database
psql -U postgres -c "CREATE DATABASE mindcare_db;"

# 4. Chạy server
.\run.ps1
```

Server sẽ chạy tại: **http://127.0.0.1:5000**

## 👤 Tài khoản Test

### Admin
- **Email:** admin@mindcare.ai
- **Password:** Admin@123456

### Users
- user1@example.com / User@123456 (Personal plan)
- user2@example.com / User@123456 (Family plan)
- user3@example.com / User@123456 (Free plan)

### Doctors
- doctor1@mindcare.ai / Doctor@123456 (Tâm lý lâm sàng)
- doctor2@mindcare.ai / Doctor@123456 (Tâm thần học)
- doctor3@mindcare.ai / Doctor@123456 (Tâm lý trẻ em)

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Thông tin user hiện tại
- `POST /api/auth/change-password` - Đổi mật khẩu
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Đăng xuất

### Health Check
- `GET /health` - Kiểm tra server status

## 📚 Documentation

Xem [SETUP.md](SETUP.md) cho hướng dẫn chi tiết về:
- Cài đặt PostgreSQL
- Cấu hình environment variables
- Database migrations
- Troubleshooting

## 🗄️ Database Models

- **User** - Users với roles (user/doctor/admin)
- **DoctorProfile** - Thông tin bác sĩ
- **ChatSession & ChatMessage** - AI chat history
- **EmotionLog** - Emotion tracking
- **Alert** - Mental health alerts
- **Appointment** - Booking system
- **Exercise** - Mental health exercises

## 🔧 Development

```powershell
# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Run migrations after model changes
flask db migrate -m "Description"
flask db upgrade

# Start development server
python wsgi.py
```

---

Made with ❤️ by MindCare AI Team
