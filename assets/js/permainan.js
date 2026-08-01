const GAMES_KEY = 'proofGameSessionsV1';
const ASSESSMENT_KEY = 'proofAssessmentV1';

const games = [
  { id:'papan-cerita', title:'Papan Cerita Batas Tubuh', category:'Papan Cerita', tone:'t1', drive:'https://drive.google.com/', goal:'Membantu anak mengenali batas tubuh, situasi aman/tidak aman, dan cara meminta bantuan.' },
  { id:'kartu-aman', title:'Kartu Aman / Tidak Aman', category:'Kartu Edukasi', tone:'t2', drive:'https://drive.google.com/', goal:'Melatih anak mengelompokkan situasi, memberi alasan sederhana, dan menyebut orang tepercaya.' },
  { id:'puzzle-lingkaran', title:'Puzzle Lingkaran Kepercayaan', category:'Puzzle', tone:'t3', drive:'https://drive.google.com/', goal:'Membantu anak memetakan orang terdekat, batas rahasia, dan jalur meminta pertolongan.' }
];

const questions = [
  { id:'recognize', text:'Anak mampu membedakan situasi aman dan tidak aman.', area:'Pemahaman batas aman' },
  { id:'express', text:'Anak mampu menyampaikan rasa tidak nyaman atau menolak.', area:'Komunikasi dan keberanian' },
  { id:'trusted', text:'Anak mampu menyebut orang dewasa tepercaya untuk meminta bantuan.', area:'Jaringan dukungan' },
  { id:'focus', text:'Anak mampu mengikuti alur permainan sampai selesai.', area:'Atensi dan regulasi' }
];

let selectedGame = games[0];
function loadSessions(){ try{return JSON.parse(localStorage.getItem(GAMES_KEY)) || []}catch(e){return []} }
function saveSessions(rows){ localStorage.setItem(GAMES_KEY, JSON.stringify(rows)); }
function rupiah(n){ return new Intl.NumberFormat('id-ID').format(n); }

function renderGameList(){
  const list = document.getElementById('gameList'); if(!list) return;
  document.getElementById('gameCount').textContent = games.length + ' kit';
  list.innerHTML = games.map(g=>`<button class="game-list-item ${g.id===selectedGame.id?'active':''}" data-game="${g.id}"><span class="game-dot ${g.tone}"></span><span><b>${g.title}</b><small>${g.category}</small></span></button>`).join('');
  list.querySelectorAll('[data-game]').forEach(btn=>btn.addEventListener('click',()=>{ selectedGame = games.find(g=>g.id===btn.dataset.game) || games[0]; renderAll(); }));
}
function renderProduct(){
  document.getElementById('gameTitle').textContent = selectedGame.title;
  document.getElementById('gameCategory').textContent = selectedGame.category;
  document.getElementById('moduleGoal').textContent = selectedGame.goal;
  document.getElementById('moduleLink').href = selectedGame.drive;
  document.getElementById('gameArt').className = 'game-product-art ' + selectedGame.tone;
}
function renderLeaderboard(){
  const box = document.getElementById('leaderboardList'); if(!box) return;
  const rows = loadSessions().filter(r=>r.gameId===selectedGame.id).sort((a,b)=>b.score-a.score || b.date.localeCompare(a.date));
  if(!rows.length){ box.innerHTML = '<div class="empty-mini">Belum ada sesi. Catat permainan pertama untuk mulai monitoring.</div>'; return; }
  box.innerHTML = rows.map((r,i)=>`<div class="leaderboard-row"><div class="rank">${i+1}</div><div><b>${r.childName}</b><span>${r.facilitator} · ${new Date(r.date).toLocaleDateString('id-ID')}</span><small>${r.notes || 'Tanpa catatan tambahan'}</small></div><strong>${r.score}</strong></div>`).join('');
}
function renderQuestions(){
  const box = document.getElementById('assessmentQuestions'); if(!box) return;
  box.innerHTML = questions.map((q,i)=>`<fieldset class="assessment-q"><legend>${i+1}. ${q.text}</legend><label><input type="radio" name="${q.id}" value="2" required> Sudah konsisten</label><label><input type="radio" name="${q.id}" value="1"> Mulai terlihat, perlu bantuan</label><label><input type="radio" name="${q.id}" value="0"> Belum terlihat</label></fieldset>`).join('');
}
function renderAll(){ renderGameList(); renderProduct(); renderLeaderboard(); renderQuestions(); }
function setTab(tab){
  document.querySelectorAll('.game-tabs button,[data-tab]').forEach(el=>{ if(el.tagName==='BUTTON') el.classList.toggle('active', el.dataset.tab===tab && el.parentElement.classList.contains('game-tabs')); });
  document.querySelectorAll('.game-tab-panel').forEach(p=>p.classList.toggle('active', p.id === 'tab-'+tab));
}

document.addEventListener('DOMContentLoaded',()=>{
  renderAll();
  document.querySelectorAll('[data-tab]').forEach(btn=>btn.addEventListener('click',()=>setTab(btn.dataset.tab)));
  document.getElementById('playForm')?.addEventListener('submit',e=>{
    e.preventDefault(); const fd = new FormData(e.currentTarget);
    const row = { gameId:selectedGame.id, childName:fd.get('childName'), facilitator:fd.get('facilitator'), score:Number(fd.get('score')), notes:fd.get('notes'), date:new Date().toISOString() };
    const rows = loadSessions(); rows.push(row); saveSessions(rows); e.currentTarget.reset(); renderLeaderboard();
  });
  document.getElementById('clearLeaderboard')?.addEventListener('click',()=>{ saveSessions(loadSessions().filter(r=>r.gameId!==selectedGame.id)); renderLeaderboard(); });
  document.getElementById('assessmentForm')?.addEventListener('submit',e=>{
    e.preventDefault(); const fd = new FormData(e.currentTarget); let score=0; const weak=[];
    questions.forEach(q=>{ const val=Number(fd.get(q.id)); score += val; if(val<2) weak.push(q.area); });
    const max = questions.length*2; const pct = Math.round(score/max*100);
    let title = pct>=75?'Potensi kuat, lanjutkan pengayaan': pct>=45?'Butuh latihan terarah':'Perlu pendampingan lebih intensif';
    const result = document.getElementById('assessmentResult'); result.hidden=false;
    result.innerHTML = `<h3>${title}</h3><div class="assessment-score">${pct}<span>%</span></div><p>${weak.length ? 'Area yang perlu diperkuat: '+weak.join(', ')+'.' : 'Semua indikator utama sudah terlihat konsisten.'}</p><small>Hasil ini tersimpan di perangkat fasilitator sebagai catatan lokal dan bukan diagnosis.</small>`;
    localStorage.setItem(ASSESSMENT_KEY, JSON.stringify({gameId:selectedGame.id, pct, weak, date:new Date().toISOString()}));
  });
});
