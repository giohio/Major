# Schema Tích Hợp Model AI - Phân Tích Cảm Xúc

## Tổng Quan

Hệ thống cần 2 loại phân tích khác nhau:
1. **Clinical Report** - Cho bác sĩ (chi tiết lâm sàng)
2. **Dashboard Analytics** - Cho user (đơn giản, dễ visualize)

---

## 1️⃣ CLINICAL REPORT (Dành cho Bác Sĩ)

### Input Schema

```json
{
  "analysis_type": "clinical_assessment",
  "session_id": "SESSION_9981",
  "user_id": 123,
  "conversation": [
    {
      "role": "user",
      "content": "Chào bác sĩ, dạo này tôi thấy mệt mỏi quá, chẳng muốn làm gì cả",
      "timestamp": "2025-12-12T10:00:00Z"
    },
    {
      "role": "assistant",
      "content": "Chào bạn. Bạn có thể chia sẻ thêm về cảm giác mệt mỏi đó được không?",
      "timestamp": "2025-12-12T10:01:00Z"
    },
    {
      "role": "user",
      "content": "Công việc áp lực, sếp thì cứ mắng. Tối về nhà tôi chỉ muốn ngủ mãi không dậy nữa cho xong",
      "timestamp": "2025-12-12T10:03:00Z"
    }
  ],
  "context": {
    "duration_minutes": 15,
    "message_count": 5,
    "session_date": "2025-12-12"
  },
  "include_clinical_details": true
}
```

### Output Schema (REQUIRED)

```json
{
  "session_id": "SESSION_9981",
  "report_type": "clinical_assessment",
  "timestamp": "2025-12-12T02:18:14Z",
  
  "dominant_emotion": "SADNESS",
  "emotional_changes": "Cảm xúc từ SADNESS chuyển sang ANGER và cuối cùng là JOY",
  
  "data_driven_analysis": {
    "dominant_emotion": "SADNESS",
    "emotional_progression": "SADNESS chuyển sang ANGER và cuối cùng là JOY",
    "intensity_trend": "decreasing"
  },
  
  "case_formulation": {
    "precipitants": [
      "Áp lực công việc",
      "Sự phê bình từ sếp"
    ],
    "automatic_thoughts": [
      "Công việc áp lực, sếp thì cứ mắng",
      "Tôi chỉ muốn ngủ mãi không dậy nữa"
    ],
    "maladaptive_behaviors": [
      "Muốn ngủ mãi không dậy",
      "Tránh né và cô lập"
    ],
    "core_beliefs": [
      "Cảm giác bất lực trước áp lực",
      "Tôi không đủ giỏi"
    ]
  },
  
  "risk_assessment": {
    "suicidal_ideation": false,
    "self_harm_risk": false,
    "severity_level": "moderate",
    "requires_immediate_intervention": false,
    "notes": "Bệnh nhân không thể hiện ý định tự tử, nhưng có dấu hiệu burnout"
  },
  
  "clinical_plan": {
    "interventions_used": [
      "Lắng nghe tích cực",
      "Tạo không gian an toàn",
      "Khuyến khích nói ra cảm xúc"
    ],
    "recommended_interventions": [
      "Cognitive Behavioral Therapy (CBT)",
      "Kỹ thuật thư giãn",
      "Tư vấn Work-life balance"
    ],
    "next_steps": [
      "Tiếp tục hỗ trợ quản lý cảm xúc",
      "Tìm giải pháp cho áp lực công việc",
      "Đánh giá lại sau 1-2 tuần"
    ],
    "follow_up_timeline": "1-2 tuần"
  },
  
  "summary": "Bệnh nhân thể hiện triệu chứng burnout và stress nghề nghiệp với cảm xúc chủ đạo là buồn bã. Có sự chuyển biến tích cực trong session khi bệnh nhân được lắng nghe."
}
```

### Validation Rules

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `dominant_emotion` | string | ✅ | One of: SADNESS, ANGER, JOY, FEAR, ANXIETY, NEUTRAL |
| `emotional_changes` | string | ✅ | Max 500 chars |
| `case_formulation.precipitants` | array[string] | ✅ | Min 1 item |
| `case_formulation.automatic_thoughts` | array[string] | ✅ | Min 1 item |
| `case_formulation.maladaptive_behaviors` | array[string] | ✅ | Min 1 item |
| `risk_assessment.suicidal_ideation` | boolean | ✅ | true/false |
| `risk_assessment.severity_level` | string | ✅ | low, moderate, high, critical |
| `clinical_plan.next_steps` | array[string] | ✅ | Min 1 item |
| `summary` | string | ✅ | Min 50 chars, max 1000 chars |

---

## 2️⃣ DASHBOARD ANALYTICS (Dành cho User)

### Input Schema

```json
{
  "analysis_type": "emotion_analytics",
  "session_id": "SESSION_9981",
  "user_id": 123,
  "conversation": [
    {
      "role": "user",
      "content": "Chào bác sĩ, dạo này tôi thấy mệt mỏi quá...",
      "timestamp": "2025-12-12T10:00:00Z"
    },
    {
      "role": "user",
      "content": "Công việc áp lực, sếp thì cứ mắng...",
      "timestamp": "2025-12-12T10:03:00Z"
    },
    {
      "role": "user",
      "content": "Cảm ơn bác sĩ đã lắng nghe, nói ra được tôi cũng thấy nhẹ hơn",
      "timestamp": "2025-12-12T10:05:00Z"
    }
  ],
  "context": {
    "duration_minutes": 15,
    "message_count": 5,
    "session_date": "2025-12-12"
  },
  "include_clinical_details": false
}
```

### Output Schema (REQUIRED)

```json
{
  "session_id": "SESSION_9981",
  "report_type": "emotion_analytics",
  "timestamp": "2025-12-12T02:18:14Z",
  
  "session_analysis": {
    "duration_minutes": 15,
    "total_messages": 5,
    "user_messages": 3,
    "dominant_emotion": "sadness",
    "emotional_breakdown": {
      "sadness": 0.33,
      "anger": 0.33,
      "joy": 0.33
    },
    "overall_sentiment": -0.15,
    "intensity_average": 0.635
  },
  
  "emotional_progression": [
    {
      "step": 1,
      "message_snippet": "Chào bác sĩ, dạo này tôi thấy mệt mỏi quá...",
      "emotion": "sadness",
      "intensity": 0.9614,
      "sentiment": -0.8,
      "timestamp": "2025-12-12T10:00:00Z"
    },
    {
      "step": 2,
      "message_snippet": "Công việc áp lực, sếp thì cứ mắng...",
      "emotion": "anger",
      "intensity": 0.3496,
      "sentiment": -0.5,
      "timestamp": "2025-12-12T10:03:00Z"
    },
    {
      "step": 3,
      "message_snippet": "Cảm ơn bác sĩ đã lắng nghe...",
      "emotion": "joy",
      "intensity": 0.5951,
      "sentiment": 0.6,
      "timestamp": "2025-12-12T10:05:00Z"
    }
  ],
  
  "triggers": {
    "primary": "Công việc",
    "secondary": ["Phê bình từ sếp", "Áp lực hiệu suất"],
    "frequency": "Cao"
  },
  
  "risk_indicators": {
    "level": "medium",
    "flags": ["burnout", "fatigue", "avoidance_behavior"]
  },
  
  "trend": "improving",
  
  "simple_summary": "Cảm xúc bắt đầu từ buồn bã, trải qua tức giận, và kết thúc với cảm giác nhẹ nhõm hơn."
}
```

### Validation Rules

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `session_analysis.dominant_emotion` | string | ✅ | lowercase: sadness, anger, joy, fear, anxiety, neutral |
| `session_analysis.emotional_breakdown` | object | ✅ | Sum of values = 1.0 (100%) |
| `session_analysis.overall_sentiment` | float | ✅ | Range: -1.0 to 1.0 |
| `session_analysis.intensity_average` | float | ✅ | Range: 0.0 to 1.0 |
| `emotional_progression` | array | ✅ | Min 1 item, max 20 items |
| `emotional_progression[].emotion` | string | ✅ | lowercase emotion names |
| `emotional_progression[].intensity` | float | ✅ | Range: 0.0 to 1.0 |
| `emotional_progression[].sentiment` | float | ✅ | Range: -1.0 to 1.0 |
| `emotional_progression[].message_snippet` | string | ✅ | Max 100 chars |
| `triggers.primary` | string | ✅ | Max 100 chars |
| `triggers.secondary` | array[string] | ❌ | Max 5 items |
| `risk_indicators.level` | string | ✅ | low, medium, high, critical |
| `trend` | string | ✅ | improving, stable, declining |
| `simple_summary` | string | ✅ | Min 20 chars, max 500 chars |

---

## 🔧 Hướng Dẫn Tích Hợp

### Bước 1: Nhận Request từ Backend

Backend sẽ gọi model của bạn qua:
- **REST API**: POST request đến endpoint của bạn
- **Python Function**: Gọi trực tiếp function
- **Message Queue**: RabbitMQ, Celery, etc.

### Bước 2: Xử Lý Input

```python
# Ví dụ: Flask API endpoint
@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.json
    
    analysis_type = data['analysis_type']
    conversation = data['conversation']
    
    if analysis_type == 'clinical_assessment':
        return analyze_clinical(conversation)
    else:
        return analyze_dashboard(conversation)
```

### Bước 3: Trả về đúng Schema

```python
def analyze_clinical(conversation):
    # Process conversation
    result = your_model.predict(conversation)
    
    # Map to required schema
    output = {
        "session_id": data['session_id'],
        "report_type": "clinical_assessment",
        "timestamp": datetime.utcnow().isoformat(),
        "dominant_emotion": result['emotion'],
        # ... map all required fields
    }
    
    return jsonify(output)
```

---

## 📊 Emotion Labels

### Standard Emotion Categories

| Emotion | Uppercase (Clinical) | Lowercase (Dashboard) | Description |
|---------|---------------------|----------------------|-------------|
| Buồn bã | SADNESS | sadness | Cảm giác buồn, chán nản |
| Tức giận | ANGER | anger | Giận dữ, khó chịu |
| Vui vẻ | JOY | joy | Hạnh phúc, tích cực |
| Lo lắng | ANXIETY | anxiety | Căng thẳng, lo âu |
| Sợ hãi | FEAR | fear | Sợ sệt, hoảng loạn |
| Trung lập | NEUTRAL | neutral | Không cảm xúc rõ ràng |

---

## ⚠️ Error Handling

### Nếu Model Không Phân Tích Được

Trả về fallback response:

```json
{
  "error": true,
  "error_message": "Model không thể phân tích conversation này",
  "fallback_data": {
    "dominant_emotion": "neutral",
    "overall_sentiment": 0.0,
    "simple_summary": "Không thể tạo tóm tắt tự động."
  }
}
```

### Timeout Handling

- Max processing time: 30 seconds
- Nếu quá 30s, backend sẽ dùng fallback

---

## 🧪 Test Cases

### Test Input Example

```json
{
  "analysis_type": "emotion_analytics",
  "session_id": "TEST_001",
  "user_id": 999,
  "conversation": [
    {
      "role": "user",
      "content": "Tôi cảm thấy rất buồn hôm nay",
      "timestamp": "2025-12-12T10:00:00Z"
    }
  ],
  "context": {
    "duration_minutes": 5,
    "message_count": 1,
    "session_date": "2025-12-12"
  }
}
```

### Expected Output

Dashboard Analytics response với all required fields

---

## 📞 API Endpoint (Nếu dùng REST API)

```
POST http://your-model-server:5001/api/v1/analyze
Content-Type: application/json

Body: {input schema như trên}
Response: {output schema như trên}
```

---

## ✅ Checklist Trước Khi Deploy

- [ ] Model nhận đúng input schema
- [ ] Model trả về đúng output schema
- [ ] Validate all required fields
- [ ] Handle timeout (< 30s)
- [ ] Handle error cases
- [ ] Test với conversation ngắn (1-2 messages)
- [ ] Test với conversation dài (20+ messages)
- [ ] Test với clinical_assessment type
- [ ] Test với emotion_analytics type
- [ ] Check sentiment score trong range -1.0 to 1.0
- [ ] Check intensity trong range 0.0 to 1.0
- [ ] Check emotional_breakdown sum = 1.0

---

## 🔗 Next Steps

1. Implement model theo schema này
2. Test với sample data trong `ml_training/data/test_sets/`
3. Báo khi ready để tích hợp vào backend
4. Backend team sẽ tạo API client để gọi model của bạn

