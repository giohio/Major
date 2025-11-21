from app.models.models import Alert, User
from app.extensions import db
from datetime import datetime
import json

class AlertService:
    """
    Service for managing mental health alerts
    """
    
    # Risk keywords and patterns
    CRITICAL_KEYWORDS = [
        'suicide', 'kill myself', 'end it all', 'want to die', 'better off dead',
        'self-harm', 'hurt myself', 'cut myself', 'overdose'
    ]
    
    HIGH_RISK_KEYWORDS = [
        'hopeless', 'worthless', 'no point', 'give up', 'can\'t go on',
        'unbearable', 'too much pain', 'no way out'
    ]
    
    @staticmethod
    def analyze_risk_level(text, emotion_analysis=None):
        """
        Analyze risk level from text and emotion analysis
        
        Args:
            text: Text to analyze
            emotion_analysis: Optional emotion analysis result from EmotionService
            
        Returns:
            dict: Risk assessment
        """
        text_lower = text.lower()
        
        # Check for critical keywords
        for keyword in AlertService.CRITICAL_KEYWORDS:
            if keyword in text_lower:
                return {
                    'risk_level': 'critical',
                    'confidence': 0.95,
                    'reason': f'Critical keyword detected: "{keyword}"',
                    'requires_immediate_attention': True
                }
        
        # Check for high risk keywords
        high_risk_count = sum(1 for keyword in AlertService.HIGH_RISK_KEYWORDS if keyword in text_lower)
        if high_risk_count >= 2:
            return {
                'risk_level': 'high',
                'confidence': 0.85,
                'reason': f'Multiple high-risk indicators detected ({high_risk_count})',
                'requires_immediate_attention': True
            }
        
        # Use emotion analysis if available
        if emotion_analysis:
            risk_level = emotion_analysis.get('risk_level', 'low')
            intensity = emotion_analysis.get('intensity', 5)
            sentiment = emotion_analysis.get('sentiment_score', 0.0)
            
            if risk_level == 'critical' or (intensity >= 9 and sentiment < -0.7):
                return {
                    'risk_level': 'critical',
                    'confidence': 0.80,
                    'reason': 'AI detected critical emotional state',
                    'requires_immediate_attention': True
                }
            elif risk_level == 'high' or (intensity >= 7 and sentiment < -0.5):
                return {
                    'risk_level': 'high',
                    'confidence': 0.70,
                    'reason': 'AI detected high emotional distress',
                    'requires_immediate_attention': True
                }
            elif risk_level == 'medium' or intensity >= 6:
                return {
                    'risk_level': 'medium',
                    'confidence': 0.60,
                    'reason': 'Moderate emotional distress detected',
                    'requires_immediate_attention': False
                }
        
        return {
            'risk_level': 'low',
            'confidence': 0.50,
            'reason': 'No significant risk indicators detected',
            'requires_immediate_attention': False
        }
    
    @staticmethod
    def create_alert(user_id, alert_type, severity, message, metadata=None):
        """
        Create a new alert
        
        Args:
            user_id: User ID
            alert_type: Type of alert (self_harm, suicide, high_stress, etc.)
            severity: Severity level (low, medium, high, critical)
            message: Alert message
            metadata: Optional additional metadata
            
        Returns:
            Alert: Created alert object
        """
        try:
            alert = Alert(
                user_id=user_id,
                alert_type=alert_type,
                severity=severity,
                message=message,
                is_resolved=False,
                created_at=datetime.utcnow()
            )
            
            db.session.add(alert)
            db.session.commit()
            
            # TODO: Send notification to doctors/admin
            # TODO: Trigger webhook for real-time notification
            
            return alert
            
        except Exception as e:
            db.session.rollback()
            print(f"Error creating alert: {str(e)}")
            return None
    
    @staticmethod
    def check_and_create_alert(user_id, text, emotion_analysis=None):
        """
        Check text for risks and create alert if needed
        
        Args:
            user_id: User ID
            text: Text to check
            emotion_analysis: Optional emotion analysis result
            
        Returns:
            Alert or None: Created alert if risk detected
        """
        risk_assessment = AlertService.analyze_risk_level(text, emotion_analysis)
        
        if not risk_assessment['requires_immediate_attention']:
            return None
        
        # Create alert
        alert_type_map = {
            'critical': 'suicide_risk',
            'high': 'self_harm_risk',
            'medium': 'high_stress'
        }
        
        alert_type = alert_type_map.get(risk_assessment['risk_level'], 'general_concern')
        
        message = f"{risk_assessment['reason']}. Confidence: {risk_assessment['confidence']*100:.0f}%"
        
        return AlertService.create_alert(
            user_id=user_id,
            alert_type=alert_type,
            severity=risk_assessment['risk_level'],
            message=message
        )
    
    @staticmethod
    def get_user_alerts(user_id, include_resolved=False):
        """
        Get alerts for a user
        
        Args:
            user_id: User ID
            include_resolved: Whether to include resolved alerts
            
        Returns:
            list: List of alerts
        """
        query = Alert.query.filter_by(user_id=user_id)
        
        if not include_resolved:
            query = query.filter_by(is_resolved=False)
        
        return query.order_by(Alert.created_at.desc()).all()
    
    @staticmethod
    def resolve_alert(alert_id, resolved_by_user_id, resolution_notes=None):
        """
        Mark an alert as resolved
        
        Args:
            alert_id: Alert ID
            resolved_by_user_id: ID of user resolving the alert
            resolution_notes: Optional notes about resolution
            
        Returns:
            bool: Success status
        """
        try:
            alert = db.session.get(Alert, alert_id)
            
            if not alert:
                return False
            
            alert.is_resolved = True
            alert.resolved_by = resolved_by_user_id
            alert.resolved_at = datetime.utcnow()
            alert.resolution_notes = resolution_notes
            
            db.session.commit()
            return True
            
        except Exception as e:
            db.session.rollback()
            print(f"Error resolving alert: {str(e)}")
            return False
    
    @staticmethod
    def get_all_active_alerts(severity_filter=None):
        """
        Get all active alerts (for admin/doctor dashboard)
        
        Args:
            severity_filter: Optional severity level to filter by
            
        Returns:
            list: List of active alerts
        """
        query = Alert.query.filter_by(is_resolved=False)
        
        if severity_filter:
            query = query.filter_by(severity=severity_filter)
        
        return query.order_by(Alert.created_at.desc()).all()
