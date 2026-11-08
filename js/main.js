/* Saber+ Mais — comportamento do site. Configurações ficam em config.js */
(function () {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---------- WhatsApp ---------- */
  function linkWhats(msg) {
    return "https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(msg || CONFIG.mensagemPadrao);
  }
  $$("[data-whats]").forEach((a) => {
    a.href = linkWhats(a.dataset.msg);
    a.target = "_blank";
    a.rel = "noopener noreferrer";
  });

  /* ---------- Textos configuráveis ---------- */
  $$("[data-cfg]").forEach((el) => { el.textContent = CONFIG[el.dataset.cfg] || ""; });
  const insta = $("#linkInstagram");
  if (CONFIG.instagram) { insta.href = CONFIG.instagram; insta.hidden = false; }
  $("#ano").textContent = new Date().getFullYear();

  /* ---------- Menu mobile ---------- */
  const btn = $("#menuBtn"), nav = $("#nav");
  btn.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    btn.setAttribute("aria-expanded", open);
  });
  $$("#nav a").forEach((a) => a.addEventListener("click", () => {
    nav.classList.remove("open"); btn.setAttribute("aria-expanded", "false");
  }));

  /* ---------- Link ativo ao rolar ---------- */
  const links = $$("#nav a[href^='#']");
  const secs = links.map((a) => $(a.getAttribute("href"))).filter(Boolean);
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) links.forEach((l) =>
        l.classList.toggle("active", l.getAttribute("href") === "#" + e.target.id));
    }), { rootMargin: "-45% 0px -50% 0px" });
    secs.forEach((s) => io.observe(s));
  }

  /* ---------- Biblioteca ---------- */
  const lista = (CONFIG.mostrarDemonstracao ? MATERIAIS.concat(MATERIAIS_DEMO) : MATERIAIS)
    .slice().sort((a, b) => b.data.localeCompare(a.data));
  const grid = $("#libGrid"), vazio = $("#libVazio"), busca = $("#busca"), cat = $("#categoria"), cont = $("#libContagem");
  const ehNovo = (d) => (Date.now() - new Date(d + "T12:00:00")) / 864e5 <= CONFIG.diasDestaqueNovo;
  const fmt = (d) => new Date(d + "T12:00:00").toLocaleDateString("pt-BR");
  const norm = (t) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  function el(tag, cls, txt) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt) e.textContent = txt;
    return e;
  }

  function render() {
    const q = norm(busca.value.trim()), c = cat.value;
    const itens = lista.filter((m) => (!c || m.categoria === c) && (!q || norm(m.nome).includes(q)));
    grid.innerHTML = "";
    itens.forEach((m) => {
      const card = el("article", "mat");
      const top = el("div", "mat-top");
      top.innerHTML = '<span class="pdf" aria-hidden="true"><svg><use href="#i-pdf"/></svg><b>PDF</b></span>';
      if (m.demo) top.appendChild(el("span", "tag tag-demo", "Demonstração"));
      else if (ehNovo(m.data)) top.appendChild(el("span", "tag tag-new", "Novo"));
      card.appendChild(top);
      card.appendChild(el("h3", "", m.nome));
      card.appendChild(el("p", "", m.descricao));
      const meta = el("p", "mat-meta");
      meta.append(el("span", "chip", m.categoria));
      if (m.ano) meta.append(el("span", "chip chip-alt", m.ano));
      card.appendChild(meta);
      card.appendChild(el("p", "mat-data", "Publicado em " + fmt(m.data)));
      if (m.demo || !m.arquivo) {
        const b = el("button", "btn btn-line", "Em breve");
        b.disabled = true;
        card.appendChild(b);
      } else {
        const a = el("a", "btn btn-blue", "Baixar PDF");
        a.href = encodeURI(m.arquivo);
        a.target = "_blank";
        a.rel = "noopener";
        a.setAttribute("download", "");
        card.appendChild(a);
      }
      grid.appendChild(card);
    });
    const filtrando = q || c;
    vazio.hidden = itens.length > 0;
    $("#libVazioTitulo").textContent = filtrando ? "Nenhum material encontrado" : "Os materiais estão sendo preparados";
    $("#libVazioTexto").textContent = filtrando
      ? "Tente outro nome ou escolha outra categoria."
      : "Em breve, novos materiais de apoio estarão disponíveis aqui. Fale com a educadora para saber mais.";
    $("#limpar").hidden = !filtrando;
    cont.textContent = itens.length ? itens.length + (itens.length === 1 ? " material" : " materiais") : "";
  }
  busca.addEventListener("input", render);
  cat.addEventListener("change", render);
  $("#limpar").addEventListener("click", () => { busca.value = ""; cat.value = ""; render(); busca.focus(); });
  render();
})();
