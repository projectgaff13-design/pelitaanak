(function(){
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money=n=>'Rp'+new Intl.NumberFormat('id-ID').format(Number(n)||0);
  function empty(target,msg){ if(target) target.innerHTML=`<div class="empty-state"><h3>${esc(msg)}</h3></div>`; }
  async function safe(label,fn){ try{return await fn();}catch(e){console.error('[Public CMS]',label,e); return null;} }
  async function boot(){
    if(!window.CMSApi?.configured()){ console.warn('[Public CMS] Supabase belum dikonfigurasi; konten database tidak dimuat.'); return; }
    const page=(location.pathname.split('/').pop()||'index.html');
    await safe('boot '+page, async()=>{
      if(page==='index.html' || page===''){
        const banners=await CMSApi.list('banners',{published:true,limit:5});
        if(banners[0]){ const b=banners[0]; const title=document.getElementById('slideTitle'); if(title) title.textContent=b.title||''; const ex=document.getElementById('slideExcerpt'); if(ex) ex.textContent=b.subtitle||''; const im=document.getElementById('slideImage'); if(im&&b.image_url) im.style.backgroundImage=`url('${esc(b.image_url)}')`; }
        const products=await CMSApi.list('products',{published:true,limit:6}); const shop=document.querySelector('.shop-grid'); if(shop && products.length) renderProducts(shop,products);
      }
      if(page==='artikel.html'||page==='materi.html'){
        const rows=await CMSApi.list('articles',{published:true}); const grid=document.querySelector('.pub-grid');
        if(!rows.length) return empty(grid,'Tidak ada data artikel/materi.');
        if(grid) grid.innerHTML=rows.map(r=>`<a class="pub-card" href="#"><div class="pub-thumb" style="${r.thumbnail_url?`background-image:url('${esc(r.thumbnail_url)}');background-size:cover;background-position:center;`:''}"><span class="tag">${esc(r.category_name||'Artikel')}</span></div><div class="pub-body"><h4>${esc(r.title)}</h4><p>${esc(r.excerpt||r.body||'')}</p><div class="pub-meta"><div class="author"><span>${esc(r.author||'Admin')}</span></div><span class="pub-read">Baca →</span></div></div></a>`).join('');
      }
      if(page==='toko.html'){
        const rows=await CMSApi.list('products',{published:true}); const grid=document.querySelector('.shop-grid'); if(!rows.length) return empty(grid,'Tidak ada data produk.'); renderProducts(grid,rows);
      }
      if(page==='mother-sharing.html'){
        const rows=await CMSApi.list('mother',{published:true}); const list=document.querySelector('.forum-list'); if(!rows.length) return empty(list,'Tidak ada data Mother Sharing.');
        if(list) list.innerHTML=rows.map(r=>`<div class="forum-post"><div class="forum-head"><div class="forum-avatar" style="${r.image_url?`background-image:url('${esc(r.image_url)}');background-size:cover;color:transparent;`:''}">${esc((r.author||'M')[0])}</div><div><b>${esc(r.author||r.title)}</b><span>${r.published_at?new Date(r.published_at).toLocaleDateString('id-ID'):''}</span></div><div class="forum-tag">${esc(r.category_name||'Sharing')}</div></div><p>${esc(r.body||'')}</p></div>`).join('');
      }
      if(page==='permainan.html'){
        const rows=await CMSApi.list('games',{published:true}); if(rows.length) window.CMS_GAMES=rows;
      }
    });
  }
  function renderProducts(grid, rows){ if(!grid) return; grid.innerHTML=rows.map(r=>`<div class="product-card" data-product data-id="${esc(r.slug||r.id)}" data-name="${esc(r.name)}" data-price="${Number(r.price)||0}" data-category="${esc(r.category_name||'Produk')}" data-thumb="t1"><div class="product-thumb" style="${r.image_url?`background-image:url('${esc(r.image_url)}');background-size:cover;background-position:center;`:''}"></div><div class="product-body"><div class="product-cat">${esc(r.category_name||'Produk')}</div><h4>${esc(r.name)}</h4><p class="product-desc">${esc(r.description||'')}</p><div class="product-foot"><span class="price">${money(r.price)}</span>${r.buy_link?`<a class="add-btn" href="${esc(r.buy_link)}" target="_blank" rel="noopener">↗</a>`:`<button class="add-btn" onclick="addToCart(this)">+</button>`}</div></div></div>`).join(''); }
  document.addEventListener('DOMContentLoaded',boot);
})();
