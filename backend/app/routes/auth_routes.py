from flask import Blueprint, jsonify

bp = Blueprint('auth', __name__)

@bp.route('/login', methods=['POST'])
def login():
    return jsonify({'message': 'Login endpoint'})
