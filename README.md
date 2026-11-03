# Pokédex – Pokémon dos anos 90 e 2000

Trabalho da disciplina **Web Development Front-End**: um site estático que consome a
[PokeAPI](https://pokeapi.co/) e monta os cards dos Pokémon dinamicamente com JavaScript.

Feito só com **HTML, CSS e JavaScript puros**, sem frameworks.

## O que o site faz

- Carrega os Pokémon da geração escolhida (I a IV, de 1996 a 2006), de 20 em 20.
- Cria cada card via `document.createElement` + `appendChild`, com imagem, número,
  nome, tipos, altura, peso e barras de HP, Ataque e Defesa.
- Busca um Pokémon pelo nome ou número.
- Layout responsivo com CSS Grid e media queries.

## Como a API é consumida

1. `GET /api/v2/pokemon?offset=0&limit=20` devolve a lista, só com nome e URL de cada Pokémon.
2. Para cada item, `fetch(item.url)` busca os detalhes. As 20 requisições rodam em paralelo com `Promise.all`.
3. Com os detalhes em mãos, `criarCard()` monta o card e o `appendChild` coloca na página.

A PokeAPI é gratuita e não exige token nem cadastro.

## Como rodar

Abra o `index.html` no navegador, ou sirva a pasta localmente:

```bash
python -m http.server 5500
```

e acesse `http://localhost:5500`.

## Estrutura

```
index.html      estrutura da página (o container dos cards começa vazio)
css/style.css   tema Pokédex, cores dos tipos e responsividade
js/script.js    fetch na PokeAPI e criação dos cards
```
