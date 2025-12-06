from flask import Flask
from app.config import Config, DevelopmentConfig, ProductionConfig, TestingConfig
from app.extensions import db, migrate, jwt, cors, bcrypt, redis_client, socketio
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
    socketio.init_app(app, cors_allowed_origins="*")
    
    # Callback to check if token is in blocklist (Redis)
    @jwt.token_in_blocklist_loader
    def check_if_token_is_revoked(jwt_header, jwt_payload: dict):
        jti = jwt_payload["jti"]
        if app.config['REDIS_URL'] and redis_client:
            try:
                token_in_redis = redis_client.get(jti)
                return token_in_redis is not None
            except Exception:
                return False
        return False

    cors.init_app(app, origins=app.config['CORS_ORIGINS'])
    bcrypt.init_app(app)
    
    # Configure Redis
    if app.config['REDIS_URL']:
        redis_client.connection_pool = redis.ConnectionPool.from_url(app.config['REDIS_URL'], decode_responses=True)
    
    # Import models for migrations
    with app.app_context():
        from app.models import models
        # Import socket events to register handlers
        from app.services import socket_events
    
    # Register all routes
    from app.routes import register_routes
    register_routes(app)
    
    # Health check endpoint
    @app.route('/health')
    def health_check():
        return {'status': 'ok', 'app': app.config['APP_NAME']}, 200
    
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
