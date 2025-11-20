import json
import random
import time
import os
# ==============================================================================
# 1. CẤU HÌNH (CONFIGURATION)
# ==============================================================================
TARGET_TOTAL = 6000       # Tổng số mẫu mục tiêu
TRAIN_RATIO = 0.9         # Tỷ lệ Train (90%), Test (10%)
OUTPUT_TRAIN = "../../data/reasoning/Text_Reasoning_train.jsonl"
OUTPUT_TEST = "../../data/reasoning/Text_Reasoning_test.jsonl"

os.makedirs("../../data/reasoning", exist_ok=True)

print(f"🚀 Đang khởi động bộ sinh dữ liệu Super Generator...")
print(f"🎯 Mục tiêu: {TARGET_TOTAL} dòng không trùng lặp.")
print(f"✂️ Chế độ chia: {int(TRAIN_RATIO*100)}% Train - {int((1-TRAIN_RATIO)*100)}% Test")

# ==============================================================================
# 2. KHO TỪ VỰNG KHỔNG LỒ (EXPANDED VOCABULARY)
# ==============================================================================

# --- ĐẠI TỪ & TỪ ĐỆM (Dùng chung) ---
pronouns = [
    "Em", "Mình", "Tớ", "Cháu", "Tôi", "Anh", "Chị", "Bác", "Con", "Tao", "Tui", 
    "Người nhà em", "Bạn em", "Vợ mình", "Chồng mình"
]

timeframes = [
    "dạo gần đây", "mấy hôm nay", "từ tuần trước", "mấy tháng nay rồi", "từ lúc chia tay", 
    "sau khi sinh em bé", "từ đợt dịch đến giờ", "gần đây", "bữa giờ", "suốt 2 tuần nay",
    "cả năm nay", "mới hôm qua", "tự nhiên hôm nay"
]

fillers = [
    "thực sự", "hình như", "có vẻ", "chắc là", "vô cùng", "rất chi là", "hơi bị", "khá là",
    "cảm thấy", "thấy", "tự dưng", "bỗng nhiên", "chả hiểu sao", "stress vãi", "chán ghê",
    "huhu", "haizz", "trời ơi", "khổ tâm ghê", "buồn thối ruột"
]

# --- VOCAB CHO INFORMATIONAL (Kiến thức) ---
info_concepts = [
    "trầm cảm", "rối loạn lo âu", "rối loạn lưỡng cực", "tâm thần phân liệt", "OCD", "PTSD",
    "ADHD ở người lớn", "chứng mất ngủ mãn tính", "rối loạn ăn uống vô độ", "chán ăn tâm thần",
    "burnout (kiệt sức)", "trầm cảm sau sinh", "stress kéo dài", "rối loạn nhân cách ranh giới (BPD)",
    "tự kỷ ám thị", "chứng sợ xã hội", "rối loạn hoảng sợ", "rối loạn cơ thể hóa", "nghiện rượu",
    "nghiện game", "hành vi tự hại", "liệu pháp CBT", "thuốc chống trầm cảm SSRI"
]

info_questions = [
    "là bệnh gì", "định nghĩa là gì", "có triệu chứng thế nào", "nguyên nhân do đâu", 
    "có chữa khỏi hẳn được không", "chẩn đoán ở đâu uy tín", "biểu hiện ra sao", 
    "khác gì với buồn bình thường", "dùng thuốc gì để chữa", "theo tiêu chuẩn DSM-5 là gì", 
    "theo MHGAP xử lý sao", "có di truyền không", "kéo dài bao lâu thì khỏi",
    "có nguy hiểm tính mạng không", "phân loại thế nào", "có mấy giai đoạn"
]

info_prefixes = [
    "Cho hỏi", "Ad ơi cho hỏi", "Muốn tìm hiểu về", "Định nghĩa của", "Thông tin về",
    "Làm sao biết mình bị", "Phân biệt giúp mình", "Giải thích thuật ngữ", "Tìm tài liệu về",
    "Bác sĩ cho hỏi", "Em muốn hỏi chút về", "Search dùm mình", "Cho mình xin info về", 
    "Tôi cần tìm hiểu", ""
]

# --- VOCAB CHO COMPLEX REASONING (Tư vấn sâu) ---
complex_contexts = [
    "áp lực công việc quá lớn", "vừa chia tay người yêu xong", "bố mẹ ly hôn", "mất việc làm đột ngột",
    "nợ nần chồng chất xã hội đen đòi", "bị đồng nghiệp toxic bắt nạt", "con cái hư hỏng không nghe lời", 
    "người thân vừa mất", "thi trượt đại học", "bị body shaming béo quá", "cảm thấy lạc lõng trong nhóm bạn",
    "sắp phải thuyết trình trước đám đông", "bị sếp dí deadline", "vừa sinh con xong stress quá",
    "gia đình chồng khắt khe", "người yêu vô tâm", "học hành sa sút", "bị lừa đảo mất tiền",
    "sống xa nhà cô đơn", "không có bạn thân", "bị phản bội", "thất bại trong kinh doanh"
]

complex_symptoms = [
    "mất ngủ triền miên trắng đêm", "ăn không ngon miệng sụt cân", "tim đập nhanh khó thở như sắp ngất", 
    "run tay chân bần bật", "hay khóc thầm mỗi đêm", "không muốn gặp ai chỉ muốn trốn trong phòng", 
    "đầu óc trống rỗng không tập trung được", "hay cáu gắt vô cớ với người nhà", 
    "mất hứng thú với mọi sở thích cũ", "luôn cảm thấy tội lỗi dằn vặt", "nghĩ ngợi lung tung cả đêm",
    "sợ tiếng động lớn", "hay quên trước quên sau", "đau đầu dữ dội đi khám không ra bệnh",
    "cảm giác như có ai theo dõi", "nghe thấy tiếng nói trong đầu", "bồn chồn không yên"
]

complex_requests = [
    "liệu có phải bị trầm cảm không?", "bác sĩ tư vấn giúp với ạ.", "làm sao để vượt qua giai đoạn này?",
    "có cách nào cân bằng lại cảm xúc không?", "tôi sợ mình bị bệnh tâm lý nặng.", 
    "tôi bế tắc quá không biết làm sao thoát ra.", "cần lời khuyên gấp ạ.", 
    "làm sao để vui vẻ trở lại như xưa?", "có nên đi khám bác sĩ tâm lý không?",
    "em phải làm gì bây giờ?", "giúp em với em mệt mỏi quá.", "có ai từng bị như này chưa?"
]

# --- VOCAB CHO HIGH RISK (Nguy cơ cao) ---
risk_triggers = [
    "tuyệt vọng tột cùng rồi", "không còn lối thoát nào nữa", "chán ghét bản thân kinh khủng", 
    "cuộc sống này vô nghĩa toàn đau khổ", "tận cùng nỗi đau rồi", "kiệt sức hoàn toàn rồi",
    "không ai thương mình cả", "mình là gánh nặng của gia đình", "thế giới này tàn nhẫn quá",
    "mất hết hy vọng rồi", "cảm giác như đã chết ở bên trong"
]

risk_actions = [
    "muốn chết đi cho xong", "muốn tự tử ngay bây giờ", "định uống thuốc ngủ để đi luôn",
    "muốn nhảy lầu kết thúc tất cả", "đang cầm dao muốn rạch tay cho bớt đau lòng", 
    "sẽ biến mất khỏi thế giới này vĩnh viễn", "không muốn nhìn thấy ngày mai nữa", 
    "cái chết là sự giải thoát duy nhất", "định lao đầu vào xe tải", "muốn treo cổ tự vẫn",
    "ước gì ngủ một giấc không bao giờ dậy nữa", "tìm cách kết liễu cuộc đời"
]

risk_plans = [
    "tạm biệt mọi người nhé.", "đã viết thư tuyệt mệnh để lại rồi.", "không ai cứu được tôi đâu.",
    "xin lỗi bố mẹ con đi đây.", "đêm nay sẽ là đêm cuối cùng.", "chịu hết nổi rồi bye bye.",
    "tôi đi đây đừng tìm tôi nữa.", "đã chuẩn bị sẵn thuốc rồi.", "đang đứng trên cầu gió mát quá.",
    "đừng khuyên tôi nữa vô ích thôi."
]

# ==============================================================================
# 3. CÁC HÀM SINH DỮ LIỆU (GENERATORS)
# ==============================================================================

def gen_informational():
    # Style 1: Formal (Trang trọng) - 50%
    if random.random() < 0.5:
        text = f"{random.choice(info_prefixes)} {random.choice(info_concepts)} {random.choice(info_questions)}?"
    # Style 2: Short/Direct (Ngắn gọn) - 50%
    else:
        text = f"{random.choice(info_concepts)} {random.choice(info_questions)}?"
    
    # Làm sạch khoảng trắng thừa
    text = " ".join(text.split()).strip()
    if not text.endswith("?"): text += "?"
    return text.capitalize()

def gen_complex_reasoning():
    pronoun = random.choice(pronouns)
    context = random.choice(complex_contexts)
    symptom = random.choice(complex_symptoms)
    request = random.choice(complex_requests)
    time = random.choice(timeframes)
    filler = random.choice(fillers)
    
    style = random.randint(1, 4)
    
    if style == 1: # Full story: Context -> Symptom -> Request
        text = f"{pronoun} bị {context}, {time} {pronoun} thấy {symptom}. {request}"
    elif style == 2: # Symptom focus: Time -> Symptom -> Filler -> Context
        text = f"{time} {pronoun} thấy {symptom} do {context}. {pronoun} {filler} lo lắng, {request}"
    elif style == 3: # Question first: Request -> Context
        text = f"{request} {pronoun} cứ {symptom} mãi, có phải do {context} không?"
    else: # Conversational/Teen code (Natural noise)
        text = f"{context} khiến {pronoun} {filler}, giờ {symptom} suốt. {request}"
        
    return text

def gen_high_risk():
    pronoun = random.choice(pronouns)
    trigger = random.choice(risk_triggers)
    action = random.choice(risk_actions)
    plan = random.choice(risk_plans)
    
    style = random.randint(1, 3)
    
    if style == 1: # Full explicit
        text = f"{pronoun} {trigger}, {pronoun} {action}. {plan}"
    elif style == 2: # Action focus
        text = f"{action}. {plan}"
    else: # Cry for help
        text = f"Cứu {pronoun} với, {pronoun} đang nghĩ quẩn {action}."
        
    return text

# ==============================================================================
# 4. MAIN LOOP & SPLIT LOGIC
# ==============================================================================

def main():
    data = []
    seen_hashes = set() # Dùng hash để check trùng lặp cực nhanh
    samples_per_class = TARGET_TOTAL // 3
    
    print("⏳ Đang bắt đầu sinh dữ liệu...")

    # --- GIAI ĐOẠN 1: SINH & LỌC TRÙNG ---
    generators = [
        ("informational", gen_informational),
        ("complex_reasoning", gen_complex_reasoning),
        ("high_risk", gen_high_risk)
    ]

    for label, generator_func in generators:
        print(f"   🔹 Đang sinh nhóm: {label}...", end="\r")
        count = 0
        attempts = 0
        while count < samples_per_class:
            text = generator_func()
            
            # KIỂM TRA TRÙNG LẶP
            if text not in seen_hashes:
                data.append({"text": text, "label": label})
                seen_hashes.add(text)
                count += 1
            
            attempts += 1
            if attempts > samples_per_class * 20: # Tránh vòng lặp vô tận nếu hết từ
                print(f"\n⚠️ Cảnh báo: Không thể sinh thêm mẫu duy nhất cho {label}. Dừng ở {count}.")
                break
        print(f"   ✅ Xong nhóm {label}: {count} dòng.")

    # --- GIAI ĐOẠN 2: XÁO TRỘN ---
    print("🔄 Đang xáo trộn (Shuffle) dữ liệu...")
    random.shuffle(data)

    # --- GIAI ĐOẠN 3: CHIA TÁCH (SPLIT) ---
    split_idx = int(len(data) * TRAIN_RATIO)
    
    train_data = data[:split_idx]
    test_data = data[split_idx:]

    # --- GIAI ĐOẠN 4: LƯU FILE ---
    print(f"💾 Đang lưu file Train ({len(train_data)} dòng)...")
    with open(OUTPUT_TRAIN, "w", encoding="utf-8") as f:
        for entry in train_data:
            json.dump(entry, f, ensure_ascii=False)
            f.write("\n")

    print(f"💾 Đang lưu file Test ({len(test_data)} dòng)...")
    with open(OUTPUT_TEST, "w", encoding="utf-8") as f:
        for entry in test_data:
            json.dump(entry, f, ensure_ascii=False)
            f.write("\n")

    # --- TỔNG KẾT ---
    print("="*50)
    print("🎉 HOÀN TẤT QUÁ TRÌNH!")
    print(f"📊 Tổng số mẫu đã sinh: {len(data)}")
    print(f"📂 File Train: {OUTPUT_TRAIN} ({len(train_data)} mẫu)")
    print(f"📂 File Test:  {OUTPUT_TEST} ({len(test_data)} mẫu)")
    print("👉 Bước tiếp theo: Upload 2 file này lên Google Colab để Train model.")
    print("="*50)

if __name__ == "__main__":
    main()