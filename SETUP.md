# MindCare AI - Setup & Deployment Guide

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL 12+

### Backend Setup

1. **Install Dependencies**
```bash
cd backend
pip install -r requirements.txt
```

2. **Environment Variables**
Create `.env` file:
```env
DATABASE_URL=postgresql://user:password@localhost/mindcare_db
JWT_SECRET_KEY=your-secret-key-here
GEMINI_API_KEY=your-gemini-api-key
FLASK_ENV=development
```

3. **Initialize Database**
```bash
# Create database
createdb mindcare_db

# Run migrations (if needed)
python migrate_user_fields.py

# Seed database with test data
python seed_database.py
```

4. **Run Backend**
```bash
python run.py
```
Backend will run on `http://localhost:5000`

### Frontend Setup

1. **Install Dependencies**
```bash
cd frontend
npm install
```

2. **Environment Variables**
Create `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
```

3. **Run Frontend**
```bash
npm run dev
```
Frontend will run on `http://localhost:5173`

---

## 🧪 Test Accounts

After running `seed_database.py`, you can login with:

**Admin:**
- Email: `admin@mindcare.ai`
- Password: `Admin@123`

**Users:**
- `user1@test.com` / `User@123` (Pro Plan)
- `user2@test.com` / `User@123` (Clinical Plan)
- `user3@test.com` / `User@123` (Free Plan)

**Doctors:**
- `doctor1@mindcare.ai` / `Doctor@123`
- `doctor2@mindcare.ai` / `Doctor@123`
- `doctor3@mindcare.ai` / `Doctor@123`
- `doctor4@mindcare.ai` / `Doctor@123`
- `doctor5@mindcare.ai` / `Doctor@123`

---

## 📋 Features Implemented

### ✅ Completed (6/11 - 55%)

**CRITICAL Priority:**
- ✅ ChatBot AI Integration (Google Gemini)
- ✅ Change Password
- ✅ Settings Persistence

**HIGH Priority:**
- ✅ Load Doctors from API
- ✅ Profile Fields (DOB & Address)

**MEDIUM Priority:**
- ✅ Subscription Management

### 🔄 Remaining (Optional)

**HIGH Priority:**
- ⏳ Exercises System

**MEDIUM Priority:**
- ⏳ Two-Factor Authentication
- ⏳ Payment Invoice Download

**LOW Priority:**
- ⏳ Danger Zone Actions
- ⏳ Privacy & Data Export

---

## 🏗️ Project Structure

```
Major/
├── backend/
│   ├── app/
│   │   ├── models/
│   │   │   └── models.py          # Database models
│   │   ├── routes/
│   │   │   ├── auth_routes.py     # Authentication endpoints
│   │   │   ├── user_routes.py     # User management endpoints
│   │   │   ├── chat_routes.py     # Chat & AI endpoints
│   │   │   └── ...
│   │   ├── services/
│   │   │   ├── ai_service.py      # Gemini AI integration
│   │   │   └── ...
│   │   └── extensions.py          # Flask extensions
│   ├── seed_database.py           # Database seeding script
│   ├── migrate_user_fields.py     # Migration script
│   └── run.py                     # Application entry point
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   └── User/
    │   │       ├── ChatBot.tsx    # AI Chat interface
    │   │       ├── Profile.tsx    # User profile
    │   │       ├── Settings.tsx   # User settings
    │   │       └── FindDoctor.tsx # Doctor search
    │   ├── services/
    │   │   └── api.client.ts      # API client
    │   ├── config/
    │   │   └── api.config.ts      # API endpoints
    │   └── types/
    │       └── api.types.ts       # TypeScript types
    └── package.json
```

---

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/refresh` - Refresh token

### Users
- `GET /api/users/me` - Get current user
- `PUT /api/users/me` - Update profile
- `GET /api/users/settings` - Get user settings
- `PUT /api/users/settings` - Update settings
- `GET /api/users/emotions` - Get emotion stats
- `GET /api/users/stats` - Get user statistics

### Chat
- `POST /api/chat/send` - Send message to AI
- `GET /api/chat/recent` - Get recent sessions
- `GET /api/chat/session/:id` - Get session messages
- `DELETE /api/chat/session/:id` - Delete session

### Doctors
- `GET /api/doctors` - List all doctors
- `GET /api/doctors/:id` - Get doctor details

### Appointments
- `GET /api/users/appointments` - Get user appointments
- `POST /api/users/appointments` - Book appointment
- `PUT /api/users/appointments/:id` - Update appointment

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm run test
```

### Manual Testing Checklist

**ChatBot:**
- [ ] Send message and receive AI response
- [ ] Emotion analysis works
- [ ] High-risk alerts are created

**Profile:**
- [ ] Update name, phone, DOB, address
- [ ] Change password
- [ ] View subscription details

**Settings:**
- [ ] Toggle notifications
- [ ] Change theme/language
- [ ] Settings persist after refresh

**Find Doctor:**
- [ ] View doctor list
- [ ] Search by name
- [ ] Filter by specialty

---

## 🚢 Deployment

### Backend (Production)

1. **Set Production Environment**
```env
FLASK_ENV=production
DATABASE_URL=your-production-db-url
JWT_SECRET_KEY=strong-random-secret
```

2. **Use Gunicorn**
```bash
gunicorn -w 4 -b 0.0.0.0:5000 run:app
```

### Frontend (Production)

1. **Build**
```bash
npm run build
```

2. **Serve with Nginx/Apache**
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        root /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:5000;
    }
}
```

---

## 📝 Notes

- All CRITICAL features are complete and tested
- Backend has 80+ API endpoints
- Frontend integration ~60% complete
- Comprehensive test data available via seed script
- Ready for production deployment with minor adjustments

---

## 🆘 Troubleshooting

**Database connection error:**
- Check PostgreSQL is running
- Verify DATABASE_URL in .env

**AI not responding:**
- Check GEMINI_API_KEY is valid
- Verify internet connection

**Frontend can't connect to backend:**
- Ensure backend is running on port 5000
- Check VITE_API_URL in frontend .env

---

## 📞 Support

For issues or questions, check:
- Backend logs: `backend/logs/`
- Frontend console: Browser DevTools
- Database: `psql mindcare_db`
