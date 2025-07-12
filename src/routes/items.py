import os
from werkzeug.utils import secure_filename
from flask import Blueprint, jsonify, request, session
from src.models.user import User, Item, db
import json

items_bp = Blueprint('items', __name__)

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), '..', 'static', 'uploads')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@items_bp.route('/upload-image', methods=['POST'])
def upload_image():
    auth_error = require_auth()
    if auth_error:
        return auth_error

    if 'image' not in request.files:
        return jsonify({'error': 'No image part in the request'}), 400
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(file_path)
        # Return the URL relative to the static folder
        url = f'/static/uploads/{filename}'
        return jsonify({'url': url}), 201
    else:
        return jsonify({'error': 'File type not allowed'}), 400

def require_auth():
    if 'user_id' not in session:
        return jsonify({'error': 'Authentication required'}), 401
    return None

@items_bp.route('/items', methods=['GET'])
def get_items():
    # Get query parameters
    category = request.args.get('category')
    search = request.args.get('search')
    approved_only = request.args.get('approved_only', 'true').lower() == 'true'
    
    # Build query
    query = Item.query
    
    if approved_only:
        query = query.filter(Item.is_approved == True)
    
    if category:
        query = query.filter(Item.category == category)
    
    if search:
        query = query.filter(
            db.or_(
                Item.title.contains(search),
                Item.description.contains(search),
                Item.tags.contains(search)
            )
        )
    
    items = query.order_by(Item.created_at.desc()).all()
    return jsonify([item.to_dict() for item in items])

@items_bp.route('/items/<int:item_id>', methods=['GET'])
def get_item(item_id):
    item = Item.query.get_or_404(item_id)
    return jsonify(item.to_dict())

@items_bp.route('/items', methods=['POST'])
def create_item():
    auth_error = require_auth()
    if auth_error:
        return auth_error
    
    try:
        data = request.json
        
        # Validate required fields
        required_fields = ['title', 'description', 'category', 'item_type', 'size', 'condition']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Create new item
        item = Item(
            title=data['title'],
            description=data['description'],
            category=data['category'],
            item_type=data['item_type'],
            size=data['size'],
            condition=data['condition'],
            tags=data.get('tags', ''),
            images=json.dumps(data.get('images', [])),
            points_value=data.get('points_value', 50),
            owner_id=session['user_id']
        )
        
        db.session.add(item)
        db.session.commit()
        
        return jsonify({
            'message': 'Item created successfully',
            'item': item.to_dict()
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@items_bp.route('/items/<int:item_id>', methods=['PUT'])
def update_item(item_id):
    auth_error = require_auth()
    if auth_error:
        return auth_error
    
    item = Item.query.get_or_404(item_id)
    
    # Check if user owns the item or is admin
    if item.owner_id != session['user_id'] and not session.get('is_admin'):
        return jsonify({'error': 'Permission denied'}), 403
    
    try:
        data = request.json
        
        # Update fields
        if 'title' in data:
            item.title = data['title']
        if 'description' in data:
            item.description = data['description']
        if 'category' in data:
            item.category = data['category']
        if 'item_type' in data:
            item.item_type = data['item_type']
        if 'size' in data:
            item.size = data['size']
        if 'condition' in data:
            item.condition = data['condition']
        if 'tags' in data:
            item.tags = data['tags']
        if 'images' in data:
            item.images = json.dumps(data['images'])
        if 'points_value' in data:
            item.points_value = data['points_value']
        if 'is_available' in data:
            item.is_available = data['is_available']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Item updated successfully',
            'item': item.to_dict()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@items_bp.route('/items/<int:item_id>', methods=['DELETE'])
def delete_item(item_id):
    auth_error = require_auth()
    if auth_error:
        return auth_error
    
    item = Item.query.get_or_404(item_id)
    
    # Check if user owns the item or is admin
    if item.owner_id != session['user_id'] and not session.get('is_admin'):
        return jsonify({'error': 'Permission denied'}), 403
    
    db.session.delete(item)
    db.session.commit()
    
    return jsonify({'message': 'Item deleted successfully'}), 200

@items_bp.route('/my-items', methods=['GET'])
def get_my_items():
    auth_error = require_auth()
    if auth_error:
        return auth_error
    
    items = Item.query.filter_by(owner_id=session['user_id']).order_by(Item.created_at.desc()).all()
    return jsonify([item.to_dict() for item in items])

@items_bp.route('/categories', methods=['GET'])
def get_categories():
    # Return predefined categories
    categories = [
        'Tops',
        'Bottoms',
        'Dresses',
        'Outerwear',
        'Shoes',
        'Accessories',
        'Activewear',
        'Formal',
        'Casual',
        'Vintage'
    ]
    return jsonify(categories)

@items_bp.route('/featured', methods=['GET'])
def get_featured_items():
    # Get recently added approved items
    items = Item.query.filter_by(is_approved=True, is_available=True).order_by(Item.created_at.desc()).limit(6).all()
    return jsonify([item.to_dict() for item in items])

