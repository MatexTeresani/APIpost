const API_URL = "http://127.0.0.1:5000/posts"

// =========================
// 🚀 TRAER POSTS
// =========================
async function getPosts() {
    try {
        const res = await fetch(API_URL)
        const data = await res.json()

        const ordered = [...data].reverse()
        await renderPosts(ordered)
    } catch (error) {
        console.error("Error al obtener posts:", error)
    }
}

// =========================
// ✍️ CREAR POST (CON ARCHIVO)
// =========================
async function crearPost() {
    const contenido = document.getElementById("contenido").value.trim()
    const archivo = document.getElementById("archivo").files[0]

    if (!contenido && !archivo) return

    const formData = new FormData()
    formData.append("contenido", contenido)

    if (archivo) {
        formData.append("archivo", archivo)
    }

    try {
        await fetch(API_URL, {
            method: "POST",
            body: formData
        })

        document.getElementById("contenido").value = ""
        document.getElementById("archivo").value = ""

        await getPosts()
    } catch (error) {
        console.error("Error al crear post:", error)
    }
}

// =========================
// 💬 TRAER COMENTARIOS
// =========================
async function getComments(postId) {
    try {
        const res = await fetch(`http://127.0.0.1:5000/comments/${postId}`)
        return await res.json()
    } catch (error) {
        console.error("Error comentarios:", error)
        return []
    }
}

// =========================
// 💬 CREAR COMENTARIO
// =========================
async function crearComentario(postId) {
    const input = document.getElementById(`comment-${postId}`)
    const contenido = input.value.trim()

    if (!contenido) return

    try {
        await fetch("http://127.0.0.1:5000/comments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contenido,
                post_id: postId
            })
        })

        input.value = ""
        await getPosts()
    } catch (error) {
        console.error("Error comentario:", error)
    }
}

// =========================
// 👍 LIKE
// =========================
async function darLike(postId) {
    try {
        await fetch(`http://127.0.0.1:5000/like/${postId}`, {
            method: "POST"
        })

        await getPosts()
    } catch (error) {
        console.error("Error like:", error)
    }
}

// =========================
// 🔁 REPOST
// =========================
async function repostear(postId) {
    try {
        await fetch(`http://127.0.0.1:5000/repost/${postId}`, {
            method: "POST"
        })

        await getPosts()
    } catch (error) {
        console.error("Error repost:", error)
    }
}

// =========================
// 🎨 RENDER POSTS
// =========================
async function renderPosts(posts) {
    const container = document.getElementById("posts")
    container.innerHTML = ""

    for (const post of posts) {
        const comentarios = await getComments(post.id)

        const likes = post.likes ?? 0
        const isRepost = post.original_id !== null && post.original_id !== undefined

        // detectar archivo
        const contenido = post.contenido || ""
        const match = contenido.match(/\[archivo: (.*?)\]/)

        let mediaHTML = ""

        if (match) {
            const filename = match[1]

            if (filename.match(/\.(jpg|jpeg|png|gif)$/i)) {
                mediaHTML = `<img src="http://127.0.0.1:5000/uploads/${filename}" width="250">`
            } else {
                mediaHTML = `<a href="http://127.0.0.1:5000/uploads/${filename}" target="_blank">📎 Descargar archivo</a>`
            }
        }

        const div = document.createElement("div")

        div.innerHTML = `
            <p><strong>${post.alias || "Anon"}</strong></p>

            ${isRepost ? `<p style="color:gray;">🔁 Repost</p>` : ""}

            <pre><code class="language-javascript">${contenido}</code></pre>

            ${mediaHTML}

            <br>

            <button onclick="darLike(${post.id})">
                👍 ${likes}
            </button>

            <button onclick="repostear(${post.id})">
                🔁 Repost
            </button>

            <br><br>

            <input id="comment-${post.id}" placeholder="Comentar...">
            <button onclick="crearComentario(${post.id})">
                Enviar
            </button>

            <div>
                ${
                    comentarios.length > 0
                        ? comentarios.map(c => `
                            <p>💬 <strong>${c.alias || "Anon"}</strong>: ${c.contenido}</p>
                        `).join("")
                        : `<p style="color:gray;">Sin comentarios</p>`
                }
            </div>

            <hr>
        `

        container.appendChild(div)
        
        document.querySelectorAll("pre code").forEach(block => {
        hljs.highlightElement(block)
        })


    }
}

// =========================
// ▶️ INICIO
// =========================
getPosts()