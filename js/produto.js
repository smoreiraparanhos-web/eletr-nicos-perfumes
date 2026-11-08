/* Página de produto: galeria, configuração passo a passo, resumo, caixa, comparação, FAQ. */
(window.BM_PRONTO || Promise.resolve()).then(() => {
  "use strict";
  const { RAIZ, $, $$, reduzido, porId, linkWa, urlProduto, urlAbsProduto, visual, catNome, adicionar, cartao, fundoTom } = window.BM;
  const L = window.LOJA, PRODS = window.PRODUTOS;

  const id = document.documentElement.dataset.produto || new URLSearchParams(location.search).get("p");
  const p = porId(id);
  if (!p) { $("#pp").innerHTML = `<div class="pp-nada"><h1>Produto não encontrado.</h1><a class="btn btn-verde" href="${RAIZ}index.html">Ver todos os produtos</a></div>`; return; }

  const ehCelular = p.categoria === "celulares";
  const ehConserto = p.categoria === "consertos";
  const optCor = p.opcoes.find((o) => typeof o.valores[0] === "object");
  const cores = optCor ? optCor.valores : null;
  let corAtual = cores ? cores[0].cor : p.render.cor;
  const corPedida = new URLSearchParams(location.search).get("cor");
  if (cores && corPedida) { const c = cores.find((v) => v.nome === corPedida); if (c) corAtual = c.cor; }
  const nomeCor = () => (cores ? (cores.find((v) => v.cor === corAtual) || cores[0]).nome : "");
  const escolhas = {};
  p.opcoes.forEach((o) => (escolhas[o.nome] = typeof o.valores[0] === "object" ? nomeCor() : o.valores[0]));

  /* tom da página acompanha a cor escolhida (perfume escuro = página escura) */
  const raiz = $("#pp");
  function tema() {
    const t = fundoTom(corAtual);
    raiz.style.setProperty("--fa", t.a); raiz.style.setProperty("--fb", t.b); raiz.style.setProperty("--tom", corAtual);
    raiz.classList.toggle("escura", t.escuro);
    $("meta[name=theme-color]").content = t.escuro ? t.b : "#0d0f0e";
  }
  tema();

  /* ---------- cabeçalho do produto ---------- */
  document.title = `${p.nome} — BM Digital Eletrônicos`;
  $('meta[name="description"]').content = `${p.nome}: ${p.linha}. Consulte disponibilidade pelo WhatsApp. BM Digital Eletrônicos, Rua Lajeado, 405, Eldorado do Sul.`;
  $("#ppMigalha").innerHTML = `<a href="${RAIZ}index.html" id="ppVoltar"><svg class="ico" aria-hidden="true"><use href="#i-esq"/></svg>Produtos</a><span aria-hidden="true">/</span><a href="${RAIZ}index.html#${p.categoria === "consertos" ? "conserto" : p.categoria}">${catNome(p.categoria)}</a>${p.sub ? `<span aria-hidden="true">/</span><span>${p.sub}</span>` : ""}`;
  // voltar preserva rolagem e aba quando o visitante veio do catálogo
  $("#ppVoltar").addEventListener("click", (e) => {
    if (document.referrer && new URL(document.referrer).origin === location.origin && history.length > 1) { e.preventDefault(); history.back(); }
  });
  $("#ppSelo").textContent = p.selo || "";
  $("#ppSelo").hidden = !p.selo;
  $("#ppNome").textContent = ehConserto ? "Conserto de celular" : `Consultar ${p.nome}`;
  $("#ppLinha").textContent = `${p.linha} · ${p.preco || (ehConserto ? "Em até 2h" : "Preço sob consulta")}`;

  /* ---------- galeria ---------- */
  const palco = $("#ppPalco"), miniaturas = $("#ppMinis");
  let slide = 0;
  function slidesHtml() {
    if (p.fotos && p.fotos.length) return p.fotos.map((f) => `<figure class="pp-slide"><img src="${f}" alt="${p.nome}" width="1200" height="1200"></figure>`);
    const s = [];
    if (cores) s.push(`<figure class="pp-slide pp-fila" aria-label="Todas as cores">${cores.map((c) => `<span class="${c.cor === corAtual ? "on" : ""}" title="${c.nome}">${window.render(p.render.tipo, c.cor)}</span>`).join("")}</figure>`);
    s.push(`<figure class="pp-slide pp-um">${window.render(p.render.tipo, corAtual)}</figure>`);
    s.push(`<figure class="pp-slide pp-angulos"><span>${window.render(p.render.tipo, corAtual)}</span><span>${window.render(p.render.tipo, corAtual)}</span></figure>`);
    return s;
  }
  function desenharGaleria() {
    const s = slidesHtml();
    palco.innerHTML = `<div class="pp-trilho" style="transform:translateX(${-100 * Math.min(slide, s.length - 1)}%)">${s.join("")}</div>`;
    miniaturas.innerHTML = s.map((h, i) => `<button type="button" aria-label="Imagem ${i + 1} de ${s.length}" aria-current="${i === slide}">${h.replace(/<figure[^>]*>|<\/figure>/g, "")}</button>`).join("");
    $$(".pp-slide", palco).forEach((f, i) => f.toggleAttribute("inert", i !== slide));
    $("#ppAnt").hidden = $("#ppProx").hidden = s.length < 2;
  }
  function irSlide(i) {
    const n = $$(".pp-slide", palco).length;
    slide = (i + n) % n;
    $(".pp-trilho", palco).style.transform = `translateX(${-100 * slide}%)`;
    $$("button", miniaturas).forEach((b, j) => b.setAttribute("aria-current", String(j === slide)));
    $$(".pp-slide", palco).forEach((f, j) => f.toggleAttribute("inert", j !== slide));
  }
  $("#ppAnt").addEventListener("click", () => irSlide(slide - 1));
  $("#ppProx").addEventListener("click", () => irSlide(slide + 1));
  miniaturas.addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) irSlide([...miniaturas.children].indexOf(b)); });
  let x0 = null;
  palco.addEventListener("touchstart", (e) => (x0 = e.touches[0].clientX), { passive: true });
  palco.addEventListener("touchend", (e) => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) irSlide(slide + (dx < 0 ? 1 : -1)); x0 = null; });
  desenharGaleria();

  /* ---------- configuração passo a passo ---------- */
  const TITULOS = {
    "Condição": "Lacrado ou seminovo?", "Cor": "Escolha a sua favorita.", "Armazenamento": "De quanto espaço você precisa?",
    "Problema": "O que aconteceu?", "Estilo": "Qual combina com você?", "Tipo": "Qual proteção você prefere?", "Cor da luz": "Qual luz combina com o seu canto?", "Para": "Para qual aparelho ou pessoa?", "Preferência": "Qual linha você procura?", "Item": "O que você precisa?"
  };
  const cfg = $("#ppConfig");
  cfg.innerHTML = p.opcoes.map((o, oi) => {
    const ehCor = typeof o.valores[0] === "object";
    const grande = o.nome === "Armazenamento" || o.nome === "Condição";
    return `<fieldset class="pp-passo">
      <legend><b>${o.nome}.</b> ${TITULOS[o.nome] || "Escolha uma opção."}</legend>
      ${ehCor ? `<p class="pp-cor-nome" aria-live="polite">${nomeCor()}</p>` : ""}
      <div class="${ehCor ? "pp-cores" : grande ? "pp-caixas" : "pp-chips"}">
        ${o.valores.map((v, vi) => {
          const nome = ehCor ? v.nome : v;
          return `<label${ehCor ? ` title="${nome}"` : ""}><input type="radio" name="o${oi}" value="${nome}" data-op="${o.nome}" ${ehCor ? `data-cor="${v.cor}"` : ""} ${(ehCor ? v.cor === corAtual : vi === 0) ? "checked" : ""}>
            <span ${ehCor ? `style="--c:${v.cor}"` : ""}>${ehCor ? `<span class="sr">${nome}</span>` : grande ? `<b>${nome}</b><small>${o.nome === "Condição" ? (nome === "Lacrado" ? "Embalagem de fábrica" : "Usado anteriormente") : "Consultar"}</small>` : nome}</span></label>`;
        }).join("")}
      </div>
    </fieldset>`;
  }).join("") + `
    <div class="pp-passo">
      <label class="pp-obs"><span><b>${ehConserto ? "Detalhes." : "Observação."}</b> ${p.campo}</span>
      <textarea id="ppObs" rows="2" maxlength="160"></textarea></label>
    </div>
    <div class="pp-passo pp-ajuda-box">
      <p><b>Dúvida para escolher?</b> Fale com a loja antes de decidir.</p>
      <a data-wa-ajuda href="#" target="_blank" rel="noopener">Pedir orientação<svg class="ico" aria-hidden="true"><use href="#i-seta"/></svg></a>
    </div>`;
  $("[data-wa-ajuda]").href = linkWa(`Olá! Estou vendo ${p.nome} no site e gostaria de ajuda para escolher.`);

  const opsTexto = () => Object.entries(escolhas).map(([k, v]) => `${k.toLowerCase()}: ${v}`).join(", ");
  function mensagem() {
    const ops = opsTexto(), obs = $("#ppObs").value.trim();
    let m = ehConserto ? "Olá! Gostaria de consultar um conserto de celular" : `Olá! Gostaria de consultar a disponibilidade: ${p.nome}`;
    if (ops) m += `, na opção ${ops}`;
    m += ".";
    if (obs) m += ` ${ehConserto ? "Aparelho/problema" : "Observação"}: ${obs}.`;
    return m + `\n${urlAbsProduto(p.id)}`;
  }
  function atualizar() {
    const href = linkWa(mensagem());
    $$("[data-consultar]").forEach((a) => (a.href = href));
    $("#ppResumoArte").innerHTML = visual(p, corAtual);
    $("#ppResumoLista").innerHTML = Object.entries(escolhas).map(([k, v]) => `<li><span>${k}</span><b>${v}</b></li>`).join("") || `<li><span>Produto</span><b>${p.nome}</b></li>`;
    $("#ppBarraEscolha").textContent = Object.values(escolhas).join(" · ") || p.linha;
  }
  cfg.addEventListener("change", (e) => {
    const t = e.target; if (!t.dataset.op) return;
    escolhas[t.dataset.op] = t.value;
    if (t.dataset.cor) {
      corAtual = t.dataset.cor;
      tema(); lembrar();
      const fc = document.querySelector("#ppCaixaItens figure"); if (fc) fc.firstElementChild.outerHTML = window.render(p.render.tipo, corAtual);
      $(".pp-cor-nome").textContent = t.value;
      const voltar = slide; desenharGaleria(); irSlide(cores ? Math.max(1, voltar) : voltar);
      palco.classList.remove("trocou"); void palco.offsetWidth; palco.classList.add("trocou");
    }
    atualizar();
  });
  $("#ppObs").addEventListener("input", atualizar);

  /* ---------- resumo ---------- */
  $("#ppResumoTitulo").innerHTML = ehConserto ? "Seu conserto.<br><span>Em até 2h.</span>" : `Seu ${p.nome}.<br><span>Do jeito que você escolheu.</span>`;
  $("#ppResumoPreco").textContent = p.preco || (ehConserto ? "Prazo e valor na consulta" : "Preço e disponibilidade na consulta");
  $$("[data-add-config]").forEach((b) => b.addEventListener("click", () => {
    adicionar({ id: p.id, ops: opsTexto(), extra: $("#ppObs").value.trim(), cor: cores ? corAtual : null });
    b.classList.add("feito"); const s = b.querySelector("span"); const t = s.textContent; s.textContent = "Adicionado à lista";
    setTimeout(() => { b.classList.remove("feito"); s.textContent = t; }, 1800);
  }));
  $$("[data-consultar-txt]").forEach((s) => (s.textContent = ehConserto ? "Consultar conserto" : `Consultar ${p.nome}`));

  /* ---------- na caixa ---------- */
  if (p.caixa) {
    const sec = $("#ppCaixa"); sec.hidden = false;
    $("#ppCaixaItens").innerHTML = p.caixa.map((it, i) => `<figure>${i === 0 ? window.render(p.render.tipo, corAtual) : window.render("cabo", "#f4f3ef")}<figcaption>${it}</figcaption></figure>`).join("");
  }

  /* ---------- comparação ---------- */
  const grupo = ehCelular ? PRODS.filter((x) => x.categoria === "celulares" && x.sub === p.sub && x.sub !== "Seminovos") : [];
  if (grupo.length > 1) {
    const sec = $("#ppCompara"); sec.hidden = false;
    $("#ppComparaTitulo").textContent = p.sub === "iPhone" ? "Qual iPhone é ideal para você?" : `Qual ${p.sub} é ideal para você?`;
    const chaves = [...new Set(grupo.flatMap((x) => Object.keys(x.specs || {})))];
    if (!chaves.length) chaves.push("Tela", "Câmera");
    const tabela = $("#ppTabela");
    tabela.style.setProperty("--n", grupo.length);
    tabela.innerHTML = `
      <div class="ct-linha ct-topo">${grupo.map((x) => {
        const c = (x.opcoes.find((o) => typeof o.valores[0] === "object") || {}).valores;
        return `<a class="ct-prod ${x.id === p.id ? "atual" : ""}" href="${urlProduto(x.id)}" ${x.id === p.id ? 'aria-current="page"' : ""}>
          <span class="ct-arte">${visual(x)}</span>
          <span class="ct-pontos">${c ? c.map((v) => `<i style="--c:${v.cor}" title="${v.nome}"></i>`).join("") : "<i class='vazio-c'></i>"}</span>
          ${x.selo ? `<span class="ct-selo">${x.selo}</span>` : ""}
          <b>${x.nome}</b><span class="ct-linha-txt">${x.linha}</span>
          <span class="ct-ver">${x.id === p.id ? "Você está vendo" : "Ver modelo"}</span></a>`;
      }).join("")}</div>
      ${chaves.map((k) => `<div class="ct-grupo"><h3>${k}</h3><div class="ct-linha">${grupo.map((x) => `<p class="${x.specs && x.specs[k] ? "" : "ct-falta"}">${(x.specs && x.specs[k]) || "Consulte na loja"}</p>`).join("")}</div></div>`).join("")}`;
  }

  /* ---------- relacionados ---------- */
  const rel = PRODS.filter((x) => x.id !== p.id && (x.categoria === p.categoria || (ehCelular && ["capa", "pelicula", "carregador"].includes(x.id))))
    .sort((a, b) => (b.categoria !== p.categoria) - (a.categoria !== p.categoria)).slice(0, 5);
  $("#ppRelacionados").innerHTML = rel.map(cartao).join("");
  if (ehCelular) $("#ppRelTitulo").textContent = "Combina com este celular";

  /* ---------- barra móvel: aparece quando o resumo não está visível ---------- */
  const barra = $("#ppBarra");
  addEventListener("scroll", () => {
    const r = $("#ppResumo").getBoundingClientRect(), f = $(".rodape").getBoundingClientRect();
    barra.classList.toggle("on", scrollY > 300 && !(r.top < innerHeight && r.bottom > 0) && f.top > innerHeight);
  }, { passive: true });
  $("#ppBarraNome").textContent = p.nome;

  /* lembra o último produto visto e informa o contexto às cutucadas */
  function lembrar() { try { localStorage.setItem("bm-visto", JSON.stringify({ id: p.id, cor: nomeCor(), corHex: cores ? corAtual : null })); } catch {} }
  lembrar();
  window.BM.contexto = () => ({ p, cor: nomeCor(), corHex: cores ? corAtual : null, ops: opsTexto(), msg: mensagem() });
  const rota = $("#faqRota"); if (rota) rota.href = L.rota;
  atualizar();
}).catch((e) => console.error(e));
