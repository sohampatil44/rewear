from flask import Blueprint, jsonify, request, session
from src.models.user import User, Item, Swap, db

admin_bp = Blueprint('admin', __name__)

def require_admin():
    if 'user_id' not in session:
        return jsonify({'error': 'Authentication required'}), 401
    if not session.get('is_admin'):
        return jsonify({'error': 'Admin access required'}), 403
    return None

@admin_bp.route('/pending-items', methods=['GET'])
def get_pending_items():
    auth_error = require_admin()
    if auth_error:
        return auth_error
    
    items = Item.query.filter_by(is_approved=False).order_by(Item.created_at.desc()).all()
    return jsonify([item.to_dict() for item in items])

@admin_bp.route('/items/<int:item_id>/approve', methods=['POST'])
def approve_item(item_id):
    auth_error = require_admin()
    if auth_error:
        return auth_error
    
    item = Item.query.get_or_404(item_id)
    item.is_approved = True
    # Award points to the owner
    owner = User.query.get(item.owner_id)
    if owner:
        owner.points += item.points_value
        db.session.commit()
    else:
        db.session.commit()
    
    return jsonify({
        'message': 'Item approved successfully',
        'item': item.to_dict(),
        'owner': owner.to_dict() if owner else None
    })

@admin_bp.route('/items/<int:item_id>/reject', methods=['POST'])
def reject_item(item_id):
    auth_error = require_admin()
    if auth_error:
        return auth_error
    
    item = Item.query.get_or_404(item_id)
    
    # Delete the item instead of just marking as rejected
    db.session.delete(item)
    db.session.commit()
    
    return jsonify({'message': 'Item rejected and removed successfully'})

@admin_bp.route('/users', methods=['GET'])
def get_all_users():
    auth_error = require_admin()
    if auth_error:
        return auth_error
    
    users = User.query.order_by(User.created_at.desc()).all()
    return jsonify([user.to_dict() for user in users])

@admin_bp.route('/users/<int:user_id>/toggle-admin', methods=['POST'])
def toggle_admin_status(user_id):
    auth_error = require_admin()
    if auth_error:
        return auth_error
    
    user = User.query.get_or_404(user_id)
    user.is_admin = not user.is_admin
    db.session.commit()
    
    return jsonify({
        'message': f'User admin status {"granted" if user.is_admin else "revoked"}',
        'user': user.to_dict()
    })

@admin_bp.route('/stats', methods=['GET'])
def get_platform_stats():
    auth_error = require_admin()
    if auth_error:
        return auth_error
    
    total_users = User.query.count()
    total_items = Item.query.count()
    approved_items = Item.query.filter_by(is_approved=True).count()
    pending_items = Item.query.filter_by(is_approved=False).count()
    total_swaps = Swap.query.count()
    completed_swaps = Swap.query.filter_by(status='accepted').count()
    
    return jsonify({
        'total_users': total_users,
        'total_items': total_items,
        'approved_items': approved_items,
        'pending_items': pending_items,
        'total_swaps': total_swaps,
        'completed_swaps': completed_swaps
    })

@admin_bp.route('/items/<int:item_id>/remove', methods=['DELETE'])
def remove_item(item_id):
    auth_error = require_admin()
    if auth_error:
        return auth_error
    
    item = Item.query.get_or_404(item_id)
    db.session.delete(item)
    db.session.commit()
    
    return jsonify({'message': 'Item removed successfully'})

@admin_bp.route('/users/<int:user_id>/adjust-points', methods=['POST'])
def adjust_user_points(user_id):
    auth_error = require_admin()
    if auth_error:
        return auth_error
    
    try:
        data = request.json
        adjustment = data.get('adjustment', 0)
        
        user = User.query.get_or_404(user_id)
        user.points = max(0, user.points + adjustment)  # Ensure points don't go negative
        db.session.commit()
        
        return jsonify({
            'message': f'User points adjusted by {adjustment}',
            'user': user.to_dict()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

