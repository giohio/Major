"""
Plan routes - check user plan limits and features
"""
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.models.models import User
from app.utils.plan_limits import get_plan_features_summary
from app.extensions import db

plan_limits_bp = Blueprint('plan_limits', __name__, url_prefix='/api/plans')


@plan_limits_bp.route('/my-limits', methods=['GET'])
@jwt_required()
def get_my_limits():
    """Get current user's plan limits and usage"""
    try:
        user_id = get_jwt_identity()
        user = db.session.get(User, user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        features = get_plan_features_summary(user)
        
        return jsonify(features), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
