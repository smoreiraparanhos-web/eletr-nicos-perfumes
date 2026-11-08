#!/usr/bin/env node
/* Gerador do site estático — rode depois de mudar produtos, planilha ou endereço:
 *
 *   node ferramentas/gerar.mjs
 *
 * Cria/atualiza:
 *   p/<id>/index.html        página fixa de cada produto (Google + prévia no WhatsApp)
 *   img/og/*.png             imagens de prévia ao compartilhar (precisa do Chrome + playwright-core)
 *   img/favicon.svg, img/*.png, site.webmanifest   ícones
 *   sitemap.xml, robots.txt  (o sitemap só sai com LOJA.url preenchido)
 *   ferramentas/modelo-planilha.csv   modelo para importar no Google Planilhas
 *   metadados de index.html, produto.html e privacidade.html
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import vm from "node:vm";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const ler = (f) => readFileSync(join(RAIZ, f), "utf8");
const gravar = (f, txt) => { mkdirSync(dirname(join(RAIZ, f)), { recursive: true }); writeFileSync(join(RAIZ, f), txt); };
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/* ---------- dados ---------- */
const ctx = { window: {}, console };
vm.createContext(ctx);
vm.runInContext(ler("js/produtos.js"), ctx);
const LOJA = ctx.window.LOJA, CATS = ctx.window.CATEGORIAS;
const urlPlanilha = LOJA.planilha; LOJA.planilha = "";
vm.runInContext(ler("js/planilha.js"), ctx);
LOJA.planilha = urlPlanilha;
const PL = ctx.window.BM_PLANILHA;
let PRODS = ctx.window.PRODUTOS;
if (urlPlanilha) {
  try {
    const r = await fetch(urlPlanilha);
    if (!r.ok) throw new Error("HTTP " + r.status);
    PRODS = PL.mesclar(PRODS, PL.lerCSV(await r.text()));
    console.log(`Planilha aplicada: ${PRODS.length} produtos.`);
  } catch (e) { console.warn("⚠ Não consegui ler a planilha (usando js/produtos.js):", e.message); }
}
const URL_SITE = (LOJA.url || "").replace(/\/?$/, LOJA.url ? "/" : "");
if (!URL_SITE) console.warn("⚠ LOJA.url está vazio: prévias do WhatsApp e sitemap precisam do endereço público. Preencha em js/produtos.js e rode de novo.");
const abs = (caminho) => (URL_SITE ? URL_SITE + caminho : caminho);

/* ---------- utilidades de cor (iguais às do site) ---------- */
const hexRgb = (h) => [1, 3, 5].map((i) => parseInt(h.substr(i, 2), 16));
const luz = (h) => { const [r, g, b] = hexRgb(h); return (0.299 * r + 0.587 * g + 0.114 * b) / 255; };
const mistura = (a, b, t) => { const x = hexRgb(a), y = hexRgb(b); return "#" + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, "0")).join(""); };
const coresDe = (p) => (p.opcoes.find((o) => typeof o.valores[0] === "object") || {}).valores || null;
const corPadrao = (p) => (coresDe(p) ? coresDe(p)[0].cor : p.render.cor);
const tom = (cor) => luz(cor) < 0.32 ? { a: mistura(cor, "#000000", .35), b: mistura(cor, "#000000", .7), escuro: true } : { a: mistura(cor, "#ffffff", .86), b: mistura(cor, "#ffffff", .7), escuro: false };
const catNome = (id) => (CATS.find((c) => c.id === id) || {}).nome || "";
const descricao = (p) => p.categoria === "consertos"
  ? `Conserto de celular em até 2h na BM Digital Eletrônicos, Rua Lajeado, 405, Centro, Eldorado do Sul. Consulte pelo WhatsApp.`
  : `${p.nome} (${p.linha.toLowerCase()}) na BM Digital Eletrônicos, Eldorado do Sul.${coresDe(p) && coresDe(p).length > 1 ? ` Opções: ${coresDe(p).map((c) => c.nome).join(", ")}.` : ""} Consulte disponibilidade pelo WhatsApp.`;

/* ---------- bloco de metadados ---------- */
function meta({ titulo, desc, caminho, imagem, alt, raiz = "", tipo = "website", robots = "" }) {
  const img = imagem ? abs(imagem) : "";
  return `<!-- meta:inicio -->
${URL_SITE && caminho !== null ? `<link rel="canonical" href="${esc(abs(caminho))}">\n` : ""}${robots ? `<meta name="robots" content="${robots}">\n` : ""}<link rel="icon" href="${raiz}img/favicon.svg" type="image/svg+xml">
<link rel="icon" href="${raiz}img/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="${raiz}img/apple-touch-icon.png">
<link rel="manifest" href="${raiz}site.webmanifest">
<meta property="og:type" content="${tipo}">
<meta property="og:site_name" content="BM Digital Eletrônicos">
<meta property="og:locale" content="pt_BR">
<meta property="og:title" content="${esc(titulo)}">
<meta property="og:description" content="${esc(desc)}">
${URL_SITE && caminho !== null ? `<meta property="og:url" content="${esc(abs(caminho))}">\n` : ""}${img ? `<meta property="og:image" content="${esc(img)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(alt || titulo)}">
<meta name="twitter:card" content="summary_large_image">` : ""}
<!-- meta:fim -->`;
}
const trocarMeta = (html, bloco) => {
  const [antes, resto] = html.split("<!-- meta:inicio -->");
  const depois = resto.slice(resto.indexOf("<!-- meta:fim -->") + "<!-- meta:fim -->".length);
  const limpa = (s) => s.replace(/^<meta property="og:[^>]+>\n/gm, "");
  return limpa(antes) + bloco + limpa(depois);
};

/* ---------- páginas da raiz ---------- */
const TITULO_SITE = "BM Digital Eletrônicos — Celulares em Eldorado do Sul";
const DESC_SITE = "iPhone e Android lacrados e seminovos, acessórios, perfumes e conserto de celular em até 2h. Rua Lajeado, 405, Centro, Eldorado do Sul. Seg a sáb, 9h30 às 19h.";
gravar("index.html", trocarMeta(ler("index.html"), meta({ titulo: TITULO_SITE, desc: DESC_SITE, caminho: "", imagem: "img/og/site.png", alt: "BM Digital Eletrônicos — celulares, acessórios e perfumes em Eldorado do Sul" })));
gravar("produto.html", trocarMeta(ler("produto.html"), meta({ titulo: "Produto — BM Digital Eletrônicos", desc: DESC_SITE, caminho: null, imagem: "img/og/site.png", robots: "noindex, follow" })));
gravar("privacidade.html", trocarMeta(ler("privacidade.html"), meta({ titulo: "Privacidade — BM Digital Eletrônicos", desc: "Como o site usa dados.", caminho: "privacidade.html", robots: "noindex" })));

/* ---------- páginas fixas de produto ---------- */
const modelo = ler("produto.html");
if (existsSync(join(RAIZ, "p"))) for (const d of readdirSync(join(RAIZ, "p"))) if (!PRODS.some((p) => p.id === d)) rmSync(join(RAIZ, "p", d), { recursive: true });
const marca = (p) => (/iphone/i.test(p.nome + p.sub) ? "Apple" : /motorola|moto /i.test(p.nome) ? "Motorola" : null);
for (const p of PRODS) {
  const caminho = `p/${p.id}/`;
  const titulo = `${p.categoria === "consertos" ? "Conserto de celular em até 2h" : p.nome} — BM Digital Eletrônicos, Eldorado do Sul`;
  const desc = descricao(p);
  const ld = [
    { "@context": "https://schema.org", "@type": p.categoria === "consertos" ? "Service" : "Product", name: p.nome, description: desc,
      ...(URL_SITE ? { image: abs(`img/og/${p.id}.png`), url: abs(caminho) } : {}),
      ...(marca(p) && p.categoria !== "consertos" ? { brand: { "@type": "Brand", name: marca(p) } } : {}),
      ...(p.categoria !== "consertos" ? { category: catNome(p.categoria) + (p.sub ? ` / ${p.sub}` : "") } : { provider: { "@type": "MobilePhoneStore", name: LOJA.nome } }) },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Produtos", ...(URL_SITE ? { item: URL_SITE } : {}) },
      { "@type": "ListItem", position: 2, name: catNome(p.categoria), ...(URL_SITE ? { item: abs(`index.html#${p.categoria}`) } : {}) },
      { "@type": "ListItem", position: 3, name: p.nome, ...(URL_SITE ? { item: abs(caminho) } : {}) }] }
  ];
  let h = modelo
    .replace('<html lang="pt-BR">', `<html lang="pt-BR" data-raiz="../../" data-produto="${esc(p.id)}">`)
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(titulo)}</title>`)
    .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(desc)}">`)
    .replace(/(href|src)="(?!https?:|#|mailto:|tel:|data:|\.\.\/)([^"]+)"/g, '$1="../../$2"')
    .replace('<h1 id="ppNome"></h1>', `<h1 id="ppNome">${esc(p.categoria === "consertos" ? "Conserto de celular" : `Consultar ${p.nome}`)}</h1>`)
    .replace('<p class="pp-linha" id="ppLinha"></p>', `<p class="pp-linha" id="ppLinha">${esc(`${p.linha} · ${p.preco || (p.categoria === "consertos" ? "Em até 2h" : "Preço sob consulta")}`)}</p>`)
    .replace("</head>", `<script type="application/ld+json">${JSON.stringify(ld)}</script>\n</head>`);
  h = trocarMeta(h, meta({ titulo, desc, caminho, imagem: `img/og/${p.id}.png`, alt: `${p.nome} — BM Digital Eletrônicos`, raiz: "../../", tipo: "product" }));
  gravar(`${caminho}index.html`, h);
}
console.log(`✓ ${PRODS.length} páginas de produto em p/`);

/* ---------- sitemap, robots, manifesto, modelo da planilha ---------- */
const hoje = new Date().toISOString().slice(0, 10);
if (URL_SITE) {
  gravar("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${["", ...PRODS.map((p) => `p/${p.id}/`)].map((c) => `  <url><loc>${esc(abs(c))}</loc><lastmod>${hoje}</lastmod></url>`).join("\n")}\n</urlset>\n`);
  console.log("✓ sitemap.xml");
}
gravar("robots.txt", `User-agent: *\nAllow: /\nDisallow: /ferramentas/\n${URL_SITE ? `Sitemap: ${abs("sitemap.xml")}\n` : ""}`);
gravar("site.webmanifest", JSON.stringify({ name: LOJA.nome, short_name: "BM Digital", start_url: "./index.html", display: "browser", background_color: "#0d0f0e", theme_color: "#0d0f0e",
  icons: [{ src: "img/icone-192.png", sizes: "192x192", type: "image/png" }, { src: "img/icone-512.png", sizes: "512x512", type: "image/png" }] }, null, 2));
gravar("ferramentas/modelo-planilha.csv", "\uFEFF" + PL.paraCSV(PRODS));
const FAVICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#0d0f0e"/><text x="29" y="42" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="25" letter-spacing="-1.5" fill="#fff">BM</text><circle cx="52" cy="33" r="5.5" fill="#2fd24f"/></svg>`;
gravar("img/favicon.svg", FAVICON);
console.log("✓ robots.txt, site.webmanifest, ferramentas/modelo-planilha.csv, img/favicon.svg");

/* ---------- imagens (precisa do Chrome) ---------- */
let chromium;
for (const base of [join(RAIZ, "package.json"), join(process.env.USERPROFILE || process.env.HOME || "", ".claude/skills/sites-incriveis/package.json")]) {
  try { ({ chromium } = createRequire(base)("playwright-core")); break; } catch {}
}
const CHROMES = ["C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  (process.env.LOCALAPPDATA || "") + "/Google/Chrome/Application/chrome.exe", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/usr/bin/google-chrome", "/usr/bin/chromium-browser", "/usr/bin/chromium"];
const exe = process.env.CHROME_PATH || CHROMES.find((c) => existsSync(c));
if (!chromium || !exe) { console.warn("⚠ Imagens não geradas: instale o Chrome e rode `npm i playwright-core`."); process.exit(0); }

const b64 = (f) => readFileSync(join(RAIZ, f)).toString("base64");
const FONTES = `@font-face{font-family:Archivo;src:url(data:font/woff2;base64,${b64("fontes/archivo.woff2")}) format("woff2");font-weight:500 900;font-stretch:100% 125%}
@font-face{font-family:Figtree;src:url(data:font/woff2;base64,${b64("fontes/figtree.woff2")}) format("woff2");font-weight:400 700}`;
const RENDER = ler("js/render.js");
const navegador = await chromium.launch({ executablePath: exe });
const pagina = await navegador.newPage({ viewport: { width: 1200, height: 630 } });
mkdirSync(join(RAIZ, "img/og"), { recursive: true });

const marcaHtml = (claro) => `<div class="marca"><span class="bm">BM</span><span class="mt">Digital<small>Eletrônicos</small></span></div>`;
const baseCss = (t) => `${FONTES}*{margin:0;box-sizing:border-box}body{width:1200px;height:630px;overflow:hidden;font-family:Figtree;color:${t.escuro ? "#f2f4f1" : "#101311"};background:${t.escuro ? t.b : "#f3f4f0"}}
.marca{display:flex;align-items:center;gap:12px}.bm{font:900 34px/1 Archivo;font-stretch:125%;letter-spacing:-.03em;background:${t.escuro ? "#fff" : "#0d0f0e"};color:${t.escuro ? "#0d0f0e" : "#fff"};padding:9px 10px 8px;border-radius:6px;position:relative}
.bm:after{content:"";position:absolute;right:-7px;top:50%;width:13px;height:13px;margin-top:-6.5px;border-radius:50%;background:#2fd24f;box-shadow:0 0 0 3px ${t.escuro ? t.b : "#f3f4f0"}}
.mt{font:800 24px/1 Archivo;font-stretch:112%;text-transform:uppercase;display:grid}.mt small{font:600 12px/1.6 Figtree;letter-spacing:.3em;color:#2fd24f}`;

async function foto(html, arquivo, vp = { width: 1200, height: 630 }) {
  await pagina.setViewportSize(vp);
  await pagina.setContent(`<!doctype html><meta charset="utf-8">${html}<script>${RENDER}</script><script>document.querySelectorAll("[data-r]").forEach(e=>{const[t,c]=e.dataset.r.split(":");e.innerHTML=window.render(t,c)})</script>`);
  await pagina.evaluate(() => document.fonts.ready);
  await pagina.screenshot({ path: join(RAIZ, arquivo), type: "png" });
}

// prévia geral
const tg = tom("#f3f4f0");
await foto(`<style>${baseCss(tg)}
.l{position:absolute;left:64px;top:64px;bottom:64px;width:500px;display:flex;flex-direction:column;justify-content:space-between}
h1{font:900 66px/.95 Archivo;font-stretch:125%;letter-spacing:-.035em}h1 span{display:block;font-weight:500;font-stretch:100%;font-size:28px;line-height:1.2;letter-spacing:-.01em;margin-top:16px;color:#565e58}
.end{font:600 20px Figtree;display:flex;align-items:center;gap:10px}.end:before{content:"";width:30px;height:3px;background:#0d0f0e}
.r{position:absolute;right:0;top:0;bottom:0;width:600px;overflow:hidden;background:radial-gradient(70% 60% at 50% 50%,#2a3a2e,#0d0f0e);display:flex;align-items:center;justify-content:center}
.r span{height:270px;display:block;margin:0 -34px}.r span svg{height:100%;width:auto;filter:drop-shadow(0 20px 20px rgba(0,0,0,.4))}.r span:nth-child(1){transform:rotate(-8deg) translateY(10px)}.r span:nth-child(3){transform:rotate(7deg) translateY(16px);height:240px}.r span:nth-child(4){height:200px;transform:translateY(46px)}
.verde{position:absolute;left:0;bottom:0;width:600px;height:10px;background:#2fd24f}</style>
<div class="l">${marcaHtml()}<h1>Celulares lacrados e seminovos.<span>Acessórios, perfumes e conserto em até&nbsp;2h.</span></h1><p class="end">Rua Lajeado, 405 · Eldorado do Sul</p></div>
<div class="r"><span data-r="pro:#c9c4bb"></span><span data-r="pro:#3a3b3d"></span><span data-r="duo:#ecc9cf"></span><span data-r="perfume:#7a4a22"></span></div><div class="verde"></div>`, "img/og/site.png");

// uma por produto, no tom da cor
for (const p of PRODS) {
  const cor = corPadrao(p), t = tom(cor), cores = coresDe(p) || [];
  await foto(`<style>${baseCss(t)}
.arte{position:absolute;left:0;top:0;bottom:0;width:560px;background:radial-gradient(75% 70% at 50% 45%,${t.escuro ? mistura(t.a, "#ffffff", .1) : "#ffffff"},${t.a} 55%,${t.b});display:flex;align-items:center;justify-content:center}
.arte div{height:470px}.arte svg{height:100%;width:auto;filter:drop-shadow(0 24px 24px rgba(0,0,0,.22))}
.txt{position:absolute;left:620px;right:64px;top:64px;bottom:64px;display:flex;flex-direction:column;justify-content:space-between}
.cat{font:700 16px Figtree;letter-spacing:.18em;text-transform:uppercase;color:${t.escuro ? "rgba(255,255,255,.65)" : "#565e58"};margin-bottom:14px}
h1{font:900 ${p.nome.length > 18 ? 54 : 66}px/.98 Archivo;font-stretch:112%;letter-spacing:-.03em}
.linha{font:500 26px/1.3 Figtree;margin-top:16px;color:${t.escuro ? "rgba(255,255,255,.75)" : "#565e58"}}
.cores{display:flex;gap:10px;margin-top:22px}.cores i{width:28px;height:28px;border-radius:50%;box-shadow:inset 0 0 0 1.5px rgba(0,0,0,.2)${t.escuro ? ",0 0 0 1.5px rgba(255,255,255,.3)" : ""}}
.cta{display:inline-flex;align-items:center;gap:12px;align-self:flex-start;background:#2fd24f;color:#06130a;font:800 22px Figtree;padding:16px 24px;border-radius:10px}
.end{font:600 17px Figtree;margin-top:16px;color:${t.escuro ? "rgba(255,255,255,.65)" : "#565e58"}}</style>
<div class="arte"><div data-r="${p.render.tipo}:${cor}"></div></div>
<div class="txt">${marcaHtml()}<div><p class="cat">${esc(catNome(p.categoria))}${p.sub ? " · " + esc(p.sub) : ""}</p><h1>${esc(p.nome)}</h1><p class="linha">${esc(p.linha)}</p>${cores.length > 1 ? `<div class="cores">${cores.slice(0, 6).map((c) => `<i style="background:${c.cor}"></i>`).join("")}</div>` : ""}</div>
<div><span class="cta">${p.categoria === "consertos" ? "Consultar conserto" : "Consultar no WhatsApp"}</span><p class="end">Rua Lajeado, 405 · Eldorado do Sul</p></div></div>`, `img/og/${p.id}.png`);
}
console.log(`✓ ${PRODS.length + 1} imagens de prévia em img/og/`);

// ícones
for (const [arq, tam] of [["img/favicon-32.png", 32], ["img/apple-touch-icon.png", 180], ["img/icone-192.png", 192], ["img/icone-512.png", 512]]) {
  await foto(`<style>${FONTES}*{margin:0}body{width:${tam}px;height:${tam}px;overflow:hidden;background:transparent}</style>${FAVICON.replace("<svg ", `<svg width="${tam}" height="${tam}" `).replace("Arial Black, Arial, sans-serif", "Archivo").replace('font-weight="900"', 'font-weight="900" style="font-stretch:125%"')}`, arq, { width: tam, height: tam });
}
console.log("✓ ícones PNG");
await navegador.close();
