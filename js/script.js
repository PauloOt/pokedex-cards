// Endereço base da PokeAPI (pública, sem token)
const API = 'https://pokeapi.co/api/v2';

// Quantos cards buscar por vez
const POR_PAGINA = 20;

// Faixa de números da Pokédex nacional de cada geração
const GERACOES = {
  1: { inicio: 1, fim: 151 },
  2: { inicio: 152, fim: 251 },
  3: { inicio: 252, fim: 386 },
  4: { inicio: 387, fim: 493 }
};

const TIPOS_PT = {
  normal: 'Normal', fire: 'Fogo', water: 'Água', grass: 'Planta',
  electric: 'Elétrico', ice: 'Gelo', fighting: 'Lutador', poison: 'Venenoso',
  ground: 'Terrestre', flying: 'Voador', psychic: 'Psíquico', bug: 'Inseto',
  rock: 'Pedra', ghost: 'Fantasma', dragon: 'Dragão', dark: 'Sombrio',
  steel: 'Aço', fairy: 'Fada'
};

const ATRIBUTOS_PT = {
  hp: 'HP',
  attack: 'Ataque',
  defense: 'Defesa'
};

// Elementos que já existem no index.html
const containerCards = document.querySelector('#cards');
const mensagem = document.querySelector('#mensagem');
const botaoMais = document.querySelector('#carregar-mais');
const formFiltros = document.querySelector('#filtros');
const campoGeracao = document.querySelector('#geracao');
const campoBusca = document.querySelector('#busca');
const totalEspecies = document.querySelector('#total-especies');

// Geração escolhida e o número do próximo Pokémon a carregar
let geracaoAtual = GERACOES[1];
let proximoNumero = geracaoAtual.inicio;

// Carrega a próxima leva de Pokémon da geração escolhida.
// Passo 1: a lista (/pokemon?offset=..&limit=..) traz só nome e URL de cada um.
// Passo 2: buscamos os detalhes de cada Pokémon ao mesmo tempo com Promise.all.
function carregarGeracao(limpar) {
  const quantidade = Math.min(POR_PAGINA, geracaoAtual.fim - proximoNumero + 1);
  const url = `${API}/pokemon?offset=${proximoNumero - 1}&limit=${quantidade}`;

  mensagem.textContent = 'Ligando a Pokédex...';
  botaoMais.disabled = true;

  fetch(url)
    .then(resposta => {
      if (!resposta.ok) {
        throw new Error(`A API respondeu com status ${resposta.status}`);
      }
      return resposta.json();
    })
    .then(lista => {
      const detalhes = lista.results.map(item =>
        fetch(item.url).then(resposta => resposta.json())
      );
      return Promise.all(detalhes);
    })
    .then(pokemons => {
      if (limpar) {
        containerCards.replaceChildren();
      }

      pokemons.forEach(pokemon => {
        containerCards.appendChild(criarCard(pokemon));
      });

      proximoNumero += quantidade;
      botaoMais.hidden = proximoNumero > geracaoAtual.fim;

      const total = geracaoAtual.fim - geracaoAtual.inicio + 1;
      mensagem.textContent = `Mostrando ${containerCards.children.length} de ${total} Pokémon desta geração.`;
    })
    .catch(erro => {
      console.error('Erro ao consumir a API:', erro);
      mensagem.textContent = 'Não foi possível carregar os Pokémon. Tente novamente mais tarde.';
    })
    .finally(() => {
      botaoMais.disabled = false;
    });
}

// Busca um Pokémon específico pelo nome ou número: /pokemon/pikachu ou /pokemon/25
function buscarPokemon(termo) {
  mensagem.textContent = 'Procurando...';
  botaoMais.hidden = true;

  fetch(`${API}/pokemon/${encodeURIComponent(termo.toLowerCase())}`)
    .then(resposta => {
      // Nome ou número que não existe: a API responde 404
      if (resposta.status === 404) {
        return null;
      }
      if (!resposta.ok) {
        throw new Error(`A API respondeu com status ${resposta.status}`);
      }
      return resposta.json();
    })
    .then(pokemon => {
      containerCards.replaceChildren();

      if (!pokemon) {
        mensagem.textContent = `Nenhum Pokémon encontrado para "${termo}".`;
        return;
      }

      containerCards.appendChild(criarCard(pokemon));
      mensagem.textContent = 'Resultado da busca.';
    })
    .catch(erro => {
      console.error('Erro ao consumir a API:', erro);
      mensagem.textContent = 'Não foi possível fazer a busca. Tente novamente mais tarde.';
    });
}

// Cria um card completo só com JavaScript. Estrutura gerada:
// <article class="card tipo-electric">
//   <div class="card-imagem"><img></div>
//   <div class="card-info">
//     <p class="card-numero">#025</p>
//     <h3>Pikachu</h3>
//     <div class="card-tipos"><span class="tipo tipo-electric">Elétrico</span></div>
//     <p class="card-medidas">Altura 0,4 m · Peso 6 kg</p>
//     <ul class="card-atributos"><li>HP <barra> 35</li> ...</ul>
//   </div>
// </article>
function criarCard(pokemon) {
  const tipoPrincipal = pokemon.types[0].type.name;

  const card = document.createElement('article');
  card.classList.add('card', `tipo-${tipoPrincipal}`);

  const moldura = document.createElement('div');
  moldura.classList.add('card-imagem');

  const imagem = document.createElement('img');
  imagem.src = pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default;
  imagem.alt = pokemon.name;
  imagem.loading = 'lazy';
  moldura.appendChild(imagem);

  const info = document.createElement('div');
  info.classList.add('card-info');

  const numero = document.createElement('p');
  numero.classList.add('card-numero');
  numero.textContent = `#${String(pokemon.id).padStart(3, '0')}`;

  const nome = document.createElement('h3');
  nome.textContent = pokemon.name;

  const tipos = document.createElement('div');
  tipos.classList.add('card-tipos');
  pokemon.types.forEach(item => {
    const tipo = document.createElement('span');
    tipo.classList.add('tipo', `tipo-${item.type.name}`);
    tipo.textContent = TIPOS_PT[item.type.name] || item.type.name;
    tipos.appendChild(tipo);
  });

  // A API mede altura em decímetros e peso em hectogramas
  const medidas = document.createElement('p');
  medidas.classList.add('card-medidas');
  const altura = (pokemon.height / 10).toLocaleString('pt-BR');
  const peso = (pokemon.weight / 10).toLocaleString('pt-BR');
  medidas.textContent = `Altura ${altura} m · Peso ${peso} kg`;

  info.append(numero, nome, tipos, medidas, criarAtributos(pokemon.stats));
  card.append(moldura, info);
  return card;
}

// Lista com barras de HP, Ataque e Defesa
function criarAtributos(stats) {
  const lista = document.createElement('ul');
  lista.classList.add('card-atributos');

  stats
    .filter(item => ATRIBUTOS_PT[item.stat.name])
    .forEach(item => {
      const linha = document.createElement('li');

      const rotulo = document.createElement('span');
      rotulo.textContent = ATRIBUTOS_PT[item.stat.name];

      const barra = document.createElement('span');
      barra.classList.add('barra');
      const preenchimento = document.createElement('span');
      // 255 é o maior valor base possível de um atributo
      preenchimento.style.width = `${Math.min(item.base_stat / 255 * 100, 100)}%`;
      barra.appendChild(preenchimento);

      const valor = document.createElement('span');
      valor.textContent = item.base_stat;

      linha.append(rotulo, barra, valor);
      lista.appendChild(linha);
    });

  return lista;
}

// Recomeça a geração escolhida do primeiro Pokémon
function trocarGeracao() {
  geracaoAtual = GERACOES[campoGeracao.value];
  proximoNumero = geracaoAtual.inicio;
  carregarGeracao(true);
}

// Com texto na busca, procura aquele Pokémon; sem texto, mostra a geração
formFiltros.addEventListener('submit', evento => {
  evento.preventDefault(); // impede o formulário de recarregar a página
  const termo = campoBusca.value.trim();
  if (termo) {
    buscarPokemon(termo);
  } else {
    trocarGeracao();
  }
});

campoGeracao.addEventListener('change', () => {
  campoBusca.value = '';
  trocarGeracao();
});

botaoMais.addEventListener('click', () => {
  carregarGeracao(false);
});

// Total de espécies na seção "Sobre", vindo da própria API
fetch(`${API}/pokemon-species?limit=1`)
  .then(resposta => resposta.json())
  .then(dados => {
    totalEspecies.textContent = dados.count;
  })
  .catch(() => {});

// Primeira carga ao abrir a página
carregarGeracao(true);
