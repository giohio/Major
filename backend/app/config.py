import os
from datetime import timedelta
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    # Database
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'postgresql://postgres:postgres_db_metal_health_care@localhost:5432/mental_care_db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = os.getenv('DEBUG', 'False') == 'True'
    
    # Flask
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    DEBUG = os.getenv('DEBUG', 'False') == 'True'
    
    # JWT
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key-change-in-production')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(seconds=int(os.getenv('JWT_ACCESS_TOKEN_EXPIRES', 3600)))
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(seconds=int(os.getenv('JWT_REFRESH_TOKEN_EXPIRES', 2592000)))
    JWT_TOKEN_LOCATION = ['headers']
    JWT_HEADER_NAME = 'Authorization'
    JWT_HEADER_TYPE = 'Bearer'
    
    # Redis
    REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
    
    # CORS
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173').split(',')
    
    # Google AI
    GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY', '')
    
    # AI Model API
    AI_MODEL_URL = os.getenv('AI_MODEL_URL', '')
    AI_MODEL_TIMEOUT = int(os.getenv('AI_MODEL_TIMEOUT', 30))
    
    # MongoDB
    MONGO_URI = os.getenv('MONGO_URI', '')
    MONGO_DB_NAME = os.getenv('MONGO_DB_NAME', 'mental_health_chat')
    
    # File Upload
    MAX_CONTENT_LENGTH = int(os.getenv('MAX_CONTENT_LENGTH', 16 * 1024 * 1024))
    UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER', 'uploads')
    
    # Application
    APP_NAME = os.getenv('APP_NAME', 'MindCare AI')
    APP_URL = os.getenv('APP_URL', 'http://localhost:5173')
    FRONTEND_URL = os.getenv('FRONTEND_URL', os.getenv('APP_URL', 'http://localhost:5173'))
    BACKEND_URL = os.getenv('BACKEND_URL', 'http://localhost:5000')
    API_VERSION = os.getenv('API_VERSION', 'v1')
    
    # Email configuration
    MAIL_SERVER = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT = int(os.getenv('MAIL_PORT', 587))
    MAIL_USE_TLS = os.getenv('MAIL_USE_TLS', 'True') == 'True'
    MAIL_USE_SSL = os.getenv('MAIL_USE_SSL', 'False') == 'True'
    MAIL_USERNAME = os.getenv('MAIL_USERNAME', '')  # Your email address
    MAIL_PASSWORD = os.getenv('MAIL_PASSWORD', '')  # Your email password or app password
    MAIL_DEFAULT_SENDER = os.getenv('MAIL_DEFAULT_SENDER', 'noreply@mindcare.com')
    
    # Payment Gateway Configuration
    VNPAY_TMN_CODE = os.getenv('VNPAY_TMN_CODE', '')
    VNPAY_HASH_SECRET = os.getenv('VNPAY_HASH_SECRET', '')
    VNPAY_URL = os.getenv('VNPAY_URL', 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html')
    
    MOMO_PARTNER_CODE = os.getenv('MOMO_PARTNER_CODE', '')
    MOMO_ACCESS_KEY = os.getenv('MOMO_ACCESS_KEY', '')
    MOMO_SECRET_KEY = os.getenv('MOMO_SECRET_KEY', '')
    MOMO_ENDPOINT = os.getenv('MOMO_ENDPOINT', 'https://test-payment.momo.vn/v2/gateway/api/create')
    
    ZALOPAY_APP_ID = os.getenv('ZALOPAY_APP_ID', '')
    ZALOPAY_KEY1 = os.getenv('ZALOPAY_KEY1', '')
    ZALOPAY_KEY2 = os.getenv('ZALOPAY_KEY2', '')
    ZALOPAY_ENDPOINT = os.getenv('ZALOPAY_ENDPOINT', 'https://sb-openapi.zalopay.vn/v2/create')


class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_ECHO = False


class ProductionConfig(Config):
    DEBUG = False
    SQLALCHEMY_ECHO = False


class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'postgresql://postgres:postgres_db_metal_health_care@localhost:5432/mental_care_test_db'


config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
