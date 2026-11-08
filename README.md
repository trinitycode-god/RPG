# Site Saber+ Mais Reforço Escolar

## Estrutura
- `index.html` — página única
- `css/style.css` — estilos
- `js/config.js` — **área de configuração** (WhatsApp, textos, Instagram, horário)
- `js/materiais.js` — cadastro dos PDFs da Biblioteca Educativa
- `js/main.js` — comportamento (menu, WhatsApp, busca e filtro)
- `materiais/` — pastas dos PDFs: portugues, matematica, alfabetizacao, atividades, orientacoes
- `assets/` — logo, favicon e imagem de compartilhamento

## Publicar no GitHub Pages
1. Crie um repositório no GitHub (ex.: `saber-mais`).
2. Envie TODOS os arquivos desta pasta (o `index.html` fica na raiz).
3. Em **Settings → Pages**: Source = *Deploy from a branch*, Branch = `main`, pasta `/ (root)`. Salve.
4. Após 1–2 minutos o site estará em `https://SEU-USUARIO.github.io/saber-mais/`.
5. Para as prévias de compartilhamento (WhatsApp/Facebook), troque em `index.html` o `og:image` por a URL completa, ex.: `https://SEU-USUARIO.github.io/saber-mais/assets/og-image.png`.

## Adicionar um PDF
1. Coloque o arquivo na pasta certa (ex.: `materiais/matematica/tabuada.pdf`). Evite acentos e espaços no nome.
2. Em `js/materiais.js`, copie o bloco de exemplo, preencha e salve.
3. Envie para o GitHub: o cartão aparece automaticamente.

Para ver o layout com cartões de demonstração, use `mostrarDemonstracao: true` em `js/config.js` (volte para `false` antes de publicar).

## Atenção sobre acesso
No GitHub Pages, qualquer arquivo publicado pode ser aberto por quem tiver o link. Se no futuro houver materiais pagos ou restritos, será necessário um sistema externo de pagamento/controle de acesso (com autenticação e servidor). Apenas HTML não protege arquivos privados.
