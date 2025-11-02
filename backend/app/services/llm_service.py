import google.generativeai as genai
from typing import Optional, Dict, Any
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ==== NHẬP TRỰC TIẾP API KEY Ở ĐÂY ====
GEMINI_API_KEY = "AIzaSyAF6dggrCzQvBTdznLt8JK7iKfo8O5y1pk"  # <-- điền API key thật của bạn
DEFAULT_MODEL = "gemini-2.5-flash"             

# ==== Cấu hình SDK ====
genai.configure(api_key=GEMINI_API_KEY)

def ask_gemini(
    message: str,
    system_instruction: Optional[str] = None,
    model_name: Optional[str] = None,
    extra_generation_config: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Gọi Gemini với 1 message người dùng. Trả về dict gồm output text, usage, raw (tùy).
    """
    model = genai.GenerativeModel(
        model_name or DEFAULT_MODEL,
        system_instruction=system_instruction or None
    )

    generation_config = {
        "temperature": 0.7,
        "top_p": 0.95,
        "top_k": 40,
        "max_output_tokens": 1024,
    }
    if extra_generation_config:
        generation_config.update(extra_generation_config)

    try:
        logger.info(f"Sending request to Gemini with model: {model_name or DEFAULT_MODEL}")
        
        result = model.generate_content(
            [message],
            generation_config=generation_config,
            safety_settings=None,
        )

        output_text = (result.text or "").strip()
        logger.info(f"Received response from Gemini: {len(output_text)} characters")
        
        usage = getattr(result, "usage_metadata", None)
        
        # Simplified response - remove problematic candidates_meta
        response_data = {
            "ok": True,
            "output": output_text,
            "usage": {
                "prompt_tokens": getattr(usage, "prompt_token_count", None) if usage else None,
                "candidates_tokens": getattr(usage, "candidates_token_count", None) if usage else None,
                "total_tokens": getattr(usage, "total_token_count", None) if usage else None,
            }
        }
        
        return response_data

    except Exception as e:
        logger.error(f"Error calling Gemini API: {str(e)}")
        return {"ok": False, "error": str(e)}
