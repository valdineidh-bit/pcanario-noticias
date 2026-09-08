document.addEventListener("DOMContentLoaded", async () => {
  const faixa = document.querySelector(".publicidade");
  if (!faixa) return;

  const mostrarPadrao = () => {
    faixa.href = "anuncie.html";
    faixa.removeAttribute("target");
    faixa.innerHTML = `
      <strong>📢 ANUNCIE SUA EMPRESA NO PCANÁRIO</strong>
      <span>TOQUE AQUI PARA ANUNCIAR →</span>
    `;
  };

  try {
    const resposta = await fetch("dados/anuncios.json?v=" + Date.now());

    if (!resposta.ok) {
      mostrarPadrao();
      return;
    }

    const dados = await resposta.json();

    const anuncios = Array.isArray(dados)
      ? dados.filter(a => a && a.ativo !== false)
      : [];

    if (anuncios.length === 0) {
      mostrarPadrao();
      return;
    }

    let atual = 0;

    function mostrarAnuncio() {
      const anuncio = anuncios[atual];

      faixa.innerHTML = "";

      if (anuncio.imagem) {
        const img = document.createElement("img");
        img.src = anuncio.imagem;
        img.alt = anuncio.empresa || "Publicidade";
        img.className = "publicidade-logo";
        faixa.appendChild(img);
      }

      const empresa = document.createElement("strong");
      empresa.textContent = anuncio.empresa || "Publicidade";

      const texto = document.createElement("span");
      texto.textContent = anuncio.texto || "Confira esta empresa";

      faixa.appendChild(empresa);
      faixa.appendChild(texto);

      faixa.href = anuncio.link || "#";

      if (anuncio.link) {
        faixa.target = "_blank";
        faixa.rel = "noopener noreferrer";
      } else {
        faixa.removeAttribute("target");
        faixa.removeAttribute("rel");
      }

      atual = (atual + 1) % anuncios.length;
    }

    mostrarAnuncio();

    if (anuncios.length > 1) {
      setInterval(mostrarAnuncio, 6000);
    }

  } catch (erro) {
    console.error("Erro ao carregar publicidade:", erro);
    mostrarPadrao();
  }
});
