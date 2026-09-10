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

function slugNoticia(titulo) {
    return String(titulo || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .toLowerCase()
        .slice(0,100);
}

function urlNoticia(n) {
    return "noticias/" + slugNoticia(n.titulo) + ".html";
}

function abrirMateria(id, mudarURL=true) {
    const n = noticiasPCanario.find(
        x => String(x.id) === String(id)
    );
    if (!n) return;

    if (mudarURL) {
        location.href = urlNoticia(n);
        return;
    }

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

        ${htmlRelacionadasPCanario(n)}

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

        /* Remove apenas os cards antigos de demonstração */
        area.querySelectorAll(".card:not(.card-noticia)").forEach(card => {
            card.remove();
        });

        /* A notícia principal já aparece no destaque.
           Nos cards abaixo, começamos pela segunda notícia. */
        noticiasPCanario.forEach((n, indice) => {

            const card =
                document.createElement("article");

            card.className = "card card-noticia";
            card.tabIndex = 0;
            card.setAttribute("role","link");

            card.dataset.indice = indice;
            card.dataset.titulo = n.titulo || "";
            card.dataset.texto = n.texto || "";
            card.dataset.categoria =
                n.categoria || "NOTÍCIAS";

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

            area.appendChild(card);
        });

        atualizarDestaquePCanario();
        atualizarUltimasPCanario();
        atualizarMinisPCanario();
        atualizarBlocosCategoriasPCanario();

        // Reaplica busca e categoria depois que o feed termina de carregar
        filtrarNoticiasPCanario();

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

/* ===== BUSCA E FILTROS PCANARIO ===== */

let categoriaPCanario = "TODAS";

function normalizarPCanario(valor){
    return String(valor || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
}

function filtrarNoticiasPCanario(){
    const busca =
        document.getElementById("busca-noticias");

    const termo = normalizarPCanario(
        busca ? busca.value : ""
    );

    let visiveis = 0;

    document
        .querySelectorAll(".card-noticia")
        .forEach(card => {

            const titulo =
                normalizarPCanario(
                    card.dataset.titulo
                );

            const texto =
                normalizarPCanario(
                    card.dataset.texto
                );

            const categoria =
                normalizarPCanario(
                    card.dataset.categoria
                );

            const categoriaEscolhida =
                normalizarPCanario(
                    categoriaPCanario
                );

            const bateBusca =
                !termo ||
                titulo.includes(termo) ||
                texto.includes(termo) ||
                categoria.includes(termo);

            const bateCategoria =
                categoriaPCanario === "TODAS" ||
                categoria === categoriaEscolhida;

            const indice = Number(card.dataset.indice || 0);

            const estaEmTodas =
                categoriaPCanario === "TODAS";

            const ocultarDestaque =
                estaEmTodas && !termo && indice < 3;

            const mostrar =
                bateBusca && bateCategoria && !ocultarDestaque;

            card.style.display =
                mostrar ? "" : "none";

            if(mostrar) visiveis++;
        });

    let aviso =
        document.getElementById(
            "sem-resultados-pcanario"
        );

    const area =
        document.getElementById(
            "noticias-publicadas"
        );

    if(!area) return;


    if(visiveis === 0 &&
       termo &&
       document.querySelector(".card-noticia")){

        if(!aviso){
            aviso = document.createElement("div");
            aviso.id =
                "sem-resultados-pcanario";
            aviso.className =
                "sem-resultados";

            aviso.textContent =
                "Nenhuma notícia encontrada.";

            area.appendChild(aviso);
        }

        aviso.style.display = "";

    }else if(aviso){
        aviso.style.display = "none";
    }
}

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const busca =
            document.getElementById(
                "busca-noticias"
            );

        if(busca){
            busca.addEventListener(
                "input",
                () => {
                    filtrarNoticiasPCanario();

                    if (busca.value.trim().length > 0) {
                        const area = document.getElementById(
                            "noticias-publicadas"
                        );

                        if (area) {
                            area.scrollIntoView({
                                behavior: "smooth",
                                block: "start"
                            });
                        }
                    }
                }
            );
        }

        document
            .querySelectorAll(
                "#filtros-categorias button"
            )
            .forEach(botao => {

                botao.addEventListener(
                    "click",
                    () => {

                        categoriaPCanario =
                            botao.dataset.categoria;

                        document
                            .querySelectorAll(
                                "#filtros-categorias button"
                            )
                            .forEach(b =>
                                b.classList.remove(
                                    "ativo"
                                )
                            );

                        botao.classList.add(
                            "ativo"
                        );

                        filtrarNoticiasPCanario();
                    }
                );
            });
    }
);

/* ===== DESTAQUE E RELACIONADAS ===== */

function atualizarDestaquePCanario(){
    if(!noticiasPCanario.length) return;

    const n = noticiasPCanario[0];
    const destaque =
        document.getElementById("destaque-principal");

    const conteudo =
        document.getElementById("conteudo-destaque");

    if(!destaque || !conteudo) return;

    if(n.imagem){
        destaque.style.background =
            `linear-gradient(to top,#02070eee,#02070e20),
             url("${n.imagem}") center/cover`;
    }

    conteudo.innerHTML = `
        <span class="tag">
            ${esc(n.categoria || "DESTAQUE")}
        </span>

        <h1>${esc(n.titulo || "")}</h1>

        <p>
            ${esc((n.texto || "").slice(0,160))}
            ${(n.texto || "").length > 160 ? "..." : ""}
        </p>

        <button type="button"
                id="abrir-destaque-pcanario">
            LER NOTÍCIA →
        </button>
    `;

    const botao =
        document.getElementById(
            "abrir-destaque-pcanario"
        );

    if(botao){
        botao.onclick =
            () => abrirMateria(n.id);
    }
}

function relacionadasPCanario(atual){
    return noticiasPCanario
        .filter(n =>
            String(n.id) !== String(atual.id)
        )
        .sort((a,b) => {
            const ac =
                a.categoria === atual.categoria ? 1 : 0;
            const bc =
                b.categoria === atual.categoria ? 1 : 0;
            return bc - ac;
        })
        .slice(0,3);
}

function htmlRelacionadasPCanario(atual){
    const lista = relacionadasPCanario(atual);

    if(!lista.length) return "";

    return `
      <section class="relacionadas">
        <h2>Leia também</h2>

        <div class="relacionadas-grade">
          ${lista.map(n => `
            <button type="button"
                    onclick="abrirMateria('${esc(n.id)}')">
              <span>
                ${esc(n.categoria || "NOTÍCIAS")}
              </span>
              <strong>
                ${esc(n.titulo || "")}
              </strong>
            </button>
          `).join("")}
        </div>
      </section>
    `;
}

/* ===== MENU PRINCIPAL POR CATEGORIA ===== */
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-menu-categoria]").forEach(link => {
        link.addEventListener("click", (e) => {
            const categoria = link.dataset.menuCategoria;

            if (categoria === "TODAS" && link.textContent.trim().includes("VER TODAS")) {
                e.preventDefault();

                document.querySelectorAll(".card-noticia").forEach(card => {
                    card.style.display = "";
                });

                link.textContent = "RECOLHER ↑";
                link.dataset.expandido = "sim";
                return;
            }

            if (categoria === "TODAS" && link.dataset.expandido === "sim") {
                e.preventDefault();

                link.textContent = "VER TODAS";
                link.dataset.expandido = "nao";

                categoriaPCanario = "TODAS";
                filtrarNoticiasPCanario();
                return;
            }

            categoriaPCanario = categoria;

            document.querySelectorAll("#filtros-categorias button").forEach(botao => {
                botao.classList.toggle(
                    "ativo",
                    botao.dataset.categoria === categoria
                );
            });

            filtrarNoticiasPCanario();
        });
    });
});

/* ===== CATEGORIA RECEBIDA PELA URL ===== */
document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const recebida = params.get("categoria");

    if (!recebida) return;

    const categoria = recebida.toUpperCase();

    const permitidas = [
        "CIDADE",
        "POLÍCIA",
        "POLÍTICA",
        "REGIÃO",
        "EDUCAÇÃO",
        "ESPORTES",
        "EMPREGOS"
    ];

    if (!permitidas.includes(categoria)) return;

    categoriaPCanario = categoria;

    document.querySelectorAll("#filtros-categorias button").forEach(botao => {
        botao.classList.toggle(
            "ativo",
            botao.dataset.categoria === categoria
        );
    });

    filtrarNoticiasPCanario();
});

/* ===== ULTIMAS NOTICIAS LATERAL ===== */
function atualizarUltimasPCanario(){
    const area = document.getElementById("ultimas-pcanario");
    if(!area || !noticiasPCanario.length) return;

    const ultimas = noticiasPCanario
        .filter(n => String(n.id) !== String(noticiasPCanario[0]?.id))
        .slice(0,4);

    area.innerHTML = ultimas.map((n, i) => `
        <div class="ultima-item"
             role="button"
             tabindex="0"
             data-noticia-id="${esc(n.id)}">
            <strong>${String(i + 1).padStart(2,"0")}</strong>
            <p>${esc(n.titulo || "")}</p>
        </div>
    `).join("");

    area.querySelectorAll(".ultima-item").forEach(item => {
        const abrir = () => abrirMateria(item.dataset.noticiaId);

        item.addEventListener("click", abrir);
        item.addEventListener("keydown", e => {
            if(e.key === "Enter" || e.key === " "){
                e.preventDefault();
                abrir();
            }
        });
    });
}

/* ===== MINI DESTAQUES AUTOMATICOS ===== */

function atualizarMinisPCanario(){

    const configurar = (id, categoria, reserva) => {
        const bloco = document.getElementById(id);
        if (!bloco) return;

        const noticia =
            noticiasPCanario.find((n, indice) =>
                indice > 0 &&
                normalizarPCanario(n.categoria) ===
                normalizarPCanario(categoria)
            ) || reserva;

        if (!noticia) return;

        const span = bloco.querySelector("span");
        const titulo = bloco.querySelector("h3");

        if (span) {
            span.textContent =
                noticia.categoria || categoria;
        }

        if (titulo) {
            titulo.textContent =
                noticia.titulo || "";
        }

        if (noticia.imagem) {
            bloco.style.background =
                `linear-gradient(to top,#02101ddd,#02101d55),
                 url("${noticia.imagem}") center/cover`;
        }

        bloco.style.cursor = "pointer";
        bloco.tabIndex = 0;
        bloco.setAttribute("role","link");

        const abrir = () =>
            abrirMateria(noticia.id);

        bloco.onclick = abrir;

        bloco.onkeydown = e => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                abrir();
            }
        };
    };

    configurar(
        "mini-cidade",
        "CIDADE",
        noticiasPCanario[0]
    );

    configurar(
        "mini-regiao",
        "REGIÃO",
        noticiasPCanario[1] || noticiasPCanario[0]
    );
}

/* ===== DESTAQUES POR CATEGORIA ===== */
function atualizarBlocosCategoriasPCanario(){

    const configurar = (id, categoria) => {
        const bloco = document.getElementById(id);
        if (!bloco) return;

        const noticia = noticiasPCanario.find((n, indice) =>
            indice > 0 &&
            normalizarPCanario(n.categoria) ===
            normalizarPCanario(categoria)
        );

        if (!noticia) return;

        const tag = bloco.querySelector("b");
        const titulo = bloco.querySelector("h3");

        if (tag) tag.textContent = categoria;
        if (titulo) titulo.textContent = noticia.titulo || "";

        bloco.style.cursor = "pointer";
        bloco.tabIndex = 0;
        bloco.setAttribute("role", "link");

        const abrir = () => abrirMateria(noticia.id);

        bloco.onclick = abrir;

        bloco.onkeydown = e => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                abrir();
            }
        };
    };

    configurar("bloco-politica", "POLÍTICA");
    configurar("bloco-esportes", "ESPORTES");
    configurar("bloco-regiao", "REGIÃO");
}

/* ===== PLANTAO PCANARIO ===== */
async function carregarPlantaoPCanario(){
    const faixa = document.getElementById("plantao-pcanario");
    if (!faixa) return;

    try {
        const r = await fetch(
            "dados/plantao.json?v=" + Date.now(),
            {cache:"no-store"}
        );

        if (!r.ok) return;

        const plantao = await r.json();

        if (!plantao.ativo || !plantao.id) return;

        const texto = faixa.querySelector("span");

        if (texto) {
            texto.textContent = plantao.titulo || "Notícia urgente";
        }

        faixa.style.display = "";
        faixa.style.cursor = "pointer";

        faixa.onclick = () => abrirMateria(plantao.id);

    } catch(e) {
        console.log("Sem plantão ativo.");
    }
}

document.addEventListener(
    "DOMContentLoaded",
    carregarPlantaoPCanario
);
