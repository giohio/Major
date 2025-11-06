# ✅ Database Configuration Updated

## 📝 **Summary of Changes**

Đã cập nhật tất cả references về database name và credentials để phù hợp với `.env` file mới.

### **Database Information (from .env)**
```
Database Name: mental_care_db
Username: postgres
Password: postgres_db_metal_health_care
Host: localhost
Port: 5432
```

---

## 🔄 **Files Updated**

### **1. Configuration Files**
✅ `backend/app/config.py`
- Updated `SQLALCHEMY_DATABASE_URI` default value
- Updated `TestingConfig` database URI
- New: `postgresql://postgres:postgres_db_metal_health_care@localhost:5432/mental_care_db`

✅ `backend/.env.example`
- Updated `DATABASE_URL`
- Updated `POSTGRES_PASSWORD`
- Updated `POSTGRES_DB`

### **2. Documentation Files**
✅ `backend/QUICK_START.md`
- Updated Docker command
- Updated database creation commands
- Updated .env configuration example
- Updated troubleshooting section

✅ `backend/API_DOCUMENTATION.md`
- Updated environment configuration
- Updated database setup instructions

✅ `backend/SETUP.md`
- Updated database creation commands
- Updated .env configuration
- Updated troubleshooting/reset commands

✅ `backend/README.md`
- Updated quick start database creation command

### **3. Scripts**
✅ `backend/setup.ps1`
- Updated setup instructions message

---

## ✅ **Verified Changes**

Đã kiểm tra và xác nhận:
- ✅ No more references to `mindcare_db`
- ✅ All files use `mental_care_db`
- ✅ Password updated to `postgres_db_metal_health_care`
- ✅ Config.py reads from `DATABASE_URL` in .env (priority)
- ✅ Fallback values updated to match .env

---

## 🚀 **Ready to Use**

Backend đã được cập nhật hoàn toàn. Bạn có thể:

### **1. Create Database**
```bash
# Option 1: Using psql
psql -U postgres -c "CREATE DATABASE mental_care_db;"

# Option 2: Using psql interactive
psql -U postgres
CREATE DATABASE mental_care_db;
\q

# Option 3: Using Docker
docker run --name mindcare-postgres \
  -e POSTGRES_PASSWORD=postgres_db_metal_health_care \
  -e POSTGRES_DB=mental_care_db \
  -p 5432:5432 -d postgres:14
```

### **2. Run Migrations**
```bash
cd backend
flask db upgrade
```

### **3. Seed Data**
```bash
python -c "from app.seeds.seed_plans import seed_all; from app import create_app; seed_all(create_app())"
```

### **4. Start Server**
```bash
python app/main.py
# hoặc
flask run
```

---

## 📊 **Database Schema**

Sau khi chạy migrations, database `mental_care_db` sẽ có:

- ✅ 15+ tables (User, Plan, Payment, ChatSession, EmotionLog, Alert, etc.)
- ✅ Relationships & Foreign Keys
- ✅ Indexes for performance
- ✅ Seed data (6 plans, 2 AI models, 1 admin user)

---

## ✅ **All Set!**

Database configuration đã hoàn toàn phù hợp với `.env` file của bạn!

```
Database: mental_care_db ✅
Username: postgres ✅
Password: postgres_db_metal_health_care ✅
Connection String: postgresql://postgres:postgres_db_metal_health_care@localhost:5432/mental_care_db ✅
```

**Ready to run! 🚀**
