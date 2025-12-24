import unittest
import logging
from chunking_txt import (
    clean_and_normalize_text,
    process_dsm5,
    process_medical_protocol,
    split_large_text
)

# Cấu hình log cho đẹp
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class TestMedicalRAGProcessing(unittest.TestCase):

    def setUp(self):
        print("\n" + "="*60)

    # ==========================================================================
    # TEST 1: KIỂM TRA TỪ ĐIỂN CHUẨN HÓA (Bot có hết nói ngọng không?)
    # ==========================================================================
    def test_term_normalization(self):
        logger.info("TEST 1: Kiểm tra chuẩn hóa thuật ngữ y khoa...")
        
        raw_inputs = [
            "Bệnh nhân có dấu hiệu căng thẳng cơ và rung rinh cơ thể.",
            "Cảm thấy buồn chán và đứng ngồi không yên.",
            "Không có hứng thú làm việc (giảm hứng thú)."
        ]
        
        expected_terms = [
            "căng cơ (muscle tension)",
            "bồn chồn (restlessness)",
            "khí sắc trầm cảm",
            "kích động tâm thần vận động",
            "mất hứng thú (anhedonia)"
        ]

        for text in raw_inputs:
            processed = clean_and_normalize_text(text)
            print(f"   Input:  {text}")
            print(f"   Output: {processed}")
            
            # Kiểm tra xem từ cũ còn tồn tại không
            self.assertNotIn("căng thẳng cơ", processed)
            self.assertNotIn("rung rinh cơ thể", processed)
            
            # Kiểm tra xem từ mới có xuất hiện không
            found_any = any(term in processed for term in expected_terms)
            self.assertTrue(found_any, "❌ Không tìm thấy thuật ngữ chuẩn trong kết quả!")

    # ==========================================================================
    # TEST 2: KIỂM TRA LOGIC DSM-5 (Có bắt đúng Diagnostic Criteria không?)
    # ==========================================================================
    def test_dsm5_extraction(self):
        logger.info("TEST 2: Kiểm tra trích xuất DSM-5 & Metadata...")

        # Giả lập một đoạn văn bản DSM-5 "khó nhằn"
        mock_text = """
        Rác đầu file...
        
        Diagnostic Criteria for GAD:
        A. Excessive anxiety and worry...
        B. The individual finds it difficult to control...
        C. The anxiety and worry are associated with three (or more)...
           1. Restlessness or feeling keyed up.
           2. Being easily fatigued.
        
        Diagnostic Criteria for PTSD:
        A. Exposure to actual or threatened death...
        """

        chunks = process_dsm5(mock_text, "DSM-5-Mock.txt")
        
        # 1. Phải tìm thấy 2 chunks (GAD và PTSD)
        self.assertEqual(len(chunks), 2, f"❌ Mong đợi 2 chunks, tìm thấy {len(chunks)}")
        
        # 2. Kiểm tra Metadata chunk 1
        chunk1 = chunks[0]
        self.assertEqual(chunk1['metadata']['standard'], 'DSM-5')
        self.assertEqual(chunk1['metadata']['disease_name'], 'GAD')
        
        # 3. Kiểm tra Anchor Text (Nguồn gốc phải được chèn vào nội dung)
        self.assertIn("[Nguồn: DSM-5 (Tiêu chuẩn gốc) | Bệnh: GAD]", chunk1['content'])
        
        print(f"   ✅ Detected: {chunk1['metadata']['disease_name']}")
        print(f"   ✅ Detected: {chunks[1]['metadata']['disease_name']}")

    # ==========================================================================
    # TEST 3: KIỂM TRA LOGIC ICD-11 (Regex có bắt được mã code lạ không?)
    # ==========================================================================
    def test_icd11_extraction(self):
        logger.info("TEST 3: Kiểm tra trích xuất ICD-11 & Protocol...")

        # Giả lập ICD-11 với mã code (6B00) thay vì số thứ tự
        mock_text = """
        Chương 6: Rối loạn tâm thần
        
        6B00. Generalized anxiety disorder
        Lo âu lan tỏa là một rối loạn đặc trưng bởi...
        
        6B01. Panic disorder
        Rối loạn hoảng sợ đặc trưng bởi các cơn hoảng loạn...
        """

        chunks = process_medical_protocol(mock_text, "ICD-11.txt")
        
        # Regex cũ thường trượt cái này, check xem regex mới bắt được không
        self.assertGreaterEqual(len(chunks), 2, "❌ Không bắt được các mã bệnh dạng '6B00.'")
        
        chunk0 = chunks[0]
        self.assertEqual(chunk0['metadata']['standard'], 'ICD-11') # Dựa vào tên file giả lập
        self.assertIn("Generalized anxiety disorder", chunk0['metadata']['disease_name'])
        
        print(f"   ✅ ICD-11 Header matched: {chunk0['metadata']['disease_name']}")

    # ==========================================================================
    # TEST 4: KIỂM TRA CẮT NHỎ THÔNG MINH (Smart Splitting)
    # ==========================================================================
    def test_smart_splitting(self):
        logger.info("TEST 4: Kiểm tra cắt đoạn thông minh (Không cắt giữa câu)...")
        
        # Tạo một câu siêu dài không có dấu chấm
        long_sentence = "A" * 1000
        # Tạo câu có dấu chấm ở vị trí hợp lý
        text_with_dot = ("Word " * 300) + ". Dừng ở đây. " + ("Word " * 300)
        
        # Test 1: Đoạn văn bản dài có dấu chấm
        chunks = split_large_text(text_with_dot, max_chars=1600)
        
        # Chunk đầu tiên nên kết thúc bằng dấu chấm
        first_chunk = chunks[0]
        self.assertTrue(first_chunk.endswith("."), f"❌ Chunk bị cắt giữa chừng: ...{first_chunk[-10:]}")
        self.assertIn("Dừng ở đây.", first_chunk)
        
        print(f"   ✅ Cắt đúng tại dấu chấm câu: ...{first_chunk[-20:]}")

if __name__ == '__main__':
    unittest.main()