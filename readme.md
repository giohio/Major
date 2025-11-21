# 🏗️ MindCare AI - System Architecture Documentation

## 📋 Overview

**MindCare AI** is an intelligent mental healthcare platform that combines Machine Learning, RAG (Retrieval-Augmented Generation), and comprehensive patient management systems. The platform is designed to:

- **Classify user intent** into 4 categories: Emotional Support, Informational, Complex Consultation, High Risk
- **Provide contextual responses** powered by RAG with medical knowledge bases (DSM-5, ICD-11, mhGAP)
- **Detect crisis situations** in real-time and trigger emergency protocols
- **Track emotional patterns** and treatment outcomes over time
- **Ensure data security** with HIPAA-compliant architecture and encryption

### Tech Stack

**Backend**: Flask, PostgreSQL, SQLAlchemy, JWT Authentication  
**Frontend**: React, TypeScript, Vite  
**ML/AI**: Qwen LLM, ChromaDB (Vector Store), Google Gemini API  
**Infrastructure**: Nginx, Redis (Cache), Docker (optional)

---

## 🎯 Model Architecture

![Model Architecture](assert/architecture_diagram.png)

### 1. **Healthcare Input Layer**

The system accepts three primary input types:

- **Text Input**: User messages describing symptoms, concerns, or information requests
- **Emotion Scores**: Computed sentiment values from text analysis (ranges: -1.0 to 1.0)
- **Medical History**: Patient records including diagnoses, medications, and treatment history

These inputs are processed in parallel for comprehensive analysis.

### 2. **Multi-Endpoint Dimensional Analysis**

Parallel analysis pipeline processing three dimensions:

#### 🔍 **Text Analysis**
- **NLP Processing**: Tokenization, lemmatization, named entity recognition
- **Keyword Extraction**: Medical terms, symptom indicators, crisis keywords
- **Context Understanding**: Semantic analysis to detect implicit meanings

#### 📊 **Emotion Detection**
- **Sentiment Scoring**: Multi-class emotion classification (joy, sadness, anger, fear, surprise)
- **Stress Level Assessment**: Quantified stress indicators (0-100 scale)
- **Pattern Recognition**: Anomaly detection in emotional trajectories

#### 📁 **Medical Records Analysis**
- **History Integration**: Cross-reference with past diagnoses and treatments
- **Treatment Response Tracking**: Evaluate outcomes of previous interventions
- **Contraindication Checks**: Identify conflicts with current conditions

### 3. **Session Manager with Profile & History Storage**

**Responsibilities**:
- **Session State Management**: Maintains conversation context using session tokens
- **Profile Storage**: PostgreSQL-backed user profiles with encrypted sensitive data
- **History Logging**: Timestamped conversation logs with emotion snapshots
- **Progress Tracking**: Time-series analysis of emotional trends and treatment milestones

### 4. **Contextual Reasoning Engine**

#### 🔄 **RAG (Retrieval-Augmented Generation) Pipeline**

**Knowledge Sources**:
- **DSM-5**: Diagnostic and Statistical Manual of Mental Disorders (5th Edition)
- **ICD-11**: International Classification of Diseases (11th Revision)
- **mhGAP**: WHO Mental Health Gap Action Programme
- **mhGAP ver2**: Updated intervention guidelines

**Vector Database Architecture**:
```
vector_db/
├── dsm-5/           # 512-dim embeddings, ~2000 chunks
├── icd-11/          # 512-dim embeddings, ~1500 chunks  
├── mhgap/           # 512-dim embeddings, ~800 chunks
└── mhgap_ver2/      # 512-dim embeddings, ~900 chunks
```

**Retrieval Process**:
1. **Query Embedding**: Convert user input to 512-dimensional vector
2. **Semantic Search**: HNSW index search across all vector DBs (top-k=5)
3. **Reranking**: Cross-encoder model scores relevance (threshold=0.7)
4. **Context Synthesis**: Combine top chunks (max 2048 tokens) as LLM context

#### 🤖 **LLM-Based Reasoning**

- **Model**: Qwen2.5-7B-Instruct (quantized INT8)
- **Modes**:
  - **Deep Reasoning**: Multi-turn RAG with reflection (avg 15s latency)
  - **Quick Consult**: Single-turn RAG (avg 3s latency)
- **Context Window**: 32K tokens (8K reserved for retrieval context)

**Training Data Sources**:
- **Historical Conversations**: 10K+ anonymized chat sessions
- **Expert Annotations**: 500+ manually labeled high-quality responses
- **Medical Literature**: Preprocessed corpus from authoritative sources

### 5. **Intent Classification**

#### 🎭 **Text Reasoning Model**

**Model Architecture**: Fine-tuned transformer-based classifier  
**Training Data**: `Text_Reasoning_train.jsonl` (~5,400 samples)  
**Test Set**: `Text_Reasoning_test.jsonl` (~600 samples)  
**Total Dataset**: 6,000 samples (90/10 train/test split)  
**Accuracy**: Target >90% on test set  

**Data Generation Strategy**:
- **Synthetic Generation**: Rule-based templates with randomized vocabulary pools
- **Context Separation**: Distinct context pools for Complex vs High Risk to prevent overlap
  - Complex: Medical/physical contexts (sau sinh, sau phẫu thuật, tai nạn)
  - High Risk: Emotional/crisis contexts (bị bắt nạt, người yêu phản bội, vỡ nợ)
- **Deduplication**: Hash-based filtering to ensure unique samples
- **Generation Script**: `ml_training/scripts/training/Text_Reasoning_train_test.py`

**Classification Categories**:

**1. Emotional Support** 🟦 (40% of dataset = ~2,400 samples)
- **Indicators**: Expressions of loneliness, stress, frustration without medical urgency
- **Example**: "Tôi chán lắm, bị bạn xa lánh nên không biết làm sao"
- **Generation Pattern**: `{emotion} + {social/personal cause}`
- **Causes**: "bị sếp mắng", "vừa chia tay", "thi trượt", "crush có người yêu"
- **Response Strategy**: Empathetic validation + coping techniques + warm line resources
- **Latency**: ~2s (direct LLM generation, no RAG)

**2. Informational** 🔵 (25% of dataset = ~1,500 samples)
- **Indicators**: Questions about conditions, symptoms, treatments  
- **Example**: "Bác sĩ nói em bị ADHD, là gì?"
- **Query Types**: "là gì", "có triệu chứng gì", "chữa thế nào", "có di truyền không"
- **Concepts**: trầm cảm, lo âu, OCD, PTSD, ADHD, rối loạn lưỡng cực
- **Response Strategy**: RAG retrieval from medical knowledge bases + structured explanation
- **Latency**: ~3s (Quick Consult mode)

**3. Complex Consultation** 🟢 (25% of dataset = ~1,500 samples)
- **Indicators**: Medical contexts, treatment history, persistent symptoms
- **Example**: "Sau sinh, em bị mất ngủ. Đã uống thuốc 2 tháng vẫn vậy, có phải bệnh không?"
- **Key Feature**: **Medical/physical contexts** ("sau sinh", "từ lúc bị tai nạn", "sau phẫu thuật")
- **Symptoms**: mất ngủ, tim đập nhanh, đau đầu, run tay, khó thở, sợ đám đông
- **Medical Framing**: "Bác sĩ ơi", "Cho em hỏi", "Triệu chứng này"
- **Response Strategy**: Deep Reasoning mode + multi-source RAG + treatment recommendations
- **Latency**: ~15s (comprehensive analysis)

**4. High Risk** 🔴 (10% of dataset = ~600 samples, highest priority)
- **Indicators**: Suicidal ideation + **emotional/crisis contexts** (separated from medical)
- **Example**: "Bị bắt nạt liên tục, em mệt mỏi quá rồi. không còn lý do để ở lại"
- **Crisis Contexts**: "bị bắt nạt liên tục", "người yêu phản bội", "gia đình tan vỡ", "vỡ nợ"
- **Keywords**: "muốn chết", "tự tử", "nhảy lầu", "cuộc sống vô nghĩa", "đã viết thư"
- **Context Separation**: NO medical contexts (prevented overlapping with Complex Consultation)
- **Response Strategy**: **IMMEDIATE EMERGENCY PROTOCOL** (see Section 6)
- **Latency**: <5s (highest priority processing)

#### ⚠️ **Emergency Decision Gate**

**Classification Logic**: Binary classifier (emergency / non-emergency)  
**Decision Threshold**: Confidence score > 0.85 triggers emergency protocol  
**False Positive Rate**: <2% (tuned for high recall to ensure safety)  

- **YES** → Trigger Emergency Protocol (Section 6)
- **NO** → Continue to Response Processing (Section 7)

### 6. **Emergency Protocol** 🚨

**Activation Conditions**: High Risk classification + confidence > 0.85

**Automated Response Pipeline** (executes in parallel):

1. **Incident Logging** (~100ms)
   - Create database record with: user_id, message_id, timestamp, risk_score, detected_keywords
   - Set alert status: `PENDING`

2. **Real-time Notifications** (~500ms)
   - Send push notification to assigned doctor/therapist
   - Email alert to admin dashboard
   - SMS to emergency contact (if configured)

3. **Resource Display** (~200ms)
   - Show crisis hotline numbers (immediate clickable links)
   - Display nearest crisis center locations
   - Provide immediate safety tips and grounding techniques

4. **Follow-up Scheduling** (~300ms)
   - Schedule automated wellness check messages (15min, 1hr, 6hr intervals)
   - Flag account for priority review by clinical team

**Total Response Time**: <5 seconds from message detection to user notification

### 7. **Response Processing**

#### 💊 **Healthcare-Based Response Strategies**

Based on intent classification, the system routes to appropriate response generators:

**For Emotional Support**:
- Empathetic acknowledgment templates
- CBT-based coping strategies
- Warm line resources and peer support groups

**For Informational**:
- Structured medical information retrieval
- Plain language explanations of conditions
- Links to authoritative resources (DSM-5, WHO guidelines)

**For Complex Consultation**:
- Multi-source RAG with Deep Reasoning mode
- Treatment algorithm recommendations
- Suggestion to consult assigned doctor

#### 📚 **RAG-Powered Response Generation**

**1. Deep_Reasoning Mode** (for Complex Consultation)
- **Process**: Multi-turn retrieval → LLM reasoning → reflection → final response
- **Context Sources**: DSM-5 + ICD-11 + mhGAP + patient history
- **Output**: Detailed analysis, differential diagnosis, treatment options
- **Latency**: ~15s

**2. Quick_Consult Mode** (for Informational)
- **Process**: Single retrieval → LLM generation
- **Context Sources**: Top-5 relevant chunks from one knowledge base
- **Output**: Concise explanation with key facts
- **Latency**: ~3s

### 8. **Specialized Workflows** (Quy Trình Chuyên Biệt)

#### 📋 **Medication Logging (Meds)** (Ghi Nhật Ký Thuốc)
- Theo dõi lịch dùng thuốc
- Nhắc nhở uống thuốc
- Ghi nhận tác dụng phụ

#### 🔬 **Diagnostic Support** (Hỗ Trợ Chẩn Đoán)
- Hỗ trợ bác sĩ chẩn đoán
- Gợi ý các xét nghiệm
- Phân tích kết quả

#### 📊 **Treatment Planning** (Lập Kế Hoạch Điều Trị)
- Thiết kế kế hoạch điều trị cá nhân hóa
- Theo dõi tiến trình
- Điều chỉnh liệu pháp

### 9. **Feedback and Iteration** (Phản Hồi và Cải Tiến)

#### 🔄 **Continuous Learning** (Học Liên Tục)

- **Store to Knowledge Base**: Lưu vào cơ sở tri thức
- **User Feedback**: Phản hồi từ người dùng
- **Log with Patient Consent**: Ghi log với sự đồng ý bệnh nhân
- **Periodic Retraining**: Huấn luyện lại định kỳ

#### 📈 **Outcome Tracking** (Theo Dõi Kết Quả)

- **Post-Conversation Survey**: Khảo sát sau cuộc trò chuyện
- **Satisfaction Metrics**: Chỉ số hài lòng
- **Clinical Outcomes**: Kết quả lâm sàng
- **Safety Logs**: Nhật ký an toàn

### 10. **Feedback Loop to RAG Pipeline** (Vòng Phản Hồi đến RAG)

Dữ liệu từ feedback được sử dụng để:
- Cải thiện model
- Cập nhật knowledge base
- Tối ưu hóa retrieval
- Nâng cao độ chính xác

---

## 🏛️ Kiến Trúc Hệ Thống

### **Three-Tier Architecture** (Kiến Trúc 3 Tầng)

```
┌─────────────────────────────────────────┐
│         Frontend (React + Vite)         │
│    - User Interface                     │
│    - Chat Interface                     │
│    - Dashboard & Analytics              │
└─────────────────┬───────────────────────┘
                  │ REST API (HTTP/HTTPS)
┌─────────────────▼───────────────────────┐
│        Backend (Flask + Python)         │
│    - API Endpoints                      │
│    - Business Logic                     │
│    - Authentication & Authorization     │
│    - Session Management                 │
└─────────────────┬───────────────────────┘
                  │ SQL Queries
┌─────────────────▼───────────────────────┐
│      Database (PostgreSQL)              │
│    - User Data                          │
│    - Medical Records                    │
│    - Chat History                       │
│    - Emotion Logs                       │
└─────────────────────────────────────────┘
```

### **ML/AI Infrastructure** (Hạ Tầng ML/AI)

```
┌──────────────────────────────────────────┐
│    ML Training & Inference Layer         │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │  RAG System (Qwen Model)           │  │
│  │  - Text Reasoning                  │  │
│  │  - Deep Reasoning                  │  │
│  │  - Quick Consult                   │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │  Vector Databases (Chroma DB)      │  │
│  │  - DSM-5                           │  │
│  │  - ICD-11                          │  │
│  │  - mhGAP                           │  │
│  │  - mhGAP ver2                      │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │  Training Data                     │  │
│  │  - Text_Reasoning (train/test)     │  │
│  │  - Medical Corpus                  │  │
│  │  - Historical Patient Data         │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

---

## 📦 Component Details (Chi Tiết Các Thành Phần)

### **Frontend Components**

```typescript
src/
├── pages/
│   ├── ChatPage.tsx           // Giao diện chat chính
│   ├── DashboardPage.tsx      // Bảng điều khiển
│   ├── EmotionTrackingPage.tsx // Theo dõi cảm xúc
│   └── AppointmentPage.tsx    // Đặt lịch hẹn
│
├── components/
│   ├── ChatMessage.tsx        // Component tin nhắn
│   ├── EmotionChart.tsx       // Biểu đồ cảm xúc
│   └── AlertBadge.tsx         // Huy hiệu cảnh báo
│
└── services/
    ├── chatService.ts         // Service chat API
    ├── emotionService.ts      // Service phân tích cảm xúc
    └── authService.ts         // Service xác thực
```

### **Backend Modules**

```python
backend/app/
├── routes/
│   ├── chat_routes.py         # API chat & messaging
│   ├── emotion_routes.py      # API phân tích cảm xúc
│   ├── patient_routes.py      # API quản lý bệnh nhân
│   └── alert_routes.py        # API cảnh báo khẩn cấp
│
├── services/
│   ├── llm_service.py         # Service LLM (Gemini/Qwen)
│   ├── emotion_service.py     # Service phân tích cảm xúc
│   ├── chat_service.py        # Service xử lý chat
│   └── alert_service.py       # Service xử lý cảnh báo
│
├── models/
│   └── models.py              # Database models
│
└── middleware/
    ├── auth_middleware.py     # Xác thực JWT
    └── role_middleware.py     # Phân quyền người dùng
```

### **ML Training Pipeline**

```python
ml_training/
├── scripts/
│   ├── preprocessing/
│   │   ├── pdf_to_txt.py              # Chuyển đổi PDF → TXT
│   │   └── chunking_txt.py            # Chia nhỏ text
│   │
│   ├── vector_db/
│   │   └── build_vector_db.py         # Xây dựng Chroma DB
│   │
│   └── training/
│       └── Text_Reasoning_train_test.py  # Huấn luyện model
│
├── models/
│   └── rag_qwen.py                     # RAG implementation
│
└── data/
    ├── corpus_advice/                  # Corpus tư vấn
    ├── corpus_reasoning/               # Corpus lập luận
    └── test_sets/                      # Test datasets
        └── Text_Reasoning/
            ├── Text_Reasoning_train.jsonl
            └── Text_Reasoning_test.jsonl
```

---

## 🔄 Data Flow (Luồng Dữ Liệu)

### **1. User Message Flow** (Luồng Tin Nhắn Người Dùng)

```
User Input → Frontend Chat Interface
    ↓
POST /api/chat/send
    ↓
Backend API (chat_routes.py)
    ↓
┌──────────────────────────────────────┐
│  Parallel Processing:                │
│  1. Emotion Detection                │
│  2. Text Analysis                    │
│  3. Intent Classification            │
└──────────────┬───────────────────────┘
               ↓
    Is High Risk? (Emergency Check)
               ↓
        ┌──────┴──────┐
        │             │
       YES           NO
        │             │
        ↓             ↓
  Emergency      Normal Flow
  Protocol         ↓
        │      LLM Service
        │      (RAG + Qwen)
        │         ↓
        │    Generate Response
        │         ↓
        └────►Store to DB
                  ↓
          Return to Frontend
                  ↓
         Display to User
```

### **2. RAG Retrieval Flow** (Luồng Truy Xuất RAG)

```
User Query
    ↓
Embedding Generation (Vector)
    ↓
Semantic Search in Vector DBs
    ├── DSM-5 Vector DB
    ├── ICD-11 Vector DB
    ├── mhGAP Vector DB
    └── mhGAP ver2 Vector DB
    ↓
Retrieve Top-K Relevant Documents
    ↓
Context Ranking & Filtering
    ↓
Combine with User Query
    ↓
Send to LLM (Qwen Model)
    ↓
Generate Contextual Response
    ↓
Post-process & Format
    ↓
Return Response
```

### **3. Emergency Protocol Flow** (Luồng Giao Thức Khẩn Cấp)

```
High Risk Message Detected
    ↓
┌────────────────────────────────────┐
│  IMMEDIATE ACTIONS (Parallel):     │
│  1. Create Incident Record         │
│  2. Send Alert to Admin Dashboard  │
│  3. Notify Assigned Doctor         │
│  4. Log to Safety Database         │
└────────────┬───────────────────────┘
             ↓
Display Emergency Resources to User
    ├── Hotline Numbers
    ├── Crisis Centers
    └── Immediate Safety Tips
             ↓
Schedule Follow-up Check
             ↓
Monitor User Status
```

---

## 🔐 Security & Privacy (Bảo Mật & Quyền Riêng Tư)

### **Authentication Flow**

```
1. User Login → Backend validates credentials
2. Generate JWT Token (expires in 24h)
3. Store token in Frontend (httpOnly cookie)
4. Include token in all API requests
5. Backend validates token on each request
6. Refresh token before expiration
```

### **Data Protection**

- **Encryption**: Mã hóa dữ liệu nhạy cảm (AES-256)
- **Password Hashing**: Bcrypt với salt rounds
- **HIPAA Compliance**: Tuân thủ quy định bảo mật y tế
- **Consent Management**: Quản lý đồng ý sử dụng dữ liệu
- **Audit Logs**: Ghi log mọi truy cập dữ liệu nhạy cảm

---

## 📊 Database Schema (Lược Đồ Cơ Sở Dữ Liệu)

### **Core Tables**

```sql
Users
├── id (PK)
├── email
├── password_hash
├── role (user/doctor/admin)
├── profile_data
└── created_at

ChatSessions
├── id (PK)
├── user_id (FK → Users)
├── doctor_id (FK → Users)
├── status (active/closed)
├── risk_level (low/medium/high/emergency)
└── created_at

Messages
├── id (PK)
├── session_id (FK → ChatSessions)
├── sender_id (FK → Users)
├── content
├── emotion_scores (JSON)
├── intent_classification
└── timestamp

EmotionLogs
├── id (PK)
├── user_id (FK → Users)
├── session_id (FK → ChatSessions)
├── emotion_data (JSON)
├── analysis_result
└── logged_at

Alerts
├── id (PK)
├── user_id (FK → Users)
├── alert_type (high_risk/emergency)
├── message_id (FK → Messages)
├── status (pending/reviewed/resolved)
├── notified_doctor_id (FK → Users)
└── created_at

MedicalRecords
├── id (PK)
├── patient_id (FK → Users)
├── diagnosis
├── treatment_plan
├── medications (JSON)
└── updated_at
```

---

## 🚀 Deployment Architecture (Kiến Trúc Triển Khai)

```
┌───────────────────────────────────────────┐
│         Load Balancer (Nginx)             │
└───────────────┬───────────────────────────┘
                │
    ┌───────────┴───────────┐
    │                       │
┌───▼────────┐      ┌──────▼─────┐
│  Frontend  │      │  Frontend  │
│  Server 1  │      │  Server 2  │
└────────────┘      └────────────┘
                │
    ┌───────────┴───────────┐
    │                       │
┌───▼────────┐      ┌──────▼─────┐
│  Backend   │      │  Backend   │
│  Server 1  │      │  Server 2  │
└─────┬──────┘      └──────┬─────┘
      │                    │
      └──────────┬─────────┘
                 │
        ┌────────▼────────┐
        │   PostgreSQL    │
        │   (Primary)     │
        └────────┬────────┘
                 │
        ┌────────▼────────┐
        │   PostgreSQL    │
        │   (Replica)     │
        └─────────────────┘

┌─────────────────────────────────┐
│     ML Service (Separate)       │
│  - RAG System                   │
│  - Vector Databases             │
│  - Model Inference              │
└─────────────────────────────────┘
```

---

## 📈 Performance Optimization (Tối Ưu Hiệu Suất)

### **Backend Optimization**
- **Caching**: Redis cache cho frequent queries
- **Database Indexing**: Index trên các trường thường truy vấn
- **Query Optimization**: Sử dụng eager loading, join hiệu quả
- **Connection Pooling**: Quản lý kết nối database

### **ML/AI Optimization**
- **Model Quantization**: Giảm kích thước model
- **Batch Processing**: Xử lý nhiều requests cùng lúc
- **Vector DB Indexing**: HNSW index cho fast retrieval
- **Caching Embeddings**: Cache các embeddings thường dùng

### **Frontend Optimization**
- **Code Splitting**: Chia nhỏ bundle
- **Lazy Loading**: Load components khi cần
- **Image Optimization**: Compress và lazy load images
- **Service Worker**: Cache static assets

---

## 🔧 Configuration (Cấu Hình)

### **Backend Environment Variables**

```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost/mental_care_db

# JWT
JWT_SECRET_KEY=your-secret-key
JWT_ACCESS_TOKEN_EXPIRES=86400

# AI Services
GOOGLE_API_KEY=your-gemini-api-key
OPENAI_API_KEY=your-openai-key

# Email
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-password

# Emergency Contacts
EMERGENCY_HOTLINE=1800-xxx-xxx
CRISIS_CENTER_EMAIL=crisis@mindcare.ai
```

### **ML Training Configuration**

```json
{
  "model_config": {
    "model_name": "Qwen2.5-7B-Instruct",
    "max_tokens": 2048,
    "temperature": 0.7,
    "top_p": 0.9
  },
  "rag_config": {
    "vector_db_path": "./vector_db",
    "chunk_size": 512,
    "chunk_overlap": 50,
    "top_k": 5,
    "similarity_threshold": 0.7
  },
  "training_config": {
    "batch_size": 32,
    "learning_rate": 2e-5,
    "epochs": 3,
    "validation_split": 0.2
  }
}
```

---

## 🧪 Testing Strategy (Chiến Lược Kiểm Thử)

### **Unit Tests**
- Backend: pytest cho services và routes
- Frontend: Jest + React Testing Library
- ML Models: pytest cho RAG pipeline

### **Integration Tests**
- API endpoints testing
- Database operations testing
- ML model inference testing

### **End-to-End Tests**
- User journey testing (Playwright/Cypress)
- Chat flow testing
- Emergency protocol testing

### **Performance Tests**
- Load testing với Locust
- Stress testing cho database
- ML inference latency testing

---

## 📚 Documentation Links (Liên Kết Tài Liệu)

- [Backend API Documentation](./backend/COMPLETE_API_DOCS.md)
- [ML Training Guide](./ml_training/README.md)
- [Frontend Setup Guide](./frontend/README.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Security Guidelines](./SECURITY.md)

---

## 👥 Team & Roles (Nhóm & Vai Trò)

- **Backend Development**: Flask API, Database, Authentication
- **Frontend Development**: React UI, Chat Interface, Dashboards
- **ML/AI Development**: RAG System, Model Training, Vector DBs
- **DevOps**: Deployment, Monitoring, CI/CD
- **QA**: Testing, Quality Assurance
- **Medical Consultants**: Domain expertise, Protocol validation
