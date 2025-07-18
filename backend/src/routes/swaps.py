from flask import Blueprint, jsonify, request, session
from src.models.user import User, Item, Swap, db, Notification
from datetime import datetime

swaps_bp = Blueprint('swaps', __name__)

def require_auth():
    if 'user_id' not in session:
        return jsonify({'error': 'Authentication required'}), 401
    return None

@swaps_bp.route('/swaps', methods=['POST'])
def create_swap():
    auth_error = require_auth()
    if auth_error:
        return auth_error
    
    try:
        data = request.json
        
        # Validate required fields
        if not data.get('item_id') or not data.get('swap_type'):
            return jsonify({'error': 'item_id and swap_type are required'}), 400
        
        item = Item.query.get_or_404(data['item_id'])
        
        # Check if item is available
        if not item.is_available or not item.is_approved:
            return jsonify({'error': 'Item is not available for swap'}), 400
        
        # Check if user is trying to swap their own item
        if item.owner_id == session['user_id']:
            return jsonify({'error': 'Cannot swap your own item'}), 400
        
        swap_type = data['swap_type']
        
        if swap_type == 'points_redemption':
            # Check if user has enough points
            user = User.query.get(session['user_id'])
            if user.points < item.points_value:
                return jsonify({'error': 'Insufficient points'}), 400
            
            # Create swap
            swap = Swap(
                item_id=data['item_id'],
                requester_id=session['user_id'],
                owner_id=item.owner_id,
                swap_type='points_redemption',
                message=data.get('message', '')
            )
            
        elif swap_type == 'direct_swap':
            # Validate offered item
            if not data.get('offered_item_id'):
                return jsonify({'error': 'offered_item_id is required for direct swap'}), 400
            
            offered_item = Item.query.get_or_404(data['offered_item_id'])
            
            # Check if user owns the offered item
            if offered_item.owner_id != session['user_id']:
                return jsonify({'error': 'You can only offer items you own'}), 400
            
            # Check if offered item is available
            if not offered_item.is_available or not offered_item.is_approved:
                return jsonify({'error': 'Offered item is not available'}), 400
            
            # Create swap
            swap = Swap(
                item_id=data['item_id'],
                requester_id=session['user_id'],
                owner_id=item.owner_id,
                swap_type='direct_swap',
                offered_item_id=data['offered_item_id'],
                message=data.get('message', '')
            )
        else:
            return jsonify({'error': 'Invalid swap_type'}), 400
        
        db.session.add(swap)
        db.session.commit()
        
        # Notify item owner
        notification = Notification(
            user_id=item.owner_id,
            message=f"You have a new swap request for '{item.title}'!"
        )
        db.session.add(notification)
        db.session.commit()
        
        return jsonify({
            'message': 'Swap request created successfully',
            'swap': swap.to_dict()
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@swaps_bp.route('/swaps/<int:swap_id>/respond', methods=['POST'])
def respond_to_swap(swap_id):
    auth_error = require_auth()
    if auth_error:
        return auth_error
    
    try:
        data = request.json
        action = data.get('action')  # 'accept' or 'reject'
        
        if action not in ['accept', 'reject']:
            return jsonify({'error': 'Action must be accept or reject'}), 400
        
        swap = Swap.query.get_or_404(swap_id)
        
        # Check if user is the owner of the item
        if swap.owner_id != session['user_id']:
            return jsonify({'error': 'Permission denied'}), 403
        
        # Check if swap is still pending
        if swap.status != 'pending':
            return jsonify({'error': 'Swap is no longer pending'}), 400
        
        if action == 'accept':
            swap.status = 'accepted'
            swap.completed_at = datetime.utcnow()
            
            # Handle points transfer for points redemption
            if swap.swap_type == 'points_redemption':
                requester = User.query.get(swap.requester_id)
                owner = User.query.get(swap.owner_id)
                item = Item.query.get(swap.item_id)
                
                # Transfer points
                requester.points -= item.points_value
                owner.points += item.points_value
                
                # Mark item as unavailable
                item.is_available = False
            
            elif swap.swap_type == 'direct_swap':
                # Mark both items as unavailable
                item = Item.query.get(swap.item_id)
                offered_item = Item.query.get(swap.offered_item_id)
                
                item.is_available = False
                offered_item.is_available = False
        
        else:  # reject
            swap.status = 'rejected'
        
        db.session.commit()
        
        # Notify requester
        notification = Notification(
            user_id=swap.requester_id,
            message=f"Your swap request for '{swap.item.title}' was {swap.status}."
        )
        db.session.add(notification)
        db.session.commit()
        
        return jsonify({
            'message': f'Swap {action}ed successfully',
            'swap': swap.to_dict()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@swaps_bp.route('/my-swaps', methods=['GET'])
def get_my_swaps():
    auth_error = require_auth()
    if auth_error:
        return auth_error
    
    # Get swaps where user is either requester or owner
    sent_swaps = Swap.query.filter_by(requester_id=session['user_id']).all()
    received_swaps = Swap.query.filter_by(owner_id=session['user_id']).all()
    
    return jsonify({
        'sent_swaps': [swap.to_dict() for swap in sent_swaps],
        'received_swaps': [swap.to_dict() for swap in received_swaps]
    })

@swaps_bp.route('/swaps/<int:swap_id>', methods=['GET'])
def get_swap(swap_id):
    auth_error = require_auth()
    if auth_error:
        return auth_error
    
    swap = Swap.query.get_or_404(swap_id)
    
    # Check if user is involved in the swap
    if swap.requester_id != session['user_id'] and swap.owner_id != session['user_id']:
        return jsonify({'error': 'Permission denied'}), 403
    
    return jsonify(swap.to_dict())

@swaps_bp.route('/swaps', methods=['GET'])
def get_all_swaps():
    auth_error = require_auth()
    if auth_error:
        return auth_error
    
    # Only admins can view all swaps
    if not session.get('is_admin'):
        return jsonify({'error': 'Admin access required'}), 403
    
    swaps = Swap.query.order_by(Swap.created_at.desc()).all()
    return jsonify([swap.to_dict() for swap in swaps])

