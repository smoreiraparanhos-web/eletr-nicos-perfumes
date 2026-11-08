/* Dados da loja e do catálogo — edite só este arquivo para mudar conteúdo.
 *
 * Produto:
 *   id, categoria, sub (aba dentro da categoria), nome, linha (texto curto)
 *   render    { tipo, cor }  — ilustração gerada enquanto não há foto
 *             tipos: pro, duo, moto, relogio, fone, carregador, capa, tvbox, abajur, perfume
 *   fotos     ["img/arquivo.webp"] — quando houver, substitui o render
 *   preco     texto exato do preço confirmado, ou null
 *   selo      "Novo" | "Seminovo" | null
 *   detalhes  características verificadas
 *   opcoes    [{ nome, valores: [texto | {nome, cor}] }] — valores com cor trocam o render
 *             e o tom da página. Cores = preferência do cliente; disponibilidade na consulta.
 *   campo     texto de ajuda do campo livre
 *   destaque  true = aparece em "Novidades"
 *   specs     { Tela, Chip, ... } — só dados verificados; ausente = "Consulte"
 *   caixa     itens na caixa (aparelho lacrado) — só se verificado
 *
 * Modelos tirados das publicações do Instagram da loja. Estoque, cores e
 * capacidades disponíveis devem ser confirmados — por isso tudo é "Consultar".
 */
window.LOJA = {
  /* ---- configuração do site ---- */
  url: "",            // endereço público, ex.: "https://bmdigitaleletronicos.com.br" (usado em prévias e no Google)
  planilha: "",       // link CSV da planilha publicada (Arquivo > Compartilhar > Publicar na Web > CSV)
  medicao: { tipo: "", id: "" }, // "plausible" (id = domínio) ou "ga4" (id = G-XXXX); vazio = desligado
  /* ---- dados da loja ---- */
  nome: "BM Digital Eletrônicos",
  whatsapp: "555193587977",
  whatsappExibicao: "(51) 9358-7977",
  instagram: "https://www.instagram.com/bmdigitaleletronicos/",
  endereco: "Rua Lajeado, 405 — Centro",
  cidade: "Eldorado do Sul — RS",
  cep: "92990-000",
  horario: "Seg a sáb, 9h30 às 19h",
  rota: "https://www.google.com/maps/dir/?api=1&destination=Rua+Lajeado+405+Centro+Eldorado+do+Sul+RS",
  mapa: "https://www.google.com/maps?q=Rua+Lajeado+405+Centro+Eldorado+do+Sul+RS&output=embed"
};

window.CATEGORIAS = [
  { id: "celulares", nome: "Celulares", subs: ["iPhone", "Android", "Seminovos"] },
  { id: "acessorios", nome: "Acessórios", subs: ["Áudio", "Energia", "Proteção", "Casa"] },
  { id: "perfumes", nome: "Perfumes", subs: [] },
  { id: "consertos", nome: "Consertos", subs: [] }
];

const COND = { nome: "Condição", valores: ["Lacrado", "Seminovo"] };
const CAP = { nome: "Armazenamento", valores: ["128 GB", "256 GB", "512 GB"] };

window.PRODUTOS = [
  {
    id: "iphone-18-pro-max", categoria: "celulares", sub: "iPhone", nome: "iPhone 18 Pro Max",
    linha: "Lacrado", selo: "Novo", destaque: true,
    render: { tipo: "pro", cor: "#3a3b3d" }, fotos: [], preco: null,
    detalhes: ["Lacrado", "Cores e capacidades sob consulta"],
    opcoes: [{ nome: "Cor", valores: [{ nome: "Preto", cor: "#3a3b3d" }, { nome: "Prata", cor: "#d9d8d4" }, { nome: "Azul-escuro", cor: "#3d4a63" }, { nome: "Laranja", cor: "#d9773b" }] }], campo: "Cor ou capacidade desejada (opcional)"
  },
  {
    id: "iphone-18-pro", categoria: "celulares", sub: "iPhone", nome: "iPhone 18 Pro",
    linha: "Lacrado", selo: "Novo", destaque: true,
    render: { tipo: "pro", cor: "#c9c4bb" }, fotos: [], preco: null,
    detalhes: ["Lacrado", "Cores e capacidades sob consulta"],
    opcoes: [{ nome: "Cor", valores: [{ nome: "Prata", cor: "#c9c4bb" }, { nome: "Preto", cor: "#3a3b3d" }, { nome: "Azul-escuro", cor: "#3d4a63" }, { nome: "Laranja", cor: "#d9773b" }] }], campo: "Cor ou capacidade desejada (opcional)"
  },
  {
    id: "iphone-16", categoria: "celulares", sub: "iPhone", nome: "iPhone 16",
    linha: "Lacrado ou seminovo", destaque: true,
    render: { tipo: "duo", cor: "#7f8fd8" }, fotos: [], preco: null,
    detalhes: ["Lacrado ou seminovo", "Disponibilidade por cor e capacidade sob consulta"],
    opcoes: [COND, { nome: "Cor", valores: [
      { nome: "Ultramarino", cor: "#7f8fd8" }, { nome: "Verde-acinzentado", cor: "#a8b8ae" },
      { nome: "Rosa", cor: "#ecc6d0" }, { nome: "Branco", cor: "#ecebe6" }, { nome: "Preto", cor: "#2c2d30" }] }, CAP],
    specs: { Tela: "6,1 pol. Super Retina XDR", Chip: "A18", "Câmera": "Fusion 48 MP + ultra-angular 12 MP", Conector: "USB-C", Destaque: "Botão de Ação e Controle da Câmera" },
    caixa: ["iPhone 16", "Cabo de carregamento USB-C"],
    campo: "Alguma observação? (opcional)"
  },
  {
    id: "iphone-15", categoria: "celulares", sub: "iPhone", nome: "iPhone 15",
    linha: "Lacrado ou seminovo", destaque: true,
    render: { tipo: "duo", cor: "#ecc9cf" }, fotos: [], preco: null,
    detalhes: ["Lacrado ou seminovo", "Disponibilidade por cor e capacidade sob consulta"],
    opcoes: [COND, { nome: "Cor", valores: [
      { nome: "Rosa", cor: "#ecc9cf" }, { nome: "Azul", cor: "#c4d3dd" }, { nome: "Verde", cor: "#d0dccb" },
      { nome: "Amarelo", cor: "#efe7bf" }, { nome: "Preto", cor: "#34363a" }] }, CAP],
    specs: { Tela: "6,1 pol. Super Retina XDR", Chip: "A16 Bionic", "Câmera": "Principal 48 MP + ultra-angular 12 MP", Conector: "USB-C", Destaque: "Dynamic Island" },
    caixa: ["iPhone 15", "Cabo de carregamento USB-C"],
    campo: "Alguma observação? (opcional)"
  },
  {
    id: "moto-g17", categoria: "celulares", sub: "Android", nome: "Motorola moto g17",
    linha: "Lacrado", destaque: true,
    render: { tipo: "moto", cor: "#5a6670" }, fotos: [], preco: null,
    detalhes: ["Lacrado", "Cores e capacidades sob consulta"],
    opcoes: [{ nome: "Cor", valores: [{ nome: "Grafite", cor: "#5a6670" }, { nome: "Verde", cor: "#6f8f7a" }, { nome: "Azul", cor: "#4f6fa0" }] }], campo: "Cor ou capacidade desejada (opcional)"
  },
  {
    id: "android-outros", categoria: "celulares", sub: "Android", nome: "Outros Android",
    linha: "Consulte marcas e modelos",
    render: { tipo: "moto", cor: "#2f3a36" }, fotos: [], preco: null,
    detalhes: ["Informe a marca ou o modelo que procura"],
    opcoes: [{ nome: "Cor", valores: [{ nome: "Preto", cor: "#2f3a36" }, { nome: "Azul", cor: "#4f6fa0" }, { nome: "Branco", cor: "#e9eae6" }] }, COND], campo: "Marca ou modelo"
  },
  {
    id: "iphone-seminovo", categoria: "celulares", sub: "Seminovos", nome: "iPhone seminovo",
    linha: "Modelos variados", selo: "Seminovo",
    render: { tipo: "duo", cor: "#c4d3dd" }, fotos: [], preco: null,
    detalhes: ["Seminovo", "Modelos disponíveis sob consulta"],
    opcoes: [{ nome: "Cor", valores: [{ nome: "Azul", cor: "#c4d3dd" }, { nome: "Preto", cor: "#2c2d30" }, { nome: "Branco", cor: "#ecebe6" }, { nome: "Rosa", cor: "#ecc9cf" }] }], campo: "Modelo que procura"
  },
  {
    id: "android-seminovo", categoria: "celulares", sub: "Seminovos", nome: "Android seminovo",
    linha: "Modelos variados", selo: "Seminovo",
    render: { tipo: "moto", cor: "#8a8f86" }, fotos: [], preco: null,
    detalhes: ["Seminovo", "Modelos disponíveis sob consulta"],
    opcoes: [{ nome: "Cor", valores: [{ nome: "Cinza", cor: "#8a8f86" }, { nome: "Preto", cor: "#2c2d30" }, { nome: "Azul", cor: "#5c7290" }] }], campo: "Marca ou modelo que procura"
  },
  {
    id: "smartwatch", categoria: "acessorios", sub: "Áudio", nome: "Smartwatch",
    linha: "Relógio inteligente", destaque: true,
    render: { tipo: "relogio", cor: "#2c2d30" }, fotos: [], preco: null,
    detalhes: ["Modelos e cores sob consulta"],
    opcoes: [{ nome: "Cor", valores: [{ nome: "Preto", cor: "#2c2d30" }, { nome: "Rosa", cor: "#e3b8bf" }, { nome: "Prata", cor: "#cfd2d4" }, { nome: "Azul-marinho", cor: "#3d4f6e" }] }], campo: "Modelo ou cor (opcional)"
  },
  {
    id: "fone-bt", categoria: "acessorios", sub: "Áudio", nome: "Fone Bluetooth",
    linha: "Sem fio, com estojo", destaque: true,
    render: { tipo: "fone", cor: "#f1efe9" }, fotos: [], preco: null,
    detalhes: ["Modelos sob consulta"],
    opcoes: [{ nome: "Cor", valores: [{ nome: "Branco", cor: "#f1efe9" }, { nome: "Preto", cor: "#2a2c2f" }, { nome: "Rosa", cor: "#ecc9cf" }, { nome: "Azul", cor: "#b9cde0" }] }], campo: "Modelo ou cor (opcional)"
  },
  {
    id: "carregador", categoria: "acessorios", sub: "Energia", nome: "Carregador e cabo",
    linha: "Para iPhone e Android", destaque: true,
    render: { tipo: "carregador", cor: "#f4f3ef" }, fotos: [], preco: null,
    detalhes: ["Para iPhone e Android", "Informe o modelo do aparelho"],
    opcoes: [{ nome: "Cor", valores: [{ nome: "Branco", cor: "#f4f3ef" }, { nome: "Preto", cor: "#2a2c2f" }] }, { nome: "Para", valores: ["iPhone", "Android"] }], campo: "Modelo do aparelho (opcional)"
  },
  {
    id: "abajur", categoria: "acessorios", sub: "Casa", nome: "Luminária com carregador",
    linha: "Luz de LED e base para celular",
    render: { tipo: "abajur", cor: "#2fd24f" }, fotos: [], preco: null,
    detalhes: ["Modelos sob consulta"],
    opcoes: [{ nome: "Cor da luz", valores: [{ nome: "Verde", cor: "#2fd24f" }, { nome: "Azul", cor: "#4aa3ff" }, { nome: "Rosa", cor: "#ff6fae" }, { nome: "Branca", cor: "#f2f2f2" }] }], campo: "Dúvida (opcional)"
  },
  {
    id: "capa", categoria: "acessorios", sub: "Proteção", nome: "Capas",
    linha: "Para o seu modelo",
    render: { tipo: "capa", cor: "#e7c7c9" }, fotos: [], preco: null,
    detalhes: ["Informe o modelo do aparelho"],
    opcoes: [{ nome: "Cor", valores: [{ nome: "Rosa brilho", cor: "#e7c7c9" }, { nome: "Transparente", cor: "#e3ebef" }, { nome: "Preto", cor: "#2a2c2f" }, { nome: "Lilás", cor: "#c8b6e2" }] }], campo: "Modelo do aparelho"
  },
  {
    id: "pelicula", categoria: "acessorios", sub: "Proteção", nome: "Películas",
    linha: "Para o seu modelo",
    render: { tipo: "pelicula", cor: "#bfd6e2" }, fotos: [], preco: null,
    detalhes: ["Informe o modelo do aparelho"],
    opcoes: [{ nome: "Tipo", valores: [{ nome: "Transparente", cor: "#bfd6e2" }, { nome: "Privacidade", cor: "#3b4248" }] }], campo: "Modelo do aparelho"
  },
  {
    id: "tvbox", categoria: "acessorios", sub: "Casa", nome: "Smart TV box",
    linha: "Deixa a TV smart",
    render: { tipo: "tvbox", cor: "#1e2124" }, fotos: [], preco: null,
    detalhes: ["Conecta na entrada HDMI da TV"],
    opcoes: [{ nome: "Cor", valores: [{ nome: "Preto", cor: "#1e2124" }] }], campo: "Dúvida ou modelo da TV (opcional)"
  },
  {
    id: "perfume-masc", categoria: "perfumes", sub: "", nome: "Perfume masculino",
    linha: "Fragrâncias sob consulta", destaque: true,
    render: { tipo: "perfume", cor: "#7a4a22" }, fotos: [], preco: null,
    detalhes: ["Marcas e fragrâncias sob consulta"],
    opcoes: [{ nome: "Estilo", valores: [{ nome: "Oriental", cor: "#3a1d10" }, { nome: "Amadeirado", cor: "#7a4a22" }, { nome: "Aquático", cor: "#2f5d7c" }] }], campo: "Fragrância ou marca que procura (opcional)"
  },
  {
    id: "perfume-fem", categoria: "perfumes", sub: "", nome: "Perfume feminino",
    linha: "Fragrâncias sob consulta",
    render: { tipo: "perfume", cor: "#d79bb0" }, fotos: [], preco: null,
    detalhes: ["Marcas e fragrâncias sob consulta"],
    opcoes: [{ nome: "Estilo", valores: [{ nome: "Floral", cor: "#d79bb0" }, { nome: "Doce", cor: "#9e3f5c" }, { nome: "Frutado", cor: "#e0a35a" }] }], campo: "Fragrância ou marca que procura (opcional)"
  },
  {
    id: "perfume-presente", categoria: "perfumes", sub: "", nome: "Perfume para presente",
    linha: "Ajuda para escolher",
    render: { tipo: "perfume", cor: "#c9a65a" }, fotos: [], preco: null,
    detalhes: ["Diga para quem é e o estilo que a pessoa gosta"],
    opcoes: [{ nome: "Estilo", valores: [{ nome: "Clássico", cor: "#c9a65a" }, { nome: "Intenso", cor: "#2b1b14" }, { nome: "Leve", cor: "#e6d4b0" }] }, { nome: "Para", valores: ["Ele", "Ela"] }], campo: "Estilo, ocasião ou faixa de valor (opcional)"
  },
  {
    id: "conserto", categoria: "consertos", sub: "", nome: "Conserto de celular",
    linha: "Em até 2h",
    render: { tipo: "conserto", cor: "#2c2d30" }, fotos: [], preco: null,
    detalhes: ["Consertos em até 2h", "Informe o modelo para consultar o prazo"],
    opcoes: [{ nome: "Problema", valores: ["Tela", "Outro defeito"] }], campo: "Modelo do aparelho e o que aconteceu"
  }
];
