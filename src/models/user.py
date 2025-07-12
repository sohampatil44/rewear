from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    points = db.Column(db.Integer, default=100)  # Starting points for new users
    is_admin = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    items = db.relationship('Item', backref='owner', lazy=True, cascade='all, delete-orphan')
    sent_swaps = db.relationship('Swap', foreign_keys='Swap.requester_id', backref='requester', lazy=True)
    received_swaps = db.relationship('Swap', foreign_keys='Swap.owner_id', backref='owner_user', lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f'<User {self.username}>'

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'points': self.points,
            'is_admin': self.is_admin,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Item(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(100), nullable=False)
    item_type = db.Column(db.String(100), nullable=False)
    size = db.Column(db.String(50), nullable=False)
    condition = db.Column(db.String(50), nullable=False)
    tags = db.Column(db.String(500))  # Comma-separated tags
    images = db.Column(db.Text)  # JSON string of image URLs
    points_value = db.Column(db.Integer, default=50)
    is_available = db.Column(db.Boolean, default=True)
    is_approved = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Foreign keys
    owner_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # Relationships
    swaps = db.relationship('Swap', foreign_keys='Swap.item_id', backref='item', lazy=True)

    def __repr__(self):
        return f'<Item {self.title}>'

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'category': self.category,
            'item_type': self.item_type,
            'size': self.size,
            'condition': self.condition,
            'tags': self.tags.split(',') if self.tags else [],
            'images': self.images,
            'points_value': self.points_value,
            'is_available': self.is_available,
            'is_approved': self.is_approved,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'owner_id': self.owner_id,
            'owner_username': self.owner.username if self.owner else None
        }

class Swap(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    status = db.Column(db.String(50), default='pending')  # pending, accepted, rejected, completed
    swap_type = db.Column(db.String(50), nullable=False)  # direct_swap, points_redemption
    message = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime)
    
    # Foreign keys
    item_id = db.Column(db.Integer, db.ForeignKey('item.id'), nullable=False)
    requester_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    owner_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    offered_item_id = db.Column(db.Integer, db.ForeignKey('item.id'))  # For direct swaps

    def __repr__(self):
        return f'<Swap {self.id}>'

    def to_dict(self):
        return {
            'id': self.id,
            'status': self.status,
            'swap_type': self.swap_type,
            'message': self.message,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'item_id': self.item_id,
            'requester_id': self.requester_id,
            'owner_id': self.owner_id,
            'offered_item_id': self.offered_item_id,
            'item_title': self.item.title if self.item else None,
            'requester_username': self.requester.username if self.requester else None,
            'owner_username': self.owner_user.username if self.owner_user else None
        }

