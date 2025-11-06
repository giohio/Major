# 🚀 Quick Start Guide - MindCare AI Backend

## Bước 1: Cài đặt môi trường

### 1.1 Kiểm tra Python version
```bash
python --version  # Cần Python 3.8+
```

### 1.2 Tạo virtual environment
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### 1.3 Install dependencies
```bash
pip install -r requirements.txt
```

## Bước 2: Setup Database

### 2.1 Cài đặt PostgreSQL
- Download từ: https://www.postgresql.org/download/
- Hoặc dùng Docker:
```bash
docker run --name mindcare-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=mindcare_db -p 5432:5432 -d postgres:14
```

### 2.2 Tạo database
```bash
# Nếu dùng PostgreSQL local
createdb mindcare_db

# Hoặc dùng psql
psql -U postgres
CREATE DATABASE mindcare_db;
\q
```

## Bước 3: Configure Environment

### 3.1 Copy .env file
```bash
copy .env.example .env  # Windows
cp .env.example .env    # Linux/Mac
```

### 3.2 Cập nhật .env
Mở file `.env` và update:

```env
# Database - đổi password nếu cần
DATABASE_URL=postgresql://postgres:password@localhost:5432/mindcare_db

# JWT - tạo secret key mới
SECRET_KEY=your-random-secret-key-here-min-32-chars
JWT_SECRET_KEY=your-jwt-secret-key-here-min-32-chars

# Google Gemini API Key (BẮT BUỘC)
GOOGLE_API_KEY=AIzaSy...  # Lấy từ https://makersuite.google.com/app/apikey
```

### 3.3 Generate Secret Keys (Optional)
```python
# Chạy lệnh này để tạo random secret keys
python -c "import secrets; print(secrets.token_hex(32))"
```

## Bước 4: Setup Database Tables

### 4.1 Run migrations
```bash
flask db upgrade
```

Nếu lỗi, chạy:
```bash
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
```

### 4.2 Seed initial data
```bash
python -m app.seeds.seed_plans
```

Lệnh này sẽ tạo:
- ✅ 6 subscription plans (Free, Pro, Clinical + Doctor plans)
- ✅ 2 AI models (Gemini Pro, Gemini Flash)
- ✅ 1 admin account

**Admin credentials:**
- Email: `admin@mindcare.ai`
- Password: `Admin@123`
- ⚠️ **Đổi password ngay sau khi đăng nhập lần đầu!**

## Bước 5: Chạy Backend Server

### 5.1 Development mode
```bash
# Windows
.\run.ps1

# Linux/Mac
python app/main.py
```

Server sẽ chạy tại: **http://localhost:5000**

### 5.2 Kiểm tra server
Mở browser hoặc dùng curl:
```bash
curl http://localhost:5000/health
```

Response:
```json
{
  "status": "ok",
  "app": "MindCare AI"
}
```

## Bước 6: Test API

### 6.1 Register user mới
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Test@123",
    "full_name": "Test User"
  }'
```

### 6.2 Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Test@123"
  }'
```

Response sẽ chứa `access_token`. Copy token này!

### 6.3 Test Chat (dùng token từ login)
```bash
curl -X POST http://localhost:5000/api/chat/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -d '{
    "message": "Tôi cảm thấy hơi lo lắng"
  }'
```

## 🎉 Hoàn thành!

Backend đã sẵn sàng. Bạn có thể:

1. **Test với Postman/Insomnia**
   - Import collection từ API_DOCUMENTATION.md
   
2. **Kết nối với Frontend**
   - Update CORS_ORIGINS trong .env
   - Frontend connect tới http://localhost:5000/api

3. **Xem API docs**
   - Đọc file `API_DOCUMENTATION.md`
   - Hoặc access http://localhost:5000

## 🔧 Troubleshooting

### Lỗi: "ModuleNotFoundError"
```bash
pip install -r requirements.txt --force-reinstall
```

### Lỗi: "Database does not exist"
```bash
createdb mindcare_db
flask db upgrade
```

### Lỗi: "Google API Key invalid"
- Kiểm tra GOOGLE_API_KEY trong .env
- Lấy key mới tại: https://makersuite.google.com/app/apikey
- Enable Gemini API

### Lỗi: "Port 5000 already in use"
```bash
# Windows: tìm và kill process
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill -9
```

### Lỗi: "Flask command not found"
```bash
# Đảm bảo virtual environment đã activate
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac

# Hoặc dùng python -m
python -m flask db upgrade
```

## 📚 Next Steps

1. **Đọc API Documentation**: `API_DOCUMENTATION.md`
2. **Test tất cả endpoints**: Dùng Postman/Insomnia
3. **Customize Plans**: Update seed_plans.py theo nhu cầu
4. **Connect Frontend**: Update CORS và test integration
5. **Deploy**: Xem DEPLOYMENT.md (nếu có)

## 🆘 Need Help?

- Check `API_DOCUMENTATION.md` cho chi tiết API
- Xem logs: `tail -f app.log`
- Debug mode: Set `DEBUG=True` trong .env

## 🎯 Common Tasks

### Tạo user mới với role
```python
from app import create_app
from app.extensions import db
from app.models.models import User

app = create_app()
with app.app_context():
    user = User(
        email='doctor@example.com',
        full_name='Dr. Smith',
        role='doctor',  # user, doctor, admin
        subscription_plan='free',
        subscription_status='active',
        is_active=True,
        is_verified=True
    )
    user.set_password('Doctor@123')
    db.session.add(user)
    db.session.commit()
```

### Reset database
```bash
flask db downgrade base
flask db upgrade
python -m app.seeds.seed_plans
```

### View all routes
```bash
flask routes
```

---

✅ **Backend setup hoàn tất! Happy coding! 🚀**
