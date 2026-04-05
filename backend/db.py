import os
import pathlib
import psycopg2
import psycopg2.extras


def get_db():
    """Return a new psycopg2 connection using DATABASE_URL from env."""
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        raise RuntimeError('DATABASE_URL environment variable is not set')
    conn = psycopg2.connect(database_url, cursor_factory=psycopg2.extras.RealDictCursor)
    return conn


def init_db():
    """Run schema.sql against the database to create tables if they don't exist."""
    schema_path = pathlib.Path(__file__).parent / 'schema.sql'
    with open(schema_path, 'r') as f:
        schema_sql = f.read()
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(schema_sql)
        conn.commit()
    finally:
        conn.close()
