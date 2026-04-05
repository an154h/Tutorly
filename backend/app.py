import pathlib
from flask import Flask, jsonify
from flask_cors import CORS

from db import init_db

BASE_DIR = pathlib.Path(__file__).parent.parent
STATIC_DIR = BASE_DIR / 'frontend' / 'static'

app = Flask(__name__, static_folder=str(STATIC_DIR), static_url_path='/static')
CORS(app)


# ---------------------------------------------------------------------------
# Blueprints — registered here, implemented in routes/
# ---------------------------------------------------------------------------
from routes.auth import auth_bp
from routes.questions import questions_bp
from routes.chat import chat_bp
from routes.analytics import analytics_bp

app.register_blueprint(auth_bp, url_prefix='/api')
app.register_blueprint(questions_bp, url_prefix='/api')
app.register_blueprint(chat_bp, url_prefix='/api')
app.register_blueprint(analytics_bp, url_prefix='/api')


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------
@app.route('/api/health')
def health():
    return jsonify({'status': 'ok'})


# ---------------------------------------------------------------------------
# Serve frontend
# ---------------------------------------------------------------------------
@app.route('/')
@app.route('/static/')
def index():
    return app.send_static_file('index.html')


if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=8000, debug=True)
