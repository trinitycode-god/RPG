/* =====================================================================
   BIBLIOTECA EDUCATIVA — cadastro dos materiais
   Como adicionar um PDF:
   1) Coloque o arquivo na pasta correspondente (ex.: materiais/portugues/nome.pdf)
   2) Copie um bloco abaixo, preencha os campos e salve.
   Categorias válidas: Português, Matemática, Alfabetização,
   Interpretação de texto, Atividades educativas,
   Orientações para os pais, Organização dos estudos
   Data no formato AAAA-MM-DD.
   Atenção: arquivos no GitHub Pages ficam acessíveis a quem tiver o link.
   ===================================================================== */
const MATERIAIS = [
  /* Exemplo (remova os comentários para usar):
  {
    nome: "Atividades de leitura – nível 1",
    descricao: "Textos curtos e exercícios para praticar a leitura.",
    categoria: "Português",
    ano: "1º ao 2º ano",
    arquivo: "materiais/portugues/leitura-nivel-1.pdf",
    data: "2026-11-08"
  },
  */
];

/* Exemplos de DEMONSTRAÇÃO — só aparecem se CONFIG.mostrarDemonstracao = true.
   Não possuem PDF real. */
const MATERIAIS_DEMO = [
  { nome: "Modelo: Atividades de leitura", descricao: "Cartão de demonstração do layout da biblioteca.", categoria: "Português", ano: "1º ao 3º ano", arquivo: "", data: new Date().toISOString().slice(0, 10), demo: true },
  { nome: "Modelo: Treino de tabuada", descricao: "Cartão de demonstração do layout da biblioteca.", categoria: "Matemática", ano: "3º ao 5º ano", arquivo: "", data: "2026-01-10", demo: true },
  { nome: "Modelo: Rotina de estudos em casa", descricao: "Cartão de demonstração do layout da biblioteca.", categoria: "Orientações para os pais", ano: "Para responsáveis", arquivo: "", data: "2026-01-05", demo: true }
];
