/* Partes comuns às páginas: cabeçalho, busca, lista de consulta, avisos. */
(window.BM_PRONTO || Promise.resolve()).then(() => {
  "use strict";
  const L = window.LOJA, CATS = window.CATEGORIAS, PRODS = window.PRODUTOS;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduzido = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const porId = (id) => PRODS.find((p) => p.id === id);
  const linkWa = (msg) => `https://wa.me/${L.whatsapp}?text=${encodeURIComponent(msg)}`;
  /* RAIZ: caminho até a raiz do site ("" na raiz, "../../" nas páginas de produto) */
  const RAIZ = document.documentElement.dataset.raiz || "";
  const raizAbs = L.url ? L.url.replace(/\/?$/, "/") : new URL(RAIZ || "./", location.href).href;
  const urlProduto = (id) => `${RAIZ}p/${encodeURIComponent(id)}/`;
  const urlAbsProduto = (id) => `${raizAbs}p/${encodeURIComponent(id)}/`;
  const coresDe = (p) => { const o = p.opcoes.find((o) => typeof o.valores[0] === "object"); return o ? o.valores : null; };
  const corPadrao = (p) => { const c = coresDe(p); return c ? c[0].cor : p.render.cor; };
  const hexRgb = (h) => [1, 3, 5].map((i) => parseInt(h.substr(i, 2), 16));
  const luz = (h) => { const [r, g, b] = hexRgb(h); return (0.299 * r + 0.587 * g + 0.114 * b) / 255; };
  const mistura = (a, b, t) => { const x = hexRgb(a), y = hexRgb(b); return "#" + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, "0")).join(""); };
  /* fundo de catálogo no tom do produto: escuro para cores escuras, claro para as demais */
  const fundoTom = (cor) => luz(cor) < 0.32
    ? { a: mistura(cor, "#000000", .35), b: mistura(cor, "#000000", .7), escuro: true }
    : { a: mistura(cor, "#ffffff", .86), b: mistura(cor, "#ffffff", .7), escuro: false };
  const visual = (p, cor) => p.fotos && p.fotos.length
    ? `<img src="${p.fotos[0]}" alt="${p.nome}" width="600" height="720" loading="lazy">`
    : window.render(p.render.tipo, cor || corPadrao(p));
  const catNome = (id) => (CATS.find((c) => c.id === id) || {}).nome || "";

  function pintarRenders(raiz = document) {
    $$("[data-render]", raiz).forEach((el) => {
      el.innerHTML = el.dataset.render.split(",").map((r) => { const [t, c] = r.split(":"); return window.render(t, c); }).join("");
    });
  }
  pintarRenders();
  $$("[data-wa]").forEach((a) => (a.href = linkWa(a.dataset.wa)));

  /* aviso */
  const aviso = $("#aviso"); let tAviso;
  const avisar = (txt) => { aviso.textContent = txt; aviso.classList.add("on"); clearTimeout(tAviso); tAviso = setTimeout(() => aviso.classList.remove("on"), 2600); };

  /* menu mobile */
  const menuBtn = $("#menuBtn"), topo = $("#topo");
  menuBtn.addEventListener("click", () => {
    const abrir = !topo.classList.contains("aberto");
    topo.classList.toggle("aberto", abrir); menuBtn.setAttribute("aria-expanded", String(abrir));
  });
  $$("#nav a").forEach((a) => a.addEventListener("click", () => { topo.classList.remove("aberto"); menuBtn.setAttribute("aria-expanded", "false"); }));
  addEventListener("scroll", () => topo.classList.toggle("rolado", scrollY > 40), { passive: true });

  /* busca */
  const campo = $("#buscaCampo"), bLista = $("#buscaLista");
  const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const esc = (s) => s.replace(/[<>&"]/g, "");
  let ativoBusca = -1, tBusca;
  function buscar() {
    const bruto = campo.value.trim(), q = norm(bruto);
    if (!q) { bLista.hidden = true; campo.setAttribute("aria-expanded", "false"); return; }
    const res = PRODS.filter((p) => norm(`${p.nome} ${p.linha} ${p.sub} ${catNome(p.categoria)}`).includes(q));
    ativoBusca = -1;
    bLista.innerHTML = res.length
      ? res.slice(0, 6).map((p, i) => `<li role="option" id="bo-${i}"><a href="${urlProduto(p.id)}" tabindex="-1"><span class="l-arte">${visual(p)}</span><span><b>${p.nome}</b><small>${p.linha}</small></span></a></li>`).join("")
      : `<li class="b-vazio">Nada encontrado para “${esc(bruto)}”.<a href="${linkWa(`Olá! Vocês têm ${bruto}?`)}" target="_blank" rel="noopener">Perguntar no WhatsApp</a></li>`;
    bLista.hidden = false; campo.setAttribute("aria-expanded", "true");
    clearTimeout(tBusca);
    if (!res.length && q.length >= 3) tBusca = setTimeout(() => (window.BM_MEDIR || (() => {}))("Busca sem resultado", { termo: bruto.slice(0, 40) }), 1500);
  }
  campo.addEventListener("input", buscar);
  campo.addEventListener("keydown", (e) => {
    const ops = $$("[role=option]", bLista);
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault(); if (!ops.length) return;
      ativoBusca = (ativoBusca + (e.key === "ArrowDown" ? 1 : -1) + ops.length) % ops.length;
      ops.forEach((o, i) => o.classList.toggle("ativo", i === ativoBusca));
      campo.setAttribute("aria-activedescendant", ops[ativoBusca].id);
    } else if (e.key === "Escape") { campo.value = ""; buscar(); }
  });
  $("#busca").addEventListener("submit", (e) => {
    e.preventDefault();
    const ops = $$("[role=option] a", bLista);
    if (ops.length) location.href = ops[Math.max(0, ativoBusca)].href;
  });
  document.addEventListener("click", (e) => { if (!e.target.closest("#busca")) { bLista.hidden = true; campo.setAttribute("aria-expanded", "false"); } });

  /* lista de consulta */
  const CHAVE = "bm-lista";
  let lista = [];
  try { lista = JSON.parse(localStorage.getItem(CHAVE)) || []; } catch { lista = []; }
  const salvar = () => { try { localStorage.setItem(CHAVE, JSON.stringify(lista)); } catch {} };
  const sacola = $("#sacola"), sacolaBtn = $("#sacolaBtn");
  const descricao = (it) => [it.ops, it.extra].filter(Boolean).join(" · ");
  function desenharLista() {
    $("#contador").textContent = lista.length;
    $("#contador").classList.toggle("on", lista.length > 0);
    $("#sVazio").hidden = lista.length > 0;
    $(".s-rodape").hidden = lista.length === 0;
    $("#sItens").innerHTML = lista.map((it, i) => {
      const p = porId(it.id); if (!p) return "";
      return `<li><a class="l-arte" href="${urlProduto(p.id)}" tabindex="-1" aria-hidden="true">${visual(p, it.cor)}</a><span class="s-txt"><b>${p.nome}</b><small>${descricao(it) || p.linha}</small></span>
        <button class="s-rem" type="button" data-rem="${i}" aria-label="Remover ${p.nome}"><svg class="ico" aria-hidden="true"><use href="#i-x"/></svg></button></li>`;
    }).join("");
    const msg = "Olá! Gostaria de consultar a disponibilidade destes itens:\n" +
      lista.map((it) => { const p = porId(it.id); return p ? `• ${p.nome}${descricao(it) ? ` (${descricao(it)})` : ""}` : ""; }).join("\n");
    $("#sWa").href = linkWa(msg);
  }
  function adicionar(item) {
    lista.push(item); salvar(); desenharLista();
    (window.BM_MEDIR || (() => {}))("Lista de consulta", { produto: item.id });
    $("#contador").animate?.([{ transform: "scale(1.5)" }, { transform: "scale(1)" }], { duration: reduzido ? 1 : 320 });
    avisar(`${porId(item.id).nome} adicionado à lista de consulta`);
  }
  $("#sItens").addEventListener("click", (e) => {
    const b = e.target.closest("[data-rem]"); if (!b) return;
    lista.splice(+b.dataset.rem, 1); salvar(); desenharLista();
    ($("[data-rem]", $("#sItens")) || $("#sFechar")).focus();
  });
  sacolaBtn.addEventListener("click", () => { sacola.showModal(); sacolaBtn.setAttribute("aria-expanded", "true"); });
  $("#sFechar").addEventListener("click", () => sacola.close());
  sacola.addEventListener("close", () => { sacolaBtn.setAttribute("aria-expanded", "false"); sacolaBtn.focus(); });
  sacola.addEventListener("click", (e) => { if (e.target === sacola) sacola.close(); });
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-add]");
    if (!b) return;
    e.preventDefault();
    adicionar({ id: b.dataset.add, ops: "", extra: "", cor: null });
    b.classList.add("feito"); setTimeout(() => b.classList.remove("feito"), 1400);
  });
  desenharLista();

  /* atalhos para uma aba do catálogo: lembra a aba ao chegar na página inicial */
  document.addEventListener("click", (e) => {
    const a = e.target.closest("[data-aba-link]"); if (!a) return;
    const [cat, sub] = a.dataset.abaLink.split(":");
    try { const ab = JSON.parse(sessionStorage.getItem("bm-abas")) || {}; ab[cat] = sub; sessionStorage.setItem("bm-abas", JSON.stringify(ab)); } catch {}
  });

  /* cartão de produto (usado nas duas páginas): fundo no tom da cor + bolinhas de cor */
  function cartao(p, i = 0) {
    const cores = coresDe(p);
    const cor = corPadrao(p), t = fundoTom(cor);
    return `<li class="item" style="--i:${i}" data-item="${p.id}">
      <a class="item-link" href="${urlProduto(p.id)}">
        ${p.selo ? `<span class="selo ${p.selo === "Seminovo" ? "selo-claro" : ""}">${p.selo}</span>` : ""}
        <span class="item-arte ${t.escuro ? "escura" : ""}" style="--fa:${t.a};--fb:${t.b}"${p.fotos && p.fotos.length ? ">" + visual(p, cor) : ` data-arte="${p.render.tipo}|${cor}">`}</span>
        <span class="item-nome">${p.nome}</span>
        <span class="item-linha">${p.linha}</span>
        ${p.preco ? `<span class="item-preco">${p.preco}</span>` : ""}
      </a>
      ${cores && cores.length > 1 ? `<div class="item-cores" role="group" aria-label="${p.nome}: ver cores">${cores.slice(0, 5).map((c, j) =>
        `<button type="button" class="item-cor" style="--c:${c.cor}" data-cor-i="${j}" aria-label="${c.nome}" aria-pressed="${j === 0}" title="${c.nome}"></button>`).join("")}</div>` : ""}
      <button class="item-add" type="button" data-add="${p.id}" aria-label="Adicionar ${p.nome} à lista de consulta"><svg class="ico" aria-hidden="true"><use href="#i-mais"/></svg></button>
    </li>`;
  }
  /* desenha o produto só quando o cartão chega perto da tela (deixa a página leve) */
  const pintor = "IntersectionObserver" in window ? new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    const el = e.target, [t, c] = el.dataset.arte.split("|");
    el.innerHTML = window.render(t, c); el.removeAttribute("data-arte"); pintor.unobserve(el);
  }), { rootMargin: "400px 0px" }) : null;
  const vigiar = (raiz) => $$("[data-arte]", raiz).forEach((el) => { if (pintor) pintor.observe(el); else { const [t, c] = el.dataset.arte.split("|"); el.innerHTML = window.render(t, c); } });
  new MutationObserver((ms) => ms.forEach((m) => m.addedNodes.forEach((n) => { if (n.nodeType !== 1) return; if (n.matches("[data-arte]") && pintor) pintor.observe(n); vigiar(n); }))).observe(document.body, { childList: true, subtree: true });
  vigiar(document);

  function trocarCorCartao(btn) {
    const li = btn.closest("[data-item]"), p = porId(li.dataset.item), c = coresDe(p)[+btn.dataset.corI];
    if (btn.getAttribute("aria-pressed") === "true") return;
    $$(".item-cor", li).forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
    const arte = $(".item-arte", li), t = fundoTom(c.cor);
    arte.style.setProperty("--fa", t.a); arte.style.setProperty("--fb", t.b);
    arte.classList.toggle("escura", t.escuro);
    if (!(p.fotos && p.fotos.length)) { if (pintor) pintor.unobserve(arte); arte.removeAttribute("data-arte"); arte.innerHTML = window.render(p.render.tipo, c.cor); arte.classList.remove("troca"); void arte.offsetWidth; arte.classList.add("troca"); }
    $(".item-link", li).href = `${urlProduto(p.id)}?cor=${encodeURIComponent(c.nome)}`;
  }
  document.addEventListener("click", (e) => { const b = e.target.closest(".item-cor"); if (b) trocarCorCartao(b); });
  document.addEventListener("pointerover", (e) => { const b = e.target.closest(".item-cor"); if (b && e.pointerType === "mouse") trocarCorCartao(b); });

  /* ---------- status da loja (horário de Brasília) ---------- */
  function statusLoja() {
    const agora = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
    const d = agora.getDay(), min = agora.getHours() * 60 + agora.getMinutes(), ABRE = 570, FECHA = 1140;
    const diaUtil = d >= 1 && d <= 6;
    const aberto = diaUtil && min >= ABRE && min < FECHA;
    let proxima = "";
    if (!aberto) proxima = diaUtil && min < ABRE ? "hoje às 9h30" : (d === 6 || d === 0) ? "segunda às 9h30" : "amanhã às 9h30";
    return { aberto, falta: FECHA - min, proxima };
  }

  /* ---------- frases da barra de topo (giram devagar) ---------- */
  const barraMeio = $(".barra-meio");
  if (barraMeio && !reduzido) {
    const frases = [barraMeio.textContent, "Perfumes para presente na loja.", "Uma mensagem e você sabe se tem o seu modelo."];
    let fi = 0, pausa = false;
    barraMeio.addEventListener("mouseenter", () => (pausa = true));
    barraMeio.addEventListener("mouseleave", () => (pausa = false));
    setInterval(() => {
      if (pausa || document.hidden) return;
      fi = (fi + 1) % frases.length;
      barraMeio.classList.add("saindo");
      setTimeout(() => { barraMeio.textContent = frases[fi]; barraMeio.classList.remove("saindo"); }, 350);
    }, 7000);
  }

  /* ---------- cutucadas: frases leves quando o visitante desacelera ----------
     Regras: nada de escassez ou urgência falsa; no máximo 3 por visita;
     intervalo mínimo de 50s; dois "fechar" e elas param nesta visita. */
  const SS = (k, v) => { try { if (v === undefined) return JSON.parse(sessionStorage.getItem(k)); sessionStorage.setItem(k, JSON.stringify(v)); } catch { return null; } };
  const visto = () => { try { return JSON.parse(localStorage.getItem("bm-visto")); } catch { return null; } };
  const ctxAtual = () => (window.BM && window.BM.contexto ? window.BM.contexto() : null);
  const cut = document.createElement("aside");
  cut.className = "cutucada"; cut.dataset.origem = "sugestao"; cut.setAttribute("aria-live", "polite"); cut.setAttribute("aria-label", "Sugestão da loja"); cut.hidden = true;
  document.body.appendChild(cut);
  let ultima = 0;
  const estado = () => SS("bm-cut") || { n: 0, fechou: 0, saida: false };

  function frasesAgora() {
    const ctx = ctxAtual();
    if (ctx) {
      const { p, cor, msg } = ctx;
      const fr = [
        { t: `${p.nome}${cor ? ` em ${cor}` : ""}. Combinou com você?`, a: "Perguntar se tem", wa: msg },
        { t: "Gostou deste? Guarde na sua lista e decida com calma.", a: "Guardar na lista", add: true },
        { t: "Na dúvida entre dois modelos? A loja ajuda a comparar.", a: "Pedir ajuda", wa: `Olá! Estou entre o ${p.nome} e outro modelo. Pode me ajudar a escolher?` }
      ];
      if (p.categoria === "perfumes") fr.unshift({ t: "Perfume bom é aquele que alguém comenta.", a: "Perguntar se tem", wa: msg });
      if (p.categoria === "consertos") fr.unshift({ t: "Celular com defeito não melhora sozinho. Em até 2h ele volta para você.", a: "Consultar conserto", wa: msg });
      if (p.categoria === "celulares") fr.push({ t: "Celular novo pede capa e película. Dá para perguntar tudo junto.", a: "Ver capas", href: urlProduto("capa") });
      return fr;
    }
    const v = visto(), pv = v && porId(v.id);
    const fr = [
      { t: "Ainda escolhendo? Uma conversa rápida costuma resolver.", a: "Pedir uma dica", wa: "Olá! Estou olhando o site e queria uma dica para escolher." },
      { t: "Passou pela Rua Lajeado? Dá para ver tudo de perto.", a: "Ver rota", href: L.rota, fora: true },
      { t: "Celular novo começa com uma mensagem. Sem compromisso.", a: "Mandar mensagem", wa: "Olá! Queria ver as opções de celular." },
      { t: "Presente sem erro: um perfume e uma mensagem resolvem.", a: "Ver perfumes", href: RAIZ + "index.html#perfumes" }
    ];
    if (pv) fr.unshift({ t: `O ${pv.nome}${v.cor ? ` em ${v.cor}` : ""} continua por aqui.`, a: "Rever", href: `${urlProduto(pv.id)}${v.cor ? `?cor=${encodeURIComponent(v.cor)}` : ""}`, p: pv, corHex: v.corHex });
    return fr;
  }

  function mostrarCutucada(f, tipo = "") {
    const ctx = ctxAtual() || {};
    const pv = f.p || ctx.p, corHex = f.corHex || ctx.corHex;
    const acao = f.add ? `<button type="button" class="cut-acao" data-cut-add>${f.a}</button>`
      : f.lista ? `<button type="button" class="cut-acao" data-cut-lista>${f.a}</button>`
      : `<a class="cut-acao" href="${f.wa ? linkWa(f.wa) : f.href}" ${f.wa || f.fora ? 'target="_blank" rel="noopener"' : ""}>${f.wa ? `<svg class="ico" aria-hidden="true"><use href="#i-wa"/></svg>` : ""}${f.a}</a>`;
    cut.className = `cutucada ${tipo}`;
    cut.innerHTML = `${pv ? `<span class="cut-arte">${visual(pv, corHex)}</span>` : `<span class="cut-marca" aria-hidden="true">BM</span>`}
      <div class="cut-txt">${tipo === "saida" ? "<small>Antes de ir</small>" : ""}<p>${f.t}</p>${acao}</div>
      <button type="button" class="cut-x" aria-label="Fechar sugestão"><svg class="ico" aria-hidden="true"><use href="#i-x"/></svg></button>`;
    cut.hidden = false;
    (window.BM_MEDIR || (() => {}))("Sugestão", { acao: "vista", texto: f.t.slice(0, 60) });
    requestAnimationFrame(() => cut.classList.add("on"));
    ultima = Date.now();
    const st = estado(); st.n++; SS("bm-cut", st);
  }
  function esconderCutucada() { cut.classList.remove("on"); setTimeout(() => (cut.hidden = true), 350); }
  cut.addEventListener("click", (e) => {
    if (e.target.closest(".cut-x")) { const st = estado(); st.fechou++; SS("bm-cut", st); esconderCutucada(); }
    else if (e.target.closest("[data-cut-add]")) { const c = ctxAtual(); adicionar({ id: c.p.id, ops: c.ops, extra: "", cor: c.corHex }); esconderCutucada(); }
    else if (e.target.closest("[data-cut-lista]")) { esconderCutucada(); sacola.showModal(); }
    else if (e.target.closest(".cut-acao")) esconderCutucada();
    if (e.target.closest(".cut-acao")) (window.BM_MEDIR || (() => {}))("Sugestão", { acao: "clique", texto: ($(".cut-txt p", cut) || {}).textContent || "" });
  });
  const podeCutucar = () => {
    const st = estado();
    return st.n < 3 && st.fechou < 2 && Date.now() - ultima > 50000 && !document.querySelector("dialog[open]") && cut.hidden && !(document.activeElement && document.activeElement.matches("input, textarea"));
  };
  let tOcioso;
  const ESPERA = Number(new URLSearchParams(location.search).get("espera")) || null; // só para testes
  const ocioso = () => {
    clearTimeout(tOcioso);
    tOcioso = setTimeout(() => {
      if (podeCutucar()) {
        const fr = frasesAgora(), st = estado();
        mostrarCutucada(fr[st.n % fr.length]);
        setTimeout(() => { if (cut.classList.contains("on")) esconderCutucada(); }, 14000);
      }
      ocioso();
    }, ESPERA || (ctxAtual() ? 18000 : 24000));
  };
  ["scroll", "pointermove", "keydown", "touchstart"].forEach((ev) => addEventListener(ev, ocioso, { passive: true }));
  ocioso();

  // intenção de saída (computador): o ponteiro sai pelo topo da janela
  const chegou = Date.now();
  document.addEventListener("mouseout", (e) => {
    if (e.relatedTarget || e.clientY > 0 || Date.now() - chegou < 8000) return;
    const st = estado();
    if (st.saida || st.fechou >= 2 || document.querySelector("dialog[open]") || !cut.hidden) return;
    st.saida = true; SS("bm-cut", st);
    const ctx = ctxAtual();
    mostrarCutucada(ctx
      ? { t: `Quer que a loja confira se tem o ${ctx.p.nome}${ctx.cor ? ` em ${ctx.cor}` : ""}? Leva um minuto.`, a: "Perguntar agora", wa: ctx.msg }
      : lista.length ? { t: "Sua lista de consulta está salva. Quer mandar agora?", a: "Abrir lista", lista: true }
      : { t: "Sem pressa. Quando quiser, a loja responde pelo WhatsApp.", a: "Salvar o contato", wa: "Olá! Salvei o contato de vocês pelo site." }, "saida");
  });

  // aba em segundo plano: o título lembra o que ficou aberto
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      window.BM.titulo = document.title;
      const ctx = ctxAtual(), v = visto(), pv = v && porId(v.id);
      const nome = ctx ? ctx.p.nome : pv ? pv.nome : null;
      document.title = nome ? `Seu ${nome} ficou aqui · BM Digital` : "Volte quando quiser · BM Digital";
    } else if (window.BM.titulo) document.title = window.BM.titulo;
  });

  window.BM = { RAIZ, $, $$, reduzido, porId, linkWa, urlProduto, urlAbsProduto, visual, catNome, adicionar, avisar, cartao, pintarRenders, coresDe, corPadrao, fundoTom, luz, mistura, statusLoja, mostrarCutucada };
}).catch((e) => console.error(e));
