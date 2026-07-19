// =====================================================================
// SHARED CART MODULE — persisted with localStorage, used on every page
// =====================================================================
const CART_KEY = 'pelitaCartV1';
function loadCart(){ try{ return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch(e){ return []; } }
function saveCart(cart){ localStorage.setItem(CART_KEY, JSON.stringify(cart)); updateCartBadge(); }
function updateCartBadge(){ const count = loadCart().reduce((sum,i)=>sum+i.qty,0); document.querySelectorAll('#cartCount').forEach(el=> el.textContent = count); }
function addToCart(btn){
  const card = btn.closest('[data-product]'); if(!card) return;
  const id = card.dataset.id;
  const cart = loadCart();
  const existing = cart.find(i=>i.id===id);
  if(existing){ existing.qty += 1; } else { cart.push({ id, name: card.dataset.name, price: parseInt(card.dataset.price,10)||0, category: card.dataset.category||'', thumb: card.dataset.thumb||'t1', variant: card.dataset.variant||'', qty: 1 }); }
  saveCart(cart);
  const originalHTML = btn.innerHTML;
  btn.classList.add('added');
  btn.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>';
  setTimeout(()=>{ btn.classList.remove('added'); btn.innerHTML = originalHTML; }, 900);
}
document.addEventListener('DOMContentLoaded', updateCartBadge);

// =====================================================================
// HOME PAGE ONLY — hero carousel, cat-tabs
// =====================================================================
(function(){
  let slides = [];
  let current = 0;
  function renderSlide(){
    const el = document.getElementById('slideTag'); if(!el || !slides.length) return;
    const s = slides[current] || slides[0];
    document.getElementById('slideTag').textContent = s.tag || '';
    document.getElementById('slideTitle').textContent = s.title || '';
    document.getElementById('slideCap').textContent = (s.title || '').split(':')[0];
    document.getElementById('slideExcerpt').textContent = s.excerpt || '';
    document.getElementById('slideAuthor').textContent = s.author || '';
    document.getElementById('slideDate').textContent = s.date || '';
    document.getElementById('slideRead').textContent = s.read || '';
    document.getElementById('slideInitial').textContent = s.initial || 'P';
    document.getElementById('slideCount').textContent = '0'+(current+1)+' / 0'+slides.length;
    const img = document.getElementById('slideImage');
    img.className = 'hero-image ' + (s.thumb || 't1');
    if(s.imageUrl){ img.style.backgroundImage = `linear-gradient(0deg, rgba(8,26,48,.35), rgba(8,26,48,.08)), url('${s.imageUrl}')`; img.style.backgroundSize='cover'; img.style.backgroundPosition='center'; }
    else { img.style.backgroundImage = ''; }
    document.querySelectorAll('.hero-dots .dot').forEach((d,i)=>d.classList.toggle('active', i===current));
  }
  window.changeSlide = function(dir){ if(!slides.length) return; current = (current + dir + slides.length) % slides.length; renderSlide(); };
  window.goSlide = function(i){ current = i; renderSlide(); };
  function setSlides(data){ slides = (data?.heroSlides || window.PelitaCMS?.get()?.heroSlides || []); current = Math.min(current, Math.max(0, slides.length-1)); renderSlide(); }
  document.addEventListener('pelita:content-ready', e=> setSlides(e.detail));
  document.addEventListener('DOMContentLoaded', ()=>{
    if(!document.getElementById('slideTag')) return;
    setSlides(window.PelitaCMS?.get());
    setInterval(()=>changeSlide(1), 7000);
  });
  document.querySelectorAll('.cat-tabs a').forEach(tab=>{
    tab.addEventListener('click', (e)=>{ if(tab.getAttribute('href') === '#') e.preventDefault(); document.querySelectorAll('.cat-tabs a').forEach(t=>t.classList.remove('active')); tab.classList.add('active'); });
  });
})();
