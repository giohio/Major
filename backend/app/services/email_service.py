"""
Email notification service for appointments
"""

import os
from flask_mail import Mail, Message
from flask import current_app
from datetime import datetime
from typing import Optional

# Initialize Flask-Mail
mail = Mail()


class EmailService:
    """Service for sending email notifications"""
    
    @staticmethod
    def send_appointment_confirmation(
        to_email: str,
        patient_name: str,
        doctor_name: str,
        appointment_time: datetime,
        consultation_type: str,
        appointment_id: int
    ) -> bool:
        """Send appointment confirmation email to patient"""
        
        try:
            subject = f"Xác nhận lịch hẹn với {doctor_name}"
            
            body = f"""
            Xin chào {patient_name},
            
            Lịch hẹn của bạn đã được xác nhận thành công!
            
            Thông tin lịch hẹn:
            - Bác sĩ: {doctor_name}
            - Thời gian: {appointment_time.strftime('%d/%m/%Y %H:%M')}
            - Loại tư vấn: {consultation_type}
            - Mã lịch hẹn: #{appointment_id}
            
            Vui lòng chuẩn bị trước 5 phút để bắt đầu buổi tư vấn.
            
            Nếu bạn cần thay đổi hoặc hủy lịch hẹn, vui lòng liên hệ với chúng tôi ít nhất 24 giờ trước.
            
            Trân trọng,
            Đội ngũ hỗ trợ
            """
            
            html_body = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                    .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                    .info-box {{ background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }}
                    .info-item {{ padding: 10px 0; border-bottom: 1px solid #eee; }}
                    .info-item:last-child {{ border-bottom: none; }}
                    .label {{ font-weight: bold; color: #667eea; }}
                    .footer {{ text-align: center; padding: 20px; color: #777; font-size: 12px; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Xác nhận lịch hẹn</h1>
                    </div>
                    <div class="content">
                        <p>Xin chào <strong>{patient_name}</strong>,</p>
                        <p>Lịch hẹn của bạn đã được xác nhận thành công!</p>
                        
                        <div class="info-box">
                            <div class="info-item">
                                <span class="label">Bác sĩ:</span> {doctor_name}
                            </div>
                            <div class="info-item">
                                <span class="label">Thời gian:</span> {appointment_time.strftime('%d/%m/%Y %H:%M')}
                            </div>
                            <div class="info-item">
                                <span class="label">Loại tư vấn:</span> {consultation_type}
                            </div>
                            <div class="info-item">
                                <span class="label">Mã lịch hẹn:</span> #{appointment_id}
                            </div>
                        </div>
                        
                        <p>Vui lòng chuẩn bị trước 5 phút để bắt đầu buổi tư vấn.</p>
                        <p>Nếu bạn cần thay đổi hoặc hủy lịch hẹn, vui lòng liên hệ với chúng tôi ít nhất 24 giờ trước.</p>
                    </div>
                    <div class="footer">
                        <p>Email này được gửi tự động, vui lòng không trả lời.</p>
                        <p>&copy; 2024 Mental Health Support Platform</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            msg = Message(
                subject=subject,
                recipients=[to_email],
                body=body,
                html=html_body
            )
            
            mail.send(msg)
            return True
            
        except Exception as e:
            current_app.logger.error(f"Failed to send email: {str(e)}")
            return False
    
    @staticmethod
    def send_appointment_reminder(
        to_email: str,
        patient_name: str,
        doctor_name: str,
        appointment_time: datetime,
        appointment_id: int
    ) -> bool:
        """Send appointment reminder email (24 hours before)"""
        
        try:
            subject = f"Nhắc nhở: Lịch hẹn với {doctor_name} vào ngày mai"
            
            body = f"""
            Xin chào {patient_name},
            
            Đây là lời nhắc về lịch hẹn của bạn:
            
            - Bác sĩ: {doctor_name}
            - Thời gian: {appointment_time.strftime('%d/%m/%Y %H:%M')}
            - Mã lịch hẹn: #{appointment_id}
            
            Vui lòng chuẩn bị trước 5 phút.
            
            Trân trọng,
            Đội ngũ hỗ trợ
            """
            
            html_body = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background: #667eea; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                    .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>⏰ Nhắc nhở lịch hẹn</h1>
                    </div>
                    <div class="content">
                        <p>Xin chào <strong>{patient_name}</strong>,</p>
                        <p>Đây là lời nhắc về lịch hẹn của bạn vào ngày mai:</p>
                        <ul>
                            <li><strong>Bác sĩ:</strong> {doctor_name}</li>
                            <li><strong>Thời gian:</strong> {appointment_time.strftime('%d/%m/%Y %H:%M')}</li>
                            <li><strong>Mã lịch hẹn:</strong> #{appointment_id}</li>
                        </ul>
                        <p>Vui lòng chuẩn bị trước 5 phút.</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            msg = Message(
                subject=subject,
                recipients=[to_email],
                body=body,
                html=html_body
            )
            
            mail.send(msg)
            return True
            
        except Exception as e:
            current_app.logger.error(f"Failed to send reminder: {str(e)}")
            return False
    
    @staticmethod
    def send_doctor_notification(
        to_email: str,
        doctor_name: str,
        patient_name: str,
        appointment_time: datetime,
        consultation_type: str,
        appointment_id: int
    ) -> bool:
        """Send new appointment notification to doctor"""
        
        try:
            subject = f"Lịch hẹn mới từ {patient_name}"
            
            body = f"""
            Xin chào Bác sĩ {doctor_name},
            
            Bạn có lịch hẹn mới:
            
            - Bệnh nhân: {patient_name}
            - Thời gian: {appointment_time.strftime('%d/%m/%Y %H:%M')}
            - Loại tư vấn: {consultation_type}
            - Mã lịch hẹn: #{appointment_id}
            
            Vui lòng chuẩn bị trước buổi tư vấn.
            
            Trân trọng,
            Hệ thống
            """
            
            html_body = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background: #10b981; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                    .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>📅 Lịch hẹn mới</h1>
                    </div>
                    <div class="content">
                        <p>Xin chào Bác sĩ <strong>{doctor_name}</strong>,</p>
                        <p>Bạn có lịch hẹn mới:</p>
                        <ul>
                            <li><strong>Bệnh nhân:</strong> {patient_name}</li>
                            <li><strong>Thời gian:</strong> {appointment_time.strftime('%d/%m/%Y %H:%M')}</li>
                            <li><strong>Loại tư vấn:</strong> {consultation_type}</li>
                            <li><strong>Mã lịch hẹn:</strong> #{appointment_id}</li>
                        </ul>
                        <p>Vui lòng chuẩn bị trước buổi tư vấn.</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            msg = Message(
                subject=subject,
                recipients=[to_email],
                body=body,
                html=html_body
            )
            
            mail.send(msg)
            return True
            
        except Exception as e:
            current_app.logger.error(f"Failed to send doctor notification: {str(e)}")
            return False
