from flask import Blueprint, request, jsonify
from app.middleware.role_middleware import admin_required
from app.models.models import User, Plan, AIModel, Payment, Alert, ChatSession, DoctorProfile, Appointment, Exercise, UserExerciseProgress
from app.extensions import db
from datetime import datetime, timedelta
from sqlalchemy import func, desc

bp = Blueprint('admin', __name__)

@bp.route('/users', methods=['GET'])
@admin_required
def get_users(current_user):
    """Get all users with filtering"""
    try:
        role = request.args.get('role')
        status = request.args.get('status')
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        
        query = User.query
        
        if role:
            query = query.filter_by(role=role)
        
        if status == 'active':
            query = query.filter_by(is_active=True)
        elif status == 'inactive':
            query = query.filter_by(is_active=False)
        
        pagination = query.order_by(User.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'users': [user.to_dict() for user in pagination.items],
            'total': pagination.total,
            'page': page,
            'per_page': per_page,
            'pages': pagination.pages
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/users/<int:user_id>', methods=['GET'])
@admin_required
def get_user(current_user, user_id):
    """Get detailed user information"""
    try:
        user = db.session.get(User, user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get user statistics
        total_chats = ChatSession.query.filter_by(user_id=user_id).count()
        total_payments = Payment.query.filter_by(user_id=user_id).count()
        total_alerts = Alert.query.filter_by(user_id=user_id).count()
        
        user_data = user.to_dict()
        user_data['statistics'] = {
            'total_chats': total_chats,
            'total_payments': total_payments,
            'total_alerts': total_alerts
        }
        
        return jsonify(user_data), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/users/<int:user_id>', methods=['PUT'])
@admin_required
def update_user(current_user, user_id):
    """Update user information"""
    try:
        user = db.session.get(User, user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        # Update allowed fields
        updateable_fields = [
            'full_name', 'phone', 'role', 'is_active', 'is_verified',
            'subscription_plan', 'subscription_status'
        ]
        
        for field in updateable_fields:
            if field in data:
                setattr(user, field, data[field])
        
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'User updated successfully',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@bp.route('/users/<int:user_id>', methods=['DELETE'])
@admin_required
def delete_user(current_user, user_id):
    """Delete a user account"""
    try:
        user = db.session.get(User, user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Prevent deleting own account
        if user.id == current_user.id:
            return jsonify({'error': 'Cannot delete your own account'}), 403
        
        db.session.delete(user)
        db.session.commit()
        
        return jsonify({'message': 'User deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500





@bp.route('/plans', methods=['GET'])
@admin_required
def get_all_plans(current_user):
    """Get all plans including inactive"""
    try:
        plans = Plan.query.all()
        
        return jsonify({
            'plans': [plan.to_dict() for plan in plans]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/models', methods=['GET'])
@admin_required
def get_models(current_user):
    """Get all AI models"""
    try:
        models = AIModel.query.all()
        
        return jsonify({
            'models': [model.to_dict() for model in models]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/models', methods=['POST'])
@admin_required
def create_model(current_user):
    """Add a new AI model"""
    try:
        data = request.get_json()
        
        required_fields = ['name', 'provider', 'model_version']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        model = AIModel(
            name=data['name'],
            provider=data['provider'],
            model_version=data['model_version'],
            is_active=data.get('is_active', True),
            is_default=data.get('is_default', False),
            max_tokens=data.get('max_tokens', 4096),
            temperature=data.get('temperature', 0.7),
            description=data.get('description')
        )
        
        # If set as default, unset other defaults
        if model.is_default:
            AIModel.query.filter_by(is_default=True).update({'is_default': False})
        
        db.session.add(model)
        db.session.commit()
        
        return jsonify({
            'message': 'Model created successfully',
            'model': model.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@bp.route('/usage-stats', methods=['GET'])
@admin_required
def get_usage_stats(current_user):
    """Get platform usage statistics for analytics page"""
    try:
        # User Growth (Last 6 months)
        from sqlalchemy import func, extract
        import calendar
        
        now = datetime.utcnow()
        six_months_ago = now - timedelta(days=180)
        
        # User growth by month
        user_growth = db.session.query(
            func.extract('month', User.created_at).label('month'),
            func.extract('year', User.created_at).label('year'),
            func.count(User.id).label('count')
        ).filter(User.created_at >= six_months_ago)\
         .group_by('year', 'month')\
         .order_by('year', 'month').all()
         
        user_growth_data = []
        cumulative_users = User.query.filter(User.created_at < six_months_ago).count()
        
        for m in user_growth:
            month_name = calendar.month_name[int(m.month)][:3]
            count = m.count
            cumulative_users += count
            user_growth_data.append({
                'month': f"T{int(m.month)}", # Format T1, T2...
                'users': cumulative_users,
                'newUsers': count
            })
            
        # Revenue by month (Last 6 months)
        revenue_stats = db.session.query(
            func.extract('month', Payment.created_at).label('month'),
            func.extract('year', Payment.created_at).label('year'),
            func.sum(Payment.amount).label('total')
        ).filter(
            Payment.created_at >= six_months_ago,
            Payment.payment_status == 'completed'
        ).group_by('year', 'month')\
         .order_by('year', 'month').all()
         
        revenue_data = []
        for m in revenue_stats:
            revenue_data.append({
                'month': f"T{int(m.month)}",
                'revenue': float(m.total)
            })
            
        # Fill missing months if necessary or let frontend handle it
        
        return jsonify({
            'userGrowth': user_growth_data,
            'revenueData': revenue_data,
            'overview': {
                'total_revenue': sum(r['revenue'] for r in revenue_data),
                'total_users': cumulative_users,
                'total_sessions': ChatSession.query.count()
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/revenue', methods=['GET'])
@bp.route('/subscriptions/overview', methods=['GET'])
@admin_required
def get_subscription_overview(current_user):
    """Get subscription statistics and recent subscriptions"""
    try:
        # 1. Check and Seed Plans if empty
        plans = Plan.query.all()
        
        if not plans:
            # Auto-seed default plans to match frontend
            default_plans = [
                {
                    'id': 9,
                    'name': 'Free',
                    'description': 'Gói miễn phí - Trải nghiệm AI chatbot cơ bản',
                    'price_monthly': 0,
                    'user_type': 'user'
                },
                {
                    'id': 10,
                    'name': 'Premium',
                    'description': 'Gói cao cấp - Truy cập đầy đủ tính năng AI và bác sĩ',
                    'price_monthly': 149000,
                     'user_type': 'user'
                },
                {
                    'id': 11,
                    'name': 'VIP',
                    'description': 'Gói VIP - Tư vấn không giới hạn với ưu đãi đặc biệt',
                    'price_monthly': 499000,
                     'user_type': 'user'
                }
            ]
            
            for p_data in default_plans:
                new_plan = Plan(
                    id=p_data['id'],
                    name=p_data['name'],
                    description=p_data['description'],
                    price_monthly=p_data['price_monthly'],
                    user_type=p_data['user_type'],
                    is_active=True,
                    chat_limit=-1 if p_data['price_monthly'] > 0 else 10,
                    voice_enabled=True if p_data['price_monthly'] > 0 else False,
                    video_enabled=True if p_data['price_monthly'] > 0 else False,
                    doctor_access=True if p_data['price_monthly'] > 0 else False,
                    priority_support=True if p_data['price_monthly'] > 150000 else False
                )
                db.session.add(new_plan)
            
            db.session.commit()
            plans = Plan.query.all()

        plans_data = [] 
        
        for plan in plans:
            # Count active users for this plan
            active_users_count = User.query.filter(
                User.subscription_plan == plan.id,
                User.subscription_status == 'active'
            ).count()
            
            # Revenue calculation (MRR) - precise enough for overview
            mrr = active_users_count * float(plan.price_monthly if plan.price_monthly else 0)
            
            # Construct feature list for frontend from booleans
            features_list = []
            if plan.chat_limit == -1:
                features_list.append("Chat không giới hạn")
            else:
                features_list.append(f"{plan.chat_limit} tin nhắn/ngày")
                
            if plan.voice_enabled: features_list.append("Voice Call")
            if plan.video_enabled: features_list.append("Video Call")
            if plan.doctor_access: features_list.append("Kết nối Bác sĩ")
            if plan.priority_support: features_list.append("Ưu tiên hỗ trợ")
            
            plans_data.append({
                'id': plan.id,
                'name': plan.name,
                'price': float(plan.price_monthly if plan.price_monthly else 0),
                'duration': 'monthly', # Frontend expects string
                'features': features_list,
                'activeUsers': active_users_count,
                'revenue': mrr,
                'color': 'bg-blue-600'
            })
            
        # 2. Recent Subscriptions
        recent_subs = []
        recent_users = User.query.filter(
            User.subscription_plan.isnot(None)
        ).order_by(User.updated_at.desc()).limit(10).all()
        
        for u in recent_users:
            plan_name = "Unknown"
            # Optimization: could load plans into dict efficiently, but loop is small
            sub_plan = next((p for p in plans if p.id == u.subscription_plan), None)
            if sub_plan:
                plan_name = sub_plan.name
                
            recent_subs.append({
                'id': u.id,
                'userName': u.full_name or u.email,
                'plan': plan_name,
                'startDate': u.subscription_start_date.isoformat() if u.subscription_start_date else datetime.utcnow().isoformat(),
                'endDate': u.subscription_end_date.isoformat() if u.subscription_end_date else datetime.utcnow().isoformat(),
                'status': u.subscription_status or 'active',
                'autoRenew': True 
            })
            
        return jsonify({
            'plans': plans_data,
            'recentSubscriptions': recent_subs
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/revenue', methods=['GET'])
@admin_required
def get_revenue(current_user):
    """Get detailed revenue statistics"""
    try:
        # This can be similar to usage-stats but more detailed
        # For now, return the same structure or specific revenue breakdown
        return get_usage_stats(current_user)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/logs', methods=['GET'])
@admin_required
def get_logs(current_user):
    """Get system logs (Audit Logs) - Aggregated from multiple tables"""
    try:
        logs = []
        
        # 1. New User Registrations (Category: User)
        new_users = User.query.order_by(User.created_at.desc()).limit(10).all()
        for u in new_users:
            logs.append({
                'id': f"u_{u.id}",
                'timestamp': u.created_at.isoformat(),
                'user': u.email,
                'userRole': 'user', # user registered themselves
                'action': 'Đăng ký',
                'category': 'user',
                'severity': 'info',
                'details': f"Người dùng mới đăng ký: {u.full_name}",
                'ipAddress': 'N/A'
            })
            
        # 2. Payments (Category: System/Payment)
        payments = Payment.query.order_by(Payment.created_at.desc()).limit(10).all()
        for p in payments:
            user = db.session.get(User, p.user_id)
            logs.append({
                'id': f"p_{p.id}",
                'timestamp': p.created_at.isoformat(),
                'user': user.email if user else 'Unknown',
                'userRole': 'user',
                'action': 'Thanh toán',
                'category': 'system', # Mapped to system for now
                'severity': 'info' if p.payment_status == 'completed' else 'warning',
                'details': f"Thanh toán {p.amount} VND ({p.payment_status})",
                'ipAddress': 'N/A'
            })
            
        # 3. Alerts (Category: Security/Critical)
        alerts = Alert.query.order_by(Alert.created_at.desc()).limit(10).all()
        for a in alerts:
            user = db.session.get(User, a.user_id)
            logs.append({
                'id': f"a_{a.id}",
                'timestamp': a.created_at.isoformat(),
                'user': user.email if user else 'System',
                'userRole': 'system',
                'action': 'Cảnh báo',
                'category': 'security' if a.severity == 'critical' else 'system',
                'severity': a.severity, # critical, warning, info
                'details': a.message,
                'ipAddress': 'System'
            })
            
        # Sort by timestamp desc
        logs.sort(key=lambda x: x['timestamp'], reverse=True)
        
        return jsonify(logs[:50]), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/overview', methods=['GET'])
@admin_required
def get_overview(current_user):
    """Get overview statistics for admin dashboard"""
    try:
        # Quick stats
        total_users = User.query.count()
        doctors_query = User.query.filter_by(role='doctor')
        total_doctors = doctors_query.count()
        new_doctors = doctors_query.filter(User.is_verified == False).count() # Pending approval approx
        
        # Revenue this month
        now = datetime.utcnow()
        start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        revenue_month = db.session.query(func.sum(Payment.amount)).filter(
            Payment.created_at >= start_of_month,
            Payment.payment_status == 'completed'
        ).scalar() or 0
        
        last_month = start_of_month - timedelta(days=1)
        start_of_last_month = last_month.replace(day=1)
        
        revenue_last_month = db.session.query(func.sum(Payment.amount)).filter(
            Payment.created_at >= start_of_last_month,
            Payment.created_at < start_of_month,
            Payment.payment_status == 'completed'
        ).scalar() or 0
        
        # Calculate revenue change
        revenue_change = 0
        if revenue_last_month > 0:
            revenue_change = ((revenue_month - revenue_last_month) / revenue_last_month) * 100
            
        # Sessions
        total_sessions = ChatSession.query.count()
        
        # Premium Users
        premium_users = User.query.filter(
            User.subscription_status == 'active', 
            User.subscription_plan != 1 # Assuming 1 is free
        ).count()
        
        # Alerts
        critical_alerts = Alert.query.filter_by(severity='critical', is_resolved=False).count()
        
        # Recent Activity (Re-use logic from logs but smaller)
        # For simplicity, call get_logs internally or duplicate logic
        # Duplicating logic for speed/customization
        recent_activities = []
        
        # Latest users
        latest_users = User.query.order_by(User.created_at.desc()).limit(3).all()
        for u in latest_users:
            recent_activities.append({
                'id': u.id,
                'type': 'user',
                'message': f"Người dùng mới đăng ký: {u.email}",
                'timestamp': u.created_at.isoformat()
            })
            
        # Latest payments
        latest_payments = Payment.query.order_by(Payment.created_at.desc()).limit(3).all()
        for p in latest_payments:
             recent_activities.append({
                'id': p.id + 10000,
                'type': 'payment',
                'message': f"Thanh toán thành công: ${p.amount}",
                'timestamp': p.created_at.isoformat()
            })
            
        recent_activities.sort(key=lambda x: x['timestamp'], reverse=True)
        
        return jsonify({
            'metrics': [
                {'label': 'Tổng Người Dùng', 'value': total_users, 'change': '+5%', 'trend': 'up'},
                {'label': 'Bác Sĩ Hoạt Động', 'value': total_doctors, 'change': f'+{new_doctors} chờ duyệt', 'trend': 'up'},
                {'label': 'Doanh Thu Tháng', 'value': float(revenue_month), 'change': f'{revenue_change:.1f}%', 'trend': 'up' if revenue_change >= 0 else 'down'},
                {'label': 'Phiên Tư Vấn', 'value': total_sessions, 'change': '+12%', 'trend': 'up'},
                {'label': 'Gói Premium', 'value': premium_users, 'change': 'Ổn định', 'trend': 'up'},
                {'label': 'Cảnh Báo', 'value': critical_alerts, 'change': 'Cần xử lý', 'trend': 'down' if critical_alerts > 0 else 'up'},
            ],
            'recentActivities': recent_activities[:5],
            'quickStats': [
                {'label': 'Người dùng mới hôm nay', 'value': User.query.filter(User.created_at >= now.replace(hour=0, minute=0)).count()},
                {'label': 'Bác sĩ chờ phê duyệt', 'value': new_doctors},
                {'label': 'Phiên tư vấn hôm nay', 'value': ChatSession.query.filter(ChatSession.created_at >= now.replace(hour=0, minute=0)).count()},
                {'label': 'Doanh thu hôm nay', 'value': 0} # Placeholder
            ]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
@bp.route('/analytics', methods=['GET'])
@admin_required
def get_analytics(current_user):
    """Get detailed analytics data for charts"""
    try:
        from app.models.models import UserExerciseProgress, Exercise
        from sqlalchemy import extract
        
        now = datetime.utcnow()
        start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        # 1. Overview Stats
        total_revenue = db.session.query(func.sum(Payment.amount)).filter(
            Payment.payment_status == 'completed'
        ).scalar() or 0
        
        new_users_month = User.query.filter(User.created_at >= start_of_month).count()
        
        total_sessions = ChatSession.query.count()
        
        # Simple retention: % of users who have more than 1 session
        active_users_count = User.query.join(ChatSession).distinct().count() or 1
        total_users = User.query.count() or 1
        retention_rate = (active_users_count / total_users) * 100
        
        last_month = start_of_month - timedelta(days=1)
        # Prev month stats for 'change' calc (simplified)
        
        overview_stats = [
            {
                'label': 'Tổng Doanh Thu',
                'value': float(total_revenue),
                'change': '+5.2%', # Placeholder calc
                'icon': 'DollarSign',
                'color': 'text-green-600'
            },
            {
                'label': 'Người Dùng Mới',
                'value': new_users_month,
                'change': '+12.5%',
                'icon': 'Users',
                'color': 'text-blue-600'
            },
            {
                'label': 'Phiên Tư Vấn',
                'value': total_sessions,
                'change': '+8.3%',
                'icon': 'Activity',
                'color': 'text-purple-600'
            },
            {
                'label': 'Tỷ Lệ Giữ Chân',
                'value': f"{retention_rate:.1f}%",
                'change': '+3.1%',
                'icon': 'TrendingUp',
                'color': 'text-orange-600'
            }
        ]
        
        # 2. Charts Data (Last 6 Months)
        revenue_data = []
        user_growth_data = []
        
        for i in range(5, -1, -1):
            # Calculate month start/end
            date_cursor = now - timedelta(days=i*30) # Approx
            month_str = f"T{date_cursor.month}"
            
            # Month range approximation for query simplicity
            # For production, use exact calendar ranges
            month_start = date_cursor.replace(day=1, hour=0, minute=0, second=0)
            next_month = (month_start + timedelta(days=32)).replace(day=1)
            
            # Revenue
            m_rev = db.session.query(func.sum(Payment.amount)).filter(
                Payment.created_at >= month_start,
                Payment.created_at < next_month,
                Payment.payment_status == 'completed'
            ).scalar() or 0
            
            revenue_data.append({'month': month_str, 'revenue': float(m_rev)})
            
            # Users
            m_users = User.query.filter(User.created_at < next_month).count()
            m_new = User.query.filter(User.created_at >= month_start, User.created_at < next_month).count()
            
            user_growth_data.append({'month': month_str, 'users': m_users, 'newUsers': m_new})
            
        # 3. Top Doctors
        # Heuristic: doctors with most sessions
        top_doctors_list = []
        doctors = User.query.filter_by(role='doctor').all()
        
        for doc in doctors:
            # Count sessions
            # Count sessions
            # ChatSession linked to Appointment linked to Doctor
            s_count = ChatSession.query.join(Appointment).filter(Appointment.doctor_id == doc.id).count()
            # Avg Rating
            # Assuming DoctorProfile links review, or direct Review table. 
            # If Model Review(doctor_id) exists:
            # rating = db.session.query(func.avg(Review.rating)).filter(Review.doctor_id == doc.id).scalar() or 5.0
            rating = 4.8 + (doc.id % 5) * 0.04 # Mock if Review model not ready links
            
            # Revenue (Mock allocation)
            d_rev = s_count * 500000 
            
            top_doctors_list.append({
                'name': doc.full_name or doc.email,
                'sessions': s_count,
                'rating': round(rating, 1),
                'revenue': d_rev
            })
        
        # Sort and take top 5
        top_doctors_list.sort(key=lambda x: x['sessions'], reverse=True)
        top_doctors_list = top_doctors_list[:5]
        
        # 4. Popular Exercises
        popular_exercises_list = []
        # Group UserExerciseProgress by exercise_id
        popular_query = db.session.query(
            UserExerciseProgress.exercise_id, 
            func.count(UserExerciseProgress.id).label('completions')
        ).filter(UserExerciseProgress.status == 'completed').group_by(UserExerciseProgress.exercise_id).order_by(desc('completions')).limit(5).all()
        
        for ex_id, completions in popular_query:
            ex = db.session.get(Exercise, ex_id)
            if ex:
                popular_exercises_list.append({
                    'name': ex.title,
                    'completions': completions,
                    'avgRating': 4.7 # Placeholder for exercise rating
                })
                
        # Fallback if no data
        if not popular_exercises_list:
             popular_exercises_list = [
                {'name': 'Hít thở sâu (Mẫu)', 'completions': 0, 'avgRating': 5.0}
            ]

        return jsonify({
            'overviewStats': overview_stats,
            'revenueData': revenue_data,
            'userGrowthData': user_growth_data,
            'topDoctors': top_doctors_list,
            'popularExercises': popular_exercises_list
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
@bp.route('/doctors', methods=['GET'])
@admin_required
def get_doctors(current_user):
    """Get all doctors with profiles and stats"""
    try:
        # Get all doctors
        doctors_query = db.session.query(User, DoctorProfile).outerjoin(
            DoctorProfile, User.id == DoctorProfile.user_id
        ).filter(User.role == 'doctor')
        
        all_doctors = doctors_query.all()
        
        doctors_list = []
        
        # Stats counters
        stats_count = {
            'total': 0,
            'approved': 0, # verified
            'pending': 0,
            'rejected': 0
        }
        
        for user, profile in all_doctors:
            stats_count['total'] += 1
            
            # Determine status based on verification
            status = 'pending'
            if user.is_verified:
                status = 'approved'
                stats_count['approved'] += 1
            elif user.is_active == False: 
                # Assuming inactive + unverified might mean rejected or just banned
                # For this logic, let's assume specific flag or just use simple mapping
                status = 'rejected'
                stats_count['rejected'] += 1
            else:
                stats_count['pending'] += 1

            # Count patients (unique users in appointments with this doctor)
            # ChatSession doesn't have doctor_id directly, so use Appointment
            from app.models.models import Appointment
            patient_count = db.session.query(Appointment.user_id).filter(
                Appointment.doctor_id == user.id
            ).distinct().count()
            
            # Profile data handling
            specialty = "Chưa cập nhật"
            license_no = "N/A"
            experience = "0 năm"
            rating = 0.0
            
            if profile:
                specialty = profile.specialization or specialty
                license_no = profile.license_number or license_no
                experience = f"{profile.years_of_experience} năm"
                rating = float(profile.rating or 0.0)
            
            doctors_list.append({
                'id': user.id,
                'name': user.full_name or user.email,
                'email': user.email,
                'phone': user.phone or "N/A",
                'specialty': specialty,
                'license': license_no,
                'experience': experience,
                'patients': patient_count,
                'rating': rating,
                'status': status,
                'joinedDate': user.created_at.strftime('%d/%m/%Y')
            })
            
        # Compare with last month for "New Doctors" stat
        now = datetime.utcnow()
        start_of_month = now.replace(day=1, hour=0, minute=0, second=0)
        new_docs_count = User.query.filter(User.role == 'doctor', User.created_at >= start_of_month).count()
            
        stats_response = [
            {'label': 'Tổng bác sĩ', 'value': str(stats_count['total']), 'change': f'+{new_docs_count} mới', 'color': 'text-blue-600'},
            {'label': 'Đã phê duyệt', 'value': str(stats_count['approved']), 'change': 'Hoạt động', 'color': 'text-green-600'},
            {'label': 'Chờ duyệt', 'value': str(stats_count['pending']), 'change': 'Cần xử lý', 'color': 'text-yellow-600'},
            {'label': 'Từ chối/Khóa', 'value': str(stats_count['rejected']), 'change': 'Đã dừng', 'color': 'text-red-600'}
        ]

        return jsonify({
            'doctors': doctors_list,
            'stats': stats_response
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
