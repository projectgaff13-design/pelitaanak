// =====================================================================
// PELITA ANAK CMS — Supabase connected, with local fallback.
// Public pages read content from Supabase. Admin page writes after login.
// =====================================================================
(function(){
  const LOCAL_KEY = 'pelitaAdminContentV1';
  const cfg = window.PELITA_SUPABASE || {};
  const DEFAULT = {
    ticker: [
      'Kurikulum edukasi batas tubuh resmi masuk 12 sekolah mitra di Jabodetabek',
      'Webinar gratis: Mengenali grooming online, Sabtu ini pukul 10.00',
      'Modul guru baru: Panduan sesi kelompok kecil untuk kelas 1–3 SD'
    ],
    heroSlides: [
      {tag:'Materi Akademik', title:'Mengenali Pola Grooming Digital: Tinjauan Literatur untuk Orang Tua', excerpt:'Rangkuman studi psikologi perkembangan tentang bagaimana pelaku membangun kepercayaan bertahap secara daring, dan tanda yang bisa dikenali sejak dini oleh keluarga.', author:'Dr. Amelia Ratna, M.Psi', date:'12 Jul 2026', read:'9 menit baca', initial:'A', thumb:'t1', imageUrl:''},
      {tag:'Artikel Komunitas', title:'Malam Ketika Saya Akhirnya Percaya Cerita Anak Saya', excerpt:'Seorang ibu berbagi bagaimana ia belajar mengenali perubahan kecil pada anaknya, dan proses sulit sebelum akhirnya berani mencari bantuan.', author:'Rina, Ibu dua anak', date:'5 Jul 2026', read:'6 menit baca', initial:'R', thumb:'t2', imageUrl:''},
      {tag:'Toko Edukasi', title:'Cara Memilih Alat Bantu Edukasi Batas Tubuh yang Tepat untuk Usia Anak', excerpt:'Panduan singkat memilih permainan dan media edukasi yang sesuai tahap usia, dari prasekolah hingga sekolah dasar.', author:'Tim Pelita Anak', date:'1 Jul 2026', read:'4 menit baca', initial:'P', thumb:'t3', imageUrl:''}
    ],
    recent: [
      {type:'Materi', title:'Kurikulum Edukasi Batasan Tubuh untuk Kelas 1–3 SD', meta:'Tim Kurikulum · 7 menit', url:'materi.html', thumb:'t1', imageUrl:''},
      {type:'Artikel', title:'Malam Ketika Saya Akhirnya Percaya Cerita Anak Saya', meta:'Rina, Bandung · 6 menit', url:'artikel.html', thumb:'t2', imageUrl:''},
      {type:'Materi', title:'Peran Komunitas RT/RW dalam Deteksi Dini Kekerasan Anak', meta:'Jurnal Sosial · 10 menit', url:'materi.html', thumb:'t3', imageUrl:''},
      {type:'Artikel', title:'Yang Saya Pelajari Setelah 10 Tahun Mengajar Kelas 4 SD', meta:'Budi, Surabaya · 5 menit', url:'artikel.html', thumb:'t4', imageUrl:''}
    ],
    materi: [
      {tag:'Kurikulum', title:'Kurikulum Edukasi Batasan Tubuh untuk Kelas 1–3 SD', body:'Rancangan modul ajar bertahap untuk memperkenalkan konsep batas tubuh dan persetujuan sejak usia dini, lengkap dengan lembar aktivitas guru.', author:'Tim Kurikulum', initial:'T', thumb:'t1', imageUrl:''},
      {tag:'Riset', title:'Mengenali Pola Grooming Digital: Tinjauan Literatur untuk Orang Tua', body:'Rangkuman studi psikologi perkembangan tentang bagaimana pelaku membangun kepercayaan bertahap secara daring, dan tanda dini yang bisa dikenali keluarga.', author:'Dr. Amelia Ratna, M.Psi', initial:'A', thumb:'t2', imageUrl:''},
      {tag:'Riset', title:'Peran Komunitas RT/RW dalam Deteksi Dini Kekerasan Anak', body:'Studi kasus tentang bagaimana jaringan RT/RW dan posyandu dapat menjadi lapisan pengawasan pertama di tingkat lingkungan.', author:'Jurnal Sosial', initial:'J', thumb:'t3', imageUrl:''}
    ],
    artikel: [
      {tag:'Cerita Orang Tua', title:'Malam Ketika Saya Akhirnya Percaya Cerita Anak Saya', body:'Seorang ibu berbagi bagaimana ia belajar mengenali perubahan kecil pada anaknya, dan proses sulit sebelum akhirnya berani mencari bantuan.', author:'Rina, Bandung', initial:'R', thumb:'t2', imageUrl:''},
      {tag:'Cerita Guru', title:'Yang Saya Pelajari Setelah 10 Tahun Mengajar Kelas 4 SD', body:'Seorang guru berbagi pengamatan lapangan tentang tanda-tanda halus yang sering luput, dan cara membuka obrolan tanpa membuat siswa merasa dituduh.', author:'Budi, Surabaya', initial:'B', thumb:'t4', imageUrl:''},
      {tag:'Pendamping Komunitas', title:'Artikel dari Sesama Orang Tua Membuat Saya Merasa Tidak Sendirian', body:'Pengalaman menjadi pendamping komunitas — bagaimana berbagi cerita, bukan menggurui, ternyata jadi jembatan paling efektif.', author:'Sari Wulandari, Yogyakarta', initial:'S', thumb:'t3', imageUrl:''}
    ],
    motherSharing: [
      {tag:'Cerita Pengalaman', title:'Rina · Bandung', time:'2 hari lalu', body:'Bun, ada yang pernah coba ajak anak diskusi pakai kartu "aman/tidak aman"? Anak saya awalnya malu-malu, tapi lama-lama malah dia yang minta main lagi.', replies:'18 balasan', likes:'42 suka', initial:'R', imageUrl:''},
      {tag:'Tanya Jawab', title:'Sari Wulandari · Yogyakarta', time:'4 hari lalu', body:'Ibu-ibu, gimana cara paling natural mulai obrolan soal batas tubuh ke anak usia TK ya? Takut kalau terlalu serius malah bikin anak bingung.', replies:'27 balasan', likes:'35 suka', initial:'S', imageUrl:''},
      {tag:'Parenting', title:'Nia · Semarang', time:'5 hari lalu', body:'Setelah ikut webinar grooming online, saya jadi lebih sadar soal jejak digital anak. Sekarang tiap minggu kami luangkan waktu cerita gadget bareng.', replies:'12 balasan', likes:'29 suka', initial:'N', imageUrl:''}
    ],
    products: [
      {id:'papan-cerita', name:'Papan Cerita Batas Tubuh', category:'Papan Cerita', price:185000, thumb:'t1', imageUrl:''},
      {id:'kartu-aman', name:'Kartu "Aman / Tidak Aman"', category:'Kartu Edukasi', price:95000, thumb:'t2', imageUrl:''},
      {id:'puzzle-lingkaran', name:'Puzzle Lingkaran Kepercayaan', category:'Puzzle', price:120000, thumb:'t3', imageUrl:''},
      {id:'modul-guru', name:'Panduan Guru: Modul Pencegahan', category:'Modul Guru', price:75000, thumb:'t4', imageUrl:''}
    ]
  };
  let state = clone(DEFAULT);
  let client = null;
  let readyPromise = null;

  function clone(x){ return JSON.parse(JSON.stringify(x)); }
  function merge(base, extra){ return Object.assign(clone(base), extra || {}); }
  function configured(){ return cfg.url && cfg.anonKey && !String(cfg.url).includes('PROJECT_REF') && !String(cfg.anonKey).includes('ISI_SUPABASE'); }
  function getClient(){
    if(client) return client;
    if(!configured() || !window.supabase) return null;
    client = window.supabase.createClient(cfg.url, cfg.anonKey);
    return client;
  }
  function localGet(){ try{ return JSON.parse(localStorage.getItem(LOCAL_KEY)) || null; }catch(e){ return null; } }
  function localSave(data){ localStorage.setItem(LOCAL_KEY, JSON.stringify(data)); }

  async function load(){
    const sb = getClient();
    if(sb){
      const { data, error } = await sb.from(cfg.table || 'site_content').select('content').eq('id', cfg.rowId || 'main').maybeSingle();
      if(!error && data && data.content){
        state = merge(DEFAULT, data.content);
        localSave(state);
        return state;
      }
      console.warn('Supabase content fallback:', error?.message || 'empty row');
    }
    state = merge(DEFAULT, localGet());
    return state;
  }
  async function save(data){
    state = merge(DEFAULT, data);
    localSave(state);
    const sb = getClient();
    if(!sb) throw new Error('Supabase belum dikonfigurasi. Isi assets/js/supabase-config.js dulu.');
    const { data: userRes } = await sb.auth.getUser();
    if(!userRes?.user) throw new Error('Admin belum login.');
    const payload = { id: cfg.rowId || 'main', content: state, updated_by: userRes.user.id, updated_at: new Date().toISOString() };
    const { error } = await sb.from(cfg.table || 'site_content').upsert(payload, { onConflict:'id' });
    if(error) throw error;
    renderAll();
    return state;
  }
  async function signIn(email, password){
    const sb = getClient();
    if(!sb) throw new Error('Supabase belum dikonfigurasi.');
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if(error) throw error;
    return data;
  }
  async function signOut(){ const sb=getClient(); if(sb) await sb.auth.signOut(); }
  async function getSession(){ const sb=getClient(); if(!sb) return null; const { data } = await sb.auth.getSession(); return data.session; }
  function get(){ return state || merge(DEFAULT, localGet()); }
  function resetLocal(){ localStorage.removeItem(LOCAL_KEY); state = clone(DEFAULT); renderAll(); }
  function rupiah(n){ return new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(Number(n)||0).replace(/\u00a0/g,''); }
  function esc(str){ return String(str ?? '').replace(/[&<>'"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
  function bgStyle(item){ return item.imageUrl ? ` style="background-image:linear-gradient(0deg, rgba(8,26,48,.35), rgba(8,26,48,.15)), url('${esc(item.imageUrl)}'); background-size:cover; background-position:center;"` : ''; }
  function thumbClass(item, base){ return `${base} ${esc(item.thumb || 't1')}`; }

  function renderTicker(data){ const track=document.querySelector('.ticker-track'); if(!track) return; const items=[...(data.ticker||[]),...(data.ticker||[])]; track.innerHTML=items.map(t=>`<span>${esc(t)}</span>`).join(''); }
  function renderRecent(data){ const grid=document.querySelector('.recent-grid'); if(!grid) return; grid.innerHTML=(data.recent||[]).map(item=>`<a class="recent-card" href="${esc(item.url||'#')}"><div class="${thumbClass(item,'recent-thumb')}"${bgStyle(item)}><span class="tag">${esc(item.type)}</span></div><div class="recent-body"><h4>${esc(item.title)}</h4><div class="recent-meta"><span>${esc(item.meta||'')}</span></div></div></a>`).join(''); }
  function pubCard(item){ return `<a class="pub-card" href="#"><div class="${thumbClass(item,'pub-thumb')}"${bgStyle(item)}><span class="tag">${esc(item.tag)}</span><span class="dummy-flag">CMS</span></div><div class="pub-body"><h4>${esc(item.title)}</h4><p>${esc(item.body)}</p><div class="pub-meta"><div class="author"><div class="avatar-sm" style="width:26px;height:26px;font-size:11px;">${esc(item.initial||'P')}</div><span>${esc(item.author)}</span></div><span class="pub-read">Baca →</span></div></div></a>`; }
  function renderPublicationPage(key){ const grid=document.querySelector('.pub-grid'); if(!grid) return; grid.innerHTML=(get()[key]||[]).map(pubCard).join(''); }
  function renderForum(){ const list=document.querySelector('.forum-list'); if(!list) return; list.innerHTML=(get().motherSharing||[]).map(item=>`<div class="forum-post"><div class="forum-head"><div class="forum-avatar"${item.imageUrl ? ` style="background-image:url('${esc(item.imageUrl)}'); background-size:cover; color:transparent;"` : ''}>${esc(item.initial||'M')}</div><div><b>${esc(item.title)}</b><span>${esc(item.time)}</span></div><div class="forum-tag">${esc(item.tag)}</div></div><p>${esc(item.body)}</p><div class="forum-foot"><span>💬 ${esc(item.replies)}</span><span>❤️ ${esc(item.likes)}</span></div></div>`).join(''); }
  function productCard(item){ const id=item.id||item.name.toLowerCase().replace(/[^a-z0-9]+/g,'-'); return `<div class="product-card" data-product data-id="${esc(id)}" data-name="${esc(item.name)}" data-price="${Number(item.price)||0}" data-category="${esc(item.category)}" data-thumb="${esc(item.thumb||'t1')}"><div class="${thumbClass(item,'product-thumb')}"${bgStyle(item)}><svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.3" opacity=".85"><rect x="3" y="4" width="18" height="14" rx="2"/><path d="M3 9h18M9 4v14"/></svg></div><div class="product-body"><div class="product-cat">${esc(item.category)}</div><h4>${esc(item.name)}</h4><div class="product-foot"><span class="price">${rupiah(item.price)}</span><button class="add-btn" onclick="addToCart(this)"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg></button></div></div></div>`; }
  function renderProducts(){ const grid=document.querySelector('.shop-grid'); if(!grid) return; grid.innerHTML=(get().products||[]).map(productCard).join(''); }
  function renderAll(){ const data=get(); renderTicker(data); renderRecent(data); renderProducts(); const path=location.pathname.split('/').pop()||'index.html'; if(path==='materi.html') renderPublicationPage('materi'); if(path==='artikel.html') renderPublicationPage('artikel'); if(path==='mother-sharing.html') renderForum(); if(path==='toko.html') renderProducts(); document.dispatchEvent(new CustomEvent('pelita:content-ready',{detail:data})); }
  function ready(){ if(!readyPromise){ readyPromise = load().then(()=>{ renderAll(); return state; }); } return readyPromise; }

  window.PelitaCMS = {LOCAL_KEY, DEFAULT, configured, getClient, get, load, save, signIn, signOut, getSession, ready, resetLocal, renderAll, rupiah};
  document.addEventListener('DOMContentLoaded', ready);
})();
