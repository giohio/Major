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
    from app.routes import exercise_routes
    
    # NEW: Import payment webhook routes
    from app.routes import payment_webhook_routes
    from app.routes import doctor_plan_routes
    from app.routes import admin_plan_routes
    from app.routes import review_routes
    from app.routes import plan_limits_routes
    
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
    app.register_blueprint(exercise_routes.exercise_bp, url_prefix='/api')  # Uses /api prefix
    
    # NEW: Payment webhook routes
    app.register_blueprint(payment_webhook_routes.webhook_bp)  # Uses /api/webhook prefix
    
    # NEW: Doctor plan management
    app.register_blueprint(doctor_plan_routes.doctor_plan_bp)  # Uses /api/doctors/plans prefix
    
    # NEW: Admin plan management
    app.register_blueprint(admin_plan_routes.admin_plan_bp)  # Uses /api/admin/plans prefix
    
    # NEW: Review and availability management
    app.register_blueprint(review_routes.review_bp)  # Uses /api/reviews prefix
    
    # NEW: Plan limits checking
    app.register_blueprint(plan_limits_routes.plan_limits_bp)  # Uses /api/plans prefix
    
    # Import and register LLM routes if exists
    try:
        from app.routes import llm_routes
        app.register_blueprint(llm_routes.bp, url_prefix='/api/llm')
    except ImportError:
        pass
    
    print("✅ All routes registered successfully")
