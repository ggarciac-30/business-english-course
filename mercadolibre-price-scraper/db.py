"""SQLite storage for price history."""

import sqlite3
from contextlib import contextmanager
from datetime import datetime, timezone

DB_PATH = "price_history.db"

SCHEMA = """
CREATE TABLE IF NOT EXISTS price_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_name TEXT NOT NULL,
    product_ref TEXT NOT NULL,
    title TEXT,
    price REAL,
    currency TEXT,
    url TEXT,
    checked_at TEXT NOT NULL
);
"""


@contextmanager
def get_connection(db_path: str = DB_PATH):
    conn = sqlite3.connect(db_path)
    try:
        yield conn
    finally:
        conn.close()


def init_db(db_path: str = DB_PATH) -> None:
    with get_connection(db_path) as conn:
        conn.execute(SCHEMA)
        conn.commit()


def save_price(
    product_name: str,
    product_ref: str,
    title: str,
    price: float,
    currency: str,
    url: str,
    db_path: str = DB_PATH,
) -> None:
    with get_connection(db_path) as conn:
        conn.execute(
            """INSERT INTO price_history
               (product_name, product_ref, title, price, currency, url, checked_at)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (
                product_name,
                product_ref,
                title,
                price,
                currency,
                url,
                datetime.now(timezone.utc).isoformat(),
            ),
        )
        conn.commit()


def get_last_price(product_ref: str, db_path: str = DB_PATH):
    with get_connection(db_path) as conn:
        cur = conn.execute(
            """SELECT price, currency, checked_at FROM price_history
               WHERE product_ref = ?
               ORDER BY checked_at DESC LIMIT 1""",
            (product_ref,),
        )
        row = cur.fetchone()
        if row is None:
            return None
        return {"price": row[0], "currency": row[1], "checked_at": row[2]}


def get_history(product_ref: str, db_path: str = DB_PATH):
    with get_connection(db_path) as conn:
        cur = conn.execute(
            """SELECT price, currency, checked_at FROM price_history
               WHERE product_ref = ?
               ORDER BY checked_at ASC""",
            (product_ref,),
        )
        return [
            {"price": r[0], "currency": r[1], "checked_at": r[2]} for r in cur.fetchall()
        ]
