/* Catálogo pela planilha do Google.
 *
 * A loja edita a planilha; o site lê a versão publicada em CSV e sobrepõe
 * os dados de js/produtos.js (que continuam valendo como reserva).
 *
 * Colunas (uma linha por produto; a primeira linha é o cabeçalho):
 *   id        identificador curto, sem espaço (ex.: iphone-16)
 *   ativo     "sim" ou "não" — "não" tira o produto do site
 *   categoria celulares | acessorios | perfumes | consertos
 *   sub       aba dentro da categoria (iPhone, Android, Seminovos, Áudio, Energia, Proteção, Casa)
 *   nome, linha, selo (Novo | Seminovo | vazio), destaque (sim | não), preco (vazio = "Consultar")
 *   render    desenho usado sem foto: pro, duo, moto, relogio, fone, carregador, capa, pelicula, tvbox, abajur, perfume, conserto
 *   cores     "Cor: Rosa #ecc9cf | Azul #c4d3dd"   (o nome antes de ":" é o título do passo)
 *   opcoes    "Condição: Lacrado | Seminovo ; [cores] ; Armazenamento: 128 GB | 256 GB"
 *             ([cores] marca onde o passo de cor aparece; sem ele, a cor vem primeiro)
 *   detalhes  "Lacrado ; Cores sob consulta"
 *   campo     texto de ajuda do campo de observação
 *   fotos     "img/iphone-16-1.webp ; img/iphone-16-2.webp"
 *   specs     "Tela: 6,1 pol. ; Chip: A18"
 *   caixa     "iPhone 16 ; Cabo USB-C"
 */
(() => {
  "use strict";
  const COLUNAS = ["id", "ativo", "categoria", "sub", "nome", "linha", "selo", "destaque", "preco", "render", "cores", "opcoes", "detalhes", "campo", "fotos", "specs", "caixa"];

  function lerCSV(txt) {
    const linhas = []; let campo = "", linha = [], aspas = false;
    txt = txt.replace(/^﻿/, "");
    for (let i = 0; i < txt.length; i++) {
      const c = txt[i];
      if (aspas) {
        if (c === '"' && txt[i + 1] === '"') { campo += '"'; i++; }
        else if (c === '"') aspas = false;
        else campo += c;
      } else if (c === '"') aspas = true;
      else if (c === ",") { linha.push(campo); campo = ""; }
      else if (c === "\n" || c === "\r") {
        if (c === "\r" && txt[i + 1] === "\n") i++;
        linha.push(campo); linhas.push(linha); linha = []; campo = "";
      } else campo += c;
    }
    if (campo || linha.length) { linha.push(campo); linhas.push(linha); }
    const cab = (linhas.shift() || []).map((h) => h.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""));
    return linhas.filter((l) => l.some((v) => v.trim())).map((l) => Object.fromEntries(cab.map((h, i) => [h, (l[i] || "").trim()])));
  }

  const lista = (s, sep = ";") => (s || "").split(sep).map((x) => x.trim()).filter(Boolean);
  const sim = (s) => /^(sim|s|yes|1|x|verdadeiro)$/i.test((s || "").trim());

  function linhaParaProduto(r, base) {
    const p = base ? JSON.parse(JSON.stringify(base)) : { opcoes: [], detalhes: [], fotos: [], render: { tipo: "duo", cor: "#c4d3dd" } };
    const tem = (k) => r[k] !== undefined && r[k] !== "";
    p.id = r.id;
    for (const k of ["categoria", "sub", "nome", "linha", "campo"]) if (tem(k)) p[k] = r[k];
    if (r.selo !== undefined) p.selo = r.selo || null;
    if (r.destaque !== undefined) p.destaque = sim(r.destaque);
    if (r.preco !== undefined) p.preco = r.preco || null;
    if (tem("render")) p.render = { ...p.render, tipo: r.render.trim() };
    if (tem("detalhes")) p.detalhes = lista(r.detalhes);
    if (tem("fotos")) p.fotos = lista(r.fotos);
    if (tem("caixa")) p.caixa = lista(r.caixa);
    if (tem("specs")) p.specs = Object.fromEntries(lista(r.specs).map((x) => { const i = x.indexOf(":"); return [x.slice(0, i).trim(), x.slice(i + 1).trim()]; }).filter(([k, v]) => k && v));
    if (r.opcoes !== undefined || r.cores !== undefined) {
      const opcoes = []; let opCor = null;
      if (tem("cores")) {
        const i = r.cores.indexOf(":");
        const nome = i > 0 ? r.cores.slice(0, i).trim() : "Cor";
        const valores = lista(i > 0 ? r.cores.slice(i + 1) : r.cores, "|").map((v) => {
          const m = v.match(/^(.*?)\s*(#[0-9a-f]{6})$/i);
          return m ? { nome: m[1].trim(), cor: m[2].toLowerCase() } : null;
        }).filter(Boolean);
        if (valores.length) { opCor = { nome, valores }; p.render.cor = valores[0].cor; }
      }
      lista(r.opcoes).forEach((o) => {
        if (/^\[cores?\]$/i.test(o)) { if (opCor) { opcoes.push(opCor); opCor = null; } return; }
        const i = o.indexOf(":"); if (i < 1) return;
        const valores = lista(o.slice(i + 1), "|");
        if (valores.length) opcoes.push({ nome: o.slice(0, i).trim(), valores });
      });
      if (opCor) opcoes.unshift(opCor);
      if (!tem("cores") && base) base.opcoes.filter((o) => typeof o.valores[0] === "object").forEach((o) => opcoes.unshift(o));
      p.opcoes = opcoes;
    }
    return p;
  }

  /* sobrepõe a planilha aos produtos locais */
  function mesclar(produtos, linhas) {
    const out = produtos.slice();
    for (const r of linhas) {
      if (!r.id) continue;
      const i = out.findIndex((p) => p.id === r.id);
      if (r.ativo !== undefined && r.ativo !== "" && !sim(r.ativo)) { if (i >= 0) out.splice(i, 1); continue; }
      const p = linhaParaProduto(r, i >= 0 ? out[i] : null);
      if (!p.nome || !p.categoria) continue;
      if (!p.campo) p.campo = "Alguma observação? (opcional)";
      if (!p.linha) p.linha = "Consulte disponibilidade";
      if (i >= 0) out[i] = p; else out.push(p);
    }
    return out;
  }

  /* produto → linha da planilha (para gerar o modelo inicial) */
  function produtoParaLinha(p) {
    const cor = p.opcoes.find((o) => typeof o.valores[0] === "object");
    return {
      id: p.id, ativo: "sim", categoria: p.categoria, sub: p.sub || "", nome: p.nome, linha: p.linha, selo: p.selo || "",
      destaque: p.destaque ? "sim" : "não", preco: p.preco || "", render: p.render.tipo,
      cores: cor ? `${cor.nome}: ${cor.valores.map((v) => `${v.nome} ${v.cor}`).join(" | ")}` : "",
      opcoes: p.opcoes.map((o) => (o === cor ? "[cores]" : `${o.nome}: ${o.valores.join(" | ")}`)).filter((x, i, a) => !(x === "[cores]" && i === 0 && a.length === 1)).join(" ; "),
      detalhes: (p.detalhes || []).join(" ; "), campo: p.campo || "", fotos: (p.fotos || []).join(" ; "),
      specs: p.specs ? Object.entries(p.specs).map(([k, v]) => `${k}: ${v}`).join(" ; ") : "", caixa: (p.caixa || []).join(" ; ")
    };
  }
  function paraCSV(produtos) {
    const q = (v) => /[",\n]/.test(v) ? `"${String(v).replace(/"/g, '""')}"` : String(v);
    return [COLUNAS.join(","), ...produtos.map((p) => { const l = produtoParaLinha(p); return COLUNAS.map((c) => q(l[c] ?? "")).join(","); })].join("\n");
  }

  const api = { lerCSV, mesclar, paraCSV, COLUNAS };
  if (typeof window === "undefined") { globalThis.BM_PLANILHA = api; return; }
  window.BM_PLANILHA = api;

  /* No navegador: aplica a última versão salva na hora (rápido) e busca a nova.
     Na primeira visita espera a planilha por até 2,5 s; se falhar, usa os dados locais. */
  const url = window.LOJA && window.LOJA.planilha;
  const CHAVE = "bm-planilha";
  const aplicar = (txt) => { try { window.PRODUTOS = mesclar(window.PRODUTOS, lerCSV(txt)); } catch (e) { console.warn("Planilha ignorada:", e); } };
  if (!url) { window.BM_PRONTO = Promise.resolve(); return; }
  let salvo = null;
  try { salvo = localStorage.getItem(CHAVE); } catch {}
  const busca = fetch(url, { cache: "no-store" }).then((r) => (r.ok ? r.text() : Promise.reject(r.status)))
    .then((txt) => { try { localStorage.setItem(CHAVE, txt); } catch {} return txt; });
  if (salvo) { aplicar(salvo); busca.catch(() => {}); window.BM_PRONTO = Promise.resolve(); }
  else window.BM_PRONTO = Promise.race([busca.then(aplicar), new Promise((ok) => setTimeout(ok, 2500))]).catch(() => {});
})();
