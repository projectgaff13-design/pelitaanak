(function(){
  const cfg = window.PELITA_SUPABASE || {};
  let client = null;
  const DEFAULT_TIMEOUT = Number(cfg.timeoutMs || 15000);
  const tableMap = {
    users:'users', articles:'articles', articleCategories:'article_categories',
    products:'products', productCategories:'product_categories',
    games:'games', gameCategories:'game_categories',
    mother:'mother_sharing', motherCategories:'mother_categories',
    banners:'banners', media:'media_uploads'
  };
  const selectMap = {
    articles:'*, category:article_categories(id,name,slug), media:media_uploads(id,public_url,file_path)',
    products:'*, category:product_categories(id,name,slug), media:media_uploads(id,public_url,file_path)',
    games:'*, category:game_categories(id,name,slug), media:media_uploads(id,public_url,file_path)',
    mother:'*, category:mother_categories(id,name,slug), media:media_uploads(id,public_url,file_path)',
    banners:'*, media:media_uploads(id,public_url,file_path)'
  };
  const writable = {
    articles:['id','title','slug','excerpt','body','author','category_id','media_id','thumbnail_url','status','published_at','created_at','updated_at'],
    products:['id','name','slug','description','category_id','media_id','image_url','price','buy_link','status','created_at','updated_at'],
    games:['id','title','slug','description','category_id','media_id','thumbnail_url','game_link','module_link','status','created_at','updated_at'],
    mother:['id','title','slug','body','author','category_id','media_id','image_url','status','published_at','created_at','updated_at'],
    banners:['id','title','slug','subtitle','media_id','image_url','cta_text','cta_link','status','sort_order','created_at','updated_at'],
    articleCategories:['id','name','slug','created_at','updated_at'],
    productCategories:['id','name','slug','created_at','updated_at'],
    gameCategories:['id','name','slug','created_at','updated_at'],
    motherCategories:['id','name','slug','created_at','updated_at']
  };
  function configured(){ return !!(cfg.url && cfg.anonKey && window.supabase); }
  function getClient(){
    if(client) return client;
    if(!configured()) return null;
    client = window.supabase.createClient(cfg.url, cfg.anonKey, { auth:{ persistSession:true, autoRefreshToken:true }});
    return client;
  }
  function table(key){ const t = tableMap[key]; if(!t) throw new Error('Resource CMS tidak dikenal: '+key); return t; }
  function logError(ctx, error){ console.error('[CMS Supabase Error]', { table:ctx.table, query:ctx.query, payload:ctx.payload, error }); }
  async function withTimeout(promise, ms, ctx){
    let timer;
    const timeout = new Promise((_, reject)=>{ timer=setTimeout(()=>reject(new Error('Request timeout setelah '+ms+'ms: '+ctx.query+' pada '+ctx.table)), ms); });
    try { return await Promise.race([promise, timeout]); }
    finally { clearTimeout(timer); }
  }
  async function run(ctx, builder){
    const c = getClient();
    if(!c) throw new Error('Gagal koneksi ke database: URL/Anon Key Supabase belum dikonfigurasi atau library Supabase gagal dimuat.');
    try{
      const res = await withTimeout(builder(c), ctx.timeout || DEFAULT_TIMEOUT, ctx);
      if(res && res.error){ logError(ctx, res.error); throw new Error('Query Supabase gagal pada tabel '+ctx.table+': '+res.error.message); }
      return res;
    }catch(e){ logError(ctx, e); throw e; }
  }
  async function healthCheck(){
    if(!configured()) throw new Error('Gagal koneksi ke database: konfigurasi Supabase tidak lengkap.');
    await run({table:'articles', query:'health select'}, c=>c.from('articles').select('id', { count:'exact', head:true }));
    return true;
  }
  function slugify(s){ return String(s||'').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') || String(Date.now()); }
  function normalizeRow(key,row){
    const allowed = writable[key];
    const copy = {};
    Object.entries(row || {}).forEach(([k,v]) => { if(!allowed || allowed.includes(k)) copy[k]=v; });
    Object.keys(copy).forEach(k=>{ if(copy[k]==='') copy[k]=null; });
    if(!copy.slug && (copy.title || copy.name)) copy.slug = slugify(copy.title || copy.name);
    if(['articles','mother','banners'].includes(key) && copy.status === 'publish' && !copy.published_at) copy.published_at = new Date().toISOString();
    if(copy.price !== undefined && copy.price !== null) copy.price = Number(copy.price) || 0;
    if(copy.sort_order !== undefined && copy.sort_order !== null) copy.sort_order = Number(copy.sort_order) || 0;
    copy.updated_at = new Date().toISOString();
    return copy;
  }
  function flatten(row){
    if(row && row.category){ row.category_name = row.category.name; row.category_slug = row.category.slug; }
    if(row && row.media){ if(!row.image_url) row.image_url = row.media.public_url; if(!row.thumbnail_url) row.thumbnail_url = row.media.public_url; }
    return row;
  }
  async function list(key,{published=false,limit=200}={}){
    const t = table(key); const select = selectMap[key] || '*';
    return (await run({table:t, query:'select list '+key}, c=>{
      let q = c.from(t).select(select).limit(limit);
      if(published && ['articles','products','games','mother','banners'].includes(key)) q = q.eq('status','publish');
      q = q.order(key==='banners'?'sort_order':'created_at', { ascending:false });
      return q;
    })).data?.map(flatten) || [];
  }
  async function get(key,id){ const t=table(key); return (await run({table:t, query:'select by id '+id}, c=>c.from(t).select(selectMap[key]||'*').eq('id',id).single())).data; }
  async function save(key,row){ const t=table(key); const payload=normalizeRow(key,row); return (await run({table:t, query:row && row.id?'update/upsert':'create/upsert', payload}, c=>c.from(t).upsert(payload).select(selectMap[key]||'*').single())).data; }
  async function remove(key,id){ const t=table(key); await run({table:t, query:'delete id '+id}, c=>c.from(t).delete().eq('id',id)); }
  async function upload(file, oldPath){
    if(!file) throw new Error('File gambar belum dipilih.');
    if(!file.type || !file.type.startsWith('image/')) throw new Error('File harus berupa gambar.');
    if(file.size > 5*1024*1024) throw new Error('Ukuran gambar maksimal 5 MB.');
    const bucket = cfg.bucket || 'pelita-images';
    const safe = file.name.toLowerCase().replace(/[^a-z0-9.]+/g,'-').replace(/-+/g,'-');
    const path = `admin/${Date.now()}-${Math.random().toString(36).slice(2,8)}-${safe}`;
    await run({table:'storage.objects', query:'upload '+path}, c=>c.storage.from(bucket).upload(path,file,{contentType:file.type,cacheControl:'3600',upsert:false}));
    const c = getClient(); const { data } = c.storage.from(bucket).getPublicUrl(path);
    if(oldPath) { try { await c.storage.from(bucket).remove([oldPath]); } catch(e){ console.warn('[CMS Storage] gagal hapus file lama', e); } }
    try { await run({table:'media_uploads', query:'insert media record', payload:{path}}, c=>c.from('media_uploads').insert({file_name:file.name,file_path:path,public_url:data.publicUrl,mime_type:file.type,size:file.size}).select().single()); } catch(e){ console.warn('[CMS Media] metadata upload gagal', e); }
    return { url:data.publicUrl, path };
  }
  async function removeFile(path){ if(!path) return; await run({table:'storage.objects', query:'delete file '+path}, c=>c.storage.from(cfg.bucket||'pelita-images').remove([path])); }
  async function session(){ const c=getClient(); if(!c) return null; const res=await withTimeout(c.auth.getSession(), DEFAULT_TIMEOUT, {table:'auth',query:'get session'}); return res.data.session; }
  async function signIn(email,password){ const c=getClient(); if(!c) throw new Error('Supabase belum dikonfigurasi.'); const {data,error}=await withTimeout(c.auth.signInWithPassword({email,password}), DEFAULT_TIMEOUT, {table:'auth',query:'sign in'}); if(error) throw error; return data; }
  async function signOut(){ const c=getClient(); if(c) await c.auth.signOut(); }
  window.CMSApi={configured,sb:getClient,getClient,healthCheck,list,get,save,remove,upload,removeFile,session,signIn,signOut,slugify,tableMap};
})();
