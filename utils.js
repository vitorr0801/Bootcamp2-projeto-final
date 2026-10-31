const TAMANHO_MAXIMO_ANOTACAO = 500;

const PAISES_PT_PARA_EN = {
  "inglaterra": "England",
  "escocia": "Scotland",
  "pais de gales": "Wales",
  "irlanda do norte": "Northern Ireland",
  "irlanda": "Republic of Ireland",
  "brasil": "Brazil",
  "espanha": "Spain",
  "italia": "Italy",
  "alemanha": "Germany",
  "franca": "France",
  "portugal": "Portugal",
  "holanda": "Netherlands",
  "paises baixos": "Netherlands",
  "mexico": "Mexico",
  "argentina": "Argentina",
  "estados unidos": "United States",
  "eua": "United States",
  "suecia": "Sweden",
  "belgica": "Belgium",
  "turquia": "Turkey",
  "russia": "Russia",
  "china": "China",
  "japao": "Japan",
  "australia": "Australia",
  "canada": "Canada",
  "chile": "Chile",
  "colombia": "Colombia",
  "uruguai": "Uruguay",
  "paraguai": "Paraguay",
  "peru": "Peru",
  "grecia": "Greece",
  "suica": "Switzerland",
  "austria": "Austria",
  "dinamarca": "Denmark",
  "noruega": "Norway",
  "polonia": "Poland",
  "croacia": "Croatia",
  "servia": "Serbia",
  "ucrania": "Ukraine",
  "egito": "Egypt",
  "marrocos": "Morocco",
  "arabia saudita": "Saudi Arabia",
  "catar": "Qatar",
  "coreia do sul": "South Korea",
  "india": "India",
};

function normalizarTexto(texto) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

function traduzirPais(paisDigitado) {
  const chave = normalizarTexto(paisDigitado);
  return PAISES_PT_PARA_EN[chave] || paisDigitado;
}

function escaparHTML(valor) {
  return String(valor)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function timeParaRegistro(time) {
  const ano = Number.parseInt(time.intFormedYear, 10);

  return {
    id_time: String(time.idTeam),
    nome_time: time.strTeam || "Time sem nome",
    escudo_url: time.strBadge || null,
    liga: time.strLeague || null,
    esporte: time.strSport || null,
    pais: time.strCountry || null,
    estadio: time.strStadium || null,
    ano_fundacao: Number.isFinite(ano) && ano > 0 ? ano : null,
  };
}

function linhaParaTime(linha) {
  return {
    idTeam: linha.id_time,
    strTeam: linha.nome_time,
    strBadge: linha.escudo_url,
    strLeague: linha.liga,
    strSport: linha.esporte,
    strCountry: linha.pais,
    strStadium: linha.estadio,
    intFormedYear: linha.ano_fundacao,
  };
}

function prepararAnotacao(texto) {
  const limpo = String(texto || "").trim().slice(0, TAMANHO_MAXIMO_ANOTACAO);
  return limpo || null;
}

const NOTA_MINIMA = 1;
const NOTA_MAXIMA = 5;

function validarNota(valor) {
  if (typeof valor !== "number" && typeof valor !== "string") return false;
  if (String(valor).trim() === "") return false;

  const nota = Number(valor);
  return Number.isInteger(nota) && nota >= NOTA_MINIMA && nota <= NOTA_MAXIMA;
}

function calcularMedia(notas) {
  const validas = notas.filter(validarNota).map(Number);
  if (validas.length === 0) return null;

  const soma = validas.reduce((total, nota) => total + nota, 0);
  return Math.round((soma / validas.length) * 10) / 10;
}

function formatarMedia(media) {
  if (media === null || media === undefined) return "—";
  return media.toFixed(1).replace(".", ",");
}

function filtrarFavoritosPorNome(lista, termo) {
  const busca = normalizarTexto(String(termo || ""));
  if (!busca) return [...lista];

  return lista.filter((favorito) => normalizarTexto(String(favorito.nome_time || "")).includes(busca));
}

function filtrarFavoritosPorNota(lista, nota) {
  if (!validarNota(nota)) return [...lista];

  return lista.filter((favorito) => validarNota(favorito.nota) && Number(favorito.nota) === Number(nota));
}

function compararNomesDeFavoritos(a, b) {
  return String(a.nome_time || "").localeCompare(String(b.nome_time || ""), "pt-BR", { sensitivity: "base" });
}

function compararNotasDeFavoritos(a, b, direcao) {
  const notaA = validarNota(a.nota) ? Number(a.nota) : null;
  const notaB = validarNota(b.nota) ? Number(b.nota) : null;

  if (notaA === null && notaB === null) return 0;
  if (notaA === null) return 1;
  if (notaB === null) return -1;
  return (notaA - notaB) * direcao;
}

function ordenarFavoritos(lista, ordem) {
  const copia = [...lista];

  switch (ordem) {
    case "nome-asc":
      return copia.sort(compararNomesDeFavoritos);
    case "nome-desc":
      return copia.sort((a, b) => compararNomesDeFavoritos(b, a));
    case "nota-desc":
      return copia.sort((a, b) => compararNotasDeFavoritos(a, b, -1) || compararNomesDeFavoritos(a, b));
    case "nota-asc":
      return copia.sort((a, b) => compararNotasDeFavoritos(a, b, 1) || compararNomesDeFavoritos(a, b));
    default:
      return copia;
  }
}

function aplicarFiltrosFavoritos(lista, { termo = "", nota = "", ordem = "recentes" } = {}) {
  const porNome = filtrarFavoritosPorNome(lista, termo);
  const porNota = filtrarFavoritosPorNota(porNome, nota);
  return ordenarFavoritos(porNota, ordem);
}

function obterCamposDeComparacao(esporte) {
  const modalidade = normalizarTexto(String(esporte || ""));
  const local = modalidade === "basketball" || modalidade === "ice hockey" ? "Arena" : "Estádio";

  return [
    { rotulo: "País", propriedades: ["strCountry"] },
    { rotulo: "Cidade", propriedades: ["strCity"] },
    { rotulo: "Ano de fundação", propriedades: ["intFormedYear"] },
    { rotulo: modalidade === "soccer" ? "Liga" : "Liga ou competição", propriedades: ["strLeague"] },
    { rotulo: local, propriedades: ["strStadium"] },
    { rotulo: "Capacidade", propriedades: ["intStadiumCapacity", "strStadiumCapacity"] },
    { rotulo: "Modalidade", propriedades: ["strSport"] },
  ];
}

function obterValorDeComparacao(time, propriedades) {
  const propriedade = propriedades.find(
    (nome) => time[nome] !== null && time[nome] !== undefined && time[nome] !== ""
  );
  return propriedade ? time[propriedade] : "Não informado";
}

function clubesDaMesmaModalidade(clubes) {
  if (!Array.isArray(clubes) || clubes.length < 2) return false;

  const modalidades = new Set(clubes.map((clube) => normalizarTexto(String(clube.strSport || ""))));
  return modalidades.size === 1;
}

function mensagemDeErroDoBanco(erro) {
  if (erro && (erro.code === "42501" || /row-level security/i.test(erro.message || ""))) {
    return "O banco recusou a operação. Confira as políticas (RLS) da tabela favoritos no Supabase.";
  }
  if (erro && (erro.code === "42703" || erro.code === "PGRST204" || /anotacao|\bnota\b/i.test(erro.message || ""))) {
    return "Uma coluna ('anotacao' ou 'nota') não existe no banco. Rode o banco.sql atualizado no SQL Editor do Supabase.";
  }
  return "Não foi possível falar com o banco de dados. Tente novamente em instantes.";
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    TAMANHO_MAXIMO_ANOTACAO,
    normalizarTexto,
    traduzirPais,
    escaparHTML,
    timeParaRegistro,
    linhaParaTime,
    prepararAnotacao,
    NOTA_MINIMA,
    NOTA_MAXIMA,
    validarNota,
    calcularMedia,
    formatarMedia,
    filtrarFavoritosPorNome,
    filtrarFavoritosPorNota,
    ordenarFavoritos,
    aplicarFiltrosFavoritos,
    obterCamposDeComparacao,
    obterValorDeComparacao,
    clubesDaMesmaModalidade,
    mensagemDeErroDoBanco,
  };
}
