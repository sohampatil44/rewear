from flask import Blueprint, jsonify, request, session
from src.models.user import User, db, Swap, Notification
import os
import requests
from sqlalchemy import or_
from werkzeug.utils import secure_filename

user_bp = Blueprint('user', __name__)

AVATAR_UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), '../static/uploads')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@user_bp.route('/users', methods=['GET'])
def get_users():
    users = User.query.all()
    return jsonify([user.to_dict() for user in users])

@user_bp.route('/users', methods=['POST'])
def create_user():
    
    data = request.json
    user = User(username=data['username'], email=data['email'])
    db.session.add(user)
    db.session.commit()
    return jsonify(user.to_dict()), 201

@user_bp.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = User.query.get_or_404(user_id)
    return jsonify(user.to_dict())

@user_bp.route('/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    user = User.query.get_or_404(user_id)
    data = request.json
    user.username = data.get('username', user.username)
    user.email = data.get('email', user.email)
    db.session.commit()
    return jsonify(user.to_dict())

@user_bp.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return '', 204

@user_bp.route('/users/<int:user_id>/avatar', methods=['POST'])
def upload_avatar(user_id):
    if 'user_id' not in session or session['user_id'] != user_id:
        return jsonify({'error': 'Permission denied'}), 403
    if 'avatar' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['avatar']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if file and allowed_file(file.filename):
        filename = secure_filename(f"user_{user_id}_avatar.{file.filename.rsplit('.', 1)[1].lower()}")
        save_path = os.path.join(AVATAR_UPLOAD_FOLDER, filename)
        os.makedirs(AVATAR_UPLOAD_FOLDER, exist_ok=True)
        file.save(save_path)
        # Update user avatar path (relative to /static/uploads)
        user = User.query.get_or_404(user_id)
        user.avatar = f'static/uploads/{filename}'
        db.session.commit()
        return jsonify({'avatar': user.avatar}), 200
    else:
        return jsonify({'error': 'Invalid file type'}), 400

def get_gemini_summary(prompt):
    """
    Calls Gemini LLM API to generate a summary. User must set GEMINI_API_KEY as an environment variable.
    """
    api_key = os.environ.get('GEMINI_API_KEY')
    if not api_key:
        return "(Set up Gemini API key to enable AI summaries.)"
    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + api_key
    headers = {"Content-Type": "application/json"}
    data = {
        "contents": [{"parts": [{"text": prompt}]}]
    }
    try:
        resp = requests.post(url, headers=headers, json=data, timeout=10)
        resp.raise_for_status()
        result = resp.json()
        return result['candidates'][0]['content']['parts'][0]['text']
    except Exception as e:
        return f"(AI summary unavailable: {e})"

@user_bp.route('/sustainability-impact', methods=['GET'])
def sustainability_impact():
    if 'user_id' not in session:
        return jsonify({'error': 'Authentication required'}), 401

    user = User.query.get(session['user_id'])
    swaps_completed = Swap.query.filter(
        or_(Swap.requester_id == user.id, Swap.owner_id == user.id),
        Swap.status == 'accepted'
    ).count()
    items_swapped = swaps_completed

    # Example impact factors
    CO2_PER_ITEM = 5  # kg
    WATER_PER_ITEM = 2000  # liters

    co2_saved = items_swapped * CO2_PER_ITEM
    water_saved = items_swapped * WATER_PER_ITEM

    prompt = (
        f"This user has swapped {items_swapped} items, saving {co2_saved}kg CO₂ and {water_saved}L water. "
        "Write a short, encouraging summary of their sustainability impact."
    )
    gemini_response = get_gemini_summary(prompt)

    return jsonify({
        "items_swapped": items_swapped,
        "co2_saved": co2_saved,
        "water_saved": water_saved,
        "summary": gemini_response
    })

@user_bp.route('/ai-chat', methods=['POST'])
def ai_chat():
    data = request.json
    user_message = data.get('message', '').strip()
    if not user_message:
        return jsonify({'error': 'Message is required.'}), 400
    # System prompt to keep answers on-topic and friendly
    system_prompt = (
        "You are ReWear's friendly AI assistant. Answer questions about sustainable fashion, clothing care, and how to use the ReWear platform. "
        "If the question is off-topic, politely guide the user back to these topics."
    )
    prompt = f"{system_prompt}\nUser: {user_message}\nAssistant:"
    ai_response = get_gemini_summary(prompt)
    return jsonify({'response': ai_response})

@user_bp.route('/notifications', methods=['GET'])
def get_notifications():
    if 'user_id' not in session:
        return jsonify({'error': 'Authentication required'}), 401
    notifications = Notification.query.filter_by(user_id=session['user_id']).order_by(Notification.created_at.desc()).all()
    return jsonify([n.to_dict() for n in notifications])

@user_bp.route('/notifications/<int:notification_id>/read', methods=['POST'])
def mark_notification_read(notification_id):
    if 'user_id' not in session:
        return jsonify({'error': 'Authentication required'}), 401
    notification = Notification.query.get_or_404(notification_id)
    if notification.user_id != session['user_id']:
        return jsonify({'error': 'Permission denied'}), 403
    notification.is_read = True
    db.session.commit()
    return jsonify({'success': True})
