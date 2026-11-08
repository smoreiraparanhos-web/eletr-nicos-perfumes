/* Página inicial: vitrine, seções com abas, mostrador. */
(window.BM_PRONTO || Promise.resolve()).then(() => {
  "use strict";
  const { $, $$, reduzido, visual, cartao, urlProduto } = window.BM;
  const L = window.LOJA, CATS = window.CATEGORIAS, PRODS = window.PRODUTOS;

  // links antigos (#p-id) vão para a página do produto
  const antigo = location.hash.match(/^#p-(.+)/);
  if (antigo) { location.replace(urlProduto(antigo[1])); return; }

  $("#btnRota").href = L.rota;

  /* CTA da loja: muda conforme o horário real e o último produto visto */
  function ctaLoja() {
    const s = window.BM.statusLoja();
    let v = null; try { v = JSON.parse(localStorage.getItem("bm-visto")); } catch {}
    const pv = v && window.BM.porId(v.id);
    const item = pv ? `${pv.nome}${v.cor ? ` (${v.cor})` : ""}` : "";
    const cta = $("#lojaCta"), pri = $("#lojaPrimario"), sec = $("#lojaSecundario");
    cta.classList.toggle("fechada", !s.aberto);
    if (s.aberto) {
      $("#lojaStatus").textContent = s.falta <= 60 ? `Aberto agora · fecha em ${s.falta} min` : "Aberto agora · até 19h";
      $("#lojaChamada").textContent = s.falta <= 60 ? "Ainda dá tempo de passar hoje." : pv ? `Que tal ver o ${pv.nome} de perto hoje?` : "Dá para passar hoje e ver de perto.";
      pri.href = L.rota; pri.querySelector("span").textContent = "Traçar rota até a loja";
      pri.querySelector("use").setAttribute("href", "#i-rota");
      sec.href = window.BM.linkWa(item ? `Olá! Estou indo até a loja ver o ${item}. Vocês têm?` : "Olá! Estou indo até a loja. Vocês estão aí?");
      sec.querySelector("span").textContent = pv ? `Avisar que vou ver o ${pv.nome}` : "Avisar que estou a caminho";
      $("#lojaDica").textContent = "Mande o modelo antes e chegue já sabendo se tem.";
    } else {
      $("#lojaStatus").textContent = `Fechado agora · abre ${s.proxima}`;
      $("#lojaChamada").textContent = "Deixe sua consulta agora. A loja responde assim que abrir.";
      pri.href = window.BM.linkWa(item ? `Olá! Quero saber se vocês têm o ${item}. Pode me responder quando abrir?` : "Olá! Quero fazer uma consulta. Pode me responder quando abrir?");
      pri.querySelector("span").textContent = pv ? `Deixar consulta do ${pv.nome}` : "Deixar minha consulta";
      pri.querySelector("use").setAttribute("href", "#i-wa");
      sec.href = L.rota; sec.querySelector("span").textContent = "Ver rota para depois";
      sec.querySelector("use").setAttribute("href", "#i-rota");
      $("#lojaDica").textContent = `Quem manda antes já chega ${s.proxima.startsWith("hoje") ? "hoje" : s.proxima.split(" ")[0]} sabendo se tem.`;
    }
  }
  ctaLoja();
  setInterval(ctaLoja, 60000);
  const mapa = $("#mapa");
  new IntersectionObserver((e, o) => { if (e[0].isIntersecting) { mapa.src = L.mapa; o.disconnect(); } }, { rootMargin: "800px" }).observe(mapa);

  const entrar = (ul) => { ul.classList.remove("entrando"); void ul.offsetWidth; ul.classList.add("entrando"); };
  $("#gradeNovidades").innerHTML = PRODS.filter((p) => p.destaque && p.categoria !== "celulares").slice(0, 4).map(cartao).join("");

  /* seções com abas — a aba escolhida é lembrada ao voltar de um produto */
  let abas = {};
  try { abas = JSON.parse(sessionStorage.getItem("bm-abas")) || {}; } catch {}
  function mostrarAba(catId, sub, foco = false) {
    const ul = $(`[data-grade="${catId}"]`), lista = $(`[data-abas="${catId}"]`);
    abas[catId] = sub;
    try { sessionStorage.setItem("bm-abas", JSON.stringify(abas)); } catch {}
    $$(".aba", lista).forEach((b) => {
      const sel = b.dataset.sub === sub;
      b.setAttribute("aria-selected", String(sel)); b.tabIndex = sel ? 0 : -1;
      if (sel) { ul.parentElement.setAttribute("aria-labelledby", b.id); if (foco) b.focus(); }
    });
    const itens = PRODS.filter((p) => p.categoria === catId && (sub === "Todos" || p.sub === sub));
    ul.innerHTML = itens.map(cartao).join("") || `<li class="vazio">Nenhum produto aqui ainda.</li>`;
    entrar(ul);
  }
  CATS.filter((c) => c.subs.length).forEach((cat) => {
    const lista = $(`[data-abas="${cat.id}"]`);
    const subs = ["Todos", ...cat.subs];
    lista.innerHTML = subs.map((s, i) => `<button class="aba" role="tab" type="button" id="aba-${cat.id}-${i}" data-sub="${s}" aria-controls="painel-${cat.id}">${s}</button>`).join("");
    lista.addEventListener("click", (e) => { const b = e.target.closest(".aba"); if (b) mostrarAba(cat.id, b.dataset.sub); });
    lista.addEventListener("keydown", (e) => {
      const i = subs.indexOf(abas[cat.id]);
      const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (d) { e.preventDefault(); mostrarAba(cat.id, subs[(i + d + subs.length) % subs.length], true); }
    });
    mostrarAba(cat.id, subs.includes(abas[cat.id]) ? abas[cat.id] : "Todos");
  });
  $('[data-grade="perfumes"]').innerHTML = PRODS.filter((p) => p.categoria === "perfumes").map(cartao).join("");
  document.addEventListener("click", (e) => {
    const a = e.target.closest("[data-aba-link]");
    if (a) { const [c, s] = a.dataset.abaLink.split(":"); mostrarAba(c, s); }
  });


  /* vitrine manual */
  const vit = $("#vitrine"), slides = $$(".slide", vit), pontos = $("#vitPontos");
  let atual = 0;
  pontos.innerHTML = slides.map((_, i) => `<button type="button" aria-label="Destaque ${i + 1}"></button>`).join("");
  function ir(i) {
    atual = (i + slides.length) % slides.length;
    vit.style.transform = `translateX(${-100 * atual}%)`;
    slides.forEach((s, j) => { s.toggleAttribute("inert", j !== atual); s.classList.toggle("ativo", j === atual); });
    $$("button", pontos).forEach((b, j) => b.setAttribute("aria-current", j === atual ? "true" : "false"));
  }
  $("#vitAnt").addEventListener("click", () => ir(atual - 1));
  $("#vitProx").addEventListener("click", () => ir(atual + 1));
  pontos.addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) ir([...pontos.children].indexOf(b)); });
  let x0 = null;
  vit.addEventListener("touchstart", (e) => (x0 = e.touches[0].clientX), { passive: true });
  vit.addEventListener("touchend", (e) => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) ir(atual + (dx < 0 ? 1 : -1)); x0 = null; });
  ir(0);

  /* mostrador 0 → 2h */
  const marcas = $(".m-marcas");
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2, r1 = i % 3 ? 94 : 88, r2 = 98;
    marcas.insertAdjacentHTML("beforeend", `<line x1="${120 + Math.sin(a) * r1}" y1="${120 - Math.cos(a) * r1}" x2="${120 + Math.sin(a) * r2}" y2="${120 - Math.cos(a) * r2}"/>`);
  }
  const secC = $("#conserto"), arco = $(".m-arco"), ponteiro = $(".m-ponteiro"), mHora = $("#mHora"), mMin = $("#mMin");
  const lim = (v) => Math.min(1, Math.max(0, v));
  let pedido = false;
  function quadro() {
    pedido = false;
    const r = secC.getBoundingClientRect();
    const p = reduzido ? 1 : lim((innerHeight - r.top) / (innerHeight + r.height * 0.2) * 1.15);
    const min = Math.round(p * 120);
    arco.style.strokeDashoffset = String(1 - p);
    ponteiro.style.transform = `rotate(${p * 360}deg)`;
    mHora.textContent = Math.floor(min / 60) + "h";
    mMin.textContent = String(min % 60).padStart(2, "0");
  }
  addEventListener("scroll", () => { if (!pedido) { pedido = true; requestAnimationFrame(quadro); } }, { passive: true });
  addEventListener("resize", quadro);
  quadro();
}).catch((e) => console.error(e));
