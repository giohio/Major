import pdfplumber, re
from pathlib import Path

SRC = Path("DSM-5-By-American-Psychiatric-Association.pdf")   # đường dẫn file PDF
OUT = Path("DSM-5-By-American-Psychiatric-Association")
OUT.mkdir(parents=True, exist_ok=True)

PAGE_RANGES = {
    # nếu muốn lọc trang cho chính file này thì thêm ở đây:
    # "9789240077263-eng.pdf": [(20,60), (120,170)],
}

def keep_pages(stem: str):
    return PAGE_RANGES.get(stem + ".pdf")

def clean(text: str) -> str:
    text = re.sub(r"[ \t]+\n", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r"\u2022|\uf0b7", "•", text)
    return text.strip()

def extract_pdf(pdf_path: Path) -> str:
    ranges = keep_pages(pdf_path.stem)
    pages_text = []
    with pdfplumber.open(pdf_path) as doc:
        if ranges:
            for a, b in ranges:
                for p in range(a-1, b):   # 0-index
                    if 0 <= p < len(doc.pages):
                        t = doc.pages[p].extract_text() or ""
                        pages_text.append(t)
        else:
            for page in doc.pages:
                t = page.extract_text() or ""
                pages_text.append(t)
    return clean("\n\n".join(pages_text))

def main():
    if not SRC.exists():
        raise FileNotFoundError(f"Không thấy file: {SRC}")
    txt = extract_pdf(SRC)
    out_path = OUT / f"{SRC.stem}.txt"
    out_path.write_text(txt, encoding="utf-8")
    print("Wrote:", out_path)

if __name__ == "__main__":
    main()
