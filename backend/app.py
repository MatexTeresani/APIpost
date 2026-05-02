from flask import Flask, jsonify, request 
from flask_cors import CORS
from models import create_tables, get_posts, create_post
from models import get_comments, create_comment


app = Flask(__name__)
CORS(app)

create_tables()

@app.route('/')
def home():
    return 'APIpost bakckend funcionando'


#TRAEMOS LOS POST 

@app.route('/posts', methods=['GET'])
def posts():
    data = get_posts()
    return jsonify(data)

# crear los post 

@app.route('/posts', methods=['POST'])
def new_post():
    data = request.json

    contenido = data.get('contenido')

    if not contenido: 
        return jsonify({'error': 'contenido requerido'}), 400
    
    alias = 'Anon' + str(len(contenido) * 3) #simple random 

    create_post(contenido, alias)

    return jsonify({'mensaje':'post creado'}), 201 

# traer comentarios
@app.route("/comments/<int:post_id>", methods=["GET"])
def comments(post_id):
    return jsonify(get_comments(post_id))


# crear comentario
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



if __name__ == '__main__': 
    app.run(debug=True)

