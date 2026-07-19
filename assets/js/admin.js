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
  function getBucket(){ return window.PELITA_SUPABASE?.bucket || PelitaCMS.config?.bucket || 'pelita-images'; }

  async function refreshAuth(){
    const session = await PelitaCMS.getSession();
    const configured = PelitaCMS.configured();
    authBox.innerHTML = configured ? (session ? `<div class="admin-login-state"><b>Login:</b> ${escapeHtml(session.user.email)} <button class="btn btn-outline-navy" id="logoutBtn">Logout</button></div>` : `<div class="admin-login-grid"><input id="adminEmail" type="email" placeholder="Email admin Supabase"><input id="adminPassword" type="password" placeholder="Password"><button class="btn btn-primary" id="loginBtn">Login Admin</button></div>`) : `<div class="admin-warning">Supabase belum dikonfigurasi. Isi <code>assets/js/supabase-config.js</code> dulu.</div>`;
    document.getElementById('loginBtn')?.addEventListener('click', async()=>{ try{ await PelitaCMS.signIn(document.getElementById('adminEmail').value, document.getElementById('adminPassword').value); setStatus('Login berhasil.', 'ok'); await refreshAuth(); }catch(e){ setStatus(e.message, 'err'); } });
    document.getElementById('logoutBtn')?.addEventListener('click', async()=>{ await PelitaCMS.signOut(); await refreshAuth(); setStatus('Logout berhasil.','info'); });
  }
  function renderTabs(){ tabs.innerHTML = sections.map(s=>`<button class="${s.key===active?'active':''}" data-key="${s.key}">${s.label}</button>`).join(''); tabs.querySelectorAll('button').forEach(btn=>btn.addEventListener('click',()=>{ collect(); active=btn.dataset.key; render(); })); }
  function imageUploadControl(index, value){
    const preview = value ? `<img class="admin-image-preview" src="${escapeHtml(value)}" alt="Preview gambar">` : `<div class="admin-image-empty">Belum ada gambar</div>`;
    return `<div class="admin-upload-box" data-upload-box="${index}">
      ${preview}
      <div class="admin-upload-actions">
        <input data-index="${index}" data-field="imageUrl" value="${escapeHtml(value)}" placeholder="URL gambar / hasil upload">
        <label class="admin-upload-btn">Upload gambar<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" data-upload="${index}"></label>
      </div>
      <small>Upload akan masuk ke Supabase Storage bucket <b>${escapeHtml(getBucket())}</b>. Setelah upload, klik <b>Simpan Perubahan</b>.</small>
    </div>`;
  }
  function fieldInput(section, item, index, field){
    const [name,label]=field; const value=item[name]||''; const area=['body','excerpt'].includes(name);
    if(name === 'imageUrl') return `<label class="admin-image-field"><span>${label}</span>${imageUploadControl(index, value)}</label>`;
    return `<label><span>${label}</span>${area ? `<textarea data-index="${index}" data-field="${name}">${escapeHtml(value)}</textarea>` : `<input data-index="${index}" data-field="${name}" value="${escapeHtml(value)}">`}</label>`;
  }
  function render(){
    renderTabs();
    const section = sections.find(s=>s.key===active);
    const items = sectionItems(section);
    editor.innerHTML = `<div class="admin-editor-head"><h2>${section.label}</h2><button class="btn btn-outline-navy" id="addItemBtn">+ Tambah item</button></div>` + items.map((item,i)=>`<article class="admin-card"><div class="admin-card-head"><b>Item ${i+1}</b><button class="remove-item" data-remove="${i}">Hapus</button></div><div class="admin-fields">${section.fields.map(f=>fieldInput(section,item,i,f)).join('')}</div></article>`).join('');
    document.getElementById('addItemBtn').addEventListener('click',()=>{ collect(); const blank={}; section.fields.forEach(([k])=>blank[k]=''); data[section.key].push(denormalize(section,blank)); render(); });
    editor.querySelectorAll('[data-remove]').forEach(btn=>btn.addEventListener('click',()=>{ collect(); data[section.key].splice(Number(btn.dataset.remove),1); render(); }));
    editor.querySelectorAll('[data-upload]').forEach(input=>input.addEventListener('change', handleUpload));
  }
  function collect(){ const section=sections.find(s=>s.key===active); if(!section) return; const items=sectionItems(section); editor.querySelectorAll('[data-index][data-field]').forEach(input=>{ const i=Number(input.dataset.index); const field=input.dataset.field; if(!items[i]) items[i]={}; items[i][field]=input.value; }); data[section.key]=items.map(item=>denormalize(section,item)); }
  async function handleUpload(event){
    const file = event.target.files?.[0];
    if(!file) return;
    try{
      const session = await PelitaCMS.getSession();
      if(!session) throw new Error('Login admin dulu sebelum upload gambar.');
      const sb = PelitaCMS.getClient();
      if(!sb) throw new Error('Supabase belum dikonfigurasi.');
      if(!file.type.startsWith('image/')) throw new Error('File harus berupa gambar.');
      if(file.size > 5 * 1024 * 1024) throw new Error('Ukuran gambar maksimal 5 MB.');
      setStatus('Mengupload gambar...', 'info');
      const safeName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g,'-').replace(/-+/g,'-');
      const path = `admin/${Date.now()}-${Math.random().toString(36).slice(2,8)}-${safeName}`;
      const { error } = await sb.storage.from(getBucket()).upload(path, file, { cacheControl:'3600', upsert:false, contentType:file.type });
      if(error) throw error;
      const { data: publicData } = sb.storage.from(getBucket()).getPublicUrl(path);
      const input = editor.querySelector(`[data-index="${event.target.dataset.upload}"][data-field="imageUrl"]`);
      input.value = publicData.publicUrl;
      collect();
      render();
      setStatus('Gambar berhasil diupload. Klik Simpan Perubahan agar tampil di website.', 'ok');
    }catch(e){
      setStatus(e.message, 'err');
      event.target.value = '';
    }
  }
  async function save(){ try{ collect(); setStatus('Menyimpan ke Supabase...', 'info'); await PelitaCMS.save(data); jsonBox.value=JSON.stringify(data,null,2); setStatus('Konten berhasil tersimpan ke Supabase.', 'ok'); }catch(e){ setStatus(e.message, 'err'); } }

  document.getElementById('saveBtn').addEventListener('click', save);
  document.getElementById('exportBtn').addEventListener('click', ()=>{ collect(); jsonBox.value=JSON.stringify(data,null,2); jsonBox.focus(); jsonBox.select(); });
  document.getElementById('importBtn').addEventListener('click', ()=>{ try{ const next=JSON.parse(jsonBox.value); data=Object.assign(PelitaCMS.get(), next); render(); setStatus('JSON berhasil di-import. Klik Simpan untuk kirim ke Supabase.','ok'); }catch(e){ setStatus('JSON tidak valid.','err'); } });
  document.getElementById('resetBtn').addEventListener('click', ()=>{ if(confirm('Reset editor ke dummy awal? Belum menyimpan ke Supabase sampai klik Simpan.')){ data=JSON.parse(JSON.stringify(PelitaCMS.DEFAULT)); render(); } });
  PelitaCMS.ready().then(async(content)=>{ data=JSON.parse(JSON.stringify(content)); render(); await refreshAuth(); setStatus(PelitaCMS.configured() ? 'Konten dimuat. Login untuk menyimpan dan upload gambar.' : 'Mode lokal: Supabase belum dikonfigurasi.', PelitaCMS.configured() ? 'info' : 'err'); });
})();
