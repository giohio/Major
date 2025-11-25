"""
Notification Service
Handles sending notifications via different channels (email, SMS, push)
"""

from typing import Optional, List
import logging
from datetime import datetime

logger = logging.getLogger(__name__)


class NotificationService:
    """Service for sending notifications to users"""
    
    @staticmethod
    def send_email(
        to_email: str,
        subject: str,
        body: str,
        html_body: Optional[str] = None
    ) -> bool:
        """
        Send email notification
        
        Args:
            to_email: Recipient email address
            subject: Email subject
            body: Plain text email body
            html_body: Optional HTML email body
            
        Returns:
            bool: True if sent successfully
        """
        try:
            # TODO: Implement actual email sending
            # Using Flask-Mail or other email service
            logger.info(f"Email would be sent to {to_email}")
            logger.info(f"Subject: {subject}")
            logger.info(f"Body: {body[:100]}...")
            
            # For now, just log the email
            # In production, integrate with:
            # - SendGrid
            # - AWS SES
            # - SMTP server
            # - Or other email service
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email: {str(e)}")
            return False
    
    @staticmethod
    def send_alert_notification(
        user_email: str,
        user_name: str,
        alert_type: str,
        severity: str,
        message: str,
        doctor_emails: Optional[List[str]] = None
    ) -> bool:
        """
        Send alert notification to doctors/admins
        
        Args:
            user_email: Patient's email
            user_name: Patient's name
            alert_type: Type of alert
            severity: Severity level
            message: Alert message
            doctor_emails: List of doctor emails to notify
            
        Returns:
            bool: True if sent successfully
        """
        try:
            subject = f"[{severity.upper()}] Mental Health Alert: {user_name}"
            
            body = f"""
Mental Health Alert Notification

Patient: {user_name} ({user_email})
Alert Type: {alert_type}
Severity: {severity.upper()}
Time: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}

Message:
{message}

Please review this alert and take appropriate action.

---
This is an automated notification from the Mental Health Support System.
            """
            
            # Send to doctors
            if doctor_emails:
                for doctor_email in doctor_emails:
                    NotificationService.send_email(
                        to_email=doctor_email,
                        subject=subject,
                        body=body
                    )
            
            logger.info(f"Alert notification sent for user {user_email}, severity: {severity}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send alert notification: {str(e)}")
            return False
    
    @staticmethod
    def send_password_reset_email(
        to_email: str,
        reset_token: str,
        frontend_url: str = "http://localhost:3000"
    ) -> bool:
        """
        Send password reset email
        
        Args:
            to_email: User's email
            reset_token: Password reset token
            frontend_url: Frontend application URL
            
        Returns:
            bool: True if sent successfully
        """
        try:
            reset_url = f"{frontend_url}/reset-password?token={reset_token}"
            
            subject = "Password Reset Request"
            
            body = f"""
You have requested to reset your password.

Click the link below to reset your password:
{reset_url}

This link will expire in 1 hour.

If you did not request this password reset, please ignore this email.

---
Mental Health Support System
            """
            
            html_body = f"""
            <html>
                <body style="font-family: Arial, sans-serif;">
                    <h2>Password Reset Request</h2>
                    <p>You have requested to reset your password.</p>
                    <p>Click the button below to reset your password:</p>
                    <a href="{reset_url}" 
                       style="background-color: #4CAF50; 
                              color: white; 
                              padding: 14px 20px; 
                              text-decoration: none; 
                              display: inline-block; 
                              border-radius: 4px;">
                        Reset Password
                    </a>
                    <p>Or copy this link: <br/>{reset_url}</p>
                    <p><small>This link will expire in 1 hour.</small></p>
                    <p><small>If you did not request this password reset, please ignore this email.</small></p>
                    <hr/>
                    <p><small>Mental Health Support System</small></p>
                </body>
            </html>
            """
            
            return NotificationService.send_email(
                to_email=to_email,
                subject=subject,
                body=body,
                html_body=html_body
            )
            
        except Exception as e:
            logger.error(f"Failed to send password reset email: {str(e)}")
            return False
    
    @staticmethod
    def send_webhook_notification(
        webhook_url: str,
        data: dict
    ) -> bool:
        """
        Send webhook notification (for real-time alerts)
        
        Args:
            webhook_url: Webhook URL to send notification to
            data: Data to send in webhook
            
        Returns:
            bool: True if sent successfully
        """
        try:
            import requests
            
            response = requests.post(
                webhook_url,
                json=data,
                timeout=5
            )
            
            if response.status_code == 200:
                logger.info(f"Webhook notification sent to {webhook_url}")
                return True
            else:
                logger.warning(f"Webhook returned status {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"Failed to send webhook notification: {str(e)}")
            return False
