from flask import Flask
from app.config import Config, DevelopmentConfig, ProductionConfig, TestingConfig
from app.extensions import db, migrate, jwt, cors, bcrypt
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
    cors.init_app(app, origins=app.config['CORS_ORIGINS'])
    bcrypt.init_app(app)
    
    # Import models for migrations
    with app.app_context():
        from app.models import models
    
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
