from flask import Blueprint, request, jsonify
from app.services.llm_service import ask_gemini
import logging

logger = logging.getLogger(__name__)
bp = Blueprint("llm", __name__)

@bp.route("/test", methods=["GET"])
def test():
    """Test endpoint to check if API is working"""
    return jsonify({"ok": True, "message": "LLM API is working!"})

@bp.route("/health", methods=["GET"])
def health():
    """Health check endpoint"""
    return jsonify({
        "ok": True, 
        "service": "llm", 
        "status": "healthy",
        "endpoints": ["/chat", "/test", "/health"]
    })

@bp.route("/chat", methods=["POST"])
def chat():
    """
    Body JSON:
    {
      "message": "Xin chào, tóm tắt giúp tôi ...",
      "system": "Bạn là trợ lý ...",            # optional
      "model": "gemini-1.5-flash",              # optional
      "generation_config": { "temperature": 0 } # optional
    }
    """
    try:
        logger.info("Received chat request")
        
        if not request.is_json:
            logger.warning("Request is not JSON")
            return jsonify({"ok": False, "error": "Request must be application/json"}), 400

        data = request.get_json(silent=True) or {}
        message = (data.get("message") or "").strip()
        system = (data.get("system") or "").strip() or None
        model = (data.get("model") or "").strip() or None
        extra_cfg = data.get("generation_config") or None

        logger.info(f"Message: {message[:100]}...")
        logger.info(f"Model: {model}")

        if not message:
            logger.warning("Empty message received")
            return jsonify({"ok": False, "error": "Field 'message' is required"}), 400

        result = ask_gemini(
            message=message,
            system_instruction=system,
            model_name=model,
            extra_generation_config=extra_cfg
        )

        status = 200 if result.get("ok") else 500
        logger.info(f"Returning response with status {status}")
        return jsonify(result), status
        
    except Exception as e:
        logger.error(f"Unexpected error in chat endpoint: {str(e)}")
        return jsonify({"ok": False, "error": "Internal server error"}), 500
