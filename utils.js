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

function mensagemDeErroDoBanco(erro) {
  if (erro && (erro.code === "42501" || /row-level security/i.test(erro.message || ""))) {
    return "O banco recusou a operação. Confira as políticas (RLS) da tabela favoritos no Supabase.";
  }
  if (erro && (erro.code === "42703" || erro.code === "PGRST204" || /anotacao/i.test(erro.message || ""))) {
    return "A coluna 'anotacao' não existe no banco. Rode o banco.sql atualizado no SQL Editor do Supabase.";
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
    mensagemDeErroDoBanco,
  };
}
