import os
import pathlib
import psycopg2
import psycopg2.extras
import psycopg2.pool


# ---------------------------------------------------------------------------
# Connection pool
# ---------------------------------------------------------------------------

_pool = None


def _get_pool():
    global _pool
    if _pool is None:
        database_url = os.environ.get('DATABASE_URL')
        if not database_url:
            raise RuntimeError('DATABASE_URL environment variable is not set')
        _pool = psycopg2.pool.ThreadedConnectionPool(
            minconn=1,
            maxconn=10,
            dsn=database_url,
            cursor_factory=psycopg2.extras.RealDictCursor,
        )
    return _pool


class _PooledConn:
    """Wraps a psycopg2 connection so that close() returns it to the pool."""

    def __init__(self, conn, pool):
        self._conn = conn
        self._pool = pool

    def close(self):
        self._pool.putconn(self._conn)

    def __getattr__(self, name):
        return getattr(self._conn, name)


def get_db():
    """Return a connection from the pool. Call conn.close() to return it."""
    pool = _get_pool()
    return _PooledConn(pool.getconn(), pool)


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
