# Database Models Organization

This directory contains all database models organized by functionality for better maintainability.

## File Structure

### `models.py` (Import Hub)
Central import point for all models. Import models from here:
```python
from app.models.models import User, DoctorProfile, Payment, etc.
```

### Model Files by Category

#### 1. `user.py` - User Authentication & Accounts
- **User**: Core user model with authentication, OAuth, subscriptions

#### 2. `doctor.py` - Doctor Services
- **DoctorProfile**: Doctor information, specialization, ratings
- **Appointment**: Appointment scheduling and management

#### 3. `chat.py` - AI Chat System
- **ChatSession**: Chat sessions between users and AI
- **ChatMessage**: Individual messages with emotion detection
- **ChatFeedback**: User feedback on AI responses

#### 4. `emotion.py` - Mental Health Tracking
- **EmotionLog**: User emotion tracking over time
- **Alert**: Crisis alerts (self-harm, suicide risk, etc.)
- **PsychologicalTest**: PHQ-9, GAD-7, DASS-21 assessments

#### 5. `exercise.py` - Therapeutic Exercises
- **Exercise**: Breathing, meditation, CBT exercises
- **UserExerciseProgress**: User progress on exercises
- **Task**: Therapist-assigned tasks and homework

#### 6. `payment.py` - Subscriptions & Payments
- **Plan**: Subscription plans (Free, Pro, Clinical, etc.)
- **Payment**: Payment records (VNPay, MoMo, ZaloPay)

#### 7. `medical.py` - Medical Records
- **PatientRecord**: Medical history, allergies, emergency contacts
- **DoctorNote**: Doctor's notes on patients
- **TherapySession**: Therapy session records with AI summaries

#### 8. `ai_model.py` - AI Configuration
- **AIModel**: AI model configurations (Qwen, GPT-4, etc.)

#### 9. `doctor_reviews.py` - Doctor Reviews & Scheduling
- **DoctorReview**: Patient reviews and ratings
- **DoctorAvailability**: Doctor weekly availability
- **DoctorTimeOff**: Doctor vacation/time-off periods

## Total Models: 20

## Database Tables: 21
All models are properly registered with SQLAlchemy and available for migrations.

## Usage Examples

### Import all models
```python
from app.models.models import *
```

### Import specific models
```python
from app.models.models import User, Payment, ChatSession
```

### Import from specific file
```python
from app.models.user import User
from app.models.payment import Plan, Payment
```

## Migration Commands

### Check current migration state
```bash
flask db heads
```

### Create new migration
```bash
flask db migrate -m "description"
```

### Apply migrations
```bash
flask db upgrade
```

## Benefits of This Structure

✅ **Easy to Navigate**: Each category has its own file  
✅ **Better Maintainability**: Changes are isolated to specific files  
✅ **Clear Responsibilities**: Each file has a clear purpose  
✅ **Reduced Conflicts**: Multiple developers can work on different model files  
✅ **Better IDE Support**: Faster autocomplete and navigation  
✅ **Clean Imports**: Central import hub in models.py
