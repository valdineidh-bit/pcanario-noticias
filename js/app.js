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

function esc(v) {
    return String(v || "")
        .replaceAll("&","&amp;")
        .replaceAll("<","&lt;")
        .replaceAll(">","&gt;")
        .replaceAll('"',"&quot;")
        .replaceAll("'","&#039;");
}

function dataBR(v) {
    if (!v) return "";
    const d = new Date(v);
    if (isNaN(d)) return "";
    return d.toLocaleString("pt-BR", {
        dateStyle: "long",
        timeStyle: "short"
    });
}

function abrirMateria(id, mudarURL=true) {
    const n = noticiasPCanario.find(
        x => String(x.id) === String(id)
    );
    if (!n) return;

    const main = document.querySelector("main.wrap");
    if (!main) return;

    const link = location.origin +
        location.pathname + "#noticia-" +
        encodeURIComponent(n.id);

    const foto = n.imagem ? `
        <img class="materia-imagem"
             src="${esc(n.imagem)}"
             alt="${esc(n.titulo)}">` : "";

    const fonte = n.url_fonte ? `
        <a class="fonte-link"
           href="${esc(n.url_fonte)}"
           target="_blank"
           rel="noopener noreferrer">
           ${esc(n.fonte || "Fonte original")}
        </a>` :
        esc(n.fonte || "Redação PCanário");

    main.innerHTML = `
      <article class="materia-completa">

        <button class="voltar-noticias"
                onclick="location.href=location.pathname">
          ← Voltar às notícias
        </button>

        <div class="materia-categoria">
          ${esc(n.categoria || "NOTÍCIAS")}
        </div>

        <h1>${esc(n.titulo)}</h1>

        <div class="materia-data">
          ${esc(dataBR(n.publicado_em))}
        </div>

        ${foto}

        <div class="compartilhar">
          <strong>Compartilhe:</strong>

          <a target="_blank"
             rel="noopener noreferrer"
             href="https://wa.me/?text=${encodeURIComponent(
                 n.titulo + " " + link
             )}">
             WhatsApp
          </a>

          <a target="_blank"
             rel="noopener noreferrer"
             href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}">
             Facebook
          </a>

          <button onclick="copiarLink('${esc(link)}')">
             Copiar link
          </button>
        </div>

        <div class="materia-texto">
          ${esc(n.texto || "")
              .replace(/\n\n/g,"</p><p>")
              .replace(/\n/g,"<br>")}
        </div>

        <div class="materia-fonte">
          <strong>Fonte:</strong> ${fonte}
        </div>

        <div class="materia-assinatura">
          <strong>PCanário Notícias</strong><br>
          Pedro Canário na palma da sua mão.
        </div>

      </article>
    `;

    document.title =
        (n.titulo || "Notícia") + " | PCanário Notícias";

    if (mudarURL) {
        history.pushState(
            {noticia:n.id},
            "",
            "#noticia-" + encodeURIComponent(n.id)
        );
    }

    window.scrollTo(0,0);
}

async function copiarLink(link) {
    try {
        await navigator.clipboard.writeText(link);
        alert("Link da notícia copiado!");
    } catch {
        prompt("Copie o link:", link);
    }
}

async function carregarNoticiasPCanario() {
    const area =
        document.getElementById("noticias-publicadas");

    if (!area) return;

    try {
        const r = await fetch(
            "dados/publicadas.json?v=" + Date.now(),
            {cache:"no-store"}
        );

        if (!r.ok) throw new Error("Feed indisponível");

        const dados = await r.json();

        noticiasPCanario =
            Array.isArray(dados.noticias)
            ? [...dados.noticias].reverse()
            : [];

        noticiasPCanario.forEach(n => {

            const card =
                document.createElement("article");

            card.className = "card card-noticia";
            card.tabIndex = 0;
            card.setAttribute("role","link");

            const foto =
                document.createElement("div");

            foto.className = "foto";

            if (n.imagem) {
                const img =
                    document.createElement("img");

                img.src = n.imagem;
                img.alt = n.titulo || "PCanário";
                img.loading = "lazy";

                foto.appendChild(img);
            } else {
                foto.textContent = "📰 PCANÁRIO";
            }

            const caixa =
                document.createElement("div");

            caixa.className = "card-texto";

            const cat =
                document.createElement("span");

            cat.textContent =
                n.categoria || "NOTÍCIAS";

            const h =
                document.createElement("h3");

            h.textContent = n.titulo || "";

            const p =
                document.createElement("p");

            const texto = n.texto || "";

            p.textContent =
                texto.length > 180
                ? texto.slice(0,180) + "..."
                : texto;

            const small =
                document.createElement("small");

            small.textContent =
                dataBR(n.publicado_em) ||
                "PCanário Notícias";

            caixa.append(cat,h,p,small);
            card.append(foto,caixa);

            card.onclick =
                () => abrirMateria(n.id);

            card.onkeydown = e => {
                if (e.key === "Enter")
                    abrirMateria(n.id);
            };

            area.prepend(card);
        });

        if (location.hash.startsWith("#noticia-")) {
            const id = decodeURIComponent(
                location.hash.substring(9)
            );

            abrirMateria(id,false);
        }

    } catch(e) {
        console.error(
            "Erro ao carregar PCanário:",e
        );
    }
}

document.addEventListener(
    "DOMContentLoaded",
    carregarNoticiasPCanario
);
