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
async function carregarNoticiasPCanario() {
    const area = document.getElementById("noticias-publicadas");
    if (!area) return;

    try {
        const resposta = await fetch(
            "dados/publicadas.json?v=" + Date.now()
        );

        if (!resposta.ok) return;

        const dados = await resposta.json();
        const noticias = [...(dados.noticias || [])].reverse();

        noticias.forEach(noticia => {
            const card = document.createElement("article");
            card.className = "card";

            const foto = document.createElement("div");
            foto.className = "foto";

            if (noticia.imagem) {
                const img = document.createElement("img");
                img.src = noticia.imagem;
                img.alt = noticia.titulo || "PCanário Notícias";
                img.loading = "lazy";
                img.style.width = "100%";
                img.style.height = "100%";
                img.style.objectFit = "cover";
                foto.appendChild(img);
            } else {
                foto.textContent = "📰 PCANÁRIO";
            }

            const caixa = document.createElement("div");
            caixa.className = "card-texto";

            const categoria = document.createElement("span");
            categoria.textContent = noticia.categoria || "NOTÍCIAS";

            const titulo = document.createElement("h3");
            titulo.textContent = noticia.titulo || "";

            const resumo = document.createElement("p");
            const corpo = noticia.texto || "";
            resumo.textContent = corpo.length > 180
                ? corpo.slice(0, 180) + "..."
                : corpo;

            const rodape = document.createElement("small");
            rodape.textContent = "PCanário Notícias";

            caixa.append(categoria, titulo, resumo, rodape);
            card.append(foto, caixa);

            area.prepend(card);
        });

    } catch (erro) {
        console.error("PCanário: erro ao carregar feed", erro);
    }
}

document.addEventListener(
    "DOMContentLoaded",
    carregarNoticiasPCanario
);
