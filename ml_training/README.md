# ML Training - Mental Health AI System

Thư mục này chứa tất cả các thành phần liên quan đến Machine Learning và xử lý dữ liệu cho hệ thống Mental Health AI.

## 📁 Cấu trúc thư mục

```
ml_training/
├── data/                          # Tất cả dữ liệu huấn luyện và corpus
│   ├── raw/                       # Dữ liệu gốc (PDFs, TXT files)
│   ├── corpus/                    # Data corpus đã xử lý (DSM-5, ICD-11, mhGAP, mhGAP ver2)
│   ├── reasoning/                 # Dữ liệu reasoning để huấn luyện
│   │   ├── Text_Reasoning_train.jsonl
│   │   ├── Text_Reasoning_test.jsonl
│   │   └── DSM-5/, ICD-11/, mhGAP/, mhGAPv2/
│   └── test_sets/                 # Test sets đánh giá (100 samples)
│
├── vector_db/                     # Vector databases cho RAG
│   ├── dsm-5-by-american-psychiatric-association/
│   ├── icd-11/
│   ├── mhgap/
│   └── mhgap ver2/
│
├── scripts/                       # Scripts xử lý và huấn luyện
│   ├── preprocessing/             # Tiền xử lý dữ liệu
│   │   ├── pdf_to_txt.py         # Chuyển PDF sang TXT
│   │   └── chunking_txt.py       # Chia nhỏ text thành chunks
│   ├── vector_db/                 # Xây dựng vector database
│   │   └── build_vector_db.py    # Build Chroma DB từ corpus
│   └── training/                  # Scripts huấn luyện
│       └── Text_Reasoning_train_test.py  # Sinh dữ liệu huấn luyện
│
├── models/                        # Models và inference
│   └── rag_qwen.py               # RAG với Qwen model
│
├── config/                        # Cấu hình
│   └── config_rag.json           # Config cho RAG system
│
└── tests/                         # Test files
    └── test_generate.py          # Test data generation

```

## 🚀 Sử dụng

### 1. Xử lý dữ liệu từ PDF
```bash
cd scripts/preprocessing
python pdf_to_txt.py
```

### 2. Chia nhỏ text thành chunks
```bash
cd scripts/preprocessing
python chunking_txt.py
```

### 3. Xây dựng Vector Database
```bash
cd scripts/vector_db
python build_vector_db.py
```

### 4. Sinh dữ liệu huấn luyện reasoning
```bash
cd scripts/training
python Text_Reasoning_train_test.py
```

### 5. Chạy RAG với Qwen
```bash
cd models
python rag_qwen.py
```

## 📊 Dữ liệu

- **Raw Data**: Các file PDF và TXT gốc từ WHO, DSM-5
- **Corpus**: ~4 bộ tri thức chuyên môn đã được xử lý
- **Reasoning Data**: 6000+ mẫu huấn luyện cho text reasoning
- **Test Sets**: 100 mẫu test đánh giá chất lượng

## 🛠️ Yêu cầu

- Python 3.8+
- CUDA (cho embedding và inference nhanh)
- Dependencies: xem `requirements.txt` trong thư mục backend

## 📝 Ghi chú

- Vector DB sử dụng BAAI/bge-m3 embedding model
- RAG model: Qwen 2.5:7b-instruct (qua Ollama)
- Corpus được chia theo 4 lĩnh vực: DSM-5, ICD-11, mhGAP, mhGAP ver2
