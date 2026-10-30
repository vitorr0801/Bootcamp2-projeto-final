const {
  TAMANHO_MAXIMO_ANOTACAO,
  normalizarTexto,
  traduzirPais,
  escaparHTML,
  timeParaRegistro,
  linhaParaTime,
  prepararAnotacao,
  mensagemDeErroDoBanco,
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

  test("erro desconhecido devolve a mensagem genérica", () => {
    expect(mensagemDeErroDoBanco(new Error("falhou"))).toMatch(/Não foi possível falar com o banco/);
  });
});
