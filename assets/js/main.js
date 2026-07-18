// ---- Hero carousel ----
  const slides = [
    {tag:"Materi Akademik", title:"Mengenali Pola Grooming Digital: Tinjauan Literatur untuk Orang Tua", excerpt:"Rangkuman studi psikologi perkembangan tentang bagaimana pelaku membangun kepercayaan bertahap secara daring, dan tanda yang bisa dikenali sejak dini oleh keluarga.", author:"Dr. Amelia Ratna, M.Psi", date:"12 Jul 2026", read:"9 menit baca", initial:"A", thumb:"t1"},
    {tag:"Mother Sharing", title:"Malam Ketika Saya Akhirnya Percaya Cerita Anak Saya", excerpt:"Ruang berbagi ibu tentang cara membangun percakapan aman bersama anak tanpa menghakimi pengalaman keluarga lain.", author:"Rina, Ibu dua anak", date:"5 Jul 2026", read:"6 menit baca", initial:"R", thumb:"t2"},
    {tag:"Toko Edukasi", title:"Cara Memilih Alat Bantu Edukasi Batas Tubuh yang Tepat untuk Usia Anak", excerpt:"Panduan singkat memilih permainan dan media edukasi yang sesuai tahap usia, dari prasekolah hingga sekolah dasar.", author:"Tim Pelita Anak", date:"1 Jul 2026", read:"4 menit baca", initial:"P", thumb:"t3"}
  ];
  let current = 0;
  function renderSlide(){
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
  function changeSlide(dir){ current = (current + dir + slides.length) % slides.length; renderSlide(); }
  function goSlide(i){ current = i; renderSlide(); }

  // ---- Add to cart & checkout ----
  const cartItems = [];
  let cartCount = 0;
  const productCatalog = {
    'Papan Cerita Batas Tubuh': { price:185000, variant:'Papan Cerita', initial:'P' },
    'Kartu "Aman / Tidak Aman"': { price:95000, variant:'Kartu Edukasi', initial:'K' },
    'Puzzle Lingkaran Kepercayaan': { price:120000, variant:'Puzzle', initial:'L' },
    'Panduan Guru: Modul Pencegahan': { price:75000, variant:'Modul Guru', initial:'M' }
  };
  function rupiah(value){ return new Intl.NumberFormat('id-ID', {style:'currency', currency:'IDR', maximumFractionDigits:0}).format(value).replace(/ /g,''); }
  function addToCart(btn){
    const card = btn.closest('.product-card');
    const title = card ? card.querySelector('h4')?.textContent.trim() : 'Produk Edukasi';
    const meta = productCatalog[title] || {price:0, variant:'Produk', initial:'P'};
    const existing = cartItems.find(item => item.title === title);
    if(existing){ existing.qty += 1; } else { cartItems.push({title, qty:1, ...meta}); }
    cartCount = cartItems.reduce((sum,item)=>sum+item.qty,0);
    document.getElementById('cartCount').textContent = cartCount;
    btn.classList.add('added');
    btn.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>';
    setTimeout(()=>{
      btn.classList.remove('added');
      btn.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>';
    }, 900);
    renderCheckout();
  }
  function renderCheckout(){
    const list = document.getElementById('checkoutItems');
    const empty = document.getElementById('checkoutEmpty');
    if(!list) return;
    list.innerHTML = cartItems.map((item,index)=>`<div class="checkout-row">
      <div class="checkout-product"><div class="checkout-mini-thumb">${item.initial}</div><div><b>${item.title}</b><small>Variasi: ${item.variant}</small></div></div>
      <span>${rupiah(item.price)}</span>
      <div class="checkout-qty"><button type="button" onclick="updateCartQty(${index},-1)">−</button><b>${item.qty}</b><button type="button" onclick="updateCartQty(${index},1)">+</button></div>
      <strong>${rupiah(item.price * item.qty)}</strong>
    </div>`).join('');
    if(empty) empty.style.display = cartItems.length ? 'none' : 'block';
    const subtotal = cartItems.reduce((sum,item)=>sum+(item.price*item.qty),0);
    const protection = cartItems.length ? 500 : 0;
    document.getElementById('checkoutSubtotal').textContent = rupiah(subtotal);
    document.getElementById('checkoutProtection').textContent = rupiah(protection);
    document.getElementById('checkoutTotal').textContent = rupiah(subtotal + protection);
  }
  function updateCartQty(index, delta){
    if(!cartItems[index]) return;
    cartItems[index].qty += delta;
    if(cartItems[index].qty <= 0) cartItems.splice(index,1);
    cartCount = cartItems.reduce((sum,item)=>sum+item.qty,0);
    document.getElementById('cartCount').textContent = cartCount;
    renderCheckout();
  }
  function openCheckout(){
    renderCheckout();
    document.getElementById('checkoutOverlay')?.classList.add('open');
    document.getElementById('checkoutOverlay')?.setAttribute('aria-hidden','false');
    document.body.classList.add('checkout-lock');
  }
  function closeCheckout(){
    document.getElementById('checkoutOverlay')?.classList.remove('open');
    document.getElementById('checkoutOverlay')?.setAttribute('aria-hidden','true');
    document.body.classList.remove('checkout-lock');
  }
  document.getElementById('cartIcon')?.addEventListener('click', openCheckout);
  document.querySelectorAll('[data-close-checkout]').forEach(el=>el.addEventListener('click', closeCheckout));
  document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') closeCheckout(); });

  // ---- Cat tabs ----
  document.querySelectorAll('.cat-tabs a').forEach(tab=>{
    tab.addEventListener('click', (e)=>{
      if(tab.getAttribute('href') === '#' ) e.preventDefault();
      document.querySelectorAll('.cat-tabs a').forEach(t=>t.classList.remove('active'));
      tab.classList.add('active');
    });
  });

  setInterval(()=>changeSlide(1), 7000);
