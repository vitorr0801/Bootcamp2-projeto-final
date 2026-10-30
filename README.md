# Escalação — Explorador de Times

Projeto final do Bootcamp 2, desenvolvido em grupo com fluxo de Pull Requests, testes automatizados no GitHub Actions e imagem publicada no Docker Hub.

## 1. Integrantes e responsabilidades

| Nome | Matrícula | Usuário GitHub | Funcionalidade pela qual é responsável | Principal PR |
|------|-----------|----------------|----------------------------------------|--------------|
| Vitor Reis Rodrigues de Souza | 22308730 | [vitorr0801](https://github.com/vitorr0801) | Nota de 1 a 5 estrelas nos favoritos, com média geral (e a base do projeto: busca, favoritos e anotações) e Funcionalidade de anotações sobre o time. | [PREENCHER: link da PR] |
| [PREENCHER] | [PREENCHER] | [PREENCHER] | [PREENCHER] | [PREENCHER: link da PR] |
| [PREENCHER] | [PREENCHER] | [PREENCHER] | [PREENCHER] | [PREENCHER: link da PR] |

## 2. A aplicação

**Escalação** é uma aplicação web para explorar times de futebol, basquete, hóquei no gelo, beisebol e futebol americano. A pessoa pode:

- buscar um time pelo nome (ex.: Real Madrid, Lakers, Cruzeiro);
- navegar por esporte → país → liga → equipe, com filtro por nome dentro da liga;
- **favoritar** times, que ficam salvos no banco de dados;
- escrever uma **anotação** pessoal em cada favorito;
- dar uma **nota de 1 a 5 estrelas** a cada favorito e ver a **média** das suas notas;
- excluir favoritos.

### API consumida

[TheSportsDB](https://www.thesportsdb.com/) (chave gratuita `123`), com os endpoints `searchteams.php` (busca por nome), `search_all_leagues.php` (ligas de um país e esporte) e `search_all_teams.php` (times de uma liga). A versão gratuita retorna no máximo 10 times por liga, e a aplicação avisa quando isso acontece.

### Banco de dados

Supabase (PostgreSQL gerenciado, região Americas), acessado pelo navegador com `supabase-js`, usando a URL do projeto e a chave **anon/public**. Os dados não ficam no navegador: aparecem em qualquer dispositivo.

Tabela `favoritos`:

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | bigint (identity, PK) | Identificador |
| `criado_em` | timestamptz | Quando foi favoritado |
| `id_time` | text, único | `idTeam` da TheSportsDB (evita favoritar o mesmo time duas vezes) |
| `nome_time`, `escudo_url`, `liga`, `esporte`, `pais`, `estadio` | text | Dados do time |
| `ano_fundacao` | integer | Ano de fundação |
| `anotacao` | text (máx. 500) | Anotação pessoal |
| `nota` | smallint (1 a 5) | Nota dada ao time |

O script de criação é o [`banco.sql`](banco.sql) (colar no SQL Editor do Supabase).

**Limitação conhecida (RLS):** o RLS está ativo, mas com políticas abertas para o papel `anon` (`select`, `insert`, `update` e `delete`). Como não há login, qualquer pessoa com a chave anon pode ler, criar, editar e apagar favoritos, e a lista é compartilhada entre todos. Em produção usaríamos Supabase Auth, uma coluna `user_id` e políticas por usuário.

### Estrutura do código

| Arquivo | Função |
|---------|--------|
| `index.html`, `style.css` | Interface |
| `script.js` | Tela, chamadas à API e ao Supabase |
| `utils.js` | Funções puras (normalizar texto, traduzir país, escapar HTML, converter time ↔ registro do banco, validar nota, calcular média...), que são as testadas |
| `utils.test.js` | Testes automatizados (Jest) |
| `banco.sql` | Criação da tabela e das políticas |
| `Dockerfile`, `.dockerignore` | Imagem Docker |
| `.github/workflows/ci.yml` | Integração contínua |

## 3. Como executar

### Localmente

1. Clone o repositório.
2. Crie um projeto no Supabase, rode o `banco.sql` no SQL Editor e copie a **Project URL** e a chave **anon/public**.
3. Preencha `SUPABASE_URL` e `SUPABASE_ANON_KEY` no começo do `script.js`. (O repositório já vem com os dados do projeto do grupo.)
4. Abra o `index.html` no navegador, ou use a extensão Live Server do VS Code.

### Com Docker

Imagem: https://hub.docker.com/r/vitorceub/bootcamp2-projeto-final

```bash
docker run -d -p 8080:80 vitorceub/bootcamp2-projeto-final:latest
```

Depois abra http://localhost:8080. Não são necessárias variáveis de ambiente: a URL e a chave anon do Supabase do grupo já estão no código da imagem, e o container só precisa de acesso à internet (TheSportsDB e Supabase).

Para parar e remover: `docker ps`, `docker stop <nome>` e `docker rm <nome>`.

Para construir a imagem localmente:

```bash
docker build -t bootcamp2-projeto-final .
docker run -d -p 8080:80 --name app bootcamp2-projeto-final
```

## 4. Como rodar os testes

Requer Node.js 20 ou mais novo.

```bash
npm install
npm test
```

Os testes (Jest) ficam em `utils.test.js` e cobrem as funções de `utils.js`: normalização de texto, tradução de países, escape de HTML, conversão entre o time da API e o registro do banco, preparação da anotação, validação da nota, cálculo e formatação da média e mensagens de erro do banco. No GitHub, o workflow `.github/workflows/ci.yml` roda `npm test` a cada Pull Request e a cada push na `main`.

## 5. Fluxo de trabalho do grupo

A `main` é protegida por um ruleset: ninguém commita direto nela. Cada funcionalidade nasce numa branch `feature/...` e chega à `main` por Pull Request, que precisa de **1 aprovação** de outro integrante e do check **testes** verde. Cada PR tem título claro, descrição (o que foi feito, por que e como testar) e um revisor, que deixa pelo menos um comentário antes de aprovar.

## 6. Evidências

### PR bloqueada pelo CI

[PREENCHER: print de uma PR com o teste quebrando de propósito e o botão de merge bloqueado, mais o link da PR]

### Conflito de merge

[PREENCHER: relato de pelo menos um conflito de merge: em quais branches e arquivo aconteceu, como foi resolvido e por quem. Se não houve conflito, dizer que não houve]
