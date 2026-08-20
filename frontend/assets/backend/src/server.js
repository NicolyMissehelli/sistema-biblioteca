const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

let livros = [
  { id: 1, titulo: "Clean Code", autor: "Robert C. Martin", categoria: "Programação", quantidade: 3, disponiveis: 2 },
  { id: 2, titulo: "O Hobbit", autor: "J. R. R. Tolkien", categoria: "Fantasia", quantidade: 2, disponiveis: 2 },
  { id: 3, titulo: "Dom Casmurro", autor: "Machado de Assis", categoria: "Literatura", quantidade: 2, disponiveis: 0 },
  { id: 4, titulo: "Algoritmos", autor: "Thomas H. Cormen", categoria: "Computação", quantidade: 4, disponiveis: 3 }
];

let alunos = [
  { id: 1, nome: "Ana Souza", email: "ana@novaris.com" },
  { id: 2, nome: "Lucas Silva", email: "lucas@novaris.com" }
];

let emprestimos = [];

// Login demonstrativo
app.post("/api/login", (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha || senha.length < 4) {
    return res.status(400).json({ mensagem: "E-mail e senha inválidos." });
  }

  res.json({
    mensagem: "Login realizado com sucesso.",
    usuario: { email, perfil: "Administrador" }
  });
});

// Livros
app.get("/api/livros", (req, res) => {
  const { busca, categoria } = req.query;

  let resultado = livros;

  if (busca) {
    const termo = busca.toLowerCase();
    resultado = resultado.filter(l =>
      `${l.titulo} ${l.autor} ${l.categoria}`.toLowerCase().includes(termo)
    );
  }

  if (categoria) {
    resultado = resultado.filter(l => l.categoria === categoria);
  }

  res.json(resultado);
});

app.post("/api/livros", (req, res) => {
  const { titulo, autor, categoria, quantidade } = req.body;

  if (!titulo || !autor || !categoria || !quantidade) {
    return res.status(400).json({ mensagem: "Preencha todos os campos obrigatórios." });
  }

  const novoLivro = {
    id: Date.now(),
    titulo,
    autor,
    categoria,
    quantidade: Number(quantidade),
    disponiveis: Number(quantidade)
  };

  livros.push(novoLivro);
  res.status(201).json(novoLivro);
});

// Alunos
app.get("/api/alunos", (req, res) => {
  res.json(alunos);
});

app.post("/api/alunos", (req, res) => {
  const { nome, email } = req.body;

  if (!nome || !email) {
    return res.status(400).json({ mensagem: "Nome e e-mail são obrigatórios." });
  }

  const novoAluno = {
    id: Date.now(),
    nome,
    email
  };

  alunos.push(novoAluno);
  res.status(201).json(novoAluno);
});

// Empréstimos
app.post("/api/emprestimos", (req, res) => {
  const { livroId, alunoId } = req.body;

  const livro = livros.find(l => l.id === Number(livroId));
  const aluno = alunos.find(a => a.id === Number(alunoId));

  if (!livro || !aluno) {
    return res.status(404).json({ mensagem: "Livro ou aluno não encontrado." });
  }

  if (livro.disponiveis <= 0) {
    return res.status(400).json({ mensagem: "Livro indisponível." });
  }

  livro.disponiveis--;

  const emprestimo = {
    id: Date.now(),
    livroId: livro.id,
    alunoId: aluno.id,
    data: new Date().toISOString(),
    status: "ATIVO"
  };

  emprestimos.push(emprestimo);
  res.status(201).json(emprestimo);
});

app.get("/api/emprestimos", (req, res) => {
  res.json(emprestimos);
});

// Dashboard
app.get("/api/dashboard", (req, res) => {
  res.json({
    livros: livros.reduce((total, l) => total + l.quantidade, 0),
    disponiveis: livros.reduce((total, l) => total + l.disponiveis, 0),
    alunos: alunos.length,
    emprestimos: emprestimos.filter(e => e.status === "ATIVO").length
  });
});

app.get("/api/status", (req, res) => {
  res.json({
    sistema: "Novaris Tech Biblioteca",
    status: "online"
  });
});

app.listen(PORT, () => {
  console.log(`API Novaris Biblioteca rodando em http://localhost:${PORT}`);
});
