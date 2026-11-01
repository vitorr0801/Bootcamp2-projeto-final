# Escalação — Explorador de Times

Aplicação web (HTML + CSS + JavaScript puros, servida por **Nginx**) para explorar times de futebol, basquete, hóquei no gelo, beisebol e futebol americano. Os dados dos times vêm da API pública [TheSportsDB](https://www.thesportsdb.com/) e os **times favoritos ficam salvos num banco PostgreSQL (Supabase)**, então continuam lá depois de fechar o navegador.

Projeto final do Bootcamp II, desenvolvido em grupo.

## Funcionalidades

- Busca de times pelo nome e navegação por esporte → país → liga → equipe.
- Favoritos salvos no banco, com anotação pessoal e nota de 1 a 5 estrelas (com média geral).
- Busca, filtro por nota e ordenação dos favoritos.
- Comparação de clubes da mesma modalidade, lado a lado.

## Como rodar

```bash
docker run -d -p 8080:80 vitorceub/bootcamp2-projeto-final:latest
```

Depois é só abrir **http://localhost:8080** no navegador.

> O container precisa de acesso à internet, porque o navegador consulta a TheSportsDB e o Supabase. Não são necessárias variáveis de ambiente.

Para parar e remover:

```bash
docker ps
docker stop <id-ou-nome>
docker rm <id-ou-nome>
```

## Tags

| Tag      | Descrição                                   |
|----------|---------------------------------------------|
| `latest` | Aponta para a versão mais recente publicada |

Confira na aba **Tags** do Docker Hub as versões disponíveis e a data de cada publicação.

## Links

- **Código-fonte (GitHub):** https://github.com/vitorr0801/Bootcamp2-projeto-final
- **Imagem (Docker Hub):** https://hub.docker.com/r/vitorceub/bootcamp2-projeto-final

## Sobre a imagem

- Base: `nginx:alpine` (enxuta)
- Porta exposta: `80`
- Contém apenas os arquivos da aplicação: `index.html`, `style.css`, `utils.js` e `script.js`
