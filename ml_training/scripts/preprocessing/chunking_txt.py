import os
import re
import json
import uuid
from pathlib import Path

# ==============================================================================
# 1. CẤU HÌNH & TỪ ĐIỂN CHUẨN HÓA
# ==============================================================================
SCRIPT_DIR = Path(__file__).parent
RAW_INPUT_DIR = (SCRIPT_DIR / "../../data/raw/processed").resolve() 
BASE_OUT_DIR = (SCRIPT_DIR / "../../data/ready_for_rag").resolve()
os.makedirs(BASE_OUT_DIR, exist_ok=True)

# Mapping file -> Chiến lược xử lý
# Cần đặt tên file chính xác để code nhận diện
FILE_STRATEGY_MAP = {
    "Phac-do-Tam-than_2020.txt": "medical_protocol",
    "DSM-5-By-American-Psychiatric-Association.txt": "medical_dsm5", # Xử lý đặc biệt
    "ICD-11.txt": "medical_icd11", 
    "mhGAP ver2.txt": "medical_protocol",
    "be38edbbfc79330a.txt": "theory_concept", 
    "cognitive-behavior-therapy-basics-and-beyond-3nbsped-1462544193-9781462544196_compress.txt": "theory_concept",
    "Giao-Trinh-Tham-Vấn-Tam-Lý-NXB-Đại-Học-Quốc-Gia-2012-Trần-Thị-Minh-Đức.txt": "theory_concept"
}

# Từ điển sửa lỗi dịch thuật (Quan trọng để Bot không nói ngọng)
MEDICAL_TERM_MAPPING = {
    "rung rinh cơ thể": "bồn chồn (restlessness)",
    "căng thẳng cơ": "căng cơ (muscle tension)",
    "giảm hứng thú": "mất hứng thú (anhedonia)",
    "buồn chán": "khí sắc trầm cảm (depressed mood)",
    "đứng ngồi không yên": "kích động tâm thần vận động"
}

# ==============================================================================
# 2. HELPER FUNCTIONS
# ==============================================================================

def clean_and_normalize_text(text):
    """Làm sạch rác và chuẩn hóa thuật ngữ y khoa."""
    if not text: return ""
    
    # Xóa rác PDF (Source tag, số trang lẻ loi)
    text = text.replace('\ufeff', '')  # Xóa BOM
    text = re.sub(r'\n\s*\d+\s*\n', '\n', text) # Xóa số trang đứng 1 mình
    
    text = re.sub(r'\s+', ' ', text).strip()
    
    # Thay thế thuật ngữ sai
    text_lower = text.lower()
    for bad_term, good_term in MEDICAL_TERM_MAPPING.items():
        if bad_term in text_lower:
            text = re.sub(bad_term, good_term, text, flags=re.IGNORECASE)
            
    return text

def split_large_text(text, max_chars=2000, overlap=200):
    """Cắt nhỏ văn bản nếu quá dài, nhưng cố gắng cắt tại dấu chấm câu."""
    if len(text) <= max_chars:
        return [text]
    
    sub_chunks = []
    start = 0
    while start < len(text):
        end = start + max_chars
        if end < len(text):
            # Tìm dấu chấm câu gần nhất để cắt cho đẹp
            last_period = text.rfind('.', start, end)
            if last_period != -1 and last_period > start + 1500: # Chỉ lùi lại nếu không mất quá nhiều
                end = last_period + 1
        
        chunk = text[start:end].strip()
        if len(chunk) > 50: # Bỏ qua chunk quá ngắn
            sub_chunks.append(chunk)
        start = end - overlap
    return sub_chunks

# ==============================================================================
# 3. PROCESSORS (CHIẾN LƯỢC CẮT THÔNG MINH)
# ==============================================================================

def process_dsm5(text, filename):
    """Chiến lược DSM-5: Giữ nguyên khối tiêu chuẩn (A-F)."""
    chunks = []
    # FIX: Thêm \s* sau (?:^|\n) để bỏ qua khoảng trắng thụt đầu dòng
    pattern = r"(?im)(?:^|\n)\s*(Diagnostic Criteria for|Tiêu chuẩn chẩn đoán|TIÊU CHUẨN CHẨN ĐOÁN)\s*[:\-]?\s*([A-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠƯẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỂỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪỬỮỰỲỴÝỶỸ\s\(\)\-]+?)(?=\n|$|:)"
    
    matches = list(re.finditer(pattern, text))
    if not matches:
        print(f"⚠️ {filename}: Fallback sang cắt thường (Không tìm thấy header DSM).")
        return process_theory_concept(text, filename) 

    print(f"   --> Tìm thấy {len(matches)} rối loạn trong DSM-5.")

    for i, match in enumerate(matches):
        start = match.start()
        end = matches[i+1].start() if i + 1 < len(matches) else len(text)
        
        full_content = text[start:end]
        disorder_name = match.group(2).strip().strip(":")
        
        if len(full_content) < 50: continue

        anchored_content = f"[Nguồn: DSM-5 (Tiêu chuẩn gốc) | Bệnh: {disorder_name}]\n{clean_and_normalize_text(full_content)}"
        
        if len(anchored_content) <= 3500:
            chunks.append({
                "id": str(uuid.uuid4()),
                "content": anchored_content,
                "metadata": {
                    "source": filename,
                    "type": "medical_protocol",
                    "standard": "DSM-5",
                    "disease_name": disorder_name
                }
            })
        else:
            sub_texts = split_large_text(anchored_content, max_chars=2000)
            for idx, sub in enumerate(sub_texts):
                chunks.append({
                    "id": str(uuid.uuid4()),
                    "content": sub,
                    "metadata": {
                        "source": filename,
                        "type": "medical_protocol",
                        "standard": "DSM-5",
                        "disease_name": disorder_name,
                        "part": idx + 1
                    }
                })
    return chunks

def process_medical_protocol(text, filename):
    """Xử lý Protocol chung & ICD-11 & mhGAP."""
    chunks = []
    
    std = "General_Protocol"
    if "ICD-11" in filename: std = "ICD-11"
    elif "mhGAP" in filename: std = "mhGAP"
    elif "Phac-do" in filename: std = "BYT-Vietnam"

    # FIX:
    # 1. ^\s* : Bắt đầu dòng + khoảng trắng tùy ý
    # 2. Thêm [A-Z0-9]+\. : Để bắt các mã như 6B00. (ICD-11)
    pattern = r"(?im)^\s*((?:\d+\.|[IVX]+\.|[A-Z0-9]+\.|[A-Z]\.|MODULE|CHƯƠNG|BÀI)\s*)([A-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠƯẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỂỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪỬỮỰỲỴÝỶỸ\s\-\(\)\:]+?)(?=\n|$)"
    
    matches = list(re.finditer(pattern, text))
    if not matches:
        print(f"⚠️ {filename}: Không bắt được Header Protocol -> Chuyển sang cắt đoạn.")
        return process_theory_concept(text, filename) 

    print(f"   --> Tìm thấy {len(matches)} mục trong {std}.")

    for i, match in enumerate(matches):
        start_idx = match.start()
        end_idx = matches[i+1].start() if i + 1 < len(matches) else len(text)
        
        full_content = text[start_idx:end_idx]
        header_full = match.group(0).strip()
        disease_name = match.group(2).strip().strip(":")

        anchored_content = f"[Nguồn: {filename} | Chuẩn: {std} | Mục: {disease_name}]\n{clean_and_normalize_text(full_content)}"

        sub_texts = split_large_text(anchored_content, max_chars=2000)

        for idx, sub_text in enumerate(sub_texts):
            chunks.append({
                "id": str(uuid.uuid4()),
                "content": sub_text,
                "metadata": {
                    "source": filename,
                    "type": "medical_protocol",
                    "standard": std,
                    "disease_name": disease_name,
                    "part": idx + 1
                }
            })
    return chunks    

def process_theory_concept(text, filename, chunk_size=2000, overlap=200):
    """
    Xử lý sách lý thuyết: Cắt theo đoạn văn để giữ cấu trúc bảng/list.
    Không dùng split() theo từ vì sẽ mất dấu xuống dòng.
    """
    chunks = []
    
    # 1. Làm sạch nhưng GIỮ NGUYÊN cấu trúc dòng
    text = clean_and_normalize_text(text) 
    
    # 2. Cắt thông minh dựa trên hàm split_large_text đã có (giữ dấu chấm câu)
    # Tăng chunk_size lên 2000-2500 để lấy trọn vẹn các bảng biểu lớn
    sub_texts = split_large_text(text, max_chars=2500, overlap=300)

    for i, sub_text in enumerate(sub_texts):
        if len(sub_text) < 100: continue
        
        # Thêm chỉ dẫn nguồn rõ ràng
        anchored_content = f"[Nguồn: {filename} | Loại: Lý thuyết/Sách giáo khoa | Phần {i+1}]\n{sub_text}"

        chunks.append({
            "id": str(uuid.uuid4()),
            "content": anchored_content,
            "metadata": {
                "source": filename,
                "type": "theory_concept",
                "part": i + 1
            }
        })
    return chunks
def process_workflow_session(text, filename):
    """Xử lý Quy trình trị liệu (Brief CBT). Lọc bỏ mục lục."""
    chunks = []
    pattern = r"(?im)^((?:SESSION|PHIÊN|BUỔI|MODULE|CHAPTER|PHẦN)\s+(\d+))(.+?)(?=\n(?:SESSION|PHIÊN|BUỔI|MODULE|CHAPTER|PHẦN)\s+\d+|$)"
    
    matches = list(re.finditer(pattern, text, re.DOTALL))
    if not matches:
        return process_theory_concept(text, filename)

    for match in matches:
        full_block = match.group(0)
        session_title = match.group(1).strip()
        session_id = match.group(2).strip()
        content_body = match.group(3).strip()

        # Lọc bỏ nếu nội dung quá ngắn (nghi ngờ là Mục lục)
        if len(content_body) < 150: 
            continue 
        
        anchored_content = f"[Nguồn: {filename} | Loại: Quy trình thực hành]\n{clean_and_normalize_text(full_block)}"
        sub_texts = split_large_text(anchored_content, max_chars=1500)

        for idx, sub_text in enumerate(sub_texts):
            chunks.append({
                "id": str(uuid.uuid4()),
                "content": sub_text,
                "metadata": {
                    "source": filename,
                    "type": "workflow_guide",
                    "session_id": session_id,
                    "session_title": session_title,
                    "part": idx + 1
                }
            })
    return chunks

def process_theory_concept(text, filename, chunk_size=1000, overlap=150):
    """Xử lý sách lý thuyết (Cắt đoạn)."""
    chunks = []
    text = clean_and_normalize_text(text)
    words = text.split()
    if not words: return []

    for i in range(0, len(words), chunk_size - overlap):
        chunk_words = words[i : i + chunk_size]
        chunk_str = " ".join(chunk_words)
        if len(chunk_str) < 100: continue
        
        anchored_content = f"[Nguồn: {filename} | Loại: Lý thuyết]\n{chunk_str}"

        chunks.append({
            "id": str(uuid.uuid4()),
            "content": anchored_content,
            "metadata": {
                "source": filename,
                "type": "theory_concept"
            }
        })
    return chunks

def save_to_jsonl(chunks, filename):
    if not chunks: 
        print(f"⚠️ Không có chunk nào để lưu cho {filename}")
        return
    out_path = BASE_OUT_DIR / f"{filename.replace('.txt', '')}_chunked.jsonl"
    with open(out_path, 'w', encoding='utf-8') as f:
        for chunk in chunks:
            f.write(json.dumps(chunk, ensure_ascii=False) + '\n')
    print(f"✅ Saved {len(chunks)} chunks -> {out_path.name}")

# ==============================================================================
# 4. MAIN RUN
# ==============================================================================
def main():
    print(f"🚀 PROCESSING DATA FROM: {RAW_INPUT_DIR}")
    if not RAW_INPUT_DIR.exists(): 
        print("❌ Input directory not found!")
        return
    
    files = [f for f in os.listdir(RAW_INPUT_DIR) if f.lower().endswith('.txt')]
    for filename in files:
        strategy = FILE_STRATEGY_MAP.get(filename)
        if not strategy: 
            # Fallback cho file lạ
            if "DSM" in filename: strategy = "medical_dsm5"
            elif "ICD" in filename: strategy = "medical_icd11"
            else: 
                print(f"⏩ Skipping unknown file: {filename}")
                continue
        
        print(f"📂 Processing: {filename} -> Strategy: {strategy}")
        try:
            with open(RAW_INPUT_DIR / filename, 'r', encoding='utf-8') as f:
                content = f.read()
            
            if strategy == "medical_dsm5":
                chunks = process_dsm5(content, filename)
            elif strategy == "medical_icd11": # ICD-11 thường cấu trúc giống protocol
                chunks = process_medical_protocol(content, filename)
            elif strategy == "medical_protocol":
                chunks = process_medical_protocol(content, filename)
            elif strategy == "workflow_session":
                chunks = process_workflow_session(content, filename)
            else:
                chunks = process_theory_concept(content, filename)
            
            save_to_jsonl(chunks, filename)
        except Exception as e:
            print(f"❌ Error processing {filename}: {e}")

if __name__ == "__main__":
    main()