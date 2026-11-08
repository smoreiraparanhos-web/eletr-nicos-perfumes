/* Renders de produto em SVG — usados enquanto não há fotos.
   window.render(tipo, cor, {frente}) → string <svg> */
(() => {
  let n = 0;
  const hex = (h) => { h = h.replace("#", ""); return [0, 2, 4].map((i) => parseInt(h.substr(i, 2), 16)); };
  const mix = (c, alvo, t) => { const a = hex(c), b = hex(alvo); return "#" + a.map((v, i) => Math.round(v + (b[i] - v) * t).toString(16).padStart(2, "0")).join(""); };
  const claro = (c, t) => mix(c, "#ffffff", t);
  const escuro = (c, t) => mix(c, "#000000", t);
  const lum = (c) => { const [r, g, b] = hex(c); return (0.299 * r + 0.587 * g + 0.114 * b) / 255; };

  function defs(id, cor) {
    return `<defs>
      <linearGradient id="g${id}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${claro(cor, .22)}"/><stop offset=".55" stop-color="${cor}"/><stop offset="1" stop-color="${escuro(cor, .22)}"/>
      </linearGradient>
      <linearGradient id="b${id}" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="${escuro(cor, .35)}"/><stop offset=".15" stop-color="${claro(cor, .35)}"/><stop offset=".85" stop-color="${cor}"/><stop offset="1" stop-color="${escuro(cor, .4)}"/>
      </linearGradient>
      <radialGradient id="l${id}" cx=".35" cy=".35" r=".7">
        <stop offset="0" stop-color="#3b4a5a"/><stop offset=".45" stop-color="#0c1116"/><stop offset="1" stop-color="#000"/>
      </radialGradient>
      <linearGradient id="r${id}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".4" stop-color="#fff" stop-opacity="0"/>
      </linearGradient>
      <radialGradient id="s${id}"><stop offset="0" stop-color="#000" stop-opacity=".28"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
    </defs>`;
  }
  const sombra = (id, cx = 100, cy = 228, rx = 62) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="7" fill="url(#s${id})"/>`;
  const lente = (id, x, y, r) => `<circle cx="${x}" cy="${y}" r="${r + 2.2}" fill="#15181b" opacity=".9"/><circle cx="${x}" cy="${y}" r="${r}" fill="url(#l${id})" stroke="#8a929a" stroke-width=".8"/><circle cx="${x - r * .32}" cy="${y - r * .32}" r="${r * .22}" fill="#fff" opacity=".55"/>`;

  function celular(id, cor, tipo) {
    const borda = lum(cor) > .6 ? escuro(cor, .25) : claro(cor, .25);
    let modulo = "";
    if (tipo === "pro") {
      modulo = `<rect x="58" y="28" width="58" height="58" rx="15" fill="${escuro(cor, .08)}" stroke="${borda}" stroke-width=".8"/>
        ${lente(id, 74, 44, 9)}${lente(id, 74, 70, 9)}${lente(id, 99, 57, 9)}
        <circle cx="104" cy="37" r="3.4" fill="#e9e3c8"/><circle cx="104" cy="77" r="2.4" fill="#111"/>`;
    } else if (tipo === "duo") {
      modulo = `<rect x="58" y="28" width="30" height="54" rx="15" fill="${escuro(cor, .06)}" stroke="${borda}" stroke-width=".8"/>
        ${lente(id, 73, 43, 8)}${lente(id, 73, 67, 8)}<circle cx="96" cy="36" r="3" fill="#e9e3c8"/>`;
    } else {
      modulo = `<rect x="58" y="28" width="40" height="50" rx="9" fill="${escuro(cor, .18)}" stroke="${borda}" stroke-width=".8"/>
        ${lente(id, 70, 41, 7)}${lente(id, 70, 63, 7)}${lente(id, 88, 41, 4)}<circle cx="88" cy="62" r="2.6" fill="#e9e3c8"/>`;
    }
    const logo = tipo === "moto"
      ? `<circle cx="100" cy="140" r="9" fill="none" stroke="${borda}" stroke-width="1.6" opacity=".8"/><path d="M94 144l3-7 3 5 3-5 3 7" fill="none" stroke="${borda}" stroke-width="1.4" opacity=".8"/>`
      : `<circle cx="100" cy="132" r="7" fill="${borda}" opacity=".35"/>`;
    return `${sombra(id)}
      <rect x="47" y="15" width="106" height="210" rx="24" fill="url(#b${id})"/>
      <rect x="50" y="18" width="100" height="204" rx="21.5" fill="url(#g${id})"/>
      <rect x="153" y="66" width="2.4" height="30" rx="1" fill="${escuro(cor, .3)}"/>
      <rect x="44.6" y="58" width="2.4" height="16" rx="1" fill="${escuro(cor, .3)}"/><rect x="44.6" y="80" width="2.4" height="26" rx="1" fill="${escuro(cor, .3)}"/>
      ${modulo}${logo}
      <path d="M50 40Q52 18 72 18h20L50 120z" fill="url(#r${id})" opacity=".55"/>`;
  }

  function relogio(id, cor) {
    return `${sombra(id, 100, 228, 46)}
      <path d="M74 20h52l5 46H69z" fill="url(#g${id})"/><path d="M69 176l5 46h52l5-46z" fill="url(#g${id})"/>
      <path d="M78 26h44M77 34h46M76 42h48M75 50h50" stroke="${escuro(cor, .25)}" stroke-width=".8"/>
      <rect x="52" y="60" width="96" height="120" rx="28" fill="url(#b${id})"/>
      <rect x="58" y="66" width="84" height="108" rx="23" fill="#0b0d0f"/>
      <rect x="148" y="98" width="7" height="22" rx="3" fill="${claro(cor, .3)}"/>
      <text x="100" y="118" font-family="Archivo, sans-serif" font-weight="800" font-size="26" fill="#fff" text-anchor="middle">09:30</text>
      <rect x="72" y="132" width="56" height="4" rx="2" fill="#2fd24f"/><rect x="72" y="142" width="34" height="4" rx="2" fill="#3b4148"/>
      <path d="M62 80Q64 68 80 68h10L62 130z" fill="url(#r${id})" opacity=".35"/>`;
  }

  function fone(id, cor) {
    return `${sombra(id, 100, 222, 56)}
      <rect x="44" y="104" width="112" height="110" rx="40" fill="url(#g${id})"/>
      <path d="M44 150h112" stroke="${escuro(cor, .18)}" stroke-width="1.4"/>
      <circle cx="100" cy="176" r="3" fill="#2fd24f"/>
      <g transform="rotate(-14 78 74)"><rect x="66" y="34" width="24" height="44" rx="12" fill="url(#g${id})"/><rect x="72" y="72" width="11" height="44" rx="5.5" fill="url(#b${id})"/><circle cx="78" cy="48" r="5" fill="#1c1f22"/></g>
      <g transform="rotate(12 124 74)"><rect x="110" y="34" width="24" height="44" rx="12" fill="url(#g${id})"/><rect x="116" y="72" width="11" height="44" rx="5.5" fill="url(#b${id})"/><circle cx="122" cy="48" r="5" fill="#1c1f22"/></g>
      <path d="M50 130Q52 108 80 106h12L50 180z" fill="url(#r${id})" opacity=".6"/>`;
  }

  function carregador(id, cor) {
    return `${sombra(id, 100, 226, 60)}
      <rect x="84" y="14" width="7" height="26" rx="2" fill="#b9bec2"/><rect x="109" y="14" width="7" height="26" rx="2" fill="#b9bec2"/>
      <rect x="56" y="36" width="88" height="92" rx="16" fill="url(#g${id})"/>
      <rect x="90" y="104" width="20" height="10" rx="3" fill="#2a2d30"/>
      <text x="100" y="82" font-family="Archivo, sans-serif" font-weight="800" font-size="13" fill="${escuro(cor, .45)}" text-anchor="middle">20W</text>
      <path d="M100 128v24c0 28 44 22 44 50v6" fill="none" stroke="${claro(cor, .1)}" stroke-width="7" stroke-linecap="round"/>
      <path d="M100 128v24c0 28 44 22 44 50v6" fill="none" stroke="${escuro(cor, .12)}" stroke-width="1"/>
      <rect x="134" y="204" width="20" height="22" rx="4" fill="url(#g${id})"/><rect x="140" y="222" width="8" height="8" fill="#b9bec2"/>
      <path d="M60 60Q62 38 84 38h8L60 110z" fill="url(#r${id})" opacity=".7"/>`;
  }

  function capa(id, cor) {
    return `${sombra(id)}
      <rect x="47" y="15" width="106" height="210" rx="26" fill="url(#g${id})"/>
      <rect x="54" y="22" width="92" height="196" rx="20" fill="none" stroke="${claro(cor, .4)}" stroke-width="1.5" stroke-dasharray="2 4" opacity=".7"/>
      <rect x="56" y="26" width="62" height="62" rx="16" fill="#101215"/>
      ${[[74, 44], [74, 70], [100, 57]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="10" fill="#1b1f23" stroke="#3a4046"/>`).join("")}
      ${Array.from({ length: 40 }, (_, i) => `<circle cx="${60 + ((i * 37) % 86)}" cy="${100 + ((i * 53) % 116)}" r="${(i % 3) * .6 + .6}" fill="#fff" opacity=".7"/>`).join("")}
      <path d="M47 40Q50 15 74 15h16L47 130z" fill="url(#r${id})" opacity=".6"/>`;
  }

  function pelicula(id, cor) {
    return `${sombra(id)}
      <rect x="54" y="22" width="100" height="204" rx="22" fill="#1a1d20"/>
      <g transform="rotate(-6 100 120)">
        <rect x="46" y="14" width="100" height="204" rx="22" fill="${cor}" opacity=".45" stroke="#fff" stroke-width="1.4"/>
        <rect x="80" y="24" width="32" height="9" rx="4.5" fill="#0d0f11" opacity=".7"/>
        <path d="M46 70L146 30v40L46 130z" fill="#fff" opacity=".35"/>
      </g>`;
  }

  function tvbox(id, cor) {
    return `${sombra(id, 100, 216, 72)}
      <path d="M36 150l14-30h100l14 30z" fill="${claro(cor, .15)}"/>
      <rect x="36" y="150" width="128" height="40" rx="8" fill="url(#g${id})"/>
      <circle cx="146" cy="170" r="2.6" fill="#2fd24f"/>
      <rect x="60" y="40" width="40" height="96" rx="12" fill="url(#g${id})" transform="rotate(-10 80 88)"/>
      <circle cx="78" cy="62" r="6" fill="#2fd24f" transform="rotate(-10 80 88)"/>
      ${[0, 1, 2, 3].map((i) => `<circle cx="${72 + (i % 2) * 14}" cy="${84 + Math.floor(i / 2) * 14}" r="4" fill="${claro(cor, .3)}" transform="rotate(-10 80 88)"/>`).join("")}
      <path d="M40 150l12-26h24L48 190z" fill="url(#r${id})" opacity=".4"/>`;
  }

  function abajur(id, cor) {
    return `${sombra(id, 100, 224, 64)}
      <path d="M150 74a58 58 0 1 0 0 72h-30v-26h30" fill="none" stroke="${cor}" stroke-width="20" stroke-linecap="round" opacity=".25"/>
      <path d="M150 74a58 58 0 1 0 0 72h-30v-26h30" fill="none" stroke="${cor}" stroke-width="8" stroke-linecap="round"/>
      <rect x="44" y="196" width="112" height="22" rx="8" fill="#1d2023"/>
      <rect x="72" y="150" width="34" height="58" rx="7" fill="#2a2e33" stroke="#4a5057"/><rect x="76" y="156" width="26" height="40" rx="4" fill="#0e1114"/>
      <rect x="84" y="200" width="32" height="3" rx="1.5" fill="${cor}"/>`;
  }

  function perfume(id, cor) {
    return `${sombra(id, 100, 228, 56)}
      <rect x="78" y="14" width="44" height="36" rx="6" fill="url(#b${id === "x" ? "" : id})" style="fill:#c9a65a"/>
      <rect x="78" y="14" width="44" height="36" rx="6" fill="${escuro("#c9a65a", .1)}" opacity=".35"/>
      <rect x="90" y="50" width="20" height="16" fill="#d8d2c4"/>
      <path d="M58 66h84l12 16v128a16 16 0 0 1-16 16H62a16 16 0 0 1-16-16V82z" fill="${claro(cor, .55)}" opacity=".6" stroke="#fff" stroke-width="1.2"/>
      <path d="M54 110h92v100a12 12 0 0 1-12 12H66a12 12 0 0 1-12-12z" fill="url(#g${id})" opacity=".92"/>
      <rect x="70" y="140" width="60" height="40" rx="3" fill="#f6f2e8" opacity=".92"/>
      <rect x="80" y="152" width="40" height="3" rx="1.5" fill="${escuro(cor, .3)}"/><rect x="88" y="162" width="24" height="2" rx="1" fill="${escuro(cor, .2)}"/>
      <path d="M52 86Q56 68 76 68h8L52 190z" fill="#fff" opacity=".35"/>`;
  }

  function conserto(id, cor) {
    return `${sombra(id)}
      <rect x="47" y="15" width="106" height="210" rx="24" fill="#1a1d20"/>
      <rect x="53" y="21" width="94" height="198" rx="19" fill="#0c0f12"/>
      <path d="M58 48l26 30-16 20 24 28-10 24 30 40" fill="none" stroke="#cfd6dc" stroke-width="1.2" opacity=".75"/>
      <path d="M100 70l-14 18 18 6" fill="none" stroke="#cfd6dc" stroke-width="1" opacity=".5"/>
      <g transform="rotate(38 128 150)"><rect x="122" y="86" width="12" height="110" rx="5" fill="#2fd24f"/><rect x="125" y="60" width="6" height="30" fill="#c5ccd2"/><path d="M125 60l3-8 3 8z" fill="#c5ccd2"/></g>
      <circle cx="58" cy="48" r="4" fill="#2fd24f"/>`;
  }

  function cabo(id, cor) {
    return `${sombra(id, 100, 222, 58)}
      ${[0, 1, 2, 3].map((i) => `<ellipse cx="100" cy="${96 + i * 22}" rx="${52 - i * 2}" ry="20" fill="none" stroke="${escuro(cor, .1)}" stroke-width="9"/><ellipse cx="100" cy="${96 + i * 22}" rx="${52 - i * 2}" ry="20" fill="none" stroke="${cor}" stroke-width="6.5"/>`).join("")}
      <path d="M148 96c10-20 6-50-10-62" fill="none" stroke="${cor}" stroke-width="6.5" stroke-linecap="round"/>
      <rect x="128" y="14" width="20" height="28" rx="5" fill="url(#g${id})" stroke="${escuro(cor, .15)}"/><rect x="133" y="6" width="10" height="10" rx="2" fill="#b9bec2"/>
      <path d="M52 162c-14 18-8 40 10 46" fill="none" stroke="${cor}" stroke-width="6.5" stroke-linecap="round"/>
      <rect x="60" y="198" width="28" height="18" rx="5" fill="url(#g${id})" stroke="${escuro(cor, .15)}"/><rect x="86" y="202" width="10" height="10" rx="2" fill="#b9bec2"/>`;
  }

  window.render = function (tipo, cor) {
    const id = "r" + (++n);
    let corpo;
    switch (tipo) {
      case "pro": case "duo": case "moto": corpo = celular(id, cor, tipo); break;
      case "relogio": corpo = relogio(id, cor); break;
      case "fone": corpo = fone(id, cor); break;
      case "carregador": corpo = carregador(id, cor); break;
      case "capa": corpo = capa(id, cor); break;
      case "pelicula": corpo = pelicula(id, cor); break;
      case "tvbox": corpo = tvbox(id, cor); break;
      case "abajur": corpo = abajur(id, cor); break;
      case "perfume": corpo = perfume(id, cor); break;
      case "cabo": corpo = cabo(id, cor); break;
      default: corpo = conserto(id, cor);
    }
    return `<svg class="render" viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${defs(id, cor)}${corpo}</svg>`;
  };
})();
