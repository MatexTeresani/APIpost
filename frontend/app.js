const API_URL = "http://127.0.0.1:5000/posts"

// traer posts
async function getPosts() {
    const res = await fetch(API_URL)
    const data = await res.json()
    renderPosts(data)
}

// crear post
async function crearPost() {
    const contenido = document.getElementById("contenido").value

    if (!contenido) return

    await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ contenido })
    })

    document.getElementById("contenido").value = ""
    getPosts()
}

// renderizar
async function renderPosts(posts) {
    const container = document.getElementById("posts")
    container.innerHTML = ""

    for (let post of posts) {
        const comentarios = await getComments(post.id)

        const div = document.createElement("div")

        div.innerHTML = `
            <p><strong>${post.alias}</strong></p>
            <p>${post.contenido}</p>

            <input id="comment-${post.id}" placeholder="Comentar...">
            <button onclick="crearComentario(${post.id})">Enviar</button>

            <div>
                ${comentarios.map(c => `<p>💬 ${c.alias}: ${c.contenido}</p>`).join("")}
            </div>

            <hr>
        `

        container.appendChild(div)
    }
}

async function crearComentario(postId) {
    const input = document.getElementById(`comment-${postId}`)
    const contenido = input.value

    if (!contenido) return

    await fetch("http://127.0.0.1:5000/comments", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            contenido,
            post_id: postId
        })
    })

    input.value = ""
    getPosts()
}

// cargar al iniciar
getPosts()

async function getComments(postId) {
    const res = await fetch(`http://127.0.0.1:5000/comments/${postId}`)
    const data = await res.json()
    return data
}