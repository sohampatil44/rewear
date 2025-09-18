import re
from flask import Blueprint, jsonify, request, session
from src.models.user import User, db

auth_bp = Blueprint('auth', __name__)

EMAIL_REGEX = r'^[\w\.-]+@[\w\.-]+\.\w+$'
MIN_PASSWORD_LENGTH = 8

@auth_bp.route('/signup', methods=['POST'])
def signup():
    try:
        data = request.json or {}

        username = data.get('username', '').strip()
        email = data.get('email', '').strip()
        password = data.get('password', '')
        print("DEBUG signup: password received =", password, " length =", len(password))

        # 1. Validate required fields
        if not username or not email or not password:
            return jsonify({'error': 'Username, email, and password are required'}), 400

        # 2. Validate email format
        if not re.match(EMAIL_REGEX, email):
            return jsonify({'error': 'Invalid email format'}), 400

        # 3. Validate password length
        if len(password) < MIN_PASSWORD_LENGTH:
            return jsonify({'error': f'Password must be at least {MIN_PASSWORD_LENGTH} characters'}), 400

        # 4. Check if username or email already exists
        if User.query.filter_by(username=username).first():
            return jsonify({'error': 'Username already exists'}), 400

        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'Email already exists'}), 400

        # ✅ Passed validation → create new user
        user = User(username=username, email=email)
        user.set_password(password)

        db.session.add(user)
        db.session.commit()

        # Set session
        session['user_id'] = user.id
        session['username'] = user.username
        session['is_admin'] = user.is_admin

        return jsonify({
            'message': 'User created successfully',
            'user': user.to_dict()
        }), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.json or {}

        username = data.get('username', '').strip()
        password = data.get('password', '')

        if not username or not password:
            return jsonify({'error': 'Username and password are required'}), 400

        user = User.query.filter_by(username=username).first()

        if user and user.check_password(password):
            # Set session
            session['user_id'] = user.id
            session['username'] = user.username
            session['is_admin'] = user.is_admin

            return jsonify({
                'message': 'Login successful',
                'user': user.to_dict()
            }), 200
        else:
            return jsonify({'error': 'Invalid username or password'}), 401

    except Exception as e:
        return jsonify({'error': str(e)}), 500
