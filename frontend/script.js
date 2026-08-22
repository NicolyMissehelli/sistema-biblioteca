const API_URL = window.APP_CONFIG?.API_URL || "http://localhost:3000/api";
const defaultBooks=[
 {id:1,title:"Clean Code",author:"Robert C. Martin",category:"Programação",qty:3,available:2,description:"Princípios e boas práticas para escrever código limpo, legível e sustentável."},
 {id:2,title:"O Hobbit",author:"J. R. R. Tolkien",category:"Fantasia",qty:2,available:2,description:"Uma aventura clássica pela Terra-média, acompanhando Bilbo Bolseiro."},
 {id:3,title:"Dom Casmurro",author:"Machado de Assis",category:"Literatura",qty:2,available:0,description:"Um dos grandes clássicos da literatura brasileira."},
 {id:4,title:"Algoritmos",author:"Thomas H. Cormen",category:"Computação",qty:4,available:3,description:"Referência sobre algoritmos, estruturas e fundamentos da computação."},
 {id:5,title:"Banco de Dados",author:"Carlos A. Heuser",category:"Banco de Dados",qty:2,available:1,description:"Fundamentos para modelagem e desenvolvimento de bancos de dados."},
 {id:6,title:"1984",author:"George Orwell",category:"Ficção",qty:2,available:2,description:"Romance distópico sobre vigilância, poder e controle social."}
];

let books=JSON.parse(localStorage.getItem("novarisBooks")||"null")||defaultBooks;
async function loadBooks(){
  try {
    const response = await fetch(`${API_URL}/livros`);
    const data = await response.json();

    books = data.map(livro => ({
      id: livro.id,
      title: livro.titulo,
      author: livro.autor,
      category: livro.categoria,
      qty: livro.quantidade,
      available: livro.disponiveis,
      description: livro.descricao || "Sem descrição cadastrada."
    }));

    renderBooks();
    updateStats();

  } catch(error){
    console.error("Erro ao carregar livros:", error);
  }
}
let students=JSON.parse(localStorage.getItem("novarisStudents")||"null")||[
 {id:1,name:"Ana Souza",email:"ana@novaris.com"},
 {id:2,name:"Lucas Silva",email:"lucas@novaris.com"}
];

const $=s=>document.querySelector(s);
const $$=s=>document.querySelectorAll(s);
const save=()=>{localStorage.setItem("novarisBooks",JSON.stringify(books));localStorage.setItem("novarisStudents",JSON.stringify(students))};
const toast=(msg)=>{const t=$("#toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2400)};

function bookCard(b){
 const ok=b.available>0;
 return `<article class="book-card" data-id="${b.id}">
   <div class="book-cover">${b.title.split(" ").map(x=>x[0]).slice(0,2).join("")}</div>
   <h4 title="${b.title}">${b.title}</h4>
   <p>${b.author} · ${b.category}</p>
   <span class="badge ${ok?"available":"unavailable"}">${ok?`${b.available} disponível(is)`:"Indisponível"}</span>
 </article>`;
}

function renderBooks(list=books){
 $("#catalogGrid").innerHTML=list.length?list.map(bookCard).join(""):`<div class="form-card"><strong>Nenhum livro encontrado.</strong><p>Tente outro título, autor ou categoria.</p></div>`;
 $("#featuredBooks").innerHTML=books.slice(0,4).map(bookCard).join("");
 $$(".book-card").forEach(c=>c.addEventListener("click",()=>openBook(Number(c.dataset.id))));
 const categories=[...new Set(books.map(b=>b.category))].sort();
 $("#categoryFilter").innerHTML=`<option value="">Todas as categorias</option>`+categories.map(c=>`<option>${c}</option>`).join("");
}

async function updateStats(){
  try {
    const response = await fetch(`${API_URL}/dashboard`);
    const data = await response.json();

    $("#statBooks").textContent = data.livros;
    $("#statAvailable").textContent = data.disponiveis;
    $("#statStudents").textContent = data.alunos;
    $("#statLoans").textContent = data.emprestimos;

  } catch (error) {
    console.error("Erro ao buscar dashboard:", error);
  }
}

function renderStudents(){
 $("#studentsList").innerHTML=`<h3>Alunos cadastrados (${students.length})</h3>`+
 (students.length?students.map(s=>`<div class="student-row"><div><strong>${s.name}</strong><span>${s.email}</span></div><span class="badge available">Ativo</span></div>`).join(""):"<p>Nenhum aluno cadastrado.</p>");
}

function openBook(id){
 const b=books.find(x=>x.id===id); if(!b)return;
 $("#modalContent").innerHTML=`<div class="modal-cover">${b.title.split(" ").map(x=>x[0]).slice(0,2).join("")}</div>
 <span class="badge ${b.available?"available":"unavailable"}">${b.available?`${b.available} disponível(is)`:"Indisponível"}</span>
 <h2>${b.title}</h2><p><strong>Autor:</strong> ${b.author}<br><strong>Categoria:</strong> ${b.category}<br><strong>Acervo:</strong> ${b.qty} exemplar(es)</p>
 <p>${b.description||"Sem descrição cadastrada."}</p>
 ${b.available?`<button class="primary-btn" id="loanBtn">Registrar empréstimo</button>`:"<button class='primary-btn' disabled>Sem exemplares disponíveis</button>"}`;
 $("#bookModal").classList.remove("hidden");
 const btn=$("#loanBtn");
 if(btn)btn.onclick=()=>{b.available--;save();updateStats();renderBooks(filterBooks());$("#bookModal").classList.add("hidden");toast("Empréstimo registrado com sucesso!");};
}

function filterBooks(){
 const q=$("#searchInput").value.toLowerCase().trim(),cat=$("#categoryFilter").value;
 return books.filter(b=>(!q||`${b.title} ${b.author} ${b.category}`.toLowerCase().includes(q))&&(!cat||b.category===cat));
}

function showPage(page){
 $$(".page").forEach(p=>p.classList.add("hidden"));
 $(`#page-${page}`).classList.remove("hidden");
 $$(".nav-item[data-page]").forEach(n=>n.classList.toggle("active",n.dataset.page===page));
 const titles={dashboard:"Visão geral",catalogo:"Catálogo de livros",livros:"Cadastrar livro",alunos:"Alunos",ajuda:"Ajuda"};
 $("#pageTitle").textContent=titles[page]||"Biblioteca";
 if(page==="catalogo")renderBooks(filterBooks());
 if(page==="alunos")renderStudents();
}

$("#loginForm").addEventListener("submit",e=>{
 e.preventDefault();
 if($("#loginPassword").value.length<4)return toast("A senha precisa ter pelo menos 4 caracteres.");
 localStorage.setItem("novarisUser",$("#loginEmail").value);
 $("#userEmail").textContent=$("#loginEmail").value;
 $("#loginScreen").classList.add("hidden");$("#app").classList.remove("hidden");
 updateStats();renderBooks();
});

$("#togglePassword").onclick=()=>{const p=$("#loginPassword");p.type=p.type==="password"?"text":"password";$("#togglePassword").textContent=p.type==="password"?"Mostrar":"Ocultar"};

$("#logoutBtn").onclick=()=>{localStorage.removeItem("novarisUser");$("#app").classList.add("hidden");$("#loginScreen").classList.remove("hidden")};

$$("[data-page]").forEach(b=>b.addEventListener("click",()=>showPage(b.dataset.page)));
$$("[data-page-jump]").forEach(b=>b.addEventListener("click",()=>showPage(b.dataset.pageJump)));

$("#searchInput").addEventListener("input",()=>renderBooks(filterBooks()));
$("#categoryFilter").addEventListener("change",()=>renderBooks(filterBooks()));

$("#bookForm").addEventListener("submit",e=>{
 e.preventDefault();
 const qty=Number($("#bookQty").value);
 books.unshift({id:Date.now(),title:$("#bookTitle").value.trim(),author:$("#bookAuthor").value.trim(),category:$("#bookCategory").value.trim(),qty,available:qty,description:$("#bookDescription").value.trim()});
 save();e.target.reset();$("#bookQty").value=1;updateStats();renderBooks();toast("Livro cadastrado com sucesso!");showPage("catalogo");
});

$("#studentForm").addEventListener("submit",e=>{
 e.preventDefault();
 students.push({id:Date.now(),name:$("#studentName").value.trim(),email:$("#studentEmail").value.trim()});
 save();e.target.reset();updateStats();renderStudents();toast("Aluno cadastrado com sucesso!");
});

$("#closeModal").onclick=()=>$("#bookModal").classList.add("hidden");
$("#bookModal").addEventListener("click",e=>{if(e.target.id==="bookModal")$("#bookModal").classList.add("hidden")});

const storedUser=localStorage.getItem("novarisUser");
if(storedUser){$("#userEmail").textContent=storedUser;$("#loginScreen").classList.add("hidden");$("#app").classList.remove("hidden");}
loadBooks();
renderStudents();
