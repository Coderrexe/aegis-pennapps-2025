import psycopg2
import os
from flask import g

def get_db():
    if 'db' not in g:
        g.db = psycopg2.connect(os.environ['DATABASE_URL'])
    return g.db

def close_db(e=None):
    db = g.pop('db', None)

    if db is not None:
        db.close()

def init_db():
    db = get_db()
    cur = db.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS crimes (
            id SERIAL PRIMARY KEY,
            lat DOUBLE PRECISION NOT NULL,
            lng DOUBLE PRECISION NOT NULL,
            type VARCHAR(255) NOT NULL,
            severity VARCHAR(50) NOT NULL,
            datetime TIMESTAMP NOT NULL
        );
    """)
    db.commit()

def init_app(app):
    app.teardown_appcontext(close_db)
