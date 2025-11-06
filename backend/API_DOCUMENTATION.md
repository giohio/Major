# MindCare AI - Backend API

AI-powered Mental Health Platform với hỗ trợ cho users, doctors và admins.

## 🚀 Tính năng chính

### 👥 3 Roles chính:
- **User/Patient**: Chat với AI, theo dõi cảm xúc, kết nối bác sĩ
- **Doctor**: Quản lý bệnh nhân, dashboard, tạo bài tập, video sessions
- **Admin**: Quản trị hệ thống, users, plans, analytics

### 🔥 Core Features:
- ✅ Authentication & Authorization (JWT)
- ✅ AI Chat với Gemini (emotion analysis + risk detection)
- ✅ Subscription Plans & Payment integration
- ✅ Real-time emotion tracking
- ✅ Alert system cho hành vi nguy hiểm
- ✅ Doctor dashboard & patient management
- ✅ Admin analytics & monitoring
- ✅ Role-based access control
- ✅ Plan-based feature gating

## 📋 Requirements

- Python 3.8+
- PostgreSQL 12+
- Google Gemini API Key

## 🛠 Installation

### 1. Clone và setup environment

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure environment

Copy `.env.example` to `.env` và cập nhật:

```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/mindcare_db

# Flask
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-here
FLASK_ENV=development

# Google AI
GOOGLE_API_KEY=your-gemini-api-key

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### 4. Setup database

```bash
# Create database
createdb mindcare_db

# Run migrations
flask db upgrade

# Seed initial data
python -m app.seeds.seed_plans
```

## 🎯 Running the Application

### Development mode:

```bash
# Windows
.\run.ps1

# Linux/Mac
python app/main.py
```

Server sẽ chạy tại: `http://localhost:5000`

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Đăng ký tài khoản mới |
| POST | `/auth/login` | Đăng nhập |
| POST | `/auth/verify-email` | Xác thực email |
| POST | `/auth/forgot-password` | Quên mật khẩu |
| POST | `/auth/reset-password` | Reset mật khẩu |
| POST | `/auth/refresh` | Refresh token |
| GET | `/auth/me` | Lấy thông tin user hiện tại |

### User Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/me` | Lấy profile |
| PUT | `/users/me` | Cập nhật profile |
| GET | `/users/subscription` | Thông tin subscription |
| GET | `/users/emotions` | Thống kê cảm xúc |
| GET | `/users/history` | Lịch sử chat |
| GET | `/users/stats` | Thống kê tổng quan |

### Chat Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/chat/send` | Gửi tin nhắn tới AI |
| GET | `/chat/session/:id` | Lấy messages trong session |
| GET | `/chat/recent` | Lấy sessions gần đây |
| DELETE | `/chat/session/:id` | Xóa session |
| POST | `/chat/session/:id/archive` | Archive session |
| POST | `/chat/feedback` | Gửi feedback |

### Plan Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/plans` | Danh sách plans |
| GET | `/plans/:id` | Chi tiết plan |
| GET | `/plans/current` | Plan hiện tại |
| POST | `/plans/subscribe` | Subscribe plan mới |
| POST | `/plans` | Tạo plan (Admin) |
| PUT | `/plans/:id` | Cập nhật plan (Admin) |

### Doctor Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/doctors/dashboard` | Dashboard overview |
| GET | `/doctors/patients` | Danh sách bệnh nhân |
| POST | `/doctors/patients/add` | Thêm bệnh nhân |
| GET | `/doctors/patients/:id` | Chi tiết bệnh nhân |
| POST | `/doctors/notes` | Tạo ghi chú |
| POST | `/doctors/tasks` | Tạo bài tập |
| GET | `/doctors/alerts` | Xem alerts |
| POST | `/doctors/session/start` | Bắt đầu session |
| POST | `/doctors/session/:id/end` | Kết thúc session |

### Admin Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/users` | Danh sách users |
| GET | `/admin/users/:id` | Chi tiết user |
| PUT | `/admin/users/:id` | Cập nhật user |
| DELETE | `/admin/users/:id` | Xóa user |
| GET | `/admin/doctors` | Danh sách doctors |
| GET | `/admin/plans` | Quản lý plans |
| GET | `/admin/models` | Quản lý AI models |
| POST | `/admin/models` | Thêm model mới |
| GET | `/admin/usage` | Usage statistics |
| GET | `/admin/logs` | System logs |
| GET | `/admin/stats/overview` | Dashboard overview |

## 🔐 Authentication

API sử dụng JWT tokens. Thêm token vào header:

```
Authorization: Bearer <your-token>
```

## 🎨 Database Models

### Core Models:
- **User**: Thông tin người dùng (user, doctor, admin)
- **Plan**: Gói dịch vụ
- **Payment**: Thanh toán
- **ChatSession**: Phiên chat
- **ChatMessage**: Tin nhắn
- **EmotionLog**: Log cảm xúc
- **Alert**: Cảnh báo
- **PatientRecord**: Hồ sơ bệnh nhân
- **DoctorProfile**: Profile bác sĩ
- **DoctorNote**: Ghi chú của bác sĩ
- **Task**: Bài tập/nhiệm vụ
- **TherapySession**: Phiên trị liệu
- **PsychologicalTest**: Bài test tâm lý
- **AIModel**: Cấu hình AI models

## 🧠 Services

### EmotionService
Phân tích cảm xúc từ text sử dụng Gemini AI:
- Detect primary emotion
- Sentiment scoring
- Risk assessment
- Emotion statistics

### AlertService
Phát hiện và quản lý cảnh báo:
- Keyword-based detection
- Risk level assessment
- Auto-alert creation
- Alert resolution

### ChatService
Quản lý chat với AI:
- Session management
- Message history
- Emotion analysis integration
- Context-aware responses

### PaymentService
Xử lý thanh toán:
- VNPay integration
- Subscription management
- Payment history
- Invoice generation

## 🔒 Middleware

### Authentication Middleware
- `token_required`: Xác thực JWT token
- `role_required`: Kiểm tra role
- `admin_required`: Chỉ admin
- `doctor_required`: Doctor hoặc admin

### Plan Middleware
- `plan_feature_required`: Kiểm tra feature trong plan
- `check_chat_limit`: Kiểm tra giới hạn chat

## 📊 Subscription Plans

### User Plans:
1. **Free**: 10 chats/month, basic features
2. **Pro**: Unlimited chats, voice, emotion tracking - 99k/month
3. **Clinical**: Full access + doctor consultations - 299k/month

### Doctor Plans:
1. **Basic**: 20 patients max - 499k/month
2. **Pro**: 50 patients + analytics - 999k/month
3. **Enterprise**: Unlimited patients - 2,999k/month

## 🚨 Alert System

Tự động phát hiện:
- Suicide risk keywords
- Self-harm indicators
- High stress levels
- Critical emotional states

## 🧪 Testing

```bash
# Run tests
pytest

# With coverage
pytest --cov=app tests/
```

## 📝 Seed Data

Chạy lệnh sau để khởi tạo:
- 6 subscription plans (3 user + 3 doctor)
- 2 AI models (Gemini Pro + Flash)
- 1 admin account (admin@mindcare.ai / Admin@123)

```bash
python -m app.seeds.seed_plans
```

## 🔄 Database Migrations

```bash
# Create migration
flask db migrate -m "Description"

# Apply migration
flask db upgrade

# Rollback
flask db downgrade
```

## 📦 Project Structure

```
backend/
├── app/
│   ├── __init__.py           # App factory
│   ├── config.py             # Configuration
│   ├── extensions.py         # Flask extensions
│   ├── models/
│   │   └── models.py         # Database models
│   ├── routes/               # API endpoints
│   │   ├── auth_routes.py
│   │   ├── user_routes.py
│   │   ├── chat_routes.py
│   │   ├── plan_routes.py
│   │   ├── doctor_routes.py
│   │   └── admin_routes.py
│   ├── services/             # Business logic
│   │   ├── chat_service.py
│   │   ├── emotion_service.py
│   │   ├── alert_service.py
│   │   └── payment_service.py
│   ├── middleware/           # Auth & permissions
│   │   ├── auth_middleware.py
│   │   ├── role_middleware.py
│   │   └── plan_middleware.py
│   └── seeds/                # Database seeds
│       └── seed_plans.py
├── migrations/               # Alembic migrations
├── requirements.txt
├── .env
└── README.md
```

## 🤝 Contributing

1. Fork the repo
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

MIT License

## 👥 Authors

- **Your Team** - Initial work

## 🙏 Acknowledgments

- Google Gemini AI
- Flask Community
- PostgreSQL Team
