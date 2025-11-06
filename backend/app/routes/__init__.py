from flask import Flask

def register_routes(app: Flask):
    """Register all application routes"""
    
    # Import blueprints
    from app.routes import auth_routes
    from app.routes import user_routes
    from app.routes import chat_routes
    from app.routes import plan_routes
    from app.routes import doctor_routes
    from app.routes import admin_routes
    from app.routes import payment_routes
    from app.routes import emotion_routes
    from app.routes import alert_routes
    from app.routes import patient_routes
    
    # Register blueprints with URL prefixes
    app.register_blueprint(auth_routes.bp, url_prefix='/api/auth')
    app.register_blueprint(user_routes.bp, url_prefix='/api/users')
    app.register_blueprint(chat_routes.bp, url_prefix='/api/chat')
    app.register_blueprint(plan_routes.bp, url_prefix='/api/plans')
    app.register_blueprint(doctor_routes.bp, url_prefix='/api/doctors')
    app.register_blueprint(admin_routes.bp, url_prefix='/api/admin')
    app.register_blueprint(payment_routes.payment_bp)  # Uses /api/payment prefix
    app.register_blueprint(emotion_routes.emotion_bp)  # Uses /api/emotion prefix
    app.register_blueprint(alert_routes.alert_bp)      # Uses /api/alert prefix
    app.register_blueprint(patient_routes.patient_bp)  # Uses /api/patient prefix
    
    # Import and register LLM routes if exists
    try:
        from app.routes import llm_routes
        app.register_blueprint(llm_routes.bp, url_prefix='/api/llm')
    except ImportError:
        pass
    
    print("✅ All routes registered successfully")
