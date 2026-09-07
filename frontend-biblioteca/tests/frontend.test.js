// Importa as funções do Vitest que serão utilizadas nos testes.
// describe: organiza os testes em um grupo.
// expect: verifica se o resultado é o esperado.
// test: define um teste individual.
import { describe, expect, test } from "vitest";

// Importa o módulo fs do Node.js para ler o arquivo script.js.
import fs from "node:fs";

// Importa o módulo vm do Node.js.
// Ele permite executar o código do script.js em um ambiente controlado.
import vm from "node:vm";


// Lê o conteúdo do arquivo script.js do frontend.
// O caminho "../script.js" significa que o arquivo está uma pasta acima
// da pasta onde este teste está localizado.
const script = fs.readFileSync(
  new URL("../script.js", import.meta.url),
  "utf8"
);


// Cria um elemento HTML falso para simular elementos do navegador.
// Como os testes são executados fora de um navegador real,
// precisamos fornecer algumas propriedades que o script.js utiliza.
function createElement() {
  return {
    // Simula o conteúdo de texto de um elemento HTML.
    textContent: "",

    // Simula o conteúdo HTML interno de um elemento.
    innerHTML: "",

    // Simula o valor de campos de formulário.
    value: "",

    // Simula o tipo de um elemento de formulário.
    type: "password",

    // Simula a propriedade disabled.
    disabled: false,

    // Simula os atributos data-* dos elementos HTML.
    dataset: {},

    // Simula as funções utilizadas para adicionar,
    // remover ou alternar classes CSS.
    classList: {
      add() {},
      remove() {},
      toggle() {}
    },

    // Simula o addEventListener do navegador.
    // Não precisamos executar eventos nesses testes,
    // então deixamos a função vazia.
    addEventListener() {},

    // Simula uma função atribuída ao evento onclick.
    onclick: null
  };
}


// Objeto utilizado para armazenar os elementos HTML simulados.
const elements = {};


// Cria uma versão simplificada do objeto document do navegador.
const document = {

  // Simula document.querySelector().
  // Quando um elemento é solicitado, cria um elemento falso
  // caso ele ainda não exista.
  querySelector(selector) {
    if (!elements[selector]) {
      elements[selector] = createElement();
    }

    return elements[selector];
  },


  // Simula document.querySelectorAll().
  // Neste conjunto de testes não precisamos de elementos múltiplos,
  // por isso retornamos uma lista vazia.
  querySelectorAll() {
    return [];
  }
};


// Simula o localStorage do navegador.
// O script.js pode tentar acessar informações armazenadas localmente,
// então criamos essas funções para evitar erros durante os testes.
const localStorage = {

  // Simula a recuperação de um valor armazenado.
  getItem() {
    return null;
  },

  // Simula o armazenamento de um valor.
  setItem() {},

  // Simula a remoção de um valor.
  removeItem() {}
};


// Cria o ambiente no qual o script.js será executado.
// Esse ambiente imita algumas funcionalidades disponíveis
// normalmente em um navegador.
const context = {

  // Simula o objeto window.
  window: {
    APP_CONFIG: {
      // Endereço utilizado pela aplicação para acessar a API.
      API_URL: "http://localhost:8000"
    },

    // Variável utilizada pelo frontend para controlar o timer
    // de mensagens/notificações.
    toastTimer: null
  },


  // Disponibiliza o document falso criado anteriormente.
  document,

  // Disponibiliza o localStorage falso.
  localStorage,


  // Simula a função fetch().
  // Esses dois testes não precisam fazer requisições à API.
  // Por isso, se alguma requisição for feita por engano,
  // o teste gera um erro para indicar que isso não deveria acontecer.
  fetch: async () => {
    throw new Error("fetch não deve ser chamado neste teste");
  },


  // Disponibiliza funcionalidades que o script.js pode utilizar.
  URLSearchParams,

  // Simula temporizadores do navegador.
  setTimeout,
  clearTimeout,

  // Disponibiliza o console para o script.
  console
};


// Cria um contexto isolado para executar o código do script.js.
vm.createContext(context);


// Executa o conteúdo do script.js dentro do contexto criado.
//
// Depois da execução, colocamos especificamente as funções
// que queremos testar dentro de globalThis.testFunctions.
// Isso permite acessá-las no arquivo de teste.
vm.runInContext(
  `${script}
   globalThis.testFunctions = {
     initials,
     escapeHtml,
     normalizeBook
   };`,
  context
);


// Recupera as funções do script.js que serão utilizadas nos testes.
const {
  initials,
  escapeHtml,
  normalizeBook
} = context.testFunctions;


// Agrupa os testes relacionados ao frontend da biblioteca.
describe("Frontend do Sistema da Biblioteca", () => {


  // PRIMEIRO TESTE
  //
  // Verifica se a função initials() consegue gerar
  // corretamente as iniciais de um título.
  test("deve gerar corretamente as iniciais do título do livro", () => {

    // Envia "Dom Casmurro" para a função.
    // O resultado esperado é "DC".
    expect(initials("Dom Casmurro")).toBe("DC");
  });


  // SEGUNDO TESTE
  //
  // Verifica se a função normalizeBook()
  // transforma corretamente os dados recebidos da API
  // para o formato utilizado pelo frontend.
  test("deve normalizar corretamente os dados de um livro", () => {


    // Cria um objeto simulando um livro recebido pela API.
    const livro = {
      id: 1,
      titulo: "Dom Casmurro",
      autor: "Machado de Assis",
      categoria_nome: "Romance",
      categoria_id: 2,
      quantidade: 5,
      disponiveis: 3,
      isbn: "123456",
      editora: "Editora X",
      ano_publicacao: 1899
    };


    // Executa a função normalizeBook()
    // e compara o resultado com o formato esperado.
    expect(normalizeBook(livro)).toEqual({

      // Identificador do livro.
      id: 1,

      // Título normalizado.
      title: "Dom Casmurro",

      // Autor normalizado.
      author: "Machado de Assis",

      // Categoria normalizada.
      category: "Romance",

      // ID da categoria.
      categoryId: 2,

      // Quantidade total de exemplares.
      qty: 5,

      // Quantidade disponível.
      available: 3,

      // ISBN do livro.
      isbn: "123456",

      // Editora.
      publisher: "Editora X",

      // Ano de publicação.
      year: 1899
    });
  });

});