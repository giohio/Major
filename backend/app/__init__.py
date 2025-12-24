from flask import Flask, send_from_directory
from app.config import Config, DevelopmentConfig, ProductionConfig, TestingConfig
from app.extensions import db, migrate, jwt, cors, bcrypt, redis_client, socketio
from app.services.email_service import mail
import redis
import os

# Config mapping
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}

def create_app(config_name=None):
    """Application factory pattern"""
    app = Flask(__name__)
    
    # Load config
    if config_name is None:
        config_name = os.getenv('FLASK_ENV', 'development')
    
    app.config.from_object(config.get(config_name, config['default']))
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    socketio.init_app(app, 
                      cors_allowed_origins="*",
                      async_mode='eventlet',
                      logger=True,
                      engineio_logger=True)
    mail.init_app(app)  # Initialize Flask-Mail
    
    # Callback to check if token is in blocklist (Redis)
    @jwt.token_in_blocklist_loader
    def check_if_token_is_revoked(jwt_header, jwt_payload: dict):
        # Skip Redis check if not configured or connection failed
        if not app.config['REDIS_URL'] or not redis_client:
            return False
            
        jti = jwt_payload["jti"]
        try:
            # Set timeout to avoid blocking requests
            token_in_redis = redis_client.get(jti)
            return token_in_redis is not None
        except (redis.exceptions.ConnectionError, redis.exceptions.TimeoutError, Exception) as e:
            # Log warning but don't block request
            app.logger.warning(f"Redis check failed: {e}")
            return False

    cors.init_app(app, origins=app.config['CORS_ORIGINS'])
    bcrypt.init_app(app)
    
    # Configure Redis with timeout
    if app.config['REDIS_URL']:
        try:
            redis_client.connection_pool = redis.ConnectionPool.from_url(
                app.config['REDIS_URL'], 
                decode_responses=True,
                socket_connect_timeout=1,  # 1 second connection timeout
                socket_timeout=1,          # 1 second operation timeout
                retry_on_timeout=False
            )
            # Test connection
            redis_client.ping()
            app.logger.info("Redis connected successfully")
        except Exception as e:
            app.logger.warning(f"Redis connection failed: {e}. Token revocation disabled.")
            redis_client.connection_pool = None
    
    # Import models for migrations
    with app.app_context():
        from app.models import models
        # Import socket events to register handlers
        from app.services import socket_events
        
        # Initialize MongoDB indexes for better performance (disabled due to DNS issues)
        # try:
        #     from app.services.mongodb_service import MongoDBService
        #     MongoDBService.create_indexes()
        # except Exception as e:
        #     app.logger.warning(f"MongoDB index creation failed: {e}")
    
    # Register all routes
    from app.routes import register_routes
    register_routes(app)
    
    # Health check endpoint
    @app.route('/health')
    def health_check():
        return {'status': 'ok', 'app': app.config['APP_NAME']}, 200
    
    # Serve uploaded files
    @app.route('/uploads/<path:filename>')
    def serve_upload(filename):
        upload_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads')
        return send_from_directory(upload_dir, filename)
    
    @app.route('/')
    def index():
        return {
            'app': app.config['APP_NAME'],
            'version': app.config['API_VERSION'],
            'status': 'running',
            'endpoints': {
                'health': '/health',
                'auth': '/api/auth',
                'users': '/api/users',
                'chat': '/api/chat',
                'plans': '/api/plans',
                'payment': '/api/payment',
                'emotion': '/api/emotion',
                'alert': '/api/alert',
                'patient': '/api/patient',
                'doctors': '/api/doctors',
                'admin': '/api/admin'
            }
        }, 200
    
    return app
