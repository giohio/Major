from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.llms import Ollama
from langchain.chains import RetrievalQA
import json, os

# ======= LOAD CONFIG =======
with open("../config/config_rag.json", "r", encoding="utf-8") as f:
    CORPORA = json.load(f)

# ======= EMBEDDING MODEL =======
emb_model = HuggingFaceEmbeddings(model_name="BAAI/bge-m3")

# ======= QWEN MODEL =======
llm = Ollama(model="qwen2.5:7b-instruct")   # nếu bạn đang dùng Ollama
# hoặc nếu bạn gọi qua API thì đổi sang wrapper tương ứng

# ======= TẠO RETRIEVERS =======
retrievers = {}
for corpus in CORPORA:
    db = Chroma(persist_directory=corpus["path"], embedding_function=emb_model)
    retrievers[corpus["corpus"]] = db.as_retriever(search_kwargs={"k": 3})

# ======= CHỌN THEO NGỮ CẢNH =======
def choose_retriever(user_query: str):
    q = user_query.lower()
    if any(k in q for k in ["diagnose", "symptom", "criteria", "rối loạn", "triệu chứng"]):
        return retrievers["DSM-5"]
    elif any(k in q for k in ["code", "icd", "mã", "classification"]):
        return retrievers["ICD-11"]
    elif any(k in q for k in ["help", "support", "intervention", "can thiệp", "tư vấn", "hỗ trợ cơ bản"]):
        return retrievers["mhGAP"]
    elif any(k in q for k in ["follow-up", "management", "điều trị", "theo dõi", "kế hoạch"]):
        return retrievers["mhGAP ver2"]
    else:
        # fallback: tổng hợp nhiều nguồn
        from langchain.retrievers import EnsembleRetriever
        ens = EnsembleRetriever(
            retrievers=[retrievers["DSM-5"], retrievers["mhGAP ver2"]],
            weights=[0.6, 0.4]
        )
        return ens

# ======= PIPELINE TRUY VẤN =======
def ask_multidb(query: str):
    retriever = choose_retriever(query)
    qa = RetrievalQA.from_chain_type(
        llm=llm,
        retriever=retriever,
        chain_type="stuff",
        verbose=False
    )
    return qa.run(query)

# ======= TEST =======
if __name__ == "__main__":
    q = "Người bệnh mất ngủ, ăn uống kém, buồn chán và mất hứng thú — có thể là rối loạn gì?"
    print(ask_multidb(q))
