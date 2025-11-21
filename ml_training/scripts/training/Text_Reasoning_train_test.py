import json
import random
import os
from pathlib import Path

# ==============================================================================
# 1. CONFIGURATION
# ==============================================================================
SCRIPT_DIR = Path(__file__).parent.resolve()
TARGET_TOTAL = 6000       
TRAIN_RATIO = 0.9         
OUTPUT_TRAIN = SCRIPT_DIR / "../../data/test_sets/Text_Reasoning/Text_Reasoning_train.jsonl"
OUTPUT_TEST = SCRIPT_DIR / "../../data/test_sets/Text_Reasoning/Text_Reasoning_test.jsonl"

(SCRIPT_DIR / "../../data/test_sets/Text_Reasoning/").mkdir(parents=True, exist_ok=True)

DISTRIBUTION = {
    "emotional_support": 0.40,
    "informational": 0.25,
    "complex_consultation": 0.25,  # Increased from 0.20
    "high_risk": 0.10              # Decreased from 0.15
}

print("🔧 Fixed Data Generator V4 - Disambiguated Contexts")
print(f"🎯 Target: {TARGET_TOTAL} samples")

# ==============================================================================
# VOCABULARY (SEPARATED POOLS)
# ==============================================================================

pronouns = [
    "Em", "Mình", "Tớ", "Con", "Tôi", "Anh", "Chị", "Cháu"
]

timeframes = [
    "dạo này", "mấy hôm nay", "gần đây", "suốt tuần", 
    "từ hôm qua", "tự dưng", "cả tháng nay"
]

# EMOTIONAL SUPPORT
emo_feelings = [
    "buồn", "chán", "mệt mỏi", "cô đơn", "áp lực", 
    "stress", "tủi thân", "trống rỗng", "bất lực"
]

emo_causes = [
    "bị sếp mắng", "vừa chia tay", "thi trượt", "mất việc",
    "cãi nhau với bạn", "bố mẹ không hiểu", "deadline dí",
    "crush có người yêu", "bị bạn xa lánh"
]

# INFORMATIONAL
info_concepts = [
    "trầm cảm", "lo âu", "rối loạn lưỡng cực", "OCD", "PTSD",
    "mất ngủ", "stress", "burnout", "rối loạn ăn uống", "ADHD"
]

info_queries = [
    "là gì", "có triệu chứng gì", "nguy hiểm không", 
    "chữa thế nào", "dùng thuốc gì", "có di truyền không"
]

# COMPLEX CONSULTATION (Medical contexts - SEPARATED)
complex_symptoms = [
    "mất ngủ", "tim đập nhanh", "đau đầu", "run tay",
    "khó thở", "sụt cân", "ăn không ngon", "hay quên",
    "cáu gắt", "sợ đám đông", "không tập trung"
]

# ⭐ SEPARATED: Medical/Physical contexts (NOT emotional)
complex_contexts = [
    "sau sinh em bé",
    "từ lúc bị tai nạn giao thông",
    "sau phẫu thuật",
    "dùng thuốc tránh thai",
    "thay đổi môi trường sống",
    "chuyển công việc mới",
    "sau đợt thi đại học",
    "mãn kinh",
    "dùng thuốc điều trị bệnh khác"
]

# Medical framing (NEW)
medical_frames = [
    "Bác sĩ ơi,",
    "Cho em hỏi,",
    "Em đi khám thì bác sĩ nói",
    "Triệu chứng này",
    "Xin tư vấn,"
]

complex_history = [
    "đã đi khám nhưng không đỡ",
    "uống thuốc 2 tháng vẫn vậy",
    "thử CBT rồi nhưng không hiệu quả",
    "xét nghiệm đều bình thường"
]

# HIGH RISK (Emotional/Crisis contexts - SEPARATED)
# ⭐ SEPARATED: Emotional/Social crisis (NOT medical)
high_risk_contexts = [
    "bị bắt nạt liên tục",
    "mất hết tiền bạc do đánh bạc",
    "người yêu phản bội",
    "bị sa thải oan",
    "gia đình tan vỡ",
    "bị lừa tiền",
    "con bị bệnh nặng",
    "vỡ nợ",
    "bị tống giam oan",
    "mất người thân đột ngột"
]

# ADD: Stressful but medical contexts (for complex)
stress_medical_contexts = [
    "áp lực nợ nần",
    "áp lực công việc quá lớn",
    "áp lực thi cử",
    "mâu thuẫn vợ chồng kéo dài"
]

risk_subtle = [
    "cuộc sống vô nghĩa",
    "mọi người tốt hơn nếu không có em",
    "muốn ngủ một giấc thật dài",
    "đã viết thư cho mọi người",
    "không còn lý do để ở lại"
]

risk_explicit = [
    "muốn chết", "tự tử", "uống thuốc ngủ", "nhảy lầu",
    "rạch tay", "kết thúc cuộc đời"
]

# ==============================================================================
# GENERATORS (FIXED)
# ==============================================================================

def gen_emotional_support():
    """Emotional support samples"""
    pronoun = random.choice(pronouns)
    feel = random.choice(emo_feelings)
    cause = random.choice(emo_causes)
    
    styles = [
        f"{feel} quá, {cause}",
        f"{cause}, giờ {feel} vcl",
        f"{pronoun} {feel} lắm, {cause}",
        f"{cause} làm {pronoun} {feel}. Ai giúp em với"
    ]
    
    return random.choice(styles)

def gen_informational():
    """Informational queries"""
    concept = random.choice(info_concepts)
    query = random.choice(info_queries)
    
    if random.random() < 0.5:
        contexts = [
            f"Bác sĩ nói em bị {concept}",
            f"Em hay {random.choice(emo_feelings)}",
            f"Người thân em có dấu hiệu {concept}"
        ]
        return f"{random.choice(contexts)}, {query}?"
    else:
        prefixes = ["", "Cho hỏi ", "Mọi người ơi "]
        return f"{random.choice(prefixes)}{concept} {query}?"

def gen_complex_consultation():
    """
    Complex consultation with MEDICAL contexts
    Key fix: Add medical framing + separated contexts
    """
    pronoun = random.choice(pronouns)
    symp = random.choice(complex_symptoms)
    
    # 40%: Pure medical contexts
    if random.random() < 0.4:
        ctx = random.choice(complex_contexts)
        frame = random.choice(medical_frames)
        
        if random.random() < 0.5:
            history = random.choice(complex_history)
            return f"{frame} {ctx}, {pronoun} {symp}. {history}, có phải bệnh không?"
        else:
            return f"{frame} {ctx} làm {pronoun} bị {symp}. Nên khám chuyên khoa nào?"
    
    # 40%: Stress contexts with CLEAR medical framing (FIX for "áp lực nợ nần")
    elif random.random() < 0.8:
        ctx = random.choice(stress_medical_contexts)
        frame = random.choice(medical_frames)
        
        templates = [
            f"{frame} do {ctx}, em bị {symp}. Có phải rối loạn lo âu không?",
            f"{frame} {ctx} làm em {symp} suốt. Đã khám nhưng không rõ nguyên nhân?",
            f"Do stress vì {ctx}, em xuất hiện triệu chứng {symp}. Xin tư vấn?",
            f"Bác sĩ ơi, {ctx} khiến em {symp} kéo dài {random.choice(['2 tuần', '1 tháng'])}. Có cần dùng thuốc không?"
        ]
        return random.choice(templates)
    
    # 20%: Multiple symptoms
    else:
        ctx = random.choice(complex_contexts + stress_medical_contexts)
        symp2 = random.choice([s for s in complex_symptoms if s != symp])
        return f"{ctx}, {pronoun} vừa {symp} vừa {symp2}. Bác sĩ chẩn đoán giúp em?"

def gen_high_risk():
    """
    High risk samples with EMOTIONAL/CRISIS contexts only
    Key fix: Use separated high_risk_contexts (no medical overlap)
    """
    pronoun = random.choice(pronouns)
    
    # 70%: Subtle/Implicit
    if random.random() < 0.7:
        context = random.choice(high_risk_contexts)  # ← SEPARATED pool
        trigger = random.choice(risk_subtle)
        base = random.choice([
            f"{pronoun} cảm thấy cuộc sống vô nghĩa",
            f"{pronoun} mệt mỏi quá rồi",
            "Làm gì cũng sai"
        ])
        
        return f"{base} do {context}. {trigger}"
    
    # 30%: Semi-explicit with crisis context
    else:
        context = random.choice(high_risk_contexts)  # ← SEPARATED pool
        trigger = random.choice(risk_explicit)
        emotion = random.choice(emo_feelings)
        
        return f"{context}, {pronoun} {emotion} và muốn {trigger}. Xin lỗi mọi người"

# ==============================================================================
# MAIN PROCESS
# ==============================================================================

def main():
    data = []
    seen_hashes = set()
    
    generators = {
        "emotional_support": gen_emotional_support,
        "informational": gen_informational,
        "complex_consultation": gen_complex_consultation,
        "high_risk": gen_high_risk
    }

    print("\n⏳ Generating dataset with fixed context separation...")
    
    for label, ratio in DISTRIBUTION.items():
        target_count = int(TARGET_TOTAL * ratio)
        print(f"   🔹 Generating {label}: Target {target_count}...")
        
        count = 0
        attempts = 0
        max_attempts = target_count * 100
        
        while count < target_count and attempts < max_attempts:
            text = generators[label]()
            text = " ".join(text.split()).strip()
            
            if text not in seen_hashes:
                data.append({"text": text, "label": label})
                seen_hashes.add(text)
                count += 1
            
            attempts += 1
        
        print(f"   ✅ Generated {count} samples")

    # Shuffle and split
    random.shuffle(data)
    split_idx = int(len(data) * TRAIN_RATIO)
    train_data = data[:split_idx]
    test_data = data[split_idx:]

    # Save
    with open(OUTPUT_TRAIN, "w", encoding="utf-8") as f:
        for entry in train_data:
            json.dump(entry, f, ensure_ascii=False)
            f.write("\n")
    
    with open(OUTPUT_TEST, "w", encoding="utf-8") as f:
        for entry in test_data:
            json.dump(entry, f, ensure_ascii=False)
            f.write("\n")

    # Stats
    from collections import Counter
    counts = Counter([d['label'] for d in data])
    
    print("\n" + "="*60)
    print(f"🎉 COMPLETE! Generated {len(data)} samples")
    print(f"📁 Train: {len(train_data)} | Test: {len(test_data)}")
    print("\n📊 Label distribution:")
    for label, count in counts.items():
        print(f"   {label:25} {count:5} ({count/len(data)*100:.1f}%)")
    print("="*60)
    
    # Validate separation
    print("\n🔍 Context separation check:")
    medical_in_high_risk = sum(1 for d in data if d['label'] == 'high_risk' and 
                                any(ctx in d['text'] for ctx in complex_contexts))
    crisis_in_complex = sum(1 for d in data if d['label'] == 'complex_consultation' and 
                            any(ctx in d['text'] for ctx in high_risk_contexts))
    
    print(f"   Medical contexts in high_risk: {medical_in_high_risk} (should be ~0)")
    print(f"   Crisis contexts in complex: {crisis_in_complex} (should be ~0)")

if __name__ == "__main__":
    main()