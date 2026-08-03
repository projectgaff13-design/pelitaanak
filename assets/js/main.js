// Shared cart module — persisted with localStorage, used on every page
const CART_KEY = 'pelitaCartV1';
function loadCart(){ try{ return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch(e){ return []; } }
function saveCart(cart){ localStorage.setItem(CART_KEY, JSON.stringify(cart)); updateCartBadge(); }
function updateCartBadge(){ const count = loadCart().reduce((sum,i)=>sum+i.qty,0); document.querySelectorAll('#cartCount').forEach(el=> el.textContent = count); }
function addToCart(btn){
  const card = btn.closest('[data-product]'); if(!card) return;
  const id = card.dataset.id;
  const cart = loadCart();
  const existing = cart.find(i=>i.id===id);
  if(existing){ existing.qty += 1; }
  else { cart.push({ id, name: card.dataset.name, price: parseInt(card.dataset.price,10)||0, category: card.dataset.category||'', thumb: card.dataset.thumb||'t1', variant: card.dataset.variant||'', qty: 1 }); }
  saveCart(cart);
  const originalHTML = btn.innerHTML;
  btn.classList.add('added');
  btn.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>';
  setTimeout(()=>{ btn.classList.remove('added'); btn.innerHTML = originalHTML; }, 900);
}
function changeSlide(){}
function goSlide(){}
document.addEventListener('DOMContentLoaded', ()=>{
  updateCartBadge();
  document.querySelectorAll('.cat-tabs a').forEach(tab=>{
    tab.addEventListener('click', e=>{ if(tab.getAttribute('href') === '#') e.preventDefault(); document.querySelectorAll('.cat-tabs a').forEach(t=>t.classList.remove('active')); tab.classList.add('active'); });
  });
});
