"""
MongoDB Service để lưu chat messages và conversation history
"""

from pymongo import MongoClient
from datetime import datetime
from typing import List, Dict, Any, Optional
from flask import current_app
import logging

logger = logging.getLogger(__name__)


class MongoDBService:
    """Service quản lý chat messages trong MongoDB"""
    
    _client = None
    _db = None
    
    @classmethod
    def get_client(cls):
        """Kết nối MongoDB (singleton) - Skip if DNS fails"""
        if cls._client is None:
            try:
                mongo_uri = current_app.config.get('MONGO_URI')
                if not mongo_uri:
                    logger.warning("MongoDB URI not configured")
                    return None
                    
                cls._client = MongoClient(
                    mongo_uri,
                    serverSelectionTimeoutMS=15000,  # Increased timeout
                    connectTimeoutMS=10000,  # Increased timeout
                    socketTimeoutMS=20000,
                    maxPoolSize=10,
                    minPoolSize=1,
                    retryWrites=True,
                    # Disable SSL verification if needed for eventlet
                    tls=True,
                    tlsAllowInvalidCertificates=False
                )
                # Test connection
                cls._client.admin.command('ping')
                logger.info("MongoDB connected successfully")
            except Exception as e:
                logger.error(f"MongoDB connection failed: {e}")
                cls._client = None
                return None  # Return None instead of raising
        
        if cls._db is None and cls._client is not None:
            db_name = current_app.config.get('MONGO_DB_NAME', 'mental_health_chat')
            cls._db = cls._client[db_name]
        
        return cls._db
    
    @staticmethod
    def save_message(session_id: int, user_id: int, role: str, content: str, 
                     emotion: str = None, sentiment_score: float = None,
                     risk_level: str = None) -> Dict[str, Any]:
        """
        Lưu một message vào MongoDB
        
        Args:
            session_id: ID của session (từ PostgreSQL)
            user_id: ID của user
            role: 'user' hoặc 'assistant'
            content: Nội dung tin nhắn
            emotion: Cảm xúc phát hiện (nếu có)
            sentiment_score: Điểm sentiment (nếu có)
            risk_level: Mức độ rủi ro (nếu có)
            
        Returns:
            dict: Message đã lưu hoặc None nếu MongoDB không available
        """
        try:
            db = MongoDBService.get_client()
            if db is None:
                logger.warning("MongoDB not available, skipping message save")
                return None
                
            collection = db['chat_sessions']
            
            timestamp = datetime.utcnow()
            message = {
                'message_id': f"msg_{user_id}_{session_id}_{timestamp.timestamp()}",
                'role': role,
                'content': content,
                'timestamp': timestamp,
                'emotion': emotion,
                'sentiment_score': sentiment_score,
                'risk_level': risk_level
            }
            
            # Upsert: tìm session, không có thì tạo mới
            result = collection.update_one(
                {
                    'session_id': session_id,
                    'user_id': user_id
                },
                {
                    '$push': {'messages': message},
                    '$set': {
                        'updated_at': timestamp,
                        'status': 'active'
                    },
                    '$setOnInsert': {
                        'created_at': timestamp,
                        'session_id': session_id,
                        'user_id': user_id
                    }
                },
                upsert=True
            )
            
            # Update metadata separately to avoid conflict
            collection.update_one(
                {
                    'session_id': session_id,
                    'user_id': user_id
                },
                {
                    '$inc': {
                        'total_messages': 1,
                        f'{role}_messages': 1
                    }
                }
            )
            
            logger.info(f"Message saved to MongoDB - Session: {session_id}, Role: {role}")
            return message
            
        except Exception as e:
            logger.error(f"Error saving message to MongoDB: {e}")
            # Không throw error để không làm crash chat flow
            return None
    
    @staticmethod
    def get_session_messages(session_id: int, user_id: int, 
                            role_filter: str = None,
                            limit: int = None) -> List[Dict[str, Any]]:
        """
        Lấy messages của một session (OPTIMIZED - only project needed messages)
        
        Args:
            session_id: ID của session
            user_id: ID của user
            role_filter: Lọc theo role ('user' hoặc 'assistant')
            limit: Giới hạn số lượng messages (mới nhất)
            
        Returns:
            List[Dict]: Danh sách messages
        """
        try:
            db = MongoDBService.get_client()
            collection = db['chat_sessions']
            
            # Build aggregation pipeline for better performance
            pipeline = [
                {'$match': {'session_id': session_id, 'user_id': user_id}},
                {'$project': {
                    'messages': {
                        '$slice': [
                            '$messages',
                            -limit if limit else 0  # Get last N messages
                        ]
                    } if limit else '$messages'
                }}
            ]
            
            result = list(collection.aggregate(pipeline))
            
            if not result or not result[0].get('messages'):
                return []
            
            messages = result[0]['messages']
            
            # Filter by role nếu cần
            if role_filter:
                messages = [m for m in messages if m['role'] == role_filter]
            
            return messages
            
        except Exception as e:
            logger.error(f"Error getting messages from MongoDB: {e}")
            return []
    
    @staticmethod
    def prepare_for_analysis(session_id: int, user_id: int) -> Optional[Dict[str, Any]]:
        """
        Chuẩn bị dữ liệu để gửi cho AI Model phân tích
        
        Args:
            session_id: ID của session
            user_id: ID của user
            
        Returns:
            dict: Dữ liệu chuẩn bị cho model hoặc None nếu không đủ data
        """
        try:
            messages = MongoDBService.get_session_messages(
                session_id, user_id
            )
            
            if not messages or len(messages) < 2:
                return None
            
            # Tính duration
            first_timestamp = messages[0]['timestamp']
            last_timestamp = messages[-1]['timestamp']
            duration_minutes = (last_timestamp - first_timestamp).total_seconds() / 60
            
            # Chuẩn bị conversation cho model
            conversation = []
            for msg in messages:
                conversation.append({
                    'role': msg['role'],
                    'content': msg['content'],
                    'timestamp': msg['timestamp'].isoformat() if isinstance(msg['timestamp'], datetime) else msg['timestamp']
                })
            
            return {
                'session_id': session_id,
                'user_id': user_id,
                'conversation': conversation,
                'context': {
                    'duration_minutes': round(duration_minutes, 2),
                    'message_count': len(messages),
                    'user_messages': len([m for m in messages if m['role'] == 'user']),
                    'assistant_messages': len([m for m in messages if m['role'] == 'assistant']),
                    'session_date': first_timestamp.date().isoformat() if isinstance(first_timestamp, datetime) else None
                }
            }
            
        except Exception as e:
            logger.error(f"Error preparing data for analysis: {e}")
            return None
    
    @staticmethod
    def update_session_status(session_id: int, user_id: int, status: str):
        """
        Cập nhật status của session
        
        Args:
            session_id: ID của session
            user_id: ID của user
            status: 'active', 'analyzed', 'archived'
        """
        try:
            db = MongoDBService.get_client()
            collection = db['chat_sessions']
            
            collection.update_one(
                {'session_id': session_id, 'user_id': user_id},
                {
                    '$set': {
                        'status': status,
                        'updated_at': datetime.utcnow()
                    }
                }
            )
            
            logger.info(f"Session {session_id} status updated to {status}")
            
        except Exception as e:
            logger.error(f"Error updating session status: {e}")
    
    @staticmethod
    def get_user_sessions(user_id: int, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Lấy danh sách sessions của user
        
        Args:
            user_id: ID của user
            limit: Số lượng sessions tối đa
            
        Returns:
            List[Dict]: Danh sách sessions
        """
        try:
            db = MongoDBService.get_client()
            collection = db['chat_sessions']
            
            sessions = collection.find(
                {'user_id': user_id}
            ).sort('updated_at', -1).limit(limit)
            
            result = []
            for session in sessions:
                result.append({
                    'session_id': session['session_id'],
                    'user_id': session['user_id'],
                    'status': session.get('status', 'active'),
                    'total_messages': session.get('metadata', {}).get('total_messages', 0),
                    'created_at': session.get('created_at'),
                    'updated_at': session.get('updated_at')
                })
            
            return result
            
        except Exception as e:
            logger.error(f"Error getting user sessions: {e}")
            return []
    
    @staticmethod
    def delete_session(session_id: int, user_id: int) -> bool:
        """
        Xóa session khỏi MongoDB
        
        Args:
            session_id: ID của session
            user_id: ID của user
            
        Returns:
            bool: True nếu xóa thành công
        """
        try:
            db = MongoDBService.get_client()
            collection = db['chat_sessions']
            
            result = collection.delete_one(
                {'session_id': session_id, 'user_id': user_id}
            )
            
            if result.deleted_count > 0:
                logger.info(f"Session {session_id} deleted from MongoDB")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error deleting session: {e}")
            return False
    
    @staticmethod
    def get_session_count(user_id: int) -> int:
        """
        Đếm số lượng sessions của user
        
        Args:
            user_id: ID của user
            
        Returns:
            int: Số lượng sessions
        """
        try:
            db = MongoDBService.get_client()
            collection = db['chat_sessions']
            
            count = collection.count_documents({'user_id': user_id})
            return count
            
        except Exception as e:
            logger.error(f"Error counting sessions: {e}")
            return 0
    
    @staticmethod
    def save_appointment_chat_message(message_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Save appointment consultation chat to MongoDB (separate collection)
        Collection: appointment_chats
        
        Args:
            message_data: {
                'appointment_id': int,
                'session_id': int,
                'user_id': int,
                'doctor_id': int,
                'sender_role': 'doctor' | 'patient',
                'message': str,
                'timestamp': str (ISO format),
                'appointment_type': 'video' | 'chat'
            }
            
        Returns:
            Message document or None if MongoDB not available
        """
        try:
            db = MongoDBService.get_client()
            if db is None:
                logger.warning("MongoDB not available, skipping appointment chat save")
                return None
                
            collection = db['appointment_chats']
            
            # Create message document
            message_doc = {
                'appointment_id': message_data['appointment_id'],
                'session_id': message_data['session_id'],
                'user_id': message_data['user_id'],
                'doctor_id': message_data['doctor_id'],
                'sender_role': message_data['sender_role'],
                'message': message_data['message'],
                'timestamp': datetime.fromisoformat(message_data['timestamp']),
                'appointment_type': message_data['appointment_type'],
                'created_at': datetime.utcnow()
            }
            
            # Insert message
            result = collection.insert_one(message_doc)
            message_doc['_id'] = str(result.inserted_id)
            
            logger.info(f"Appointment chat saved - Appointment: {message_data['appointment_id']}, Role: {message_data['sender_role']}")
            return message_doc
            
        except Exception as e:
            logger.error(f"Error saving appointment chat to MongoDB: {e}")
            return None
    
    @staticmethod
    def get_appointment_chat_history(appointment_id: int, limit: int = 100) -> List[Dict[str, Any]]:
        """
        Get chat history for an appointment
        
        Args:
            appointment_id: ID of appointment
            limit: Max messages to return
            
        Returns:
            List of messages (empty list if MongoDB not available)
        """
        try:
            db = MongoDBService.get_client()
            if db is None:
                logger.warning("MongoDB not available, returning empty message list")
                return []
                
            collection = db['appointment_chats']
            
            messages = list(collection.find(
                {'appointment_id': appointment_id}
            ).sort('timestamp', 1).limit(limit))
            
            # Convert ObjectId to string
            for msg in messages:
                msg['_id'] = str(msg['_id'])
                if isinstance(msg.get('timestamp'), datetime):
                    msg['timestamp'] = msg['timestamp'].isoformat()
            
            return messages
            
        except Exception as e:
            logger.error(f"Error getting appointment chat history: {e}")
            return []
    
    @staticmethod
    def create_indexes():
        """
        Tạo indexes cho MongoDB để tăng tốc độ query
        """
        try:
            db = MongoDBService.get_client()
            
            # Chat sessions indexes
            collection = db['chat_sessions']
            collection.create_index([('session_id', 1), ('user_id', 1)], unique=True)
            collection.create_index([('user_id', 1), ('updated_at', -1)])
            collection.create_index([('messages.timestamp', -1)])
            
            # Appointment chats indexes
            appt_collection = db['appointment_chats']
            appt_collection.create_index([('appointment_id', 1), ('timestamp', 1)])
            appt_collection.create_index([('user_id', 1)])
            appt_collection.create_index([('doctor_id', 1)])
            appt_collection.create_index([('session_id', 1)])
            
            logger.info("MongoDB indexes created successfully")
            return True
            
        except Exception as e:
            logger.error(f"Error creating indexes: {e}")
            return False
