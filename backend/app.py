from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from models import (
    create_tables,
    get_posts,
    create_post,
    get_comments,
    create_comment,
    like_post,
    repost_post,
    get_connection
)
import os

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

create_tables()

@app.route('/')
def home():
    return 'APIpost backend funcionando'

@app.route("/posts", methods=["GET"])
def posts():
    return jsonify(get_posts())


@app.route("/posts", methods=["POST"])
def new_post():
    contenido = request.form.get("contenido")
    archivo = request.files.get("archivo")

    filename = None

    if archivo:
        filename = archivo.filename
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        archivo.save(filepath)

    if not contenido and not archivo:
        return jsonify({"error": "contenido o archivo requerido"}), 400

    alias = "AnonFile"

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "INSERT INTO posts (contenido, alias, original_id) VALUES (?, ?, ?)",
        (contenido or "", alias, None)
    )

    post_id = cursor.lastrowid

    # guardar archivo como texto (simple)
    if filename:
        cursor.execute(
            "UPDATE posts SET contenido = contenido || ? WHERE id = ?",
            (f" [archivo: {filename}]", post_id)
        )

    conn.commit()
    conn.close()

    return jsonify({"mensaje": "post creado"})


@app.route("/uploads/<filename>")
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)


@app.route("/comments/<int:post_id>", methods=["GET"])
def comments(post_id):
    return jsonify(get_comments(post_id))


@app.route("/comments", methods=["POST"])
def new_comment():
    data = request.json

    contenido = data.get("contenido")
    post_id = data.get("post_id")

    if not contenido or not post_id:
        return jsonify({"error": "datos incompletos"}), 400

    alias = "Anon" + str(len(contenido) * 2)

    create_comment(contenido, post_id, alias)

    return jsonify({"mensaje": "comentario creado"}), 201


@app.route("/like/<int:post_id>", methods=["POST"])
def like(post_id):
    like_post(post_id)
    return jsonify({"mensaje": "like agregado"})


@app.route("/repost/<int:post_id>", methods=["POST"])
def repost(post_id):
    alias = "AnonRepost"

    repost_post(post_id, alias)

    return jsonify({"mensaje": "reposteado"})


if __name__ == '__main__':
    app.run(debug=True)