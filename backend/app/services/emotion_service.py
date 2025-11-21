import google.generativeai as genai
from flask import current_app
from app.models.models import EmotionLog, Alert
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
            
            # Save emotion log if user_id provided
            if user_id:
                emotion_log = EmotionLog(
                    user_id=user_id,
                    emotion=result.get('primary_emotion', 'neutral'),
                    intensity=result.get('intensity', 5),
                    sentiment_score=result.get('sentiment_score', 0.0),
                    triggers=result.get('triggers', ''),
                    logged_at=datetime.utcnow()
                )
                db.session.add(emotion_log)
                db.session.commit()
            
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
        
        # Get emotion logs
        logs = EmotionLog.query.filter(
            EmotionLog.user_id == user_id,
            EmotionLog.logged_at >= start_date
        ).order_by(EmotionLog.logged_at.desc()).all()
        
        if not logs:
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
        total_intensity = 0
        total_sentiment = 0
        
        for log in logs:
            emotion_counts[log.emotion] = emotion_counts.get(log.emotion, 0) + 1
            total_intensity += log.intensity
            if log.sentiment_score:
                total_sentiment += float(log.sentiment_score)
        
        avg_intensity = total_intensity / len(logs)
        avg_sentiment = total_sentiment / len(logs)
        
        # Determine trend
        if avg_sentiment > 0.3:
            trend = 'improving'
        elif avg_sentiment < -0.3:
            trend = 'declining'
        else:
            trend = 'stable'
        
        return {
            'period': period,
            'total_logs': len(logs),
            'emotion_distribution': emotion_counts,
            'average_intensity': round(avg_intensity, 2),
            'average_sentiment': round(avg_sentiment, 2),
            'trend': trend,
            'recent_logs': [log.to_dict() for log in logs[:10]]
        }
