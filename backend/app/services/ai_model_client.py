"""
AI Model Client Service
Gọi FastAPI model của bạn qua Ngrok
"""

import requests
from typing import Dict, List, Any, Optional
from flask import current_app
import json


class AIModelClient:
    """Client để gọi AI Model FastAPI"""
    
    def __init__(self, base_url: str = None):
        """
        Initialize AI Model Client
        
        Args:
            base_url: URL của model API (Ngrok hoặc production URL)
        """
        self.base_url = base_url or current_app.config.get(
            'AI_MODEL_URL', 
            'https://lissotrichous-irreclaimably-jessenia.ngrok-free.dev'
        )
        self.timeout = 90  # 90 seconds timeout (increased from 30)
    
    def health_check(self) -> bool:
        """
        Kiểm tra model có đang chạy không
        
        Returns:
            bool: True nếu model đang hoạt động
        """
        try:
            response = requests.get(
                f"{self.base_url}/",
                timeout=5
            )
            return response.status_code == 200
        except Exception as e:
            print(f"AI Model health check failed: {e}")
            return False
    
    def chat(self, session_id: str, user_text: str) -> Dict[str, Any]:
        """
        Gọi endpoint /chat để trò chuyện với AI
        
        Args:
            session_id: ID của session chat
            user_text: Tin nhắn của user
            
        Returns:
            dict: {
                "response": "AI response text",
                "intent": "detected intent",
                "emotion": "detected emotion"
            }
        """
        try:
            payload = {
                "session_id": session_id,
                "user_text": user_text
            }
            
            response = requests.post(
                f"{self.base_url}/chat",
                json=payload,
                timeout=self.timeout,
                headers={'Content-Type': 'application/json'}
            )
            
            response.raise_for_status()
            return response.json()
            
        except requests.exceptions.Timeout:
            print("AI Model chat timeout")
            return {
                "response": "Xin lỗi, hệ thống đang phản hồi chậm. Vui lòng thử lại.",
                "intent": "unknown",
                "emotion": "neutral",
                "error": "timeout"
            }
        except requests.exceptions.RequestException as e:
            print(f"AI Model chat error: {e}")
            return {
                "response": "Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.",
                "intent": "unknown",
                "emotion": "neutral",
                "error": str(e)
            }
    
    def generate_user_dashboard(self, conversation: List[Dict[str, str]]) -> Dict[str, Any]:
        """
        Tạo dashboard analytics cho user (emotion tracking)
        
        Args:
            conversation: List of messages [{"role": "user", "content": "..."}]
            
        Returns:
            dict: Dashboard analytics theo schema đã định nghĩa
        """
        try:
            payload = {
                "conversation": conversation
            }
            
            response = requests.post(
                f"{self.base_url}/report/user",
                json=payload,
                timeout=self.timeout,
                headers={'Content-Type': 'application/json'}
            )
            
            response.raise_for_status()
            return response.json()
            
        except requests.exceptions.Timeout:
            print("User dashboard generation timeout")
            return self._fallback_dashboard_response()
        except requests.exceptions.RequestException as e:
            print(f"User dashboard generation error: {e}")
            return self._fallback_dashboard_response()
    
    def generate_clinical_report(self, conversation: List[Dict[str, str]]) -> Dict[str, Any]:
        """
        Tạo clinical report cho bác sĩ
        
        Args:
            conversation: List of messages [{"role": "user", "content": "..."}]
            
        Returns:
            dict: Clinical report theo schema đã định nghĩa
        """
        try:
            payload = {
                "conversation": conversation
            }
            
            response = requests.post(
                f"{self.base_url}/report/clinical",
                json=payload,
                timeout=self.timeout,
                headers={'Content-Type': 'application/json'}
            )
            
            response.raise_for_status()
            return response.json()
            
        except requests.exceptions.Timeout:
            print("Clinical report generation timeout")
            return self._fallback_clinical_response()
        except requests.exceptions.RequestException as e:
            print(f"Clinical report generation error: {e}")
            return self._fallback_clinical_response()
    
    def _fallback_dashboard_response(self) -> Dict[str, Any]:
        """Fallback response nếu model không phản hồi"""
        return {
            "session_id": "fallback",
            "report_type": "emotion_analytics",
            "session_analysis": {
                "dominant_emotion": "neutral",
                "emotional_breakdown": {"neutral": 1.0},
                "overall_sentiment": 0.0,
                "intensity_average": 0.5
            },
            "emotional_progression": [],
            "triggers": {"primary": "Không xác định"},
            "risk_indicators": {"level": "low", "flags": []},
            "trend": "stable",
            "simple_summary": "Không thể phân tích do lỗi hệ thống.",
            "error": True
        }
    
    def _fallback_clinical_response(self) -> Dict[str, Any]:
        """Fallback response cho clinical report"""
        return {
            "session_id": "fallback",
            "report_type": "clinical_assessment",
            "dominant_emotion": "NEUTRAL",
            "emotional_changes": "Không xác định",
            "case_formulation": {
                "precipitants": ["Không xác định"],
                "automatic_thoughts": ["Không xác định"],
                "maladaptive_behaviors": ["Không xác định"]
            },
            "risk_assessment": {
                "suicidal_ideation": False,
                "severity_level": "low",
                "notes": "Không thể đánh giá do lỗi hệ thống"
            },
            "clinical_plan": {
                "interventions_used": [],
                "recommended_interventions": ["Đánh giá lại khi hệ thống hoạt động"],
                "next_steps": ["Kiểm tra lại hệ thống"]
            },
            "summary": "Không thể tạo báo cáo lâm sàng do lỗi hệ thống.",
            "error": True
        }


# Singleton instance
_client_instance = None

def get_ai_client() -> AIModelClient:
    """Get singleton instance of AI Model Client"""
    global _client_instance
    if _client_instance is None:
        _client_instance = AIModelClient()
    return _client_instance
