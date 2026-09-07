const API_URL = (window.APP_CONFIG?.API_URL || "http://localhost:8000").replace(/\/$/, "");

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

function authHeaders(extra = {}) {
  const token = localStorage.getItem("bibliotecaToken");
  return token ? { Authorization: `Bearer ${token}`, ...extra } : extra;
}

const api = async (endpoint, options = {}) => {
  const headers = { ...(options.headers || {}) };
  if (!(options.body instanceof URLSearchParams)) headers["Content-Type"] = headers["Content-Type"] || "application/json";
  Object.assign(headers, authHeaders());

  try {
    const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const detail = data.detail || data.mensagem || "Não foi possível concluir a operação.";
      const message = Array.isArray(detail) ? detail.map((x) => x.msg).join("; ") : detail;
      throw new Error(message);
    }
    return data;
  } catch (error) {
    if (error instanceof TypeError) throw new Error("Não foi possível conectar ao backend. Verifique se o container da API está rodando.");
    throw error;
  }
};

function initials(text = "") {
  return text.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join("");
}

function escapeHtml(value = "") {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function normalizeBook(book) {
  return {
    id: book.id,
    title: book.titulo,
    author: book.autor,
    category: book.categoria_nome || `Categoria #${book.categoria_id}`,
    categoryId: book.categoria_id,
    qty: Number(book.quantidade || 0),
    available: Number(book.disponiveis || 0),
    isbn: book.isbn || "",
    publisher: book.editora || "",
    year: book.ano_publicacao || ""
  };
}

function bookCard(book) {
  const available = book.available > 0;
  return `<article class="book-card" data-id="${book.id}">
    <div class="book-cover">${initials(book.title)}</div>
    <h4 title="${escapeHtml(book.title)}">${escapeHtml(book.title)}</h4>
    <p>${escapeHtml(book.author)} · ${escapeHtml(book.category)}</p>
    <span class="badge ${available ? "available" : "unavailable"}">${available ? `${book.available} disponível(is)` : "Indisponível"}</span>
  </article>`;
}

function renderBooks(list = books) {
  $("#catalogGrid").innerHTML = list.length ? list.map(bookCard).join("") : `<div class="form-card empty-state"><strong>Nenhum livro encontrado.</strong><p>Tente outro título, autor ou categoria.</p></div>`;
  $("#featuredBooks").innerHTML = books.slice(0, 4).map(bookCard).join("");
  $$(".book-card").forEach((card) => card.addEventListener("click", () => openBook(Number(card.dataset.id))));

  const categories = [...new Set(books.map((book) => book.category))].sort((a, b) => a.localeCompare(b));
  const selected = $("#categoryFilter").value;
  $("#categoryFilter").innerHTML = `<option value="">Todas as categorias</option>${categories.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`).join("")}`;
  $("#categoryFilter").value = categories.includes(selected) ? selected : "";
}

function filterBooks() {
  const query = $("#searchInput").value.toLowerCase().trim();
  const category = $("#categoryFilter").value;
  return books.filter((book) => {
    const matchesQuery = !query || `${book.title} ${book.author} ${book.category}`.toLowerCase().includes(query);
    return matchesQuery && (!category || book.category === category);
  });
}

function renderStudents() {
  $("#studentsList").innerHTML = `<h3>Alunos cadastrados (${students.length})</h3>${students.length ? students.map((student) => `<div class="student-row"><div><strong>${escapeHtml(student.nome)}</strong><span>${escapeHtml(student.email)}</span></div><span class="badge available">${student.ativo ? "Ativo" : "Inativo"}</span></div>`).join("") : "<p>Nenhum aluno cadastrado.</p>"}`;
}

function renderLoanStudentOptions() {
  const select = $("#loanStudent");
  if (!select) return;
  select.innerHTML = `<option value="">Selecione o aluno</option>${students.map((student) => `<option value="${student.id}">${escapeHtml(student.nome)} — ${escapeHtml(student.email)}</option>`).join("")}`;
}

function renderLoans() {
  const container = $("#loansList");
  const activeLoans = loans.filter((loan) => loan.status === "ATIVO");
  $("#activeLoansCount").textContent = `${activeLoans.length} ativo(s)`;
  if (!loans.length) {
    container.innerHTML = `<div class="empty-state"><strong>Nenhum empréstimo registrado.</strong><p>Os novos empréstimos aparecerão aqui.</p></div>`;
    return;
  }
  container.innerHTML = loans.map((loan) => {
    const exemplar = loan.exemplar_id;
    const book = books.find((item) => item.id === loan._livroId);
    const student = students.find((item) => item.id === loan.usuario_id);
    const active = loan.status === "ATIVO";
    const date = loan.data_emprestimo ? new Date(`${loan.data_emprestimo}T00:00:00`).toLocaleDateString("pt-BR") : "-";
    return `<div class="loan-row"><div><strong>${escapeHtml(book?.title || `Exemplar #${exemplar}`)}</strong><span>${escapeHtml(student?.nome || `Usuário #${loan.usuario_id}`)} · ${date} · devolução ${escapeHtml(loan.data_prevista_devolucao || "-")}</span></div><div style="display:flex;gap:8px;align-items:center"><span class="badge ${active ? "available" : "unavailable"}">${active ? "Ativo" : escapeHtml(loan.status)}</span>${active && currentUser?.perfil !== "LEITOR" ? `<button class="text-btn return-loan" data-id="${loan.id}">Devolver</button>` : ""}</div></div>`;
  }).join("");
  $$(".return-loan").forEach((button) => button.addEventListener("click", () => returnLoan(Number(button.dataset.id))));
}

async function updateStats() {
  const dashboard = await api("/dashboard");
  $("#statBooks").textContent = dashboard.livros;
  $("#statAvailable").textContent = dashboard.disponiveis;
  $("#statStudents").textContent = dashboard.alunos;
  $("#statLoans").textContent = dashboard.emprestimos;
}

async function loadBooks() {
  const data = await api("/livros");
  books = data.map(normalizeBook);
  renderBooks(filterBooks());
}

async function loadStudents() {
  const data = await api("/usuarios");
  students = data.filter((user) => user.perfil === "LEITOR");
  renderStudents();
  renderLoanStudentOptions();
}

async function loadLoans() {
  loans = await api("/emprestimos");
  const exemplars = await Promise.all(books.map((book) => api(`/livros/${book.id}/exemplares`).catch(() => [])));
  const exemplarToBook = new Map();
  exemplars.forEach((items, index) => items.forEach((item) => exemplarToBook.set(item.id, books[index].id)));
  loans = loans.map((loan) => ({ ...loan, _livroId: exemplarToBook.get(loan.exemplar_id) }));
  renderLoans();
}

async function refreshData() {
  await loadBooks();
  await Promise.all([loadStudents(), loadLoans(), updateStats()]);
}

async function loadCurrentUser() {
  currentUser = await api("/auth/me");
  $("#userEmail").textContent = currentUser.email;
  $("#userRole").textContent = currentUser.perfil === "BIBLIOTECARIO" ? "Bibliotecário" : currentUser.perfil === "ADMIN" ? "Administrador" : "Leitor";
}

function openBook(id) {
  const book = books.find((item) => item.id === id);
  if (!book) return;
  const available = book.available > 0;
  $("#modalContent").innerHTML = `<div class="modal-cover">${initials(book.title)}</div><span class="badge ${available ? "available" : "unavailable"}">${available ? `${book.available} disponível(is)` : "Indisponível"}</span><h2>${escapeHtml(book.title)}</h2><p><strong>Autor:</strong> ${escapeHtml(book.author)}<br><strong>Categoria:</strong> ${escapeHtml(book.category)}<br><strong>Acervo:</strong> ${book.qty} exemplar(es)${book.year ? `<br><strong>Ano:</strong> ${book.year}` : ""}${book.publisher ? `<br><strong>Editora:</strong> ${escapeHtml(book.publisher)}` : ""}${book.isbn ? `<br><strong>ISBN:</strong> ${escapeHtml(book.isbn)}` : ""}</p>${available && currentUser?.perfil !== "LEITOR" ? `<div class="loan-form"><label>Aluno<select id="loanStudent" class="modal-select"></select></label><button class="primary-btn" id="loanBtn">Registrar empréstimo</button></div>` : available ? `<p>O usuário leitor pode realizar o empréstimo pela própria conta.</p>` : `<button class="primary-btn" disabled>Sem exemplares disponíveis</button>`}`;
  $("#bookModal").classList.remove("hidden");
  if (available && currentUser?.perfil !== "LEITOR") {
    renderLoanStudentOptions();
    $("#loanBtn").onclick = () => registerLoan(book.id);
  }
}

async function registerLoan(bookId) {
  const studentId = Number($("#loanStudent").value);
  if (!studentId) return toast("Selecione um aluno.", "error");
  try {
    const exemplars = await api(`/livros/${bookId}/exemplares`);
    const exemplar = exemplars.find((item) => item.status === "DISPONIVEL");
    if (!exemplar) throw new Error("Nenhum exemplar disponível.");
    await api("/emprestimos", { method: "POST", body: JSON.stringify({ exemplar_id: exemplar.id, usuario_id: studentId }) });
    $("#bookModal").classList.add("hidden");
    toast("Empréstimo registrado com sucesso!", "success");
    await refreshData();
  } catch (error) { toast(error.message, "error"); }
}

async function returnLoan(id) {
  try {
    await api(`/emprestimos/${id}/devolver`, { method: "POST" });
    toast("Livro devolvido com sucesso!", "success");
    await refreshData();
  } catch (error) { toast(error.message, "error"); }
}

function showPage(page) {
  $$(".page").forEach((section) => section.classList.add("hidden"));
  $(`#page-${page}`).classList.remove("hidden");
  $$(".nav-item[data-page]").forEach((item) => item.classList.toggle("active", item.dataset.page === page));
  const titles = { dashboard: "Visão geral", catalogo: "Catálogo de livros", livros: "Cadastrar livro", alunos: "Alunos", emprestimos: "Empréstimos", ajuda: "Ajuda" };
  $("#pageTitle").textContent = titles[page] || "Biblioteca";
  if (page === "catalogo") renderBooks(filterBooks());
  if (page === "alunos") renderStudents();
  if (page === "emprestimos") renderLoans();
}

async function handleLogin(event) {
  event.preventDefault();
  const email = $("#loginEmail").value.trim();
  const senha = $("#loginPassword").value;
  const submit = $("#loginForm button[type='submit']");
  submit.disabled = true;
  submit.textContent = "Entrando...";
  try {
    const form = new URLSearchParams();
    form.set("username", email);
    form.set("password", senha);
    const result = await api("/auth/login", { method: "POST", body: form, headers: { "Content-Type": "application/x-www-form-urlencoded" } });
    localStorage.setItem("bibliotecaToken", result.access_token);
    await loadCurrentUser();
    $("#loginScreen").classList.add("hidden");
    $("#app").classList.remove("hidden");
    await refreshData();
    toast("Login realizado com sucesso!", "success");
  } catch (error) { toast(error.message, "error"); }
  finally { submit.disabled = false; submit.textContent = "Entrar"; }
}

$("#loginForm").addEventListener("submit", handleLogin);
$("#togglePassword").onclick = () => { const password = $("#loginPassword"); password.type = password.type === "password" ? "text" : "password"; $("#togglePassword").textContent = password.type === "password" ? "Mostrar" : "Ocultar"; };
$("#logoutBtn").onclick = () => { localStorage.removeItem("bibliotecaToken"); currentUser = null; $("#app").classList.add("hidden"); $("#loginScreen").classList.remove("hidden"); $("#loginPassword").value = ""; };
$$("[data-page]").forEach((button) => button.addEventListener("click", () => showPage(button.dataset.page)));
$$("[data-page-jump]").forEach((button) => button.addEventListener("click", () => showPage(button.dataset.pageJump)));
$("#searchInput").addEventListener("input", () => renderBooks(filterBooks()));
$("#categoryFilter").addEventListener("change", () => renderBooks(filterBooks()));

$("#bookForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const quantity = Number($("#bookQty").value);
  const categoryName = $("#bookCategory").value.trim();
  if (!$("#bookTitle").value.trim() || !$("#bookAuthor").value.trim() || !categoryName || quantity < 1) return toast("Preencha corretamente os campos obrigatórios.", "error");
  try {
    let category = (await api("/categorias")).find((item) => item.nome.toLowerCase() === categoryName.toLowerCase());
    if (!category) category = await api("/categorias", { method: "POST", body: JSON.stringify({ nome: categoryName }) });
    const book = await api("/livros", { method: "POST", body: JSON.stringify({ titulo: $("#bookTitle").value.trim(), autor: $("#bookAuthor").value.trim(), categoria_id: category.id }) });
    for (let i = 1; i <= quantity; i++) await api(`/livros/${book.id}/exemplares`, { method: "POST", body: JSON.stringify({ tombo: `L${book.id}-${String(i).padStart(3, "0")}` }) });
    event.target.reset(); $("#bookQty").value = 1; toast("Livro e exemplares cadastrados com sucesso!", "success"); await refreshData(); showPage("catalogo");
  } catch (error) { toast(error.message, "error"); }
});

$("#studentForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = { nome: $("#studentName").value.trim(), email: $("#studentEmail").value.trim(), senha: $("#studentPassword").value, perfil: "LEITOR" };
  if (payload.senha.length < 6) return toast("A senha do aluno deve ter pelo menos 6 caracteres.", "error");
  try { await api("/usuarios", { method: "POST", body: JSON.stringify(payload) }); event.target.reset(); toast("Aluno cadastrado com sucesso!", "success"); await refreshData(); }
  catch (error) { toast(error.message, "error"); }
});

$("#closeModal").onclick = () => $("#bookModal").classList.add("hidden");
$("#bookModal").addEventListener("click", (event) => { if (event.target.id === "bookModal") $("#bookModal").classList.add("hidden"); });

async function initialize() {
  if (!localStorage.getItem("bibliotecaToken")) return;
  try {
    await loadCurrentUser();
    $("#loginScreen").classList.add("hidden"); $("#app").classList.remove("hidden"); await refreshData();
  } catch (error) {
    localStorage.removeItem("bibliotecaToken"); $("#app").classList.add("hidden"); $("#loginScreen").classList.remove("hidden"); toast("Sua sessão expirou. Faça login novamente.", "error");
  }
}

initialize();
