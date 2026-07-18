// =====================================================================
// SHARED CART MODULE — persisted with localStorage, used on every page
// (Demo/dummy data only — this is a static-site prototype, no real
// backend or payment processing is connected.)
// =====================================================================
const CART_KEY = 'pelitaCartV1';

function loadCart(){
  try{ return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch(e){ return []; }
}
function saveCart(cart){
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}
function updateCartBadge(){
  const count = loadCart().reduce((sum,i)=>sum+i.qty,0);
  document.querySelectorAll('#cartCount').forEach(el=> el.textContent = count);
}

// Add a product to the cart. Called from product cards that carry
// data-id / data-name / data-price / data-category / data-thumb on a
// `[data-product]` ancestor of the clicked button.
function addToCart(btn){
  const card = btn.closest('[data-product]');
  if(!card) return;
  const id = card.dataset.id;
  const cart = loadCart();
  const existing = cart.find(i=>i.id===id);
  if(existing){
    existing.qty += 1;
  }else{
    cart.push({
      id,
      name: card.dataset.name,
      price: parseInt(card.dataset.price, 10) || 0,
      category: card.dataset.category || '',
      thumb: card.dataset.thumb || 't1',
      variant: card.dataset.variant || '',
      qty: 1
    });
  }
  saveCart(cart);

  const originalHTML = btn.innerHTML;
  btn.classList.add('added');
  btn.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>';
  setTimeout(()=>{
    btn.classList.remove('added');
    btn.innerHTML = originalHTML;
  }, 900);
}

document.addEventListener('DOMContentLoaded', updateCartBadge);

// =====================================================================
// HOME PAGE ONLY — hero carousel, cat-tabs (guarded so other pages
// that don't have these elements don't throw errors)
// =====================================================================
(function(){
  const slides = [
    {tag:"Materi Akademik", title:"Mengenali Pola Grooming Digital: Tinjauan Literatur untuk Orang Tua", excerpt:"Rangkuman studi psikologi perkembangan tentang bagaimana pelaku membangun kepercayaan bertahap secara daring, dan tanda yang bisa dikenali sejak dini oleh keluarga.", author:"Dr. Amelia Ratna, M.Psi", date:"12 Jul 2026", read:"9 menit baca", initial:"A", thumb:"t1"},
    {tag:"Artikel Komunitas", title:"Malam Ketika Saya Akhirnya Percaya Cerita Anak Saya", excerpt:"Seorang ibu berbagi bagaimana ia belajar mengenali perubahan kecil pada anaknya, dan proses sulit sebelum akhirnya berani mencari bantuan.", author:"Rina, Ibu dua anak", date:"5 Jul 2026", read:"6 menit baca", initial:"R", thumb:"t2"},
    {tag:"Toko Edukasi", title:"Cara Memilih Alat Bantu Edukasi Batas Tubuh yang Tepat untuk Usia Anak", excerpt:"Panduan singkat memilih permainan dan media edukasi yang sesuai tahap usia, dari prasekolah hingga sekolah dasar.", author:"Tim Pelita Anak", date:"1 Jul 2026", read:"4 menit baca", initial:"P", thumb:"t3"}
  ];
  let current = 0;
  function renderSlide(){
    const el = document.getElementById('slideTag');
    if(!el) return; // not on this page
    const s = slides[current];
    document.getElementById('slideTag').textContent = s.tag;
    document.getElementById('slideTitle').textContent = s.title;
    document.getElementById('slideCap').textContent = s.title.split(':')[0];
    document.getElementById('slideExcerpt').textContent = s.excerpt;
    document.getElementById('slideAuthor').textContent = s.author;
    document.getElementById('slideDate').textContent = s.date;
    document.getElementById('slideRead').textContent = s.read;
    document.getElementById('slideInitial').textContent = s.initial;
    document.getElementById('slideCount').textContent = '0'+(current+1)+' / 0'+slides.length;
    const img = document.getElementById('slideImage');
    img.className = 'hero-image ' + s.thumb;
    document.querySelectorAll('.hero-dots .dot').forEach((d,i)=>d.classList.toggle('active', i===current));
  }
  window.changeSlide = function(dir){ current = (current + dir + slides.length) % slides.length; renderSlide(); };
  window.goSlide = function(i){ current = i; renderSlide(); };

  document.addEventListener('DOMContentLoaded', ()=>{
    if(!document.getElementById('slideTag')) return;
    renderSlide();
    setInterval(()=>changeSlide(1), 7000);
  });

  document.querySelectorAll('.cat-tabs a').forEach(tab=>{
    tab.addEventListener('click', (e)=>{
      if(tab.getAttribute('href') === '#') e.preventDefault();
      document.querySelectorAll('.cat-tabs a').forEach(t=>t.classList.remove('active'));
      tab.classList.add('active');
    });
  });
})();
