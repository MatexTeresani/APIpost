from database import get_connection

def create_tables():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contenido TEXT NOT NULL,
        alias TEXT NOT NULL,
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        likes INTEGER DEFAULT 0
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS comentarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contenido TEXT NOT NULL,
        post_id INTEGER,
        alias TEXT,
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(post_id) REFERENCES posts(id)
    )
    """)

    conn.commit()
    conn.close()


def get_posts():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM posts ORDER BY fecha DESC")
    posts = cursor.fetchall()

    conn.close()
    return [dict(post) for post in posts]


def create_post(contenido, alias):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "INSERT INTO posts (contenido, alias) VALUES (?, ?)",
        (contenido, alias)
    )

    conn.commit()
    conn.close()

def get_comments(post_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT * FROM comentarios WHERE post_id = ? ORDER BY fecha ASC",
        (post_id,)
    )

    comentarios = cursor.fetchall()
    conn.close()

    return [dict(c) for c in comentarios]


def create_comment(contenido, post_id, alias):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "INSERT INTO comentarios (contenido, post_id, alias) VALUES (?, ?, ?)",
        (contenido, post_id, alias)
    )

    conn.commit()
    conn.close()