import os
import json
import glob
import shutil
import warnings
from pathlib import Path
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_core.documents import Document

# Cấu hình
os.environ["HF_HOME"] = "E:/Major/.cache/huggingface"
os.environ["TOKENIZERS_PARALLELISM"] = "false"
warnings.filterwarnings("ignore")

SCRIPT_DIR = Path(__file__).parent.resolve()
# Đảm bảo đường dẫn này trỏ đúng đến nơi bạn lưu file .jsonl
INPUT_DATA_DIR = (SCRIPT_DIR / "../../data/ready_for_rag").resolve() 
# Đảm bảo đường dẫn này khớp với biến PATHS["vector_db_path"] trong Cell Config
DB_DIR = (SCRIPT_DIR / "../../vector_db/Advice").resolve()
EMB_MODEL = "intfloat/multilingual-e5-small"
COLLECTION_NAME = "psychology_advice" # <--- QUAN TRỌNG: PHẢI CÓ TÊN NÀY

# 1. Load Model
print(f"🚀 Loading model: {EMB_MODEL}...")
emb = HuggingFaceEmbeddings(
    model_name=EMB_MODEL,
    model_kwargs={"device": "cuda"},
    encode_kwargs={"batch_size": 32, "normalize_embeddings": True}
)

# 2. Xóa DB cũ để xây lại từ đầu
if os.path.exists(DB_DIR):
    print(f"🧹 Đang xóa Database cũ tại {DB_DIR}...")
    try:
        shutil.rmtree(DB_DIR)
    except Exception as e:
        print(f"⚠️ Không thể xóa folder cũ (có thể đang được sử dụng): {e}")
os.makedirs(DB_DIR, exist_ok=True)

# 3. Đọc dữ liệu
print(f"\n📂 Reading JSONL files from: {INPUT_DATA_DIR}")
documents = []
jsonl_files = list(glob.glob(str(INPUT_DATA_DIR / "*.jsonl")))

if not jsonl_files:
    print("❌ LỖI: Không tìm thấy file .jsonl nào! Hãy kiểm tra lại đường dẫn INPUT_DATA_DIR.")
else:
    for file_path in jsonl_files:
        file_name = os.path.basename(file_path)
        print(f"   -> Processing: {file_name}")
        
        with open(file_path, 'r', encoding='utf-8') as f:
            count = 0
            for line in f:
                if not line.strip(): continue
                try:
                    item = json.loads(line)
                    content = item.get("content", "").strip()
                    if not content: continue
                    
                    # Prefix cho E5
                    page_content_fixed = f"passage: {content}" 

                    orig_meta = item.get("metadata", {})
                    
                    # Flatten metadata
                    clean_meta = {
                        "source": str(orig_meta.get("source", file_name)),
                        "type": str(orig_meta.get("type", "unknown")),
                    }
                    if "standard" in orig_meta: clean_meta["standard"] = str(orig_meta["standard"])
                    if "disease_name" in orig_meta: clean_meta["disease_name"] = str(orig_meta["disease_name"])
                    if "session_id" in orig_meta: clean_meta["session_id"] = str(orig_meta["session_id"])
                    if "session_title" in orig_meta: clean_meta["session_title"] = str(orig_meta["session_title"])
                    
                    documents.append(Document(page_content=page_content_fixed, metadata=clean_meta))
                    count += 1
                except: continue
        print(f"      + Loaded {count} chunks.")

    print(f"📊 Tổng số documents: {len(documents)}")

# 4. Build DB
if documents:
    print(f"\n🧠 Building Index into Collection: '{COLLECTION_NAME}'...")
    BATCH_SIZE = 64
    for i in range(0, len(documents), BATCH_SIZE):
        batch = documents[i : i + BATCH_SIZE]
        if i == 0:
            # FIX: Thêm tham số collection_name
            db = Chroma.from_documents(
                documents=batch, 
                embedding=emb, 
                persist_directory=str(DB_DIR),
                collection_name=COLLECTION_NAME # <--- FIX Ở ĐÂY
            )
        else:
            db.add_documents(batch)
        print(f"   + Indexed {min(i+BATCH_SIZE, len(documents))}/{len(documents)}")
    
    print(f"✅ DONE! Database saved at: {DB_DIR}")
    print(f"✅ Collection Name: {COLLECTION_NAME}")
else:
    print("❌ Không có dữ liệu để tạo DB!")