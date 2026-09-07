document.querySelectorAll('a[href^="#"]').forEach(link=>{
  link.addEventListener('click',e=>{
    const alvo=document.querySelector(link.getAttribute('href'));
    if(alvo){
      e.preventDefault();
      alvo.scrollIntoView({behavior:'smooth'});
    }
  });
});

/* FEED AUTOMATICO PCANARIO */

let noticiasPCanario = [];

function escaparHTML(valor) {
    return String(valor || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function formatarData(data) {
    if (!data) return "PCanário Notícias";

    const d = new Date(data);
    if (isNaN(d.getTime())) return "PCanário Notícias";

    return d.toLocaleString("pt-BR", {
        dateStyle: "long",
        timeStyle: "short"
    });
}

function abrirMateria(id) {
    const noticia = noticiasPCanario.find(
        item => String(item.id) === String(id)
    );

    if (!noticia) return;

    const principal = document.querySelector("main.wrap");
    if (!principal) return;

    principal.dataset.conteudoOriginal = principal.innerHTML;

    const imagem = noticia.imagem
        ? `<img src="${escaparHTML(noticia.imagem)}"
             alt="${escaparHTML(noticia.titulo)}"
             class="materia-imagem">`
        : "";

    const fonte = noticia.url_fonte
        ? `<p class="materia-fonte">
             Fonte:
             <a href="${escaparHTML(noticia.url_fonte)}"
                target="_blank"
                rel="noopener noreferrer">
                ${escaparHTML(noticia.fonte || "Fonte original")}
             </a>
           </p>`
        : `<p class="materia-fonte">
             Fonte: ${escaparHTML(noticia.fonte || "Redação PCanário")}
           </p>`;

    principal.innerHTML = `
        <article class="materia-completa">

            <button class="voltar-noticias"
                    onclick="voltarNoticias()">
                ← VOLTAR
            </button>

            <span class="tag">
                ${escaparHTML(noticia.categoria || "NOTÍCIAS")}
            </span>

            <h1>${escaparHTML(noticia.titulo)}</h1>

            <small>
                ${escaparHTML(formatarData(noticia.publicado_em))}
            </small>

            ${imagem}

            <div class="materia-texto">
                ${escaparHTML(noticia.texto)
                    .replace(/\n/g, "<br>")}
            </div>

            ${fonte}

            <p class="materia-assinatura">
                <b>PCanário Notícias</b><br>
                Pedro Canário na palma da sua mão.
            </p>

        </article>
    `;

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    history.pushState(
        { materia: id },
        "",
        "#noticia-" + encodeURIComponent(id)
    );
}

function voltarNoticias() {
    location.hash = "";
    location.reload();
}

async function carregarNoticiasPCanario() {
    const area = document.getElementById("noticias-publicadas");
    if (!area) return;

    try {
        const resposta = await fetch(
            "dados/publicadas.json?v=" + Date.now(),
            { cache: "no-store" }
        );

        if (!resposta.ok) {
            throw new Error("Feed indisponível");
        }

        const dados = await resposta.json();

        noticiasPCanario = Array.isArray(dados.noticias)
            ? [...dados.noticias].reverse()
            : [];

        noticiasPCanario.forEach(noticia => {
            const card = document.createElement("article");
            card.className = "card card-noticia";
            card.tabIndex = 0;

            const foto = document.createElement("div");
            foto.className = "foto";

            if (noticia.imagem) {
                const img = document.createElement("img");
                img.src = noticia.imagem;
                img.alt = noticia.titulo || "PCanário Notícias";
                img.loading = "lazy";
                foto.appendChild(img);
            } else {
                foto.textContent = "📰 PCANÁRIO";
            }

            const caixa = document.createElement("div");
            caixa.className = "card-texto";

            const categoria = document.createElement("span");
            categoria.textContent =
                noticia.categoria || "NOTÍCIAS";

            const titulo = document.createElement("h3");
            titulo.textContent = noticia.titulo || "";

            const resumo = document.createElement("p");
            const corpo = noticia.texto || "";

            resumo.textContent =
                corpo.length > 180
                    ? corpo.slice(0, 180) + "..."
                    : corpo;

            const rodape = document.createElement("small");
            rodape.textContent =
                formatarData(noticia.publicado_em);

            caixa.append(
                categoria,
                titulo,
                resumo,
                rodape
            );

            card.append(foto, caixa);

            card.addEventListener("click", () => {
                abrirMateria(noticia.id);
            });

            card.addEventListener("keydown", e => {
                if (e.key === "Enter") {
                    abrirMateria(noticia.id);
                }
            });

            area.prepend(card);
        });

        const hash = location.hash;

        if (hash.startsWith("#noticia-")) {
            const id = decodeURIComponent(
                hash.replace("#noticia-", "")
            );

            abrirMateria(id);
        }

    } catch (erro) {
        console.error(
            "PCanário: erro ao carregar notícias",
            erro
        );
    }
}

document.addEventListener(
    "DOMContentLoaded",
    carregarNoticiasPCanario
);
