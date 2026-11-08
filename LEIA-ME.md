# Site BM Digital Eletrônicos

Site estático (HTML, CSS, JS). Funciona em qualquer hospedagem estática (GitHub Pages, Netlify).

## Onde fica cada coisa
- `index.html`: página inicial
- `p/<id>/index.html`: página fixa de cada produto (gerada, não edite à mão)
- `produto.html?p=<id>`: mesma página sem estar gerada (serve para testes)
- `privacidade.html`: página de privacidade
- `js/produtos.js`: **configuração e catálogo** (endereço do site, planilha, medição, produtos)
- `js/planilha.js`: leitura do catálogo pela planilha do Google
- `js/medicao.js`: medição de visitas e consultas
- `ferramentas/gerar.mjs`: gera páginas fixas, prévias do WhatsApp, ícones e sitemap
- `ferramentas/modelo-planilha.csv`: modelo para importar no Google Planilhas
- `fontes/`: fontes hospedadas no próprio site

## 1. Antes de publicar: endereço do site
Em `js/produtos.js`, preencha `url` com o endereço público, por exemplo
`url: "https://bmdigitaleletronicos.com.br"`. Depois rode:

    npm install
    node ferramentas/gerar.mjs

Sem o endereço, a prévia com imagem no WhatsApp e o sitemap do Google não funcionam,
porque os dois exigem links completos.

## 2. Catálogo pela planilha (a loja edita, o site atualiza)
1. No Google Planilhas: Arquivo > Importar > `ferramentas/modelo-planilha.csv`.
2. Arquivo > Compartilhar > Publicar na Web > escolha a aba > formato **CSV** > Publicar. Copie o link.
3. Cole o link em `planilha:` dentro de `js/produtos.js`.

Como a loja usa a planilha:
- **Mudar** um produto: editar a linha.
- **Tirar** do site: colocar `não` na coluna `ativo`.
- **Novo produto:** nova linha com `id` (sem espaço), `categoria` e `nome`.
- **Preço:** coluna `preco`. Vazio mostra "Consultar".
- **Cores:** `Cor: Rosa #ecc9cf | Azul #c4d3dd`.
- **Outras opções:** `Condição: Lacrado | Seminovo ; [cores] ; Armazenamento: 128 GB | 256 GB`.

Quando as mudanças aparecem:
- **No navegador dos visitantes:** sozinhas, a partir da visita seguinte.
- **Nas páginas fixas e prévias do WhatsApp:** precisam do gerador. No GitHub, o fluxo
  `.github/workflows/atualizar.yml` roda o gerador **a cada 3 horas** e publica sozinho.
  Fora do GitHub, rode `node ferramentas/gerar.mjs`.

## 3. Medição de visitas (desligada por padrão)
Em `js/produtos.js`, preencha `medicao`:
- `{ tipo: "plausible", id: "seudominio.com.br" }`: sem cookies, sem aviso. Plano pago, com teste grátis.
- `{ tipo: "ga4", id: "G-XXXXXXX" }`: Google Analytics, gratuito. O site mostra um aviso de consentimento (LGPD).

Eventos medidos:
- Consulta WhatsApp, com a origem (resumo, barra do celular, loja…) e o produto
- Lista de consulta
- Rota
- Busca sem resultado
- Sugestão (vista ou clicada)

## 4. Publicar no GitHub Pages
1. Crie um repositório e envie o conteúdo desta pasta `site/` para a raiz.
2. Settings > Pages > Source: "Deploy from a branch" > `main` / `(root)`.
3. Settings > Actions > General > Workflow permissions: **Read and write**, para o catálogo se atualizar sozinho.
4. Domínio próprio: Settings > Pages > Custom domain.

Alternativa sem Git: arraste a pasta `site/` em https://app.netlify.com/drop
(nesse caso, rode o gerador antes de cada envio).

## Trocar desenho por foto
Coloque a foto em `img/` (WebP, cerca de 1200px) e preencha `fotos` do produto
(em `js/produtos.js` ou na planilha). Depois rode o gerador.
