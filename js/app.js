// Listado de posts
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

const listEl = document.getElementById('postList');
const pager = document.getElementById('pager');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const pageInfo = document.getElementById('pageInfo');
const qInput = document.getElementById('q');

let posts = [];
let filtered = [];
let page = 1;
const perPage = 9;

async function loadIndex(){
  try{
    const res = await fetch('./posts/index.json', { cache: 'no-cache' });
    if(!res.ok) throw new Error('No se pudo cargar posts/index.json');
    posts = await res.json();
    posts.sort((a,b)=> new Date(b.date) - new Date(a.date));
    filtered = posts;
    render();
  }catch(err){
    listEl.innerHTML = `<div class="prose"><h2>Error</h2><p>${err.message}</p></div>`;
  }
}

function render(){
  const start = (page-1)*perPage;
  const items = filtered.slice(start, start+perPage);
  listEl.innerHTML = items.map(card).join('');
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  pager.hidden = totalPages <= 1;
  prevBtn.disabled = page <= 1;
  nextBtn.disabled = page >= totalPages;
  pageInfo.textContent = `Página ${page} de ${totalPages}`;
}

function card(p){
  const tags = (p.tags||[]).map(t=>`<span class="tag">#${escapeHtml(t)}</span>`).join('');
  const cover = p.cover ? `<img class="cover" src="${p.cover}" alt="${escapeHtml(p.title)}" loading="lazy">` : '';
  return `<article class="card">
    <a href="./post.html?id=${encodeURIComponent(p.slug)}" style="text-decoration:none;color:inherit">
      ${cover}
      <h2 class="title-sm">${escapeHtml(p.title)}</h2>
      <p class="meta">${fmtDate(p.date)} · ${p.readingTime||'—'} min</p>
      <div class="tags">${tags}</div>
    </a>
  </article>`;
}

function fmtDate(s){
  const d = new Date(s);
  return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: '2-digit' });
}

function escapeHtml(str=''){
  return str.replace(/[&<>"']/g, m => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  })[m]);
}

prevBtn?.addEventListener('click', ()=>{ if(page>1){ page--; render(); } });
nextBtn?.addEventListener('click', ()=>{ page++; render(); });

qInput?.addEventListener('input', (e)=>{
  const q = e.target.value.toLowerCase().trim();
  if(!q){ filtered = posts; page = 1; render(); return; }
  filtered = posts.filter(p => 
    p.title.toLowerCase().includes(q) ||
    (p.tags||[]).some(t => t.toLowerCase().includes(q))
  );
  page = 1;
  render();
});

loadIndex();
