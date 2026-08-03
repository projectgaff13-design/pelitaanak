(function(){
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money = n => 'Rp' + new Intl.NumberFormat('id-ID').format(Number(n) || 0);
  const pageName = () => {
    const raw = (location.pathname.split('/').filter(Boolean).pop() || 'index').toLowerCase();
    return raw.replace(/\.html$/,'') || 'index';
  };
  function setEmpty(target, title, text='Konten akan tampil setelah ditambahkan dan dipublish dari Admin.'){
    if(target) target.innerHTML = `<div class="empty-state"><h3>${esc(title)}</h3><p>${esc(text)}</p></div>`;
  }
  async function safe(label, fn){ try { return await fn(); } catch(e){ console.error('[Public CMS]', label, e); return null; } }
  function imgStyle(url){ return url ? `background-image:url('${esc(url)}');background-size:cover;background-position:center;` : ''; }
  function articleCards(rows){
    return rows.map(r => `<a class="pub-card" href="#"><div class="pub-thumb" style="${imgStyle(r.thumbnail_url || r.image_url)}"><span class="tag">${esc(r.category_name || 'Artikel')}</span></div><div class="pub-body"><h4>${esc(r.title)}</h4><p>${esc(r.excerpt || r.body || '')}</p><div class="pub-meta"><div class="author"><span>${esc(r.author || 'Admin')}</span></div><span class="pub-read">Baca →</span></div></div></a>`).join('');
  }
  function recentCards(rows){
    return rows.map(r => `<a class="recent-card" href="artikel.html"><div class="recent-thumb" style="${imgStyle(r.thumbnail_url || r.image_url)}"><span class="tag">${esc(r.category_name || 'Publikasi')}</span></div><div class="recent-body"><h4>${esc(r.title)}</h4><div class="recent-meta"><span>${esc(r.author || 'Admin')}</span><span>·</span><span>${r.published_at ? new Date(r.published_at).toLocaleDateString('id-ID') : 'Publish'}</span></div></div></a>`).join('');
  }
  function renderProducts(grid, rows){
    if(!grid) return;
    if(!rows.length) return setEmpty(grid, 'Belum ada produk.', 'Produk akan tampil setelah dipublish dari Admin.');
    grid.innerHTML = rows.map(r => `<div class="product-card" data-product data-id="${esc(r.slug || r.id)}" data-name="${esc(r.name)}" data-price="${Number(r.price)||0}" data-category="${esc(r.category_name || 'Produk')}" data-thumb="t1"><div class="product-thumb" style="${imgStyle(r.image_url || r.thumbnail_url)}"></div><div class="product-body"><div class="product-cat">${esc(r.category_name || 'Produk')}</div><h4>${esc(r.name)}</h4><p class="product-desc">${esc(r.description || '')}</p><div class="product-foot"><span class="price">${money(r.price)}</span>${r.buy_link ? `<a class="add-btn" href="${esc(r.buy_link)}" target="_blank" rel="noopener">↗</a>` : `<button class="add-btn" onclick="addToCart(this)">+</button>`}</div></div></div>`).join('');
  }
  function renderMother(list, rows){
    if(!list) return;
    if(!rows.length) return setEmpty(list, 'Belum ada posting Mother Sharing.', 'Posting akan tampil setelah dipublish dari Admin.');
    list.innerHTML = rows.map(r => `<div class="forum-post"><div class="forum-head"><div class="forum-avatar" style="${r.image_url ? `background-image:url('${esc(r.image_url)}');background-size:cover;color:transparent;` : ''}">${esc((r.author || r.title || 'M')[0])}</div><div><b>${esc(r.author || r.title)}</b><span>${r.published_at ? new Date(r.published_at).toLocaleDateString('id-ID') : ''}</span></div><div class="forum-tag">${esc(r.category_name || 'Sharing')}</div></div><p>${esc(r.body || '')}</p></div>`).join('');
  }
  function setHeroBanner(b){
    if(!b) return;
    const title = document.getElementById('slideTitle'); if(title) title.textContent = b.title || '';
    const ex = document.getElementById('slideExcerpt'); if(ex) ex.textContent = b.subtitle || '';
    const tag = document.getElementById('slideTag'); if(tag) tag.textContent = 'Banner';
    const cap = document.getElementById('slideCap'); if(cap) cap.textContent = b.title || '';
    const img = document.getElementById('slideImage'); if(img && b.image_url) img.style.backgroundImage = `linear-gradient(0deg, rgba(8,26,48,.35), rgba(8,26,48,.08)), url('${esc(b.image_url)}')`;
  }
  async function boot(){
    if(!window.CMSApi?.configured()){ console.warn('[Public CMS] Supabase belum dikonfigurasi.'); return; }
    const page = pageName();
    await safe('boot '+page, async () => {
      if(page === 'index'){
        const [banners, articles, products, mother] = await Promise.all([
          CMSApi.list('banners', {published:true, limit:5}),
          CMSApi.list('articles', {published:true, limit:5}),
          CMSApi.list('products', {published:true, limit:5}),
          CMSApi.list('mother', {published:true, limit:5})
        ]);
        setHeroBanner(banners[0]);
        const recent = document.querySelector('.recent-grid');
        if(recent) articles.length ? recent.innerHTML = recentCards(articles) : setEmpty(recent, 'Belum ada publikasi terbaru.');
        renderProducts(document.querySelector('.shop-grid'), products);
        renderMother(document.querySelector('.forum-list'), mother);
        return;
      }
      if(page === 'artikel' || page === 'materi'){
        const rows = (await CMSApi.list('articles', {published:true, limit:1000})).slice().reverse();
        const grid = document.querySelector('.pub-grid');
        if(grid) rows.length ? grid.innerHTML = articleCards(rows) : setEmpty(grid, 'Belum ada publikasi.');
        return;
      }
      if(page === 'toko'){
        const rows = (await CMSApi.list('products', {published:true, limit:1000})).slice().reverse();
        renderProducts(document.querySelector('.shop-grid'), rows);
        return;
      }
      if(page === 'mother-sharing'){
        const rows = (await CMSApi.list('mother', {published:true, limit:1000})).slice().reverse();
        renderMother(document.querySelector('.forum-list'), rows);
        return;
      }
      if(page === 'permainan'){
        window.CMS_GAMES = (await CMSApi.list('games', {published:true, limit:1000})).slice().reverse();
        document.dispatchEvent(new CustomEvent('pelita:games-ready', { detail: window.CMS_GAMES }));
      }
    });
  }
  document.addEventListener('DOMContentLoaded', boot);
})();
