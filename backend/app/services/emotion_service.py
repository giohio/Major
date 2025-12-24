import google.generativeai as genai
from flask import current_app
from app.models.models import Alert
from app.extensions import db
from datetime import datetime
import json

class EmotionService:
    """
    Service for analyzing emotions from text using Gemini AI
    """
    
    @staticmethod
    def configure_gemini():
        """Configure Gemini API"""
        genai.configure(api_key=current_app.config['GOOGLE_API_KEY'])
    
    @staticmethod
    def analyze_text_emotion(text, user_id=None):
        """
        Analyze emotion from text using Gemini AI
        
        Args:
            text: The text to analyze
            user_id: Optional user ID to save emotion log
            
        Returns:
            dict: Emotion analysis result
        """
        try:
            EmotionService.configure_gemini()
            
            model = genai.GenerativeModel('gemini-pro')
            
            prompt = f"""
            Analyze the emotional content of the following text and provide a JSON response with:
            1. primary_emotion: The main emotion (happy, sad, anxious, angry, fearful, neutral)
            2. intensity: Rate from 1-10
            3. sentiment_score: Between -1.0 (very negative) to 1.0 (very positive)
            4. secondary_emotions: List of other emotions detected
            5. risk_level: Assess mental health risk (low, medium, high, critical)
            6. triggers: Possible triggers identified
            7. needs_attention: Boolean indicating if professional help might be needed
            
            Text to analyze: "{text}"
            
            Respond ONLY with valid JSON.
            """
            
            response = model.generate_content(prompt)
            
            # Parse the response
            try:
                result_text = response.text.strip()
                # Remove markdown code blocks if present
                if result_text.startswith('```json'):
                    result_text = result_text[7:]
                if result_text.startswith('```'):
                    result_text = result_text[3:]
                if result_text.endswith('```'):
                    result_text = result_text[:-3]
                
                result = json.loads(result_text.strip())
            except json.JSONDecodeError:
                # Fallback if JSON parsing fails
                result = {
                    'primary_emotion': 'neutral',
                    'intensity': 5,
                    'sentiment_score': 0.0,
                    'secondary_emotions': [],
                    'risk_level': 'low',
                    'triggers': '',
                    'needs_attention': False
                }
            
            # Note: Emotions are now stored in ChatMessage, not EmotionLog
            # This function only returns analysis; saving happens in chat routes
            
            return {
                'success': True,
                'analysis': result
            }
            
        except Exception as e:
            print(f"Error analyzing emotion: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'analysis': {
                    'primary_emotion': 'neutral',
                    'intensity': 5,
                    'sentiment_score': 0.0,
                    'risk_level': 'low'
                }
            }
    
    @staticmethod
    def get_emotion_stats(user_id, period='week'):
        """
        Get emotion statistics for a user
        
        Args:
            user_id: User ID
            period: 'week', 'month', or 'year'
            
        Returns:
            dict: Emotion statistics
        """
        from datetime import timedelta
        
        # Calculate date range
        now = datetime.utcnow()
        if period == 'week':
            start_date = now - timedelta(days=7)
        elif period == 'month':
            start_date = now - timedelta(days=30)
        elif period == 'year':
            start_date = now - timedelta(days=365)
        else:
            start_date = now - timedelta(days=7)
        
        # Get emotion data from chat messages
        from app.models.models import ChatMessage, ChatSession
        
        messages = db.session.query(ChatMessage)\
            .join(ChatSession)\
            .filter(
                ChatSession.user_id == user_id,
                ChatMessage.role == 'user',
                ChatMessage.emotion_detected.isnot(None),
                ChatMessage.created_at >= start_date
            ).order_by(ChatMessage.created_at.desc()).all()
        
        if not messages:
            return {
                'period': period,
                'total_logs': 0,
                'emotion_distribution': {},
                'average_intensity': 0,
                'average_sentiment': 0,
                'trend': 'neutral'
            }
        
        # Calculate statistics
        emotion_counts = {}
        total_sentiment = 0
        
        for msg in messages:
            emotion_counts[msg.emotion_detected] = emotion_counts.get(msg.emotion_detected, 0) + 1
            if msg.sentiment_score:
                total_sentiment += float(msg.sentiment_score)
        
        avg_sentiment = total_sentiment / len(messages)
        avg_intensity = 5  # Default value for backward compatibility
        
        # Determine trend
        if avg_sentiment > 0.3:
            trend = 'improving'
        elif avg_sentiment < -0.3:
            trend = 'declining'
        else:
            trend = 'stable'
        
        return {
            'period': period,
            'total_logs': len(messages),
            'emotion_distribution': emotion_counts,
            'average_intensity': round(avg_intensity, 2),
            'average_sentiment': round(avg_sentiment, 2),
            'trend': trend,
            'recent_logs': [{
                'id': msg.id,
                'emotion': msg.emotion_detected,
                'sentiment_score': float(msg.sentiment_score) if msg.sentiment_score else 0,
                'created_at': msg.created_at.isoformat()
            } for msg in messages[:10]]
        }
