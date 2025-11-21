import re, json, hashlib
from pathlib import Path
from typing import List, Tuple

# ==============================================================================
# 1. CẤU HÌNH HỆ THỐNG
# ==============================================================================
SCRIPT_DIR = Path(__file__).parent.resolve()
RAW_TXT_DIR = SCRIPT_DIR / "../../data/raw"
OUT_DIR_REASONING = SCRIPT_DIR / "../../data/corpus_reasoning" # Kho Bác sĩ
OUT_DIR_ADVICE    = SCRIPT_DIR / "../../data/corpus_advice"    # Kho Counselor

for p in [OUT_DIR_REASONING, OUT_DIR_ADVICE]:
    p.mkdir(parents=True, exist_ok=True)

# Cấu hình cắt đoạn
CHUNK_TARGET = 200  
CHUNK_MAX    = 350  # Nới rộng để giữ trọn vẹn danh sách A, B, C

ALLOW_CONDITIONS = set()

# ==============================================================================
# 2. BỘ NHẬN DIỆN (METADATA EXTRACTOR)
# ==============================================================================

def detect_source_from_file(name: str, content_sample: str) -> Tuple[str, str]:
    n = name.lower()
    c = content_sample.lower()
    if "mhgap" in n or "mh gap" in c: return "WHO mhGAP-IG 2023", "https://www.who.int/"
    if "icd11" in n or "icd-11" in n: return "WHO ICD-11", "https://icd.who.int/"
    if "dsm" in n: return "DSM-5", "https://psychiatry.org/"
    return "Everyday Essentials", ""

COND_HINTS = {
    "depress": "Depression", "anxiety": "Anxiety", "gad": "Anxiety",
    "panic": "Anxiety", "ptsd": "PTSD", "ocd": "OCD",
    "insomnia": "Sleep", "sleep": "Sleep", "substance": "SubstanceUse",
    "eating": "Eating", "suicid": "SuicideRisk", "self-harm": "SuicideRisk",
}
def infer_condition(file_name: str) -> str:
    n = file_name.lower()
    for k, v in COND_HINTS.items():
        if k in n: return v
    return "General"

# TỪ KHÓA PHÂN LOẠI
CLINICAL_SECTIONS = {
    "risk_safety": ["risk", "safety", "self-harm", "suicid", "crisis", "urgent", "danger", "emergency"],
    "screening_cues": ["screen", "assessment", "identify", "symptom", "criteria", "evaluate", "diagnos"],
    "referral": ["refer", "specialist", "urgent referral", "follow-up", "escalate"],
    "management": ["management", "treatment", "therapy", "cognitive", "antidepressant", "medication"],
    "psychoeducation": ["psychoeducation", "advice", "support", "self-help", "education"],
}
EVERYDAY_TOPICS = {
    "sleep": ["sleep", "insomnia", "sleep hygiene", "bedtime"],
    "stress": ["stress", "tension", "overwhelm", "relaxation", "breathing"],
    "study": ["study", "exam", "focus", "procrastination"],
    "work": ["work", "burnout", "deadline", "overwork"],
    "relationships": ["relationship", "family", "partner", "friends", "conflict"],
    "emotions": ["grief", "loss", "sadness", "lonely", "anger"]
}
ADVICE_SECTIONS = {
    "coping_skill": ["breath", "relax", "grounding", "mindfulness", "journaling", "reappraisal", "exercise"],
    "communication_tips": ["i-statement", "assertive", "boundary", "active listening"],
    "habits": ["sleep hygiene", "pomodoro", "time management", "routine", "schedule", "habit"]
}

# TỪ ĐIỂN DỊCH THUẬT MINI
GLOSS_MAP = {
    "depression":"trầm cảm","anxiety":"lo âu","suicide":"tự sát","self-harm":"tự hại",
    "ideation":"ý nghĩ","risk":"nguy cơ","safety":"an toàn","screening":"sàng lọc",
    "assessment":"đánh giá","referral":"chuyển tuyến","psychoeducation":"giáo dục tâm lý",
    "support":"hỗ trợ","urgent":"khẩn cấp","sleep":"giấc ngủ","hygiene":"vệ sinh giấc ngủ",
    "stress":"căng thẳng","breathing":"hít thở","grounding":"neo tâm trí","mindfulness":"chánh niệm",
    "communication":"giao tiếp","boundary":"ranh giới","assertive":"quả quyết",
    "study":"học tập","work":"công việc","burnout":"kiệt sức"
}

def normalize(text: str) -> str:
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"(^|\s)page\s*\d+(\s*of\s*\d+)?", " ", text, flags=re.I)
    return text.strip()

def detect_axes(text: str):
    tl = text.lower()
    clinical = [sec for sec, keys in CLINICAL_SECTIONS.items() if any(k in tl for k in keys)]
    life_topics = [tpc for tpc, keys in EVERYDAY_TOPICS.items() if any(k in tl for k in keys)]
    advice = [sec for sec, keys in ADVICE_SECTIONS.items() if any(k in tl for k in keys)]
    
    risk = "low"
    if any(k in tl for k in ["suicid", "self-harm", "kill myself", "end my life", "tự sát", "tự tử", "chết"]):
        risk = "high"
    elif any(k in tl for k in ["crisis", "urgent", "danger", "emergency", "cấp cứu"]):
        risk = "medium"

    return clinical, life_topics, advice, risk

def gloss_vi_short(text_en: str) -> str:
    sents = re.split(r"(?<=[\.\!\?])\s+", text_en.strip())
    pick = " ".join(sents[:2]) if sents else text_en
    low  = pick.lower()
    for en, vi in GLOSS_MAP.items():
        low = re.sub(rf"\b{re.escape(en)}\b", vi, low)
    low  = low[:1].upper() + low[1:]
    return (low[:220] + "...") if len(low) > 220 else low

def make_id(source: str, main_section: str, text: str) -> str:
    h = hashlib.sha1((main_section + text[:100]).encode()).hexdigest()[:8]
    src_tag = "mhgap" if "mhgap" in source.lower() else ("everyday" if "everyday" in source.lower() else "clinical")
    return f"{src_tag}#{main_section}_{h}"

# ==============================================================================
# 3. HÀM CẮT THÔNG MINH (STRUCTURE PRESERVING)
# ==============================================================================

def chunk_smart_preserve_structure(text: str) -> List[str]:
    """
    Giữ nguyên danh sách A. B. C. hoặc 1. 2. 3. để bảo toàn logic chẩn đoán.
    """
    text = re.sub(r'[ \t]+', ' ', text)
    lines = text.split('\n')
    
    chunks = []
    current_chunk = []
    current_wc = 0
    
    list_pattern = re.compile(r'^\s*(\d+\.|[A-Z]\.|-|•|\*)\s+')

    for line in lines:
        line = line.strip()
        if not line: continue
        wc = len(line.split())
        is_list_item = bool(list_pattern.match(line))
        
        if current_wc + wc <= CHUNK_TARGET:
            current_chunk.append(line)
            current_wc += wc
        elif is_list_item and (current_wc + wc <= CHUNK_MAX):
            current_chunk.append(line)
            current_wc += wc
        else:
            if current_chunk: chunks.append("\n".join(current_chunk))
            overlap = current_chunk[-2:] if len(current_chunk) > 2 else current_chunk[-1:]
            current_chunk = overlap + [line]
            current_wc = sum(len(l.split()) for l in current_chunk)

    if current_chunk: chunks.append("\n".join(current_chunk))
    return chunks

# ==============================================================================
# 4. MAIN LOOP: LOGIC ĐỊNH TUYẾN AN TOÀN (SAFETY ROUTING)
# ==============================================================================

def main():
    stats = {
        "reasoning": 0, 
        "advice": 0, 
        "high_risk_blocked": 0,
        "clinical_source_blocked": 0 
    }
    print(f"🚀 Bắt đầu Routing V5 (DSM/ICD Hard Block)...")

    for path in sorted(RAW_TXT_DIR.glob("*.txt")):
        raw = path.read_text("utf-8", errors="ignore")
        sample = raw[:2000]
        source, url = detect_source_from_file(path.name, sample)
        condition = infer_condition(path.name)

        chunks = chunk_smart_preserve_structure(raw)

        for ch in chunks:
            clinical_sec, life_topics, advice_sec, risk_band = detect_axes(ch)

            if not (clinical_sec or life_topics or advice_sec):
                continue

            main_sec = (clinical_sec[0] if clinical_sec else (advice_sec[0] if advice_sec else "general"))
            title_en = f"{condition} — {main_sec.replace('_',' ').title()}"
            gloss_vi = gloss_vi_short(ch)
            sid = make_id(source, main_sec, ch)

            item = {
                "id": sid,
                "content": ch,
                "metadata": {
                    "source": source,
                    "url": url,
                    "condition": condition,
                    "risk_band": risk_band,
                    "topics": life_topics + advice_sec + clinical_sec,
                    "is_clinical": bool(clinical_sec),
                    "is_advice": False 
                },
                "index_text": f"{title_en} {ch} {gloss_vi}"
            }

            # ------------------------------------------------------
            # 🛑 QUY TẮC AN TOÀN CỐT LÕI (CORE SAFETY RULES)
            # ------------------------------------------------------
            
            # Biến cờ nhận diện nguồn Chẩn đoán thuần túy
            is_pure_diagnostic_source = "dsm" in source.lower() or "icd" in source.lower()

            # 🟢 KHO 1: REASONING (Bác sĩ) - Lưu tất cả những gì có mùi Y khoa
            if clinical_sec or "who" in source.lower() or is_pure_diagnostic_source:
                subdir = OUT_DIR_REASONING / path.stem.lower()
                subdir.mkdir(exist_ok=True)
                with open(subdir / f"{sid}.json", "w", encoding="utf-8") as f:
                    json.dump(item, f, ensure_ascii=False, indent=2)
                stats["reasoning"] += 1

            # 🟠 KHO 2: ADVICE (Counselor) - Chỉ lưu Lời khuyên An toàn
            has_advice_content = (advice_sec or life_topics or "psychoeducation" in clinical_sec)
            
            if has_advice_content:
                # 🔒 RULE 1: CHẶN High Risk (Tự sát -> Không khuyên lung tung)
                if risk_band == "high":
                    stats["high_risk_blocked"] += 1
                    continue 

                # 🔒 RULE 2: CHẶN Nguồn Chẩn đoán (DSM/ICD -> Không phải lời khuyên)
                # Đây là fix cho trường hợp ASD "Habit" bạn phát hiện
                if is_pure_diagnostic_source:
                    stats["clinical_source_blocked"] += 1
                    continue

                # ✅ Đã qua các chốt chặn -> Lưu vào Advice
                subdir = OUT_DIR_ADVICE / path.stem.lower()
                subdir.mkdir(exist_ok=True)
                
                item_advice = item.copy()
                item_advice["metadata"]["is_advice"] = True
                item_advice["id"] = f"adv_{sid}"
                
                with open(subdir / f"adv_{sid}.json", "w", encoding="utf-8") as f:
                    json.dump(item_advice, f, ensure_ascii=False, indent=2)
                stats["advice"] += 1

    print(f"="*50)
    print(f"📊 THỐNG KÊ FINAL:")
    print(f"   ✅ Reasoning DB:    {stats['reasoning']} chunks (Gồm cả DSM/ICD/mhGAP)")
    print(f"   ✅ Advice DB:       {stats['advice']} chunks (Sạch, an toàn)")
    print(f"   🛡️ Chặn High-Risk:  {stats['high_risk_blocked']} chunks")
    print(f"   🛡️ Chặn DSM/ICD:    {stats['clinical_source_blocked']} chunks (Loại bỏ False Positive)")
    print(f"="*50)

if __name__ == "__main__":
    main()