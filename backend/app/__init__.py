from flask import Flask
from app.config import Config
from app.extensions import db, migrate, jwt, cors
from app.routes import auth_routes

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    cors.init_app(app)

    app.register_blueprint(auth_routes.bp, url_prefix="/auth")
    return app
