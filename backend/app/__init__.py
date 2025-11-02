from flask import Flask
from app.config import config
from app.extensions import db, migrate, jwt, cors, bcrypt
from app.routes.auth_routes import auth_bp
from app.routes import llm_routes
import os

def create_app(config_name=None):
    """Application factory pattern"""
    app = Flask(__name__)
    
    # Load config
    if config_name is None:
        config_name = os.getenv('FLASK_ENV', 'development')
    app.config.from_object(config[config_name])
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    cors.init_app(app, origins=app.config['CORS_ORIGINS'])
    bcrypt.init_app(app)
    
    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(llm_routes.bp, url_prefix="/api/llm")
    
    # Import models for migrations
    with app.app_context():
        from app.models import models
    
    @app.route('/health')
    def health_check():
        return {'status': 'ok', 'app': app.config['APP_NAME']}, 200
    
    return app
