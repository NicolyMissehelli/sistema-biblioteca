const configuredApi = window.APP_CONFIG?.API_URL?.trim();
const API_URL = configuredApi || (window.location.protocol === "file:" ? "http://localhost:3000/api" : "/api");

let books = [];
let students = [];
let loans = [];
let currentUser = null;

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const toast = (message, type = "info") => {
  const element = $("#toast");
  element.textContent = message;
  element.dataset.type = type;
  element.classList.add("show");
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => element.classList.remove("show"), 2800);
};

const api = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
      ...options
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.mensagem || "Não foi possível concluir a operação.");
    return data;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error("Não foi possível conectar ao backend. Verifique se a API está acessível no endereço configurado.");
    }
    throw error;
  }
};

function initials(text) {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

function normalizeBook(book) {
  return {
    id: book.id,
    title: book.titulo,
    author: book.autor,
    category: book.categoria,
    qty: Number(book.quantidade),
    available: Number(book.disponiveis),
    description: book.descricao || ""
  };
}

function normalizeStudent(student) {
  return { id: student.id, name: student.nome, email: student.email };
}

function bookCard(book) {
  const available = book.available > 0;
  return `
    <article class="book-card" data-id="${book.id}">
      <div class="book-cover">${initials(book.title)}</div>
      <h4 title="${escapeHtml(book.title)}">${escapeHtml(book.title)}</h4>
      <p>${escapeHtml(book.author)} · ${escapeHtml(book.category)}</p>
      <span class="badge ${available ? "available" : "unavailable"}">
        ${available ? `${book.available} disponível(is)` : "Indisponível"}
      </span>
    </article>`;
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderBooks(list = books) {
  $("#catalogGrid").innerHTML = list.length
    ? list.map(bookCard).join("")
    : `<div class="form-card empty-state"><strong>Nenhum livro encontrado.</strong><p>Tente outro título, autor ou categoria.</p></div>`;

  $("#featuredBooks").innerHTML = books.slice(0, 4).map(bookCard).join("");

  $$(".book-card").forEach((card) => {
    card.addEventListener("click", () => openBook(Number(card.dataset.id)));
  });

  const categories = [...new Set(books.map((book) => book.category))].sort((a, b) => a.localeCompare(b));
  const selected = $("#categoryFilter").value;
  $("#categoryFilter").innerHTML = `<option value="">Todas as categorias</option>${categories
    .map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`)
    .join("")}`;
  $("#categoryFilter").value = categories.includes(selected) ? selected : "";
}

function filterBooks() {
  const query = $("#searchInput").value.toLowerCase().trim();
  const category = $("#categoryFilter").value;

  return books.filter((book) => {
    const matchesQuery = !query || `${book.title} ${book.author} ${book.category}`.toLowerCase().includes(query);
    const matchesCategory = !category || book.category === category;
    return matchesQuery && matchesCategory;
  });
}

function renderStudents() {
  $("#studentsList").innerHTML = `
    <h3>Alunos cadastrados (${students.length})</h3>
    ${students.length
      ? students.map((student) => `
        <div class="student-row">
          <div><strong>${escapeHtml(student.name)}</strong><span>${escapeHtml(student.email)}</span></div>
          <span class="badge available">Ativo</span>
        </div>`).join("")
      : "<p>Nenhum aluno cadastrado.</p>"}`;
}

function renderLoanStudentOptions() {
  $("#loanStudent").innerHTML = `<option value="">Selecione o aluno</option>${students
    .map((student) => `<option value="${student.id}">${escapeHtml(student.name)} — ${escapeHtml(student.email)}</option>`)
    .join("")}`;
}

function renderLoans() {
  const container = $("#loansList");
  const activeLoans = loans.filter((loan) => loan.status === "ATIVO");

  if (!loans.length) {
    container.innerHTML = `<div class="empty-state"><strong>Nenhum empréstimo registrado.</strong><p>Os novos empréstimos aparecerão aqui.</p></div>`;
    return;
  }

  container.innerHTML = loans.map((loan) => {
    const book = books.find((item) => item.id === loan.livroId);
    const student = students.find((item) => item.id === loan.alunoId);
    const date = new Date(loan.data).toLocaleString("pt-BR");
    const active = loan.status === "ATIVO";

    return `<div class="loan-row">
      <div>
        <strong>${escapeHtml(book?.title || `Livro #${loan.livroId}`)}</strong>
        <span>${escapeHtml(student?.name || `Aluno #${loan.alunoId}`)} · ${date}</span>
      </div>
      <span class="badge ${active ? "available" : "unavailable"}">${active ? "Ativo" : escapeHtml(loan.status)}</span>
    </div>`;
  }).join("");

  $("#activeLoansCount").textContent = `${activeLoans.length} ativo(s)`;
}

async function updateStats() {
  try {
    const dashboard = await api("/dashboard");
    $("#statBooks").textContent = dashboard.livros;
    $("#statAvailable").textContent = dashboard.disponiveis;
    $("#statStudents").textContent = dashboard.alunos;
    $("#statLoans").textContent = dashboard.emprestimos;
  } catch (error) {
    toast(error.message, "error");
  }
}

async function loadBooks() {
  const data = await api("/livros");
  books = data.map(normalizeBook);
  renderBooks(filterBooks());
}

async function loadStudents() {
  const data = await api("/alunos");
  students = data.map(normalizeStudent);
  renderStudents();
  renderLoanStudentOptions();
}

async function loadLoans() {
  loans = await api("/emprestimos");
  renderLoans();
}

async function refreshData() {
  await Promise.all([loadBooks(), loadStudents(), loadLoans(), updateStats()]);
}

function openBook(id) {
  const book = books.find((item) => item.id === id);
  if (!book) return;

  const available = book.available > 0;
  $("#modalContent").innerHTML = `
    <div class="modal-cover">${initials(book.title)}</div>
    <span class="badge ${available ? "available" : "unavailable"}">
      ${available ? `${book.available} disponível(is)` : "Indisponível"}
    </span>
    <h2>${escapeHtml(book.title)}</h2>
    <p><strong>Autor:</strong> ${escapeHtml(book.author)}<br>
    <strong>Categoria:</strong> ${escapeHtml(book.category)}<br>
    <strong>Acervo:</strong> ${book.qty} exemplar(es)</p>
    <p>${escapeHtml(book.description || "Sem descrição cadastrada.")}</p>
    ${available
      ? `<div class="loan-form">
          <label>Aluno
            <select id="loanStudent" class="modal-select"></select>
          </label>
          <button class="primary-btn" id="loanBtn">Registrar empréstimo</button>
        </div>`
      : `<button class="primary-btn" disabled>Sem exemplares disponíveis</button>`}`;

  $("#bookModal").classList.remove("hidden");

  if (available) {
    renderLoanStudentOptions();
    $("#loanBtn").onclick = () => registerLoan(book.id);
  }
}

async function registerLoan(bookId) {
  const studentId = Number($("#loanStudent").value);
  if (!studentId) return toast("Selecione um aluno.", "error");

  try {
    await api("/emprestimos", {
      method: "POST",
      body: JSON.stringify({ livroId: bookId, alunoId: studentId })
    });

    $("#bookModal").classList.add("hidden");
    toast("Empréstimo registrado com sucesso!", "success");
    await refreshData();
    if (!$("#page-catalogo").classList.contains("hidden")) renderBooks(filterBooks());
  } catch (error) {
    toast(error.message, "error");
  }
}

function showPage(page) {
  $$(".page").forEach((section) => section.classList.add("hidden"));
  $(`#page-${page}`).classList.remove("hidden");
  $$(".nav-item[data-page]").forEach((item) => item.classList.toggle("active", item.dataset.page === page));

  const titles = {
    dashboard: "Visão geral",
    catalogo: "Catálogo de livros",
    livros: "Cadastrar livro",
    alunos: "Alunos",
    emprestimos: "Empréstimos",
    ajuda: "Ajuda"
  };
  $("#pageTitle").textContent = titles[page] || "Biblioteca";

  if (page === "catalogo") renderBooks(filterBooks());
  if (page === "alunos") renderStudents();
  if (page === "emprestimos") renderLoans();
}

async function handleLogin(event) {
  event.preventDefault();
  const email = $("#loginEmail").value.trim();
  const senha = $("#loginPassword").value;

  if (!email || senha.length < 4) {
    return toast("Informe um e-mail e uma senha com pelo menos 4 caracteres.", "error");
  }

  const submit = $("#loginForm button[type='submit']");
  submit.disabled = true;
  submit.textContent = "Entrando...";

  try {
    const result = await api("/login", {
      method: "POST",
      body: JSON.stringify({ email, senha })
    });

    currentUser = result.usuario;
    localStorage.setItem("novarisUser", JSON.stringify(currentUser));
    $("#userEmail").textContent = currentUser.email;
    $("#loginScreen").classList.add("hidden");
    $("#app").classList.remove("hidden");
    await refreshData();
    toast("Login realizado com sucesso!", "success");
  } catch (error) {
    toast(error.message, "error");
  } finally {
    submit.disabled = false;
    submit.textContent = "Entrar";
  }
}

$("#loginForm").addEventListener("submit", handleLogin);

$("#togglePassword").onclick = () => {
  const password = $("#loginPassword");
  password.type = password.type === "password" ? "text" : "password";
  $("#togglePassword").textContent = password.type === "password" ? "Mostrar" : "Ocultar";
};

$("#logoutBtn").onclick = () => {
  localStorage.removeItem("novarisUser");
  currentUser = null;
  $("#app").classList.add("hidden");
  $("#loginScreen").classList.remove("hidden");
  $("#loginPassword").value = "";
};

$$("[data-page]").forEach((button) => button.addEventListener("click", () => showPage(button.dataset.page)));
$$ ("[data-page-jump]").forEach((button) => button.addEventListener("click", () => showPage(button.dataset.pageJump)));

$("#searchInput").addEventListener("input", () => renderBooks(filterBooks()));
$("#categoryFilter").addEventListener("change", () => renderBooks(filterBooks()));

$("#bookForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const quantity = Number($("#bookQty").value);
  const payload = {
    titulo: $("#bookTitle").value.trim(),
    autor: $("#bookAuthor").value.trim(),
    categoria: $("#bookCategory").value.trim(),
    quantidade: quantity,
    descricao: $("#bookDescription").value.trim()
  };

  if (!payload.titulo || !payload.autor || !payload.categoria || quantity < 1) {
    return toast("Preencha corretamente os campos obrigatórios.", "error");
  }

  try {
    await api("/livros", { method: "POST", body: JSON.stringify(payload) });
    event.target.reset();
    $("#bookQty").value = 1;
    toast("Livro cadastrado com sucesso!", "success");
    await refreshData();
    showPage("catalogo");
  } catch (error) {
    toast(error.message, "error");
  }
});

$("#studentForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = {
    nome: $("#studentName").value.trim(),
    email: $("#studentEmail").value.trim()
  };

  try {
    await api("/alunos", { method: "POST", body: JSON.stringify(payload) });
    event.target.reset();
    toast("Aluno cadastrado com sucesso!", "success");
    await refreshData();
  } catch (error) {
    toast(error.message, "error");
  }
});

$("#closeModal").onclick = () => $("#bookModal").classList.add("hidden");
$("#bookModal").addEventListener("click", (event) => {
  if (event.target.id === "bookModal") $("#bookModal").classList.add("hidden");
});

async function initialize() {
  const storedUser = localStorage.getItem("novarisUser");
  if (!storedUser) return;

  try {
    currentUser = JSON.parse(storedUser);
    $("#userEmail").textContent = currentUser.email;
    $("#loginScreen").classList.add("hidden");
    $("#app").classList.remove("hidden");
    await refreshData();
  } catch (error) {
    localStorage.removeItem("novarisUser");
    $("#app").classList.add("hidden");
    $("#loginScreen").classList.remove("hidden");
    toast(error.message, "error");
  }
}

initialize();
