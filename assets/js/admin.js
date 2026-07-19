(function(){
  const sections = [
    {key:'ticker', label:'Terkini', fields:[['text','Teks berjalan']]},
    {key:'heroSlides', label:'Hero', fields:[['tag','Kategori'],['title','Judul'],['excerpt','Ringkasan'],['author','Penulis'],['date','Tanggal'],['read','Durasi baca'],['initial','Inisial'],['thumb','Tema gambar t1/t2/t3/t4'],['imageUrl','URL gambar']]},
    {key:'recent', label:'Beranda', fields:[['type','Jenis'],['title','Judul'],['meta','Meta'],['url','Link'],['thumb','Tema gambar'],['imageUrl','URL gambar']]},
    {key:'materi', label:'Materi', fields:[['tag','Kategori'],['title','Judul'],['body','Isi/Ringkasan'],['author','Penulis'],['initial','Inisial'],['thumb','Tema gambar'],['imageUrl','URL gambar']]},
    {key:'artikel', label:'Artikel', fields:[['tag','Kategori'],['title','Judul'],['body','Isi/Ringkasan'],['author','Penulis'],['initial','Inisial'],['thumb','Tema gambar'],['imageUrl','URL gambar']]},
    {key:'motherSharing', label:'Mother Sharing', fields:[['tag','Topik'],['title','Nama/Lokasi'],['time','Waktu'],['body','Isi postingan'],['replies','Balasan'],['likes','Suka'],['initial','Inisial'],['imageUrl','URL avatar/gambar']]},
    {key:'products', label:'Toko', fields:[['id','ID produk'],['name','Nama produk'],['category','Kategori'],['price','Harga angka'],['thumb','Tema gambar'],['imageUrl','URL gambar']]}
  ];
  let data = PelitaCMS.get();
  let active = sections[0].key;
  const tabs = document.getElementById('adminTabs');
  const editor = document.getElementById('adminEditor');
  const jsonBox = document.getElementById('jsonBox');
  const status = document.getElementById('adminStatus');
  const authBox = document.getElementById('authBox');

  function normalizeItem(section, item){ if(section.key === 'ticker') return {text: typeof item === 'string' ? item : (item.text || '')}; return {...item}; }
  function denormalize(section, item){ if(section.key === 'ticker') return item.text || ''; if(section.key === 'products') item.price = Number(item.price) || 0; return item; }
  function sectionItems(section){ return (data[section.key] || []).map(x=>normalizeItem(section,x)); }
  function escapeHtml(str){ return String(str ?? '').replace(/[&<>'"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
  function setStatus(text, kind='info'){ status.textContent = text; status.className = 'admin-status ' + kind; }

  async function refreshAuth(){
    const session = await PelitaCMS.getSession();
    const configured = PelitaCMS.configured();
    authBox.innerHTML = configured ? (session ? `<div class="admin-login-state"><b>Login:</b> ${escapeHtml(session.user.email)} <button class="btn btn-outline-navy" id="logoutBtn">Logout</button></div>` : `<div class="admin-login-grid"><input id="adminEmail" type="email" placeholder="Email admin Supabase"><input id="adminPassword" type="password" placeholder="Password"><button class="btn btn-primary" id="loginBtn">Login Admin</button></div>`) : `<div class="admin-warning">Supabase belum dikonfigurasi. Isi <code>assets/js/supabase-config.js</code> dulu.</div>`;
    document.getElementById('loginBtn')?.addEventListener('click', async()=>{ try{ await PelitaCMS.signIn(document.getElementById('adminEmail').value, document.getElementById('adminPassword').value); setStatus('Login berhasil.', 'ok'); await refreshAuth(); }catch(e){ setStatus(e.message, 'err'); } });
    document.getElementById('logoutBtn')?.addEventListener('click', async()=>{ await PelitaCMS.signOut(); await refreshAuth(); setStatus('Logout berhasil.','info'); });
  }
  function renderTabs(){ tabs.innerHTML = sections.map(s=>`<button class="${s.key===active?'active':''}" data-key="${s.key}">${s.label}</button>`).join(''); tabs.querySelectorAll('button').forEach(btn=>btn.addEventListener('click',()=>{ collect(); active=btn.dataset.key; render(); })); }
  function fieldInput(section, item, index, field){ const [name,label]=field; const value=item[name]||''; const area=['body','excerpt'].includes(name); return `<label><span>${label}</span>${area ? `<textarea data-index="${index}" data-field="${name}">${escapeHtml(value)}</textarea>` : `<input data-index="${index}" data-field="${name}" value="${escapeHtml(value)}">`}</label>`; }
  function render(){
    renderTabs();
    const section = sections.find(s=>s.key===active);
    const items = sectionItems(section);
    editor.innerHTML = `<div class="admin-editor-head"><h2>${section.label}</h2><button class="btn btn-outline-navy" id="addItemBtn">+ Tambah item</button></div>` + items.map((item,i)=>`<article class="admin-card"><div class="admin-card-head"><b>Item ${i+1}</b><button class="remove-item" data-remove="${i}">Hapus</button></div><div class="admin-fields">${section.fields.map(f=>fieldInput(section,item,i,f)).join('')}</div></article>`).join('');
    document.getElementById('addItemBtn').addEventListener('click',()=>{ collect(); const blank={}; section.fields.forEach(([k])=>blank[k]=''); data[section.key].push(denormalize(section,blank)); render(); });
    editor.querySelectorAll('[data-remove]').forEach(btn=>btn.addEventListener('click',()=>{ collect(); data[section.key].splice(Number(btn.dataset.remove),1); render(); }));
  }
  function collect(){ const section=sections.find(s=>s.key===active); if(!section) return; const items=sectionItems(section); editor.querySelectorAll('[data-index][data-field]').forEach(input=>{ const i=Number(input.dataset.index); const field=input.dataset.field; if(!items[i]) items[i]={}; items[i][field]=input.value; }); data[section.key]=items.map(item=>denormalize(section,item)); }
  async function save(){ try{ collect(); setStatus('Menyimpan ke Supabase...', 'info'); await PelitaCMS.save(data); jsonBox.value=JSON.stringify(data,null,2); setStatus('Konten berhasil tersimpan ke Supabase.', 'ok'); }catch(e){ setStatus(e.message, 'err'); } }

  document.getElementById('saveBtn').addEventListener('click', save);
  document.getElementById('exportBtn').addEventListener('click', ()=>{ collect(); jsonBox.value=JSON.stringify(data,null,2); jsonBox.focus(); jsonBox.select(); });
  document.getElementById('importBtn').addEventListener('click', ()=>{ try{ const next=JSON.parse(jsonBox.value); data=Object.assign(PelitaCMS.get(), next); render(); setStatus('JSON berhasil di-import. Klik Simpan untuk kirim ke Supabase.','ok'); }catch(e){ setStatus('JSON tidak valid.','err'); } });
  document.getElementById('resetBtn').addEventListener('click', ()=>{ if(confirm('Reset editor ke dummy awal? Belum menyimpan ke Supabase sampai klik Simpan.')){ data=JSON.parse(JSON.stringify(PelitaCMS.DEFAULT)); render(); } });
  PelitaCMS.ready().then(async(content)=>{ data=JSON.parse(JSON.stringify(content)); render(); await refreshAuth(); setStatus(PelitaCMS.configured() ? 'Konten dimuat. Login untuk menyimpan.' : 'Mode lokal: Supabase belum dikonfigurasi.', PelitaCMS.configured() ? 'info' : 'err'); });
})();
