// Página de post individual (lee ?id=slug y carga /posts/{slug}.json)
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

const params = new URLSearchParams(location.search);
const slug = params.get('id');

const titleEl = document.getElementById('postTitle');
const dateEl = document.getElementById('postDate');
const tagsEl = document.getElementById('postTags');
const contentEl = document.getElementById('content');
const coverEl = document.getElementById('cover');
const titleTag = document.getElementById('titleTag');

if(!slug){
  contentEl.innerHTML = '<p>No se encontró el identificador del post.</p>';
}else{
  load(slug);
}

async function load(slug){
  try{
    const res = await fetch(`./posts/${encodeURIComponent(slug)}.json`, { cache: 'no-cache' });
    if(!res.ok) throw new Error('No se encontró el post.');
    const post = await res.json();
    titleEl.textContent = post.title;
    titleTag.textContent = post.title + ' — El Punto de Vista Equivocado';
    dateEl.textContent = fmtDate(post.date);
    tagsEl.innerHTML = (post.tags||[]).map(t=>`<span class="tag">#${escapeHtml(t)}</span>`).join(' · ');
    if(post.cover){ coverEl.src = post.cover; coverEl.hidden = false; coverEl.alt = post.title; }
    // Render content: supports simple HTML or Markdown-ish line breaks
    const html = post.contentHtml || toHtml(post.content || '');
    contentEl.innerHTML = html;
  }catch(err){
    contentEl.innerHTML = `<p>${err.message}</p>`;
  }
}

function fmtDate(s){
  const d = new Date(s);
  return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: '2-digit' });
}

function escapeHtml(str=''){
  return str.replace(/[&<>"']/g, m => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  })[m]);
}

// Super simple Markdown->HTML (bold, italics, headings, links, paragraphs)
function toHtml(md){
  let h = escapeHtml(md);
  h = h.replace(/^### (.*)$/gim, '<h3>$1</h3>');
  h = h.replace(/^## (.*)$/gim, '<h2>$1</h2>');
  h = h.replace(/^# (.*)$/gim, '<h1>$1</h1>');
  h = h.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
  h = h.replace(/\*(.*?)\*/gim, '<em>$1</em>');
  h = h.replace(/`([^`]+)`/g, '<code>$1</code>');
  h = h.replace(/\[(.*?)\]\((https?:[^\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  h = h.replace(/\n\n/g, '</p><p>');
  return '<p>' + h + '</p>';
}
