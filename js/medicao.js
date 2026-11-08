/* Medição de visitas e consultas.
 *
 * Desligada por padrão. Para ligar, preencha LOJA.medicao em js/produtos.js:
 *   { tipo: "plausible", id: "seudominio.com.br" }  → sem cookies, não precisa de aviso
 *   { tipo: "ga4",       id: "G-XXXXXXX" }          → usa cookies, pede consentimento antes
 *
 * Eventos enviados:
 *   "Consulta WhatsApp"  { origem, produto }   — qualquer clique que abre o WhatsApp
 *   "Lista de consulta"  { produto }           — produto adicionado à lista
 *   "Rota"               { origem }            — clique em rota / Google Maps
 *   "Busca sem resultado"{ termo }
 *   "Sugestão"           { acao: vista | clique, texto }
 */
(() => {
  "use strict";
  const cfg = (window.LOJA && window.LOJA.medicao) || {};
  const fila = [];
  let enviar = null;

  window.BM_MEDIR = (evento, props = {}) => {
    if (enviar) enviar(evento, props); else if (cfg.tipo) fila.push([evento, props]);
  };
  const esvaziar = () => { while (fila.length) enviar(...fila.shift()); };

  function carregar(src, attrs = {}) {
    const s = document.createElement("script");
    s.src = src; s.defer = true;
    Object.entries(attrs).forEach(([k, v]) => s.setAttribute(k, v));
    document.head.appendChild(s);
  }

  if (cfg.tipo === "plausible" && cfg.id) {
    window.plausible = window.plausible || function () { (window.plausible.q = window.plausible.q || []).push(arguments); };
    carregar("https://plausible.io/js/script.js", { "data-domain": cfg.id });
    enviar = (e, props) => window.plausible(e, { props });
    esvaziar();
  }

  if (cfg.tipo === "ga4" && cfg.id) {
    const ligarGA = () => {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag("js", new Date());
      window.gtag("config", cfg.id, { anonymize_ip: true });
      carregar(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(cfg.id)}`);
      enviar = (e, props) => window.gtag("event", e.toLowerCase().replace(/\s+/g, "_"), props);
      esvaziar();
    };
    let escolha = null;
    try { escolha = localStorage.getItem("bm-consentimento"); } catch {}
    if (escolha === "sim") ligarGA();
    else if (escolha !== "nao") {
      document.addEventListener("DOMContentLoaded", () => {
        const raiz = document.documentElement.dataset.raiz || "";
        const av = document.createElement("div");
        av.className = "consentimento"; av.setAttribute("role", "region"); av.setAttribute("aria-label", "Aviso de privacidade");
        av.innerHTML = `<p>Usamos medição de visitas para melhorar o site. <a href="${raiz}privacidade.html">Saiba mais</a></p>
          <div><button type="button" class="btn btn-verde" data-c="sim">Aceitar</button><button type="button" class="btn btn-linha" data-c="nao">Agora não</button></div>`;
        document.body.appendChild(av);
        av.addEventListener("click", (e) => {
          const b = e.target.closest("[data-c]"); if (!b) return;
          try { localStorage.setItem("bm-consentimento", b.dataset.c); } catch {}
          av.remove();
          if (b.dataset.c === "sim") ligarGA(); else fila.length = 0;
        });
      });
    }
  }

  /* cliques medidos automaticamente */
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]"); if (!a) return;
    const ctx = window.BM && window.BM.contexto ? window.BM.contexto() : null;
    const origem = (a.closest("[data-origem]") || {}).dataset?.origem || a.id || (a.className || "").split(" ")[0] || "link";
    if (a.href.includes("wa.me/")) window.BM_MEDIR("Consulta WhatsApp", { origem, produto: ctx ? ctx.p.id : "" });
    else if (/google\.[^/]+\/maps/.test(a.href)) window.BM_MEDIR("Rota", { origem });
  }, true);
})();
