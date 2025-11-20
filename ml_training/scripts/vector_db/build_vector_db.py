# ======================================
# BUILD VECTOR DATABASE FOR MULTI-CORPUS RAG
# ======================================

import os, json, glob, warnings
from pathlib import Path

# Tắt toàn bộ warning
warnings.filterwarnings("ignore")

# Sử dụng gói mới nhất chính thức của LangChain
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_core.documents import Document

# ====== 1️⃣ CẤU HÌNH ======
SCRIPT_DIR = Path(__file__).parent.resolve()
CORPUS_DIR = SCRIPT_DIR / "../../data/reasoning"     # 4 folder tri thức: dsm5, icd11, mhgap, mhgap_ver2
DB_DIR     = SCRIPT_DIR / "../../vector_db/Deep_Reasoning"              # nơi lưu vector database
DB_DIR.mkdir(parents=True, exist_ok=True)

EMB_MODEL  = "BAAI/bge-m3"           # model embedding mạnh, đa ngôn ngữ
os.environ["USE_TF"] = "0"           # tắt TensorFlow để tránh xung đột Keras 3

# ====== 2️⃣ KHỞI TẠO EMBEDDING MODEL ======
print(f"🚀 Loading embedding model: {EMB_MODEL}")
emb = HuggingFaceEmbeddings(
    model_name=EMB_MODEL,
    model_kwargs={"device": "cuda"},
    encode_kwargs={"batch_size": 1}  # Reduced to 1 to prevent OOM
)
# ====== 3️⃣ TẠO VECTOR DATABASE RIÊNG CHO MỖI FOLDER ======
manifest = []
for corpus_dir in CORPUS_DIR.iterdir():
    if not corpus_dir.is_dir():
        continue

    corpus_name = corpus_dir.name
    print(f"\n🧠 Building index for: {corpus_name}")

    docs = []
    for f in glob.glob(str(corpus_dir / "*.json")):
        try:
            item = json.load(open(f, encoding="utf-8"))
        except Exception as e:
            print(f"⚠️  Error reading {f}: {e}")
            continue

        text = item.get("index_text") or item.get("text_en") or item.get("text") or ""
        if not text.strip():
            continue

        # --- Chuyển list/dict trong metadata thành chuỗi ---
        def safe(v):
            if isinstance(v, list):
                return "; ".join(map(str, v))
            if isinstance(v, (dict, set)):
                return str(v)
            return v

        metadata = {
            "id": safe(item.get("id", "")),
            "corpus": safe(item.get("corpus", corpus_name)),
            "condition": safe(item.get("condition", "")),
            "source": safe(item.get("source", corpus_name)),
        }

        docs.append(Document(page_content=text, metadata=metadata))

    if not docs:
        print(f"⚠️  No valid documents found in {corpus_name}, skipping.")
        continue

    out_dir = DB_DIR / corpus_name
    out_dir.mkdir(exist_ok=True)

    # --- Tạo index với batch processing để tránh OOM ---
    print(f"   Processing {len(docs)} documents in batches...")
    batch_size = 50  # Process 50 documents at a time
    
    if len(docs) <= batch_size:
        db = Chroma.from_documents(
            docs,
            embedding=emb,
            persist_directory=str(out_dir)
        )
    else:
        # First batch creates the database
        db = Chroma.from_documents(
            docs[:batch_size],
            embedding=emb,
            persist_directory=str(out_dir)
        )
        # Add remaining documents in batches
        for i in range(batch_size, len(docs), batch_size):
            batch = docs[i:i+batch_size]
            db.add_documents(batch)
            print(f"   Processed {min(i+batch_size, len(docs))}/{len(docs)} documents")
    
    db.persist()

    manifest.append({
        "corpus": corpus_name,
        "num_snippets": len(docs),
        "db_path": str(out_dir)
    })
    print(f"✅ Indexed {len(docs)} snippets → {out_dir}")

# ====== 4️⃣ LƯU MANIFEST ======
manifest_path = DB_DIR / "_manifest.json"
manifest_path.write_text(
    json.dumps(manifest, indent=2, ensure_ascii=False),
    encoding="utf-8"
)

print("\n🎯 All vector databases built successfully!")
print(f"📄 Manifest saved at: {manifest_path}")
