from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.services.chat_service import ChatService
from app.services.emotion_service import EmotionService
from app.middleware.auth_middleware import token_required
from app.middleware.plan_middleware import check_chat_limit
from app.extensions import db

bp = Blueprint('chat', __name__)

@bp.route('/send', methods=['POST'])
@check_chat_limit
def send_message(current_user, plan, remaining):
    """Send message to AI chatbot"""
    try:
        data = request.get_json()
        
        if 'message' not in data:
            return jsonify({'error': 'Message is required'}), 400
        
        message = data['message']
        session_id = data.get('session_id')
        analyze_emotion = data.get('analyze_emotion', True)
        
        # Send message and get response
        result = ChatService.send_message(
            user_id=current_user.id,
            message_content=message,
            session_id=session_id,
            analyze_emotion=analyze_emotion
        )
        
        if not result['success']:
            return jsonify({'error': result.get('error')}), 500
        
        # Add remaining quota info
        result['remaining_chats'] = remaining if remaining != -1 else 'unlimited'
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/session/<int:session_id>', methods=['GET'])
@token_required
def get_session(current_user, session_id):
    """Get messages in a session with pagination"""
    try:
        limit = int(request.args.get('limit', 50))
        skip = int(request.args.get('skip', 0))
        
        messages = ChatService.get_session_messages(
            session_id, current_user.id, limit=limit, skip=skip
        )
        
        return jsonify({
            'session_id': session_id,
            'messages': messages
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/recent', methods=['GET'])
@token_required
def get_recent_sessions(current_user):
    """Get recent chat sessions"""
    try:
        limit = int(request.args.get('limit', 10))
        
        sessions = ChatService.get_user_sessions(current_user.id, limit)
        
        return jsonify({
            'sessions': sessions,
            'total': len(sessions)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/session/<int:session_id>', methods=['DELETE'])
@token_required
def delete_session(current_user, session_id):
    """Delete a chat session"""
    try:
        success = ChatService.delete_session(session_id, current_user.id)
        
        if not success:
            return jsonify({'error': 'Session not found or unauthorized'}), 404
        
        return jsonify({'message': 'Session deleted successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/session/<int:session_id>/archive', methods=['POST'])
@token_required
def archive_session(current_user, session_id):
    """Archive a chat session"""
    try:
        success = ChatService.archive_session(session_id, current_user.id)
        
        if not success:
            return jsonify({'error': 'Session not found or unauthorized'}), 404
        
        return jsonify({'message': 'Session archived successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/feedback', methods=['POST'])
@token_required
def submit_feedback(current_user):
    """Submit feedback for a message"""
    try:
        from app.models.models import ChatMessage
        from datetime import datetime
        
        data = request.get_json()
        
        required_fields = ['message_id', 'rating']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Get the message and update feedback fields
        message = db.session.get(ChatMessage, data['message_id'])
        if not message:
            return jsonify({'error': 'Message not found'}), 404
        
        # Verify user owns the session
        from app.models.models import ChatSession
        session = db.session.get(ChatSession, message.session_id)
        if not session or session.user_id != current_user.id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Update feedback
        message.rating = data['rating']
        message.feedback_text = data.get('feedback_text')
        message.feedback_created_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'message': 'Feedback submitted successfully',
            'feedback': {
                'message_id': message.id,
                'rating': message.rating,
                'feedback_text': message.feedback_text,
                'feedback_created_at': message.feedback_created_at.isoformat() if message.feedback_created_at else None
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@bp.route('/appointments/<int:appointment_id>/messages', methods=['GET'])
@token_required
def get_appointment_messages(current_user, appointment_id):
    """Get chat messages for an appointment - MongoDB only"""
    try:
        from app.models.models import Appointment, DoctorProfile
        from app.services.mongodb_service import MongoDBService
        
        print(f"[CHAT] Getting messages for appointment {appointment_id}, user {current_user.id}")
        
        # Verify user has access to this appointment
        appointment = db.session.get(Appointment, appointment_id)
        if not appointment:
            print(f"[CHAT] Appointment {appointment_id} not found")
            return jsonify({'error': 'Appointment not found'}), 404
        
        print(f"[CHAT] Appointment found: user_id={appointment.user_id}, doctor_id={appointment.doctor_id}")
        
        # Check authorization (user or doctor)
        if appointment.user_id != current_user.id:
            # Check if current user is the doctor
            doctor_profile = DoctorProfile.query.filter_by(user_id=current_user.id).first()
            if not doctor_profile or appointment.doctor_id != doctor_profile.id:
                print(f"[CHAT] Unauthorized: user {current_user.id} not authorized for appointment {appointment_id}")
                return jsonify({'error': 'Unauthorized'}), 403
            print(f"[CHAT] User is doctor with profile {doctor_profile.id}")
        else:
            print(f"[CHAT] User is patient")
        
        # Get messages from MongoDB
        mongo_service = MongoDBService()
        messages = mongo_service.get_appointment_chat_history(appointment_id)
        
        print(f"[CHAT] Found {len(messages)} messages in MongoDB")
        
        # Format response
        formatted_messages = [{
            'id': msg.get('_id'),
            'role': msg.get('sender_role'),
            'message': msg.get('message'),
            'created_at': msg.get('timestamp'),
            'read': True
        } for msg in messages]
        
        return jsonify({'messages': formatted_messages}), 200
        
    except Exception as e:
        print(f"[CHAT] Error getting messages: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@bp.route('/appointments/<int:appointment_id>/messages', methods=['POST'])
@token_required
def send_appointment_message(current_user, appointment_id):
    """Send a chat message - save to MongoDB only, session metadata in PostgreSQL"""
    try:
        from app.models.models import Appointment, ChatSession, DoctorProfile
        from app.services.mongodb_service import MongoDBService
        from datetime import datetime
        
        print(f"[CHAT] Sending message for appointment {appointment_id}, user {current_user.id}")
        
        data = request.get_json()
        print(f"[CHAT] Request data: {data}")
        
        if 'message' not in data:
            print(f"[CHAT] Error: Message field missing")
            return jsonify({'error': 'Message is required'}), 400
        
        # Verify appointment
        appointment = db.session.get(Appointment, appointment_id)
        if not appointment:
            print(f"[CHAT] Error: Appointment {appointment_id} not found")
            return jsonify({'error': 'Appointment not found'}), 404
        
        print(f"[CHAT] Appointment found: user_id={appointment.user_id}, doctor_id={appointment.doctor_id}")
        
        # Determine role
        is_doctor = False
        doctor_profile = DoctorProfile.query.filter_by(user_id=current_user.id).first()
        if doctor_profile and appointment.doctor_id == doctor_profile.id:
            is_doctor = True
            print(f"[CHAT] User is doctor with profile {doctor_profile.id}")
        elif appointment.user_id != current_user.id:
            print(f"[CHAT] Error: User {current_user.id} unauthorized for appointment {appointment_id}")
            return jsonify({'error': 'Unauthorized'}), 403
        else:
            print(f"[CHAT] User is patient")
        
        # Get or create chat session metadata (PostgreSQL - metadata only)
        chat_session = ChatSession.query.filter_by(
            user_id=appointment.user_id,
            appointment_id=appointment_id
        ).first()
        
        if not chat_session:
            print(f"[CHAT] Creating new chat session")
            chat_session = ChatSession(
                user_id=appointment.user_id,
                appointment_id=appointment_id,
                title=f"Tư vấn với Bác sĩ",
                status='active'
            )
            db.session.add(chat_session)
        else:
            print(f"[CHAT] Using existing chat session {chat_session.id}")
        
        # Update session timestamp
        chat_session.updated_at = datetime.utcnow()
        db.session.commit()
        
        # Save message to MongoDB only
        print(f"[CHAT] Saving message to MongoDB")
        mongo_service = MongoDBService()
        timestamp = datetime.utcnow()
        message_data = {
            'appointment_id': appointment_id,
            'session_id': chat_session.id,
            'user_id': appointment.user_id,
            'doctor_id': appointment.doctor_id,
            'sender_role': 'doctor' if is_doctor else 'patient',
            'message': data['message'],
            'timestamp': timestamp.isoformat(),
            'appointment_type': appointment.appointment_type
        }
        print(f"[CHAT] Message data: {message_data}")
        
        mongo_doc = mongo_service.save_appointment_chat_message(message_data)
        print(f"[CHAT] Message saved to MongoDB with ID: {mongo_doc.get('_id') if mongo_doc else 'None'}")
        
        return jsonify({
            'message': 'Message sent successfully',
            'data': {
                'id': mongo_doc.get('_id') if mongo_doc else None,
                'role': 'doctor' if is_doctor else 'patient',
                'message': data['message'],
                'created_at': timestamp.isoformat()
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# ============================================================================
# AUDIO MESSAGE ROUTES
# ============================================================================

@bp.route('/send-audio', methods=['POST'])
@check_chat_limit
def send_audio_message(current_user, plan, remaining):
    """
    Send audio message to AI model API
    """
    import os
    import uuid
    import requests
    
    try:
        # Validate audio file
        if 'audio' not in request.files:
            return jsonify({'error': 'No audio file provided'}), 400
        
        audio_file = request.files['audio']
        if audio_file.filename == '':
            return jsonify({'error': 'Empty filename'}), 400
        
        # Get session ID
        session_id = request.form.get('session_id', str(uuid.uuid4()))
        
        # Save audio temporarily
        temp_filename = f"{uuid.uuid4()}.webm"
        temp_path = os.path.join('/tmp', temp_filename)
        audio_file.save(temp_path)
        
        try:
            # Get AI Model API URL from environment
            AI_MODEL_API_URL = os.getenv('AI_MODEL_API_URL', 'http://localhost:8000')
            
            # Prepare request to model API
            with open(temp_path, 'rb') as f:
                files = {'file': (temp_filename, f, 'audio/webm')}
                data = {'session_id': session_id}
                
                # Call model API
                print(f"[AUDIO] Calling model API: {AI_MODEL_API_URL}/chat/audio")
                response = requests.post(
                    f"{AI_MODEL_API_URL}/chat/audio",
                    files=files,
                    data=data,
                    timeout=120  # Increased to 120s for Whisper processing
                )
            
            if response.status_code != 200:
                print(f"[ERROR] Model API error: {response.text}")
                return jsonify({'error': f'Model API error: {response.text}'}), 500
            
            # Parse response from model
            model_response = response.json()
            print(f"[AUDIO] Model response: {model_response}")
            
            # Extract data from model response
            transcription = model_response.get('transcription', '')
            detected_emotion = model_response.get('detected_emotion', 'neutral')
            ai_response = model_response.get('ai_response', '')
            
            # Save to database via ChatService
            result = ChatService.send_message(
                user_id=current_user.id,
                message_content=transcription,
                session_id=int(session_id) if session_id and session_id.isdigit() else None,
                analyze_emotion=False  # Already analyzed by model
            )
            
            # Override AI response with model's response
            if ai_response:
                result['ai_response'] = ai_response
            
            # Add audio metadata
            result['audio_metadata'] = {
                'transcription': transcription,
                'emotion_detected': detected_emotion,
                'source': 'model_api'
            }
            result['remaining_chats'] = remaining if remaining != -1 else 'unlimited'
            
            return jsonify(result), 200
            
        finally:
            # Cleanup temporary file
            if os.path.exists(temp_path):
                os.remove(temp_path)
    
    except requests.exceptions.RequestException as e:
        print(f"[ERROR] Failed to connect to model API: {e}")
        return jsonify({'error': f'Cannot connect to AI model: {str(e)}'}), 503
    except Exception as e:
        print(f"[ERROR] send_audio_message: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500




@bp.route('/transcribe', methods=['POST'])
@token_required
def transcribe_audio(current_user):
    """
    Transcribe audio to text only (no chat processing)
    """
    import os
    import uuid
    from app.services.audio_service import get_audio_service
    
    try:
        # Validate audio file
        if 'audio' not in request.files:
            return jsonify({'error': 'No audio file provided'}), 400
        
        audio_file = request.files['audio']
        
        # Save audio temporarily
        temp_filename = f"{uuid.uuid4()}.webm"
        temp_path = os.path.join('/tmp', temp_filename)
        audio_file.save(temp_path)
        
        try:
            # Transcribe only
            audio_service = get_audio_service()
            result = audio_service.transcribe(temp_path)
            
            return jsonify(result), 200
            
        finally:
            # Cleanup
            if os.path.exists(temp_path):
                os.remove(temp_path)
    
    except Exception as e:
        print(f"[ERROR] transcribe_audio: {e}")
        return jsonify({'error': str(e)}), 500
