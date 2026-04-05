import os
import sys
from pathlib import Path

# Load .env from project root
from dotenv import load_dotenv
load_dotenv(Path(__file__).parent / '.env')

# Make backend/ importable
BACKEND_DIR = Path(__file__).parent / 'backend'
sys.path.insert(0, str(BACKEND_DIR))

from app import app, init_db

if __name__ == '__main__':
    init_db()
    port = int(os.environ.get('PORT', 8000))
    print(f'Starting Tutorly on http://localhost:{port}')
    app.run(host='0.0.0.0', port=port, debug=True)
