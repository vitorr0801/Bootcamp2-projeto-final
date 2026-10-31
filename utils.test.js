const {
  TAMANHO_MAXIMO_ANOTACAO,
  normalizarTexto,
  traduzirPais,
  escaparHTML,
  timeParaRegistro,
  linhaParaTime,
  prepararAnotacao,
  validarNota,
  calcularMedia,
  formatarMedia,
  mensagemDeErroDoBanco,
  filtrarFavoritosPorNome,
  filtrarFavoritosPorNota,
  ordenarFavoritos,
  aplicarFiltrosFavoritos,
  obterCamposDeComparacao,
  obterValorDeComparacao,
  clubesDaMesmaModalidade,
} = require("./utils");

describe("normalizarTexto", () => {
  test("remove acentos, espaços das pontas e deixa minúsculo", () => {
    expect(normalizarTexto("  São Paulo ")).toBe("sao paulo");
  });

  test("mantém texto já normalizado", () => {
    expect(normalizarTexto("brasil")).toBe("brasil");
  });
});

describe("traduzirPais", () => {
  test("traduz país digitado em português, com ou sem acento", () => {
    expect(traduzirPais("Brasil")).toBe("Brazil");
    expect(traduzirPais("Itália")).toBe("Italy");
    expect(traduzirPais("ESPANHA")).toBe("Spain");
  });

  test("devolve o texto original quando o país não está na lista", () => {
    expect(traduzirPais("Narnia")).toBe("Narnia");
  });
});

describe("escaparHTML", () => {
  test("escapa caracteres que poderiam virar HTML", () => {
    expect(escaparHTML('<b onclick="x">&')).toBe("&lt;b onclick=&quot;x&quot;&gt;&amp;");
  });

  test("escapa aspas simples e aceita números", () => {
    expect(escaparHTML("d'Oro")).toBe("d&#39;Oro");
    expect(escaparHTML(1921)).toBe("1921");
  });
});

describe("timeParaRegistro", () => {
  const timeDaApi = {
    idTeam: 133,
    strTeam: "Cruzeiro",
    strBadge: "https://exemplo.test/cruzeiro.png",
    strLeague: "Brazilian Serie B",
    strSport: "Soccer",
    strCountry: "Brazil",
    strStadium: "Mineirão",
    intFormedYear: "1921",
  };

  test("converte o time da API no formato da tabela favoritos", () => {
    expect(timeParaRegistro(timeDaApi)).toEqual({
      id_time: "133",
      nome_time: "Cruzeiro",
      escudo_url: "https://exemplo.test/cruzeiro.png",
      liga: "Brazilian Serie B",
      esporte: "Soccer",
      pais: "Brazil",
      estadio: "Mineirão",
      ano_fundacao: 1921,
    });
  });

  test("usa null nos campos ausentes e ignora ano de fundação inválido", () => {
    const registro = timeParaRegistro({ idTeam: "9", intFormedYear: "0" });
    expect(registro.nome_time).toBe("Time sem nome");
    expect(registro.escudo_url).toBeNull();
    expect(registro.liga).toBeNull();
    expect(registro.ano_fundacao).toBeNull();
  });
});

describe("linhaParaTime", () => {
  test("faz o caminho inverso: linha do banco vira objeto no formato da API", () => {
    const time = linhaParaTime({
      id_time: "133",
      nome_time: "Cruzeiro",
      escudo_url: null,
      liga: "Brazilian Serie B",
      esporte: "Soccer",
      pais: "Brazil",
      estadio: "Mineirão",
      ano_fundacao: 1921,
    });
    expect(time.idTeam).toBe("133");
    expect(time.strTeam).toBe("Cruzeiro");
    expect(time.strBadge).toBeNull();
    expect(time.intFormedYear).toBe(1921);
  });
});

describe("prepararAnotacao", () => {
  test("remove espaços das pontas", () => {
    expect(prepararAnotacao("  ver o jogo de domingo  ")).toBe("ver o jogo de domingo");
  });

  test("texto vazio ou só com espaços vira null", () => {
    expect(prepararAnotacao("")).toBeNull();
    expect(prepararAnotacao("   ")).toBeNull();
    expect(prepararAnotacao(undefined)).toBeNull();
  });

  test("corta o texto no tamanho máximo", () => {
    const longo = "a".repeat(TAMANHO_MAXIMO_ANOTACAO + 50);
    expect(prepararAnotacao(longo)).toHaveLength(TAMANHO_MAXIMO_ANOTACAO);
  });
});

describe("mensagemDeErroDoBanco", () => {
  test("erro de RLS (42501) orienta a conferir as políticas", () => {
    expect(mensagemDeErroDoBanco({ code: "42501" })).toMatch(/RLS/);
  });

  test("coluna inexistente orienta a rodar o banco.sql", () => {
    expect(mensagemDeErroDoBanco({ code: "42703" })).toMatch(/banco\.sql/);
  });

  test("coluna 'nota' inexistente também orienta a rodar o banco.sql", () => {
    expect(mensagemDeErroDoBanco({ message: 'column "nota" does not exist' })).toMatch(/banco\.sql/);
  });

  test("erro desconhecido devolve a mensagem genérica", () => {
    expect(mensagemDeErroDoBanco(new Error("falhou"))).toMatch(/Não foi possível falar com o banco/);
  });
});

describe("validarNota", () => {
  test("aceita inteiros de 1 a 5, como número ou texto", () => {
    [1, 2, 3, 4, 5, "3", " 5 "].forEach((nota) => {
      expect(validarNota(nota)).toBe(true);
    });
  });

  test("rejeita valores fora do intervalo", () => {
    [0, 6, -1, 100].forEach((nota) => {
      expect(validarNota(nota)).toBe(false);
    });
  });

  test("rejeita decimais, texto e valores vazios", () => {
    [2.5, "abc", "", "  ", null, undefined, true, NaN].forEach((nota) => {
      expect(validarNota(nota)).toBe(false);
    });
  });
});

describe("calcularMedia", () => {
  test("lista vazia ou sem notas válidas devolve null", () => {
    expect(calcularMedia([])).toBeNull();
    expect(calcularMedia([null, undefined, 0, 9])).toBeNull();
  });

  test("calcula a média arredondando para uma casa decimal", () => {
    expect(calcularMedia([5, 4])).toBe(4.5);
    expect(calcularMedia([5, 5, 4])).toBe(4.7);
    expect(calcularMedia([3])).toBe(3);
  });

  test("ignora as notas inválidas no cálculo", () => {
    expect(calcularMedia([5, null, 3, "abc", 7])).toBe(4);
  });
});

describe("formatarMedia", () => {
  test("usa vírgula e uma casa decimal", () => {
    expect(formatarMedia(4.5)).toBe("4,5");
    expect(formatarMedia(3)).toBe("3,0");
  });

  test("sem média mostra um traço", () => {
    expect(formatarMedia(null)).toBe("—");
  });
});

const favoritosDeExemplo = Object.freeze([
  Object.freeze({ id: 1, nome_time: "São Paulo", nota: 4 }),
  Object.freeze({ id: 2, nome_time: "Atlético Mineiro", nota: null }),
  Object.freeze({ id: 3, nome_time: "Cruzeiro", nota: 5 }),
  Object.freeze({ id: 4, nome_time: "Botafogo", nota: 4 }),
  Object.freeze({ id: 5, nome_time: "Palmeiras" }),
]);

const ids = (lista) => lista.map((f) => f.id);

describe("filtrarFavoritosPorNome", () => {
  test("ignora maiúsculas, minúsculas e acentos", () => {
    expect(ids(filtrarFavoritosPorNome(favoritosDeExemplo, "sao"))).toEqual([1]);
    expect(ids(filtrarFavoritosPorNome(favoritosDeExemplo, "SÃO PAULO"))).toEqual([1]);
    expect(ids(filtrarFavoritosPorNome(favoritosDeExemplo, "atletico"))).toEqual([2]);
  });

  test("encontra pelo trecho do nome", () => {
    expect(ids(filtrarFavoritosPorNome(favoritosDeExemplo, "fogo"))).toEqual([4]);
  });

  test("termo vazio devolve uma cópia com todos os favoritos", () => {
    const resultado = filtrarFavoritosPorNome(favoritosDeExemplo, "   ");
    expect(ids(resultado)).toEqual([1, 2, 3, 4, 5]);
    expect(resultado).not.toBe(favoritosDeExemplo);
    expect(ids(filtrarFavoritosPorNome(favoritosDeExemplo, undefined))).toEqual([1, 2, 3, 4, 5]);
  });

  test("sem correspondência devolve lista vazia", () => {
    expect(filtrarFavoritosPorNome(favoritosDeExemplo, "Flamengo")).toEqual([]);
  });

  test("não quebra com favorito sem nome", () => {
    expect(filtrarFavoritosPorNome([{ id: 9, nome_time: null }], "x")).toEqual([]);
  });
});

describe("filtrarFavoritosPorNota", () => {
  test("sem nota selecionada devolve todos, inclusive os sem avaliação", () => {
    expect(ids(filtrarFavoritosPorNota(favoritosDeExemplo, ""))).toEqual([1, 2, 3, 4, 5]);
    expect(ids(filtrarFavoritosPorNota(favoritosDeExemplo, undefined))).toEqual([1, 2, 3, 4, 5]);
  });

  test("filtra pela nota exata, como número ou texto", () => {
    expect(ids(filtrarFavoritosPorNota(favoritosDeExemplo, 4))).toEqual([1, 4]);
    expect(ids(filtrarFavoritosPorNota(favoritosDeExemplo, "5"))).toEqual([3]);
  });

  test("nota sem favoritos devolve lista vazia", () => {
    expect(filtrarFavoritosPorNota(favoritosDeExemplo, 1)).toEqual([]);
  });

  test("favoritos sem avaliação não aparecem num filtro de nota", () => {
    const resultado = [1, 2, 3, 4, 5].flatMap((nota) => ids(filtrarFavoritosPorNota(favoritosDeExemplo, nota)));
    expect(resultado).not.toContain(2);
    expect(resultado).not.toContain(5);
  });
});

describe("ordenarFavoritos", () => {
  test("ordena por nome de A a Z, ignorando acentos", () => {
    expect(ids(ordenarFavoritos(favoritosDeExemplo, "nome-asc"))).toEqual([2, 4, 3, 5, 1]);
  });

  test("ordena por nome de Z a A", () => {
    expect(ids(ordenarFavoritos(favoritosDeExemplo, "nome-desc"))).toEqual([1, 5, 3, 4, 2]);
  });

  test("maior nota primeiro, empate pelo nome e sem avaliação no final", () => {
    expect(ids(ordenarFavoritos(favoritosDeExemplo, "nota-desc"))).toEqual([3, 4, 1, 2, 5]);
  });

  test("menor nota primeiro, empate pelo nome e sem avaliação no final", () => {
    expect(ids(ordenarFavoritos(favoritosDeExemplo, "nota-asc"))).toEqual([4, 1, 3, 2, 5]);
  });

  test("posiciona nomes acentuados pela letra base em A–Z e Z–A", () => {
    const lista = [
      { id: 1, nome_time: "Zaragoza" },
      { id: 2, nome_time: "Écija" },
      { id: 3, nome_time: "Botafogo" },
      { id: 4, nome_time: "Ávila" },
    ];
    const nomes = (resultado) => resultado.map((f) => f.nome_time);

    expect(nomes([...lista].sort((a, b) => (a.nome_time < b.nome_time ? -1 : 1)))).toEqual([
      "Botafogo",
      "Zaragoza",
      "Ávila",
      "Écija",
    ]);
    expect(nomes(ordenarFavoritos(lista, "nome-asc"))).toEqual(["Ávila", "Botafogo", "Écija", "Zaragoza"]);
    expect(nomes(ordenarFavoritos(lista, "nome-desc"))).toEqual(["Zaragoza", "Écija", "Botafogo", "Ávila"]);
  });

  test("aceita nota salva como texto", () => {
    const lista = [
      { id: 1, nome_time: "A", nota: "3" },
      { id: 2, nome_time: "B", nota: 5 },
    ];
    expect(ids(ordenarFavoritos(lista, "nota-desc"))).toEqual([2, 1]);
  });

  test("'recentes' ou critério desconhecido mantém a ordem original", () => {
    expect(ids(ordenarFavoritos(favoritosDeExemplo, "recentes"))).toEqual([1, 2, 3, 4, 5]);
    expect(ids(ordenarFavoritos(favoritosDeExemplo, "qualquer"))).toEqual([1, 2, 3, 4, 5]);
  });

  test("não modifica o array original", () => {
    const original = [...favoritosDeExemplo];
    const resultado = ordenarFavoritos(favoritosDeExemplo, "nome-asc");
    expect(resultado).not.toBe(favoritosDeExemplo);
    expect(favoritosDeExemplo).toEqual(original);
  });
});

describe("aplicarFiltrosFavoritos", () => {
  test("combina busca, nota e ordenação", () => {
    expect(ids(aplicarFiltrosFavoritos(favoritosDeExemplo, { nota: "4", ordem: "nome-asc" }))).toEqual([4, 1]);
    expect(ids(aplicarFiltrosFavoritos(favoritosDeExemplo, { termo: "a", ordem: "nota-desc" }))).toEqual([4, 1, 2, 5]);
  });

  test("sem filtros devolve uma cópia na ordem original", () => {
    const resultado = aplicarFiltrosFavoritos(favoritosDeExemplo);
    expect(ids(resultado)).toEqual([1, 2, 3, 4, 5]);
    expect(resultado).not.toBe(favoritosDeExemplo);
  });

  test("filtros sem resultado devolvem lista vazia sem alterar os favoritos", () => {
    const original = [...favoritosDeExemplo];
    expect(aplicarFiltrosFavoritos(favoritosDeExemplo, { termo: "Cruzeiro", nota: "1" })).toEqual([]);
    expect(favoritosDeExemplo).toEqual(original);
  });
});

describe("obterCamposDeComparacao", () => {
  test("inclui cidade e usa liga para futebol", () => {
    expect(obterCamposDeComparacao("Soccer")).toEqual([
      { rotulo: "País", propriedades: ["strCountry"] },
      { rotulo: "Cidade", propriedades: ["strCity"] },
      { rotulo: "Ano de fundação", propriedades: ["intFormedYear"] },
      { rotulo: "Liga", propriedades: ["strLeague"] },
      { rotulo: "Estádio", propriedades: ["strStadium"] },
      { rotulo: "Capacidade", propriedades: ["intStadiumCapacity", "strStadiumCapacity"] },
      { rotulo: "Modalidade", propriedades: ["strSport"] },
    ]);
  });

  test("usa Arena para basquete e hóquei", () => {
    expect(obterCamposDeComparacao("Basketball").map((campo) => campo.rotulo)).toContain("Arena");
    expect(obterCamposDeComparacao("Ice Hockey").map((campo) => campo.rotulo)).toContain("Arena");
  });

  test("usa competição para modalidades diferentes de futebol", () => {
    expect(obterCamposDeComparacao("Baseball").map((campo) => campo.rotulo)).toContain("Liga ou competição");
  });
});

describe("obterValorDeComparacao", () => {
  test("usa a primeira propriedade disponível", () => {
    expect(
      obterValorDeComparacao({ intStadiumCapacity: "", strStadiumCapacity: "50000" }, [
        "intStadiumCapacity",
        "strStadiumCapacity",
      ])
    ).toBe("50000");
  });

  test("informa quando o dado não existe", () => {
    expect(obterValorDeComparacao({ strCity: null }, ["strCity"])).toBe("Não informado");
  });
});

describe("clubesDaMesmaModalidade", () => {
  test("aceita dois ou mais clubes da mesma modalidade", () => {
    expect(
      clubesDaMesmaModalidade([{ strSport: "Soccer" }, { strSport: "soccer" }, { strSport: "Soccer" }])
    ).toBe(true);
  });

  test("rejeita clubes de modalidades diferentes", () => {
    expect(clubesDaMesmaModalidade([{ strSport: "Soccer" }, { strSport: "Basketball" }])).toBe(false);
  });

  test("rejeita lista com menos de dois clubes", () => {
    expect(clubesDaMesmaModalidade([{ strSport: "Soccer" }])).toBe(false);
    expect(clubesDaMesmaModalidade([])).toBe(false);
  });
});
