const BASE_URL = "https://www.thesportsdb.com/api/v1/json/123";

const SUPABASE_URL = "https://nhyzivvfdotnxiwdomhw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oeXppdnZmZG90bnhpd2RvbWh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzNjk3MjksImV4cCI6MjEwODk0NTcyOX0.md1zmAZb0erlPxVdwbTyf67AQ526nH2_cdx0Dgi2rSg";

const TABELA_FAVORITOS = "favoritos";

const ESCUDO_PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 84 84"><rect width="84" height="84" rx="42" fill="#16233A"/><text x="50%" y="55%" text-anchor="middle" font-family="sans-serif" font-size="34" fill="#93A1B8">?</text></svg>`
  );

const ESPORTES = [
  { label: "Futebol", valor: "Soccer" },
  { label: "Basquete", valor: "Basketball" },
  { label: "Hóquei no gelo", valor: "Ice Hockey" },
  { label: "Beisebol", valor: "Baseball" },
  { label: "Futebol Americano", valor: "American Football" },
];

const LIGAS_FAMOSAS = {
  "Soccer|England": [
    "English Premier League",
    "English League Championship",
    "English League One",
    "English League Two",
  ],
  "Soccer|Spain": ["Spanish La Liga", "Spanish Adelante"],
  "Soccer|Italy": ["Italian Serie A", "Italian Serie B"],
  "Soccer|Germany": ["German Bundesliga", "German 2. Bundesliga"],
  "Soccer|France": ["French Ligue 1", "French Ligue 2"],
  "Soccer|Brazil": ["Brazilian Serie A", "Brazilian Serie B", "Brazilian Serie C", "Brazilian Serie D"],
  "Soccer|Portugal": ["Portuguese Primeira Liga"],
  "Soccer|Netherlands": ["Dutch Eredivisie"],
  "Soccer|Mexico": ["Mexican Primera Division"],
  "Soccer|Sweden": ["Swedish Allsvenskan", "Swedish Superettan"],
  "Soccer|Argentina": ["Argentinian Primera Division"],
  "Soccer|United States": ["American Major League Soccer"],
  "Basketball|United States": ["NBA"],
  "Ice Hockey|United States": ["NHL"],
  "Baseball|United States": ["MLB"],
  "American Football|United States": ["NFL"],
};

const area = document.getElementById("resultado");
const form = document.getElementById("form-busca");
const campoBusca = document.getElementById("campo-busca");
const chips = document.querySelectorAll(".chip");
const selectEsporte = document.getElementById("select-esporte");
const campoPais = document.getElementById("campo-pais");
const botaoBuscarLigas = document.getElementById("botao-buscar-ligas");
const areaSelectLiga = document.getElementById("area-select-liga");
const selectLiga = document.getElementById("select-liga");
const areaFiltroTimes = document.getElementById("area-filtro-times");
const campoFiltroTimes = document.getElementById("campo-filtro-times");
const listaFavoritos = document.getElementById("lista-favoritos");
const contadorFavoritos = document.getElementById("contador-favoritos");
const toast = document.getElementById("toast");
const mediaNotas = document.getElementById("media-notas");
const controlesFavoritos = document.getElementById("controles-favoritos");
const campoBuscaFavoritos = document.getElementById("campo-busca-favoritos");
const selectOrdemFavoritos = document.getElementById("select-ordem-favoritos");
const selectNotaFavoritos = document.getElementById("select-nota-favoritos");
const resumoFavoritos = document.getElementById("resumo-favoritos");
const areaComparacao = document.getElementById("comparacao");
const descricaoComparacao = document.getElementById("descricao-comparacao");
const cabecalhoComparacao = document.getElementById("cabecalho-comparacao");
const corpoComparacao = document.getElementById("corpo-comparacao");
const botaoLimparComparacao = document.getElementById("botao-limpar-comparacao");

let ultimosTimesCarregados = [];
const timesSelecionados = new Map();

let ligaAtualSelecionada = "";

const timesPorId = new Map();

async function buscarJSON(url) {
  let resposta;
  try {
    resposta = await fetch(url);
  } catch (erro) {
    return null;
  }

  if (!resposta.ok) return null;

  try {
    return await resposta.json();
  } catch (erro) {
    return null;
  }
}

async function buscarPorNome(termo) {
  mostrarCarregando();

  const dados = await buscarJSON(`${BASE_URL}/searchteams.php?t=${encodeURIComponent(termo)}`);

  if (!dados) {
    mostrarErro();
    return;
  }

  if (!dados.teams) {
    mostrarVazio(`Nenhum time encontrado para "${escaparHTML(termo)}". Tente outro nome, como "Barcelona" ou "Lakers".`);
    return;
  }

  carregarTimes(dados.teams);
}

function popularSelectEsportes() {
  selectEsporte.innerHTML =
    `<option value="">Escolha um esporte</option>` +
    ESPORTES.map((e) => `<option value="${e.valor}">${e.label}</option>`).join("");
}

async function buscarLigas(esporte, pais) {
  areaSelectLiga.hidden = true;
  mostrarCarregando();

  const dados = await buscarJSON(
    `${BASE_URL}/search_all_leagues.php?c=${encodeURIComponent(pais)}&s=${encodeURIComponent(esporte)}`
  );

  if (!dados) {
    mostrarErro();
    return;
  }

  const ligasDaApi = dados.countries || [];
  const nomesFamosos = LIGAS_FAMOSAS[`${esporte}|${pais}`] || [];

  const nomesJaNaApi = new Set(ligasDaApi.map((l) => normalizarTexto(l.strLeague)));

  const ligasFamosas = nomesFamosos
    .filter((nome) => !nomesJaNaApi.has(normalizarTexto(nome)))
    .map((nome) => ({ strLeague: nome, famosa: true }));

  const ligas = [
    ...ligasFamosas,
    ...ligasDaApi.map((l) => ({ strLeague: l.strLeague, famosa: nomesFamosos.some((n) => normalizarTexto(n) === normalizarTexto(l.strLeague)) })),
  ];

  if (ligas.length === 0) {
    mostrarVazio(
      `Não encontramos ligas de "${escaparHTML(pais)}" para esse esporte. Verifique se digitou o nome do país corretamente.`
    );
    return;
  }

  popularSelectLigas(ligas);
  area.innerHTML = `<p class="estado-inicial">Encontramos ${ligas.length} liga(s). Escolha uma no select acima para ver os times.</p>`;
}

function popularSelectLigas(ligas) {
  selectLiga.innerHTML =
    `<option value="">Escolha uma liga</option>` +
    ligas
      .map((l) => {
        const rotulo = l.famosa ? `★ ${l.strLeague}` : l.strLeague;
        return `<option value="${escaparHTML(l.strLeague)}">${escaparHTML(rotulo)}</option>`;
      })
      .join("");

  areaSelectLiga.hidden = false;
}

async function buscarPorLiga(ligaNome) {
  ligaAtualSelecionada = ligaNome;
  mostrarCarregando();

  const dados = await buscarJSON(`${BASE_URL}/search_all_teams.php?l=${encodeURIComponent(ligaNome)}`);

  if (!dados) {
    mostrarErro();
    return;
  }

  if (!dados.teams) {
    mostrarVazio(`Não encontramos times cadastrados para "${escaparHTML(ligaNome)}" no momento.`);
    return;
  }

  carregarTimes(dados.teams);
}

async function buscarTimeNaLigaAtual(nomeTime) {
  mostrarCarregando();

  const dados = await buscarJSON(`${BASE_URL}/searchteams.php?t=${encodeURIComponent(nomeTime)}`);

  if (!dados) {
    mostrarErro();
    return;
  }

  if (!dados.teams) {
    mostrarVazio(`Não encontramos nenhum time chamado "${escaparHTML(nomeTime)}".`);
    return;
  }

  const time = dados.teams[0];

  if (normalizarTexto(time.strLeague || "") !== normalizarTexto(ligaAtualSelecionada)) {
    mostrarVazio(
      `Encontramos "${escaparHTML(time.strTeam)}", mas ele joga em "${escaparHTML(time.strLeague || "outra liga")}", não na liga selecionada.`
    );
    return;
  }

  const jaEstaNaLista = ultimosTimesCarregados.some((t) => t.idTeam === time.idTeam);
  if (!jaEstaNaLista) {
    ultimosTimesCarregados = [...ultimosTimesCarregados, time];
  }

  renderizarTimes([time]);
}

function mostrarCarregando() {
  areaFiltroTimes.hidden = true;
  area.innerHTML = `<p class="estado-carregando">Buscando nas arquibancadas...</p>`;
}

function mostrarVazio(mensagem) {
  areaFiltroTimes.hidden = true;
  area.innerHTML = `<p class="estado-vazio">${mensagem}</p>`;
}

function mostrarErro() {
  areaFiltroTimes.hidden = true;
  area.innerHTML = `
    <p class="estado-erro">
      Não conseguimos falar com a API agora. Verifique sua conexão
      e tente novamente em instantes.
    </p>
  `;
}

function carregarTimes(times) {
  limparSelecaoComparacao();
  ultimosTimesCarregados = times;
  campoFiltroTimes.value = "";
  areaFiltroTimes.hidden = times.length <= 1;

  renderizarTimes(times);

  if (times.length === 10) {
    area.insertAdjacentHTML(
      "afterbegin",
      `<p class="aviso-limite">A API gratuita mostra no máximo 10 times por liga. Se o time que você procura não estiver aqui, use o campo abaixo para buscar por nome — ele pode existir mesmo assim.</p>`
    );
  }
}

function renderizarTimes(times) {
  times.forEach((time) => {
    if (time.idTeam) timesPorId.set(String(time.idTeam), time);
  });

  area.innerHTML = times.map((time) => criarCardHTML(time, criarBotaoFavoritarHTML(time))).join("");
  atualizarBotoesFavoritar();
}

function criarCardHTML(time, acoesHTML = "") {
  const escudo = escaparHTML(time.strBadge || ESCUDO_PLACEHOLDER);
  const nome = escaparHTML(time.strTeam || "Time sem nome");
  const liga = escaparHTML(time.strLeague || "Liga não informada");
  const estadio = escaparHTML(time.strStadium || "Não informado");
  const pais = escaparHTML(time.strCountry || "Não informado");
  const fundacao = escaparHTML(time.intFormedYear || "—");
  const esporte = escaparHTML(time.strSport || "Não informado");

  return `
    <article class="card">
      <div class="card__faixa"></div>
      <div class="card__corpo">
        <img class="card__escudo" src="${escudo}" alt="Escudo do ${nome}" loading="lazy" onerror="this.onerror=null; this.src='${ESCUDO_PLACEHOLDER}';">
        <h2 class="card__nome">${nome}</h2>
        <p class="card__liga">${liga}</p>
        <div class="card__stats">
          <div class="card__stat">
            <span class="card__stat-label">Esporte</span>
            <span class="card__stat-valor">${esporte}</span>
          </div>
          <div class="card__stat">
            <span class="card__stat-label">Estádio</span>
            <span class="card__stat-valor">${estadio}</span>
          </div>
          <div class="card__stat">
            <span class="card__stat-label">País</span>
            <span class="card__stat-valor">${pais}</span>
          </div>
          <div class="card__stat">
            <span class="card__stat-label">Fundado em</span>
            <span class="card__stat-valor">${fundacao}</span>
          </div>
        </div>
        ${acoesHTML ? `<div class="card__acoes">${acoesHTML}</div>` : ""}
      </div>
    </article>
  `;
}

function criarClienteSupabase() {
  const configurado =
    SUPABASE_URL.startsWith("https://") &&
    !SUPABASE_URL.includes("SEU-PROJETO") &&
    !SUPABASE_ANON_KEY.includes("SUA_CHAVE");

  if (!configurado) {
    return {
      cliente: null,
      motivo: "O banco de dados ainda não foi configurado (faltam a URL e a chave do Supabase no script.js).",
    };
  }

  if (!window.supabase || typeof window.supabase.createClient !== "function") {
    return {
      cliente: null,
      motivo: "Não foi possível carregar a biblioteca do Supabase. Verifique sua conexão com a internet.",
    };
  }

  return { cliente: window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY), motivo: "" };
}

const { cliente: clienteSupabase, motivo: motivoBancoIndisponivel } = criarClienteSupabase();

let favoritos = [];

function encontrarFavoritoPorIdTime(idTime) {
  return favoritos.find((f) => String(f.id_time) === String(idTime));
}

let temporizadorToast;

function mostrarToast(mensagem, tipo = "info") {
  toast.textContent = mensagem;
  toast.className = `toast toast--${tipo}`;
  toast.hidden = false;

  clearTimeout(temporizadorToast);
  temporizadorToast = setTimeout(() => {
    toast.hidden = true;
  }, 5000);
}

function mostrarErroNosFavoritos(mensagem) {
  contadorFavoritos.textContent = "—";
  controlesFavoritos.hidden = true;
  resumoFavoritos.hidden = true;
  listaFavoritos.innerHTML = `<p class="estado-erro">${escaparHTML(mensagem)}</p>`;
}

async function carregarFavoritos() {
  if (!clienteSupabase) {
    mostrarErroNosFavoritos(motivoBancoIndisponivel);
    return;
  }

  try {
    const { data, error } = await clienteSupabase
      .from(TABELA_FAVORITOS)
      .select("*")
      .order("criado_em", { ascending: false });

    if (error) throw error;

    favoritos = data || [];
    listaFavoritos.innerHTML = "";
    renderizarFavoritos();
  } catch (erro) {
    console.error("Erro ao listar favoritos:", erro);
    mostrarErroNosFavoritos(mensagemDeErroDoBanco(erro));
  }
}

function criarEstrelasHTML(linha) {
  const id = escaparHTML(linha.id);
  const notaAtual = validarNota(linha.nota) ? Number(linha.nota) : 0;

  const estrelas = [1, 2, 3, 4, 5]
    .map(
      (n) => `
        <button type="button" class="estrela${n <= notaAtual ? " is-ativa" : ""}"
          data-id="${id}" data-nota="${n}"
          aria-label="Dar nota ${n} de 5" aria-pressed="${n === notaAtual}">★</button>`
    )
    .join("");

  const limpar = notaAtual
    ? `<button type="button" class="botao-limpar-nota" data-id="${id}">Limpar nota</button>`
    : "";

  return `
    <div class="nota" data-id="${id}" role="group" aria-label="Nota do time">
      <span class="nota__rotulo">Minha nota</span>
      <div class="nota__estrelas">${estrelas}</div>
      ${limpar}
    </div>
  `;
}

function atualizarMediaNotas() {
  const notas = favoritos.map((f) => f.nota).filter(validarNota);
  const media = calcularMedia(notas);

  if (media === null) {
    mediaNotas.hidden = true;
    return;
  }

  const avaliados = notas.length === 1 ? "time avaliado" : "times avaliados";
  mediaNotas.textContent = `Média das suas notas: ${formatarMedia(media)} ★ (${notas.length} ${avaliados})`;
  mediaNotas.hidden = false;
}

function criarCardFavoritoHTML(linha) {
  const anotacao = `
    <div class="anotacao">
      <label class="anotacao__rotulo" for="anotacao-${escaparHTML(linha.id)}">Minha anotação</label>
      <textarea
        id="anotacao-${escaparHTML(linha.id)}"
        class="anotacao__campo"
        maxlength="${TAMANHO_MAXIMO_ANOTACAO}"
        rows="2"
        placeholder="Ex.: ver o jogo de domingo, camisa que quero comprar..."
      >${escaparHTML(linha.anotacao || "")}</textarea>
      <button type="button" class="botao-salvar-anotacao" data-id="${escaparHTML(linha.id)}">
        Salvar anotação
      </button>
    </div>
  `;
  const botaoExcluir = `
    <button type="button" class="botao-excluir-favorito" data-id="${escaparHTML(linha.id)}">
      Excluir
    </button>
  `;
  const time = linhaParaTime(linha);
  if (!timesPorId.has(String(time.idTeam))) timesPorId.set(String(time.idTeam), time);
  return criarCardHTML(time, criarBotaoCompararHTML(time) + criarEstrelasHTML(linha) + anotacao + botaoExcluir);
}

function criarElementoCardFavorito(linha) {
  const recipiente = document.createElement("div");
  recipiente.innerHTML = criarCardFavoritoHTML(linha);
  const card = recipiente.firstElementChild;
  card.dataset.idFavorito = String(linha.id);
  return card;
}

function encontrarCardFavorito(id) {
  return [...listaFavoritos.children].find((el) => el.dataset.idFavorito === String(id));
}

function lerFiltrosFavoritos() {
  return {
    termo: campoBuscaFavoritos.value,
    nota: selectNotaFavoritos.value,
    ordem: selectOrdemFavoritos.value,
  };
}

function temFiltroAtivo(filtros) {
  return filtros.termo.trim() !== "" || filtros.nota !== "";
}

// Os cards já existentes são reaproveitados (só escondidos ou movidos),
// assim anotações ainda não salvas não se perdem ao filtrar ou reordenar.
function sincronizarCardsFavoritos(visiveis) {
  const idsFavoritos = new Set(favoritos.map((f) => String(f.id)));
  const cards = new Map();

  [...listaFavoritos.children].forEach((el) => {
    const id = el.dataset.idFavorito;
    if (id && idsFavoritos.has(id)) cards.set(id, el);
    else el.remove();
  });

  favoritos.forEach((linha) => {
    const id = String(linha.id);
    if (!cards.has(id)) {
      const card = criarElementoCardFavorito(linha);
      listaFavoritos.append(card);
      cards.set(id, card);
    }
  });

  const idsVisiveis = new Set(visiveis.map((l) => String(l.id)));
  cards.forEach((card, id) => {
    card.hidden = !idsVisiveis.has(id);
  });

  let referencia = listaFavoritos.firstElementChild;
  visiveis.forEach((linha) => {
    const card = cards.get(String(linha.id));
    if (card === referencia) {
      referencia = referencia.nextElementSibling;
    } else {
      listaFavoritos.insertBefore(card, referencia);
    }
  });
}

function atualizarEstadoDaLista(totalVisiveis, filtros) {
  listaFavoritos.querySelectorAll(":scope > :not(.card)").forEach((el) => el.remove());

  controlesFavoritos.hidden = favoritos.length === 0;

  if (favoritos.length === 0) {
    listaFavoritos.insertAdjacentHTML(
      "beforeend",
      `
      <p class="estado-vazio">
        Você ainda não favoritou nenhum time. Busque um time e clique em
        "☆ Favoritar" para guardá-lo aqui.
      </p>
    `
    );
  } else if (totalVisiveis === 0) {
    listaFavoritos.insertAdjacentHTML(
      "beforeend",
      `
      <div class="estado-vazio">
        <p>Nenhum favorito corresponde aos filtros selecionados. Seus favoritos continuam salvos.</p>
        <button type="button" class="search__button botao-limpar-filtros">Limpar filtros</button>
      </div>
    `
    );
  }

  if (favoritos.length > 0 && temFiltroAtivo(filtros)) {
    const rotulo = favoritos.length === 1 ? "favorito" : "favoritos";
    resumoFavoritos.textContent = `Mostrando ${totalVisiveis} de ${favoritos.length} ${rotulo}.`;
    resumoFavoritos.hidden = false;
  } else {
    resumoFavoritos.hidden = true;
  }
}

function atualizarListaFavoritos() {
  const filtros = lerFiltrosFavoritos();
  const visiveis = aplicarFiltrosFavoritos(favoritos, filtros);

  sincronizarCardsFavoritos(visiveis);
  atualizarEstadoDaLista(visiveis.length, filtros);
}

// Após mudar a nota, mexe só no card afetado: esconde, mostra ou move
// para a posição certa, sem recriar os outros cards.
function reposicionarCardFavorito(id) {
  const card = encontrarCardFavorito(id);
  if (!card) return;

  const filtros = lerFiltrosFavoritos();
  const visiveis = aplicarFiltrosFavoritos(favoritos, filtros);
  const posicao = visiveis.findIndex((l) => String(l.id) === String(id));

  card.hidden = posicao === -1;

  if (posicao > 0) {
    const anterior = encontrarCardFavorito(visiveis[posicao - 1].id);
    if (anterior && anterior.nextElementSibling !== card) anterior.after(card);
  } else if (posicao === 0 && listaFavoritos.firstElementChild !== card) {
    listaFavoritos.prepend(card);
  }

  atualizarEstadoDaLista(visiveis.length, filtros);
}

function renderizarFavoritos() {
  contadorFavoritos.textContent = String(favoritos.length);

  atualizarListaFavoritos();
  atualizarMediaNotas();
  atualizarBotoesFavoritar();
}

function limparFiltrosFavoritos() {
  campoBuscaFavoritos.value = "";
  selectNotaFavoritos.value = "";
  atualizarListaFavoritos();
  campoBuscaFavoritos.focus();
}

function criarBotaoFavoritarHTML(time) {
  if (!time.idTeam) return "";

  return `
    ${criarBotaoCompararHTML(time)}
    <button type="button" class="botao-favoritar" data-id-time="${escaparHTML(time.idTeam)}" aria-pressed="false">
      ☆ Favoritar
    </button>
  `;
}

function criarBotaoCompararHTML(time) {
  if (!time.idTeam) return "";

  const id = escaparHTML(time.idTeam);
  return `
    <label class="comparar-time">
      <input type="checkbox" class="campo-comparar-time" data-id-time="${id}">
      Comparar
    </label>
  `;
}

function obterTimeParaComparacao(idTime) {
  const time = timesPorId.get(String(idTime));
  if (time) return time;

  const favorito = encontrarFavoritoPorIdTime(idTime);
  return favorito ? linhaParaTime(favorito) : null;
}

function renderizarComparacao() {
  const selecionados = [...timesSelecionados.values()];
  areaComparacao.hidden = selecionados.length < 2;
  if (selecionados.length < 2) return;

  const campos = obterCamposDeComparacao(selecionados[0].strSport);
  descricaoComparacao.textContent = `${selecionados.length} clubes de ${selecionados[0].strSport || "modalidade não informada"} selecionados.`;
  cabecalhoComparacao.innerHTML = `
    <tr>
      <th scope="col">Indicador</th>
      ${selecionados.map((time) => `<th scope="col">${escaparHTML(time.strTeam || "Time sem nome")}</th>`).join("")}
    </tr>
  `;
  corpoComparacao.innerHTML = campos
    .map(
      (campo) => `
        <tr>
          <th scope="row">${escaparHTML(campo.rotulo)}</th>
          ${selecionados
            .map((time) => `<td>${escaparHTML(obterValorDeComparacao(time, campo.propriedades))}</td>`)
            .join("")}
        </tr>
      `
    )
    .join("");
}

function limparSelecaoComparacao() {
  timesSelecionados.clear();
  document.querySelectorAll(".campo-comparar-time").forEach((campo) => {
    campo.checked = false;
  });
  renderizarComparacao();
}

function alternarSelecaoComparacao(campo) {
  const idTime = String(campo.dataset.idTime);
  const time = obterTimeParaComparacao(idTime);
  if (!time) return;

  if (campo.checked) {
    const selecionados = [...timesSelecionados.values()];
    if (selecionados.length > 0 && !clubesDaMesmaModalidade([...selecionados, time])) {
      campo.checked = false;
      mostrarToast("Só é possível comparar clubes da mesma modalidade.", "erro");
      return;
    }

    timesSelecionados.set(idTime, time);
  } else {
    timesSelecionados.delete(idTime);
  }

  renderizarComparacao();
}

function atualizarBotoesFavoritar() {
  document.querySelectorAll(".botao-favoritar").forEach((botao) => {
    const favorito = Boolean(encontrarFavoritoPorIdTime(botao.dataset.idTime));
    botao.setAttribute("aria-pressed", String(favorito));
    botao.classList.toggle("is-ativo", favorito);
    botao.textContent = favorito ? "★ Favoritado" : "☆ Favoritar";
    botao.title = favorito ? "Clique para remover dos favoritos" : "Salvar nos favoritos";
  });
}

async function salvarFavorito(time) {
  const { data, error } = await clienteSupabase
    .from(TABELA_FAVORITOS)
    .insert(timeParaRegistro(time))
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      mostrarToast("Esse time já estava nos favoritos.", "info");
      await carregarFavoritos();
      return;
    }
    throw error;
  }

  favoritos = [data, ...favoritos];
  renderizarFavoritos();
  mostrarToast(`${time.strTeam} foi para os favoritos.`, "sucesso");
}

async function removerFavorito(id) {
  const { data, error } = await clienteSupabase
    .from(TABELA_FAVORITOS)
    .delete()
    .eq("id", id)
    .select();

  if (error) throw error;

  if (!data || data.length === 0) {
    await carregarFavoritos();
    mostrarToast("Não foi possível excluir esse favorito. Confira as políticas (RLS) da tabela no Supabase.", "erro");
    return;
  }

  favoritos = favoritos.filter((f) => String(f.id) !== String(id));
  renderizarFavoritos();
  mostrarToast("Favorito removido.", "info");
}

async function alternarFavorito(botao) {
  if (!clienteSupabase) {
    mostrarToast(motivoBancoIndisponivel, "erro");
    return;
  }

  const idTime = botao.dataset.idTime;
  const time = timesPorId.get(String(idTime));
  if (!time) return;

  botao.disabled = true;

  try {
    const existente = encontrarFavoritoPorIdTime(idTime);
    if (existente) {
      await removerFavorito(existente.id);
    } else {
      await salvarFavorito(time);
    }
  } catch (erro) {
    console.error("Erro ao atualizar favorito:", erro);
    mostrarToast(mensagemDeErroDoBanco(erro), "erro");
  } finally {
    botao.disabled = false;
  }
}

async function excluirFavoritoDaLista(botao) {
  if (!clienteSupabase) return;

  botao.disabled = true;

  try {
    await removerFavorito(botao.dataset.id);
  } catch (erro) {
    console.error("Erro ao excluir favorito:", erro);
    mostrarToast(mensagemDeErroDoBanco(erro), "erro");
    botao.disabled = false;
  }
}

async function salvarAnotacao(botao) {
  if (!clienteSupabase) return;

  const id = botao.dataset.id;
  const campo = botao.closest(".anotacao").querySelector(".anotacao__campo");
  const anotacao = prepararAnotacao(campo.value);

  botao.disabled = true;
  campo.disabled = true;

  try {
    const { data, error } = await clienteSupabase
      .from(TABELA_FAVORITOS)
      .update({ anotacao })
      .eq("id", id)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      mostrarToast("O banco recusou salvar a anotação. Confira a policy de UPDATE (RLS) no Supabase.", "erro");
      return;
    }

    const linha = favoritos.find((f) => String(f.id) === String(id));
    if (linha) linha.anotacao = data[0].anotacao;
    campo.value = data[0].anotacao || "";
    mostrarToast("Anotação salva!", "sucesso");
  } catch (erro) {
    console.error("Erro ao salvar anotação:", erro);
    mostrarToast(mensagemDeErroDoBanco(erro), "erro");
  } finally {
    botao.disabled = false;
    campo.disabled = false;
  }
}

form.addEventListener("submit", (evento) => {
  evento.preventDefault();
  const termo = campoBusca.value.trim();
  if (termo) buscarPorNome(termo);
});

chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    const termo = chip.dataset.time;
    campoBusca.value = termo;
    buscarPorNome(termo);
  });
});

selectEsporte.addEventListener("change", () => {
  const esporte = selectEsporte.value;
  areaSelectLiga.hidden = true;

  if (!esporte) {
    campoPais.disabled = true;
    campoPais.value = "";
    campoPais.placeholder = "Escolha um esporte primeiro";
    botaoBuscarLigas.disabled = true;
    return;
  }

  campoPais.disabled = false;
  campoPais.value = "";
  campoPais.placeholder = "País em português: Brasil, Inglaterra...";
  botaoBuscarLigas.disabled = false;
});

function dispararBuscaDeLigas() {
  const esporte = selectEsporte.value;
  const paisDigitado = campoPais.value.trim();
  if (!esporte || !paisDigitado) return;

  const paisEmIngles = traduzirPais(paisDigitado);
  buscarLigas(esporte, paisEmIngles);
}

botaoBuscarLigas.addEventListener("click", dispararBuscaDeLigas);

campoPais.addEventListener("keydown", (evento) => {
  if (evento.key === "Enter") {
    evento.preventDefault();
    dispararBuscaDeLigas();
  }
});

selectLiga.addEventListener("change", () => {
  const liga = selectLiga.value;
  if (liga) buscarPorLiga(liga);
});

campoFiltroTimes.addEventListener("input", () => {
  const termo = normalizarTexto(campoFiltroTimes.value);

  const filtrados = termo
    ? ultimosTimesCarregados.filter((t) => normalizarTexto(t.strTeam || "").includes(termo))
    : ultimosTimesCarregados;

  if (filtrados.length === 0 && termo) {
    area.innerHTML = `
      <div class="estado-vazio">
        <p>Nenhum time carregado bate com "${escaparHTML(campoFiltroTimes.value)}" — mas ele pode existir na liga mesmo assim (lembra que só carregamos até 10 times).</p>
        <button type="button" class="search__button botao-buscar-time-liga" data-termo="${escaparHTML(campoFiltroTimes.value)}">
          Buscar "${escaparHTML(campoFiltroTimes.value)}" direto
        </button>
      </div>
    `;
    return;
  }

  renderizarTimes(filtrados);
});

area.addEventListener("click", (evento) => {
  const botaoFavoritar = evento.target.closest(".botao-favoritar");
  if (botaoFavoritar) {
    alternarFavorito(botaoFavoritar);
    return;
  }

  const botaoBuscarTime = evento.target.closest(".botao-buscar-time-liga");
  if (botaoBuscarTime) buscarTimeNaLigaAtual(botaoBuscarTime.dataset.termo);
});

area.addEventListener("change", (evento) => {
  const campoComparar = evento.target.closest(".campo-comparar-time");
  if (campoComparar) alternarSelecaoComparacao(campoComparar);
});

listaFavoritos.addEventListener("change", (evento) => {
  const campoComparar = evento.target.closest(".campo-comparar-time");
  if (campoComparar) alternarSelecaoComparacao(campoComparar);
});

botaoLimparComparacao.addEventListener("click", limparSelecaoComparacao);

async function salvarNota(id, valor) {
  if (!clienteSupabase) return;

  if (valor !== null && !validarNota(valor)) {
    mostrarToast("A nota precisa ser um número inteiro de 1 a 5.", "erro");
    return;
  }

  const grupo = [...listaFavoritos.querySelectorAll(".nota")].find((el) => el.dataset.id === String(id));
  const botoes = grupo ? grupo.querySelectorAll("button") : [];
  botoes.forEach((b) => (b.disabled = true));

  try {
    const { data, error } = await clienteSupabase
      .from(TABELA_FAVORITOS)
      .update({ nota: valor === null ? null : Number(valor) })
      .eq("id", id)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      mostrarToast("O banco recusou salvar a nota. Confira a policy de UPDATE (RLS) no Supabase.", "erro");
      botoes.forEach((b) => (b.disabled = false));
      return;
    }

    const linha = favoritos.find((f) => String(f.id) === String(id));
    if (linha) linha.nota = data[0].nota;

    if (grupo && linha) grupo.outerHTML = criarEstrelasHTML(linha);
    atualizarMediaNotas();
    reposicionarCardFavorito(id);
  } catch (erro) {
    console.error("Erro ao salvar nota:", erro);
    mostrarToast(mensagemDeErroDoBanco(erro), "erro");
    botoes.forEach((b) => (b.disabled = false));
  }
}

listaFavoritos.addEventListener("click", (evento) => {
  const botaoEstrela = evento.target.closest(".estrela");
  if (botaoEstrela) {
    salvarNota(botaoEstrela.dataset.id, botaoEstrela.dataset.nota);
    return;
  }

  const botaoLimparNota = evento.target.closest(".botao-limpar-nota");
  if (botaoLimparNota) {
    salvarNota(botaoLimparNota.dataset.id, null);
    return;
  }

  const botaoSalvar = evento.target.closest(".botao-salvar-anotacao");
  if (botaoSalvar) {
    salvarAnotacao(botaoSalvar);
    return;
  }

  const botaoExcluir = evento.target.closest(".botao-excluir-favorito");
  if (botaoExcluir) {
    excluirFavoritoDaLista(botaoExcluir);
    return;
  }

  const botaoLimparFiltros = evento.target.closest(".botao-limpar-filtros");
  if (botaoLimparFiltros) limparFiltrosFavoritos();
});

campoBuscaFavoritos.addEventListener("input", atualizarListaFavoritos);
selectOrdemFavoritos.addEventListener("change", atualizarListaFavoritos);
selectNotaFavoritos.addEventListener("change", atualizarListaFavoritos);

popularSelectEsportes();
carregarFavoritos();
