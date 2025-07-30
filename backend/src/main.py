import os
import sys
from flask import Flask, send_from_directory
from flask_cors import CORS

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

frontend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'frontend'))

app = Flask(__name__, static_folder=frontend_path, static_url_path='/')
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'fallback_secret_key')

CORS(app, supports_credentials=True)

# Register blueprints
from src.models.user import db
from src.routes.user import user_bp
from src.routes.auth import auth_bp
from src.routes.items import items_bp
from src.routes.swaps import swaps_bp
from src.routes.admin import admin_bp

app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(items_bp, url_prefix='/api')
app.register_blueprint(swaps_bp, url_prefix='/api')
app.register_blueprint(admin_bp, url_prefix='/api/admin')

# Configure DB
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

# Create DB and default admin
with app.app_context():
    db.create_all()

    from src.models.user import User
    if not User.query.filter_by(username='admin').first():
        admin_user = User(
            username='admin',
            email='admin@rewear.com',
            is_admin=True,
            points=1000
        )
        admin_user.set_password('admin123')
        db.session.add(admin_user)
        db.session.commit()
        print("✅ Default admin user created: username=admin, password=admin123")

# Serve frontend
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    elif os.path.exists(os.path.join(app.static_folder, 'index.html')):
        return send_from_directory(app.static_folder, 'index.html')
    else:
        return "index.html not found", 404

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
