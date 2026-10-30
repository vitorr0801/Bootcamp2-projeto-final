# Escalação — Explorador de Times

Projeto final do Bootcamp 2, desenvolvido em grupo.

## 1. Integrantes e responsabilidades

| Nome | Matrícula | Usuário GitHub | Funcionalidade (dono do código) | Principal PR |
|------|-----------|----------------|---------------------------------|--------------|
| Vitor | 22308730 | [vitorr0801](https://github.com/vitorr0801) | [PREENCHER] | [PREENCHER: link da PR] |
| [PREENCHER] | [PREENCHER] | [PREENCHER] | [PREENCHER] | [PREENCHER: link da PR] |
| [PREENCHER] | [PREENCHER] | [PREENCHER] | [PREENCHER] | [PREENCHER: link da PR] |

## 2. A aplicação

Aplicação web (HTML, CSS e JavaScript) para explorar times de futebol, basquete, hóquei no gelo, beisebol e futebol americano. É possível buscar um time por nome ou navegar por esporte, país e liga, favoritar times e escrever uma anotação pessoal em cada favorito.

- **API externa:** [TheSportsDB](https://www.thesportsdb.com/) (chave gratuita `123`), usando `searchteams.php`, `search_all_leagues.php` e `search_all_teams.php`.
- **Banco de dados:** Supabase (PostgreSQL), tabela `favoritos`. O script de criação está em [`banco.sql`](banco.sql). O RLS está ativo com políticas abertas para o papel `anon`, o que é uma limitação conhecida: sem login, qualquer pessoa com a chave anon pode ler, criar, editar e apagar favoritos.
- **Estrutura do código:** `utils.js` guarda as funções puras (normalização de texto, tradução de país, escape de HTML, conversão entre time da API e registro do banco), que são as testadas. `script.js` cuida da tela e da comunicação com a API e o banco.

## 3. Como rodar localmente

1. Clone o repositório.
2. Em `script.js`, preencha `SUPABASE_URL` e `SUPABASE_ANON_KEY` com os dados do projeto Supabase do grupo.
3. Abra o `index.html` no navegador (ou use a extensão Live Server).

## 4. Como rodar com Docker

```bash
docker run -d -p 8080:80 [PREENCHER: usuario]/[PREENCHER: nome-da-imagem]:[PREENCHER: tag]
```

Depois abra http://localhost:8080. A imagem não precisa de variáveis de ambiente: a URL e a chave anon do Supabase já estão no código.

Docker Hub: [PREENCHER: link do repositório no Docker Hub]

Para construir a imagem localmente:

```bash
docker build -t bootcamp2-projeto-final .
docker run -d -p 8080:80 --name app bootcamp2-projeto-final
```

## 5. Como rodar os testes

É preciso ter o Node.js 20 ou mais novo.

```bash
npm install
npm test
```

Os testes ficam em `utils.test.js` (Jest) e cobrem as funções de `utils.js`. No GitHub, o workflow `.github/workflows/ci.yml` roda os mesmos testes a cada Pull Request e a cada push na `main`.

## 6. Fluxo de trabalho do grupo

A `main` é protegida: nenhum código entra direto nela. Cada funcionalidade nasce numa branch `feature/...`, chega à `main` por Pull Request, é revisada por outro integrante (que deixa pelo menos um comentário) e só pode ser mesclada com o check de testes verde.

## 7. Evidências

### PR bloqueada pelo CI

[PREENCHER: print de uma PR com o teste quebrando e o merge bloqueado, e o link da PR]

### Conflito de merge resolvido

[PREENCHER: relato de pelo menos um conflito de merge: quais branches, qual arquivo, como foi resolvido e por quem. Se não houve, escrever que não houve]
