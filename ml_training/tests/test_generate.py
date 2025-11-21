import json, random
from pathlib import Path

# ===== CẤU HÌNH =====
ROOT = Path("data_corpus")   # sửa đường dẫn nếu cần
OUT_DIR = Path("test_set_100")
OUT_DIR.mkdir(exist_ok=True)

corpora_map = {
    "dsm": "DSM-5",
    "icd": "ICD-11",
    "mhgap ver2": "mhGAP ver2",
    "mhgap": "mhGAP"
}

def detect_corpus_name(path: Path):
    name = str(path).lower()
    for k, v in corpora_map.items():
        if k in name:
            return v
    return "Unknown"

def extract_text(j: dict):
    """Lấy nội dung văn bản hợp lệ từ các key phổ biến."""
    for key in ["index_text", "text_en", "page_content", "content", "text"]:
        if key in j and isinstance(j[key], str) and len(j[key].strip()) > 30:
            return j[key].strip()
    return None

def extract_title(j: dict):
    for key in ["title_en", "title", "heading"]:
        if key in j and isinstance(j[key], str):
            return j[key].strip()
    return ""

# ===== QUÉT FILE =====
corpus_snippets = {}
total_files = 0

for file in ROOT.rglob("*.json"):
    try:
        data = json.loads(file.read_text(encoding="utf-8"))
        text = extract_text(data)
        if text:
            corpus = detect_corpus_name(file)
            corpus_snippets.setdefault(corpus, []).append({
                "title": extract_title(data),
                "snippet": text
            })
            total_files += 1
    except Exception:
        continue

print(f"📊 Tổng số file đọc được: {total_files}")
for k,v in corpus_snippets.items():
    print(f"📘 {k}: {len(v)} đoạn")

# ===== TẠO TEST SET =====
random.seed(42)
test_all = []

for corpus, items in corpus_snippets.items():
    if not items: continue
    chosen = random.sample(items, min(25, len(items)))
    file_out = OUT_DIR / f"testset_{corpus.lower().replace(' ', '_')}.json"
    test_local = []

    for item in chosen:
        title = item["title"]
        snippet = item["snippet"]
        q = f"Theo phần “{title}”, nội dung chính của đoạn sau là gì?" if title else \
            "Theo đoạn sau, nội dung chính là gì?"
        gold = snippet.split(".")[0][:350]

        record = {
            "question": q,
            "gold_answer": gold,
            "context_snippet": snippet[:800],
            "source": corpus
        }
        test_local.append(record)
        test_all.append(record)

    # Lưu từng corpus riêng
    with open(file_out, "w", encoding="utf-8") as f:
        json.dump(test_local, f, ensure_ascii=False, indent=2)
    print(f"✅ Đã tạo {len(test_local)} mẫu → {file_out.name}")

# Lưu file tổng hợp
out_all = OUT_DIR / "test_set_100.json"
with open(out_all, "w", encoding="utf-8") as f:
    json.dump(test_all, f, ensure_ascii=False, indent=2)

print(f"\n🌍 Đã tạo {len(test_all)} mẫu test tổng hợp trong {out_all}")
