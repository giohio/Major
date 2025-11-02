import re, json, hashlib
from pathlib import Path
from typing import List, Tuple

# ========= CẤU HÌNH =========
RAW_TXT_DIR = Path("raw_txt")           # tất cả .txt nằm ở đây
OUT_DIR     = Path("data_corpus_2")       # nơi xuất snippets .json
OUT_DIR.mkdir(parents=True, exist_ok=True)

# Kích thước & overlap
MIN_WORDS   = 120
MAX_WORDS   = 220
OVERLAP_FR  = 0.20    # 20%

CHUNK_CONFIG = {
    "clinical":  (120, 220, 0.20),
    "everyday":  (80, 160, 0.15),
    "advice":    (80, 140, 0.10),
}

# Nếu muốn chỉ giữ 1 số condition (để MVP gọn). Để set() nếu giữ tất cả.
ALLOW_CONDITIONS = set()   # giữ trống để lấy tất cả

# Nhận diện nguồn theo tên file hoặc nội dung
def detect_source_from_file(name: str, content_sample: str) -> Tuple[str, str]:
    n = name.lower()
    c = content_sample.lower()
    if "mhgap" in n or "mh gap" in c:
        return "WHO mhGAP-IG 2023", "https://www.who.int/"
    if "icd11" in n or "icd-11" in n or "icd 11" in c:
        return "WHO ICD-11", "https://icd.who.int/"
    return "Everyday Essentials", ""

# Suy đoán condition theo tên file
COND_HINTS = {
    "depress": "Depression",
    "anxiety": "Anxiety",
    "gad": "Anxiety",
    "panic": "Anxiety",
    "ptsd": "PTSD",
    "ocd": "OCD",
    "insomnia": "Sleep",
    "sleep": "Sleep",
    "substance": "SubstanceUse",
    "eating": "Eating",
    "suicid": "SuicideRisk",
    "self-harm": "SuicideRisk",
}
def infer_condition(file_name: str) -> str:
    n = file_name.lower()
    for k, v in COND_HINTS.items():
        if k in n:
            return v
    return "General"

# Từ khóa gán nhãn
CLINICAL_SECTIONS = {
    "risk_safety": ["risk", "safety", "self-harm", "suicid", "crisis", "urgent", "danger"],
    "screening_cues": ["screen", "assessment", "identify", "symptom", "criteria", "evaluate"],
    "referral": ["refer", "specialist", "urgent referral", "follow-up", "escalate"],
    "psychoeducation": ["psychoeducation", "advice", "support", "self-help", "education"],
    "do_not_do": ["do not", "avoid", "contraindicat", "not recommended"]
}
CLINICAL_SECTIONS.update({
    "management": ["management", "treatment", "therapy", "cognitive", "antidepressant", "follow-up"],
    "caregiver": ["family", "caregiver", "support person", "guardian"]
})
EVERYDAY_TOPICS = {
    "sleep": ["sleep", "insomnia", "sleep hygiene", "bedtime", "circadian"],
    "stress": ["stress", "tension", "overwhelm", "relaxation", "breathing"],
    "study": ["study", "exam", "focus", "procrastination", "time management"],
    "work": ["work", "burnout", "deadline", "overwork", "workload"],
    "relationships": ["relationship", "family", "partner", "friends", "conflict", "boundary"],
    "self_esteem": ["self-esteem", "confidence", "negative self-talk"],
    "digital": ["phone", "social media", "screen time", "doomscroll"],
    "grief": ["grief", "loss", "bereavement"]
}
ADVICE_SECTIONS = {
    "coping_skill": ["breath", "relax", "grounding", "mindfulness", "journaling", "reappraisal"],
    "communication_tips": ["i-statement", "assertive", "boundary", "active listening"],
    "sleep_hygiene": ["sleep hygiene", "caffeine", "screen", "regular schedule"],
    "study_habits": ["pomodoro", "time management", "study plan", "breaks"],
    "work_habits": ["prioritize", "break tasks", "burnout", "rest", "workload"]
}

# gloss VI đơn giản (tóm tắt 1–2 câu + thay từ khóa phổ biến)
GLOSS_MAP = {
    "depression":"trầm cảm","anxiety":"lo âu","suicide":"tự sát","self-harm":"tự hại",
    "ideation":"ý nghĩ","risk":"nguy cơ","safety":"an toàn","screening":"sàng lọc",
    "assessment":"đánh giá","referral":"chuyển tuyến","psychoeducation":"giáo dục tâm lý",
    "support":"hỗ trợ","urgent":"khẩn cấp","sleep":"giấc ngủ","hygiene":"vệ sinh giấc ngủ",
    "stress":"căng thẳng","breathing":"hít thở","grounding":"neo tâm trí","mindfulness":"chánh niệm",
    "communication":"giao tiếp","boundary":"ranh giới","assertive":"quả quyết",
    "study":"học tập","work":"công việc","burnout":"kiệt sức",
}

def normalize(text: str) -> str:
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"(^|\s)page\s*\d+(\s*of\s*\d+)?", " ", text, flags=re.I)  # bỏ số trang
    return text.strip()

def split_paragraphs(raw: str) -> List[str]:
    paras = [normalize(p) for p in re.split(r"\n\s*\n", raw) if p.strip()]
    return paras

def chunk_paragraphs(paras: List[str], min_words=MIN_WORDS, max_words=MAX_WORDS, overlap_fr=OVERLAP_FR) -> List[str]:
    """Ghép đoạn văn thành chunk 120–220 từ, với overlap ~20%."""
    out, buf, wc = [], [], 0
    for p in paras:
        words = p.split()
        if wc + len(words) > max_words and buf:
            out.append(" ".join(buf))
            # overlap
            keep = max(1, int(len(buf) * overlap_fr))
            buf = buf[-keep:]
            wc  = sum(len(x.split()) for x in buf)
        buf.append(p)
        wc += len(words)
    if buf:
        out.append(" ".join(buf))

    # Nếu chunk nào quá ngắn < min_words, gộp vào hàng xóm
    fixed = []
    for ch in out:
        if len(ch.split()) >= min_words:
            fixed.append(ch)
        else:
            if fixed:
                fixed[-1] = (fixed[-1] + " " + ch).strip()
            else:
                fixed.append(ch)
    # Nếu còn quá dài > ~320 từ, tách đôi
    final = []
    for ch in fixed:
        wc = len(ch.split())
        if wc > 320:
            tokens = ch.split()
            mid = wc // 2
            final.append(" ".join(tokens[:mid]))
            final.append(" ".join(tokens[mid:]))
        else:
            final.append(ch)
    return final

def detect_axes(text: str):
    tl = text.lower()
    # clinical sections
    clinical = []
    for sec, keys in CLINICAL_SECTIONS.items():
        if any(k in tl for k in keys):
            clinical.append(sec)
    # everyday topics
    life_topics = []
    for tpc, keys in EVERYDAY_TOPICS.items():
        if any(k in tl for k in keys):
            life_topics.append(tpc)
    # advice
    advice = []
    for sec, keys in ADVICE_SECTIONS.items():
        if any(k in tl for k in keys):
            advice.append(sec)
    # risk band
    risk = "low"
    if any(k in tl for k in ["suicid","self-harm","crisis","urgent","danger"]):
        risk = "high"

    # type: clinical vs everyday (ưu tiên clinical nếu có)
    types = []
    if clinical:
        types.append("clinical")
    if life_topics or advice:
        types.append("everyday")
    if not types:
        # nếu thật sự không khớp gì, coi như general-everyday (để không mất mát)
        types = ["everyday"]

    return types, clinical, life_topics, advice, risk

def gloss_vi_short(text_en: str) -> str:
    sents = re.split(r"(?<=[\.\!\?])\s+", text_en.strip())
    pick = " ".join(sents[:2]) if sents else text_en
    low  = pick.lower()
    for en, vi in GLOSS_MAP.items():
        low = re.sub(rf"\b{re.escape(en)}\b", vi, low)
    low  = low[:1].upper() + low[1:]
    return (low[:220] + "...") if len(low) > 220 else low

def make_id(source: str, main_section: str, text: str) -> str:
    h = hashlib.sha1((main_section + text[:120]).encode()).hexdigest()[:8]
    src_tag = "mhgap" if "mhgap" in source.lower() else ("icd11" if "icd-11" in source.lower() or "icd11" in source.lower() else "everyday")
    return f"{src_tag}#{main_section}_{h}"

def main():
    total_snips = 0
    for path in sorted(RAW_TXT_DIR.glob("*.txt")):
        raw = path.read_text("utf-8", errors="ignore")
        # sample để đoán nguồn
        sample = raw[:2000]
        source, url = detect_source_from_file(path.name, sample)
        condition = infer_condition(path.name)

        # lọc theo allowlist nếu có
        if ALLOW_CONDITIONS and condition not in ALLOW_CONDITIONS and source != "Everyday Essentials":
            # cho clinical: bỏ nếu không thuộc allow; everyday thì vẫn giữ (vì nhu cầu phủ rộng)
            pass

        paras  = split_paragraphs(raw)
        chunk_type = (
            "clinical" if "who" in source.lower() or "icd" in source.lower()
            else "everyday"
        )
        min_w, max_w, overlap_fr = CHUNK_CONFIG[chunk_type]
        chunks = chunk_paragraphs(paras, min_w, max_w, overlap_fr)

        for ch in chunks:
            # gán axes
            types, clinical_sec, life_topics, advice, risk_band = detect_axes(ch)

            # bỏ đoạn quá chung chung (không có clinical/life/advice)
            if not (clinical_sec or life_topics or advice):
                continue

            # source/type logic: nếu source là WHO → bảo đảm có "clinical" trong types
            if "WHO" in source and "clinical" not in types:
                types = ["clinical"] + types

            # main section để hiển thị/ID
            main_sec = (clinical_sec[0] if clinical_sec else (advice[0] if advice else "general"))

            # tiêu đề song ngữ
            title_en = f"{condition} — {main_sec.replace('_',' ').title()}"
            title_vi = (title_en.replace("Depression","Trầm cảm")
                                   .replace("Anxiety","Lo âu")
                                   .replace("SuicideRisk","Nguy cơ tự hại/tự sát")
                                   .replace("Risk Safety","Nguy cơ An toàn")
                                   .replace("Screening Cues","Dấu hiệu sàng lọc")
                                   .replace("Psychoeducation","Giáo dục tâm lý")
                                   .replace("Referral","Chuyển tuyến"))

            gloss_vi = gloss_vi_short(ch)
            sid = make_id(source, main_sec, ch)

            item = {
                "id": sid,
                "title_en": title_en,
                "title_vi": title_vi,
                "text_en": ch,
                "gloss_vi": gloss_vi,
                "source": source,
                "url": url,
                "lang": "en",
                "axes": {
                    "type": list(dict.fromkeys(types)),
                    "condition": [condition] if condition else ["General"],
                    "clinical_section": clinical_sec,
                    "life_topics": life_topics,
                    "advice_section": advice,
                    "audience": [],
                    "risk_band": risk_band
                },
                "index_text": ""
            }
            item["index_text"] = " ".join([
                item["title_en"], item["title_vi"], item["text_en"], item["gloss_vi"]
            ]).strip()

            subdir = OUT_DIR / path.stem.lower()
            subdir.mkdir(exist_ok=True)
            out_path = subdir / f"{sid.replace('#','_')}.json"
            out_path.write_text(json.dumps(item, ensure_ascii=False, indent=2), "utf-8")
            total_snips += 1

    print(f"Done. Wrote {total_snips} snippets to {OUT_DIR}")

if __name__ == "__main__":
    main()
