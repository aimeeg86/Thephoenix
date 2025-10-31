// Phoenix Bar app.js
const PASS = 'Nugget07';
const els = {
  heroImg: document.getElementById('heroImg'),
  galleryStrip: document.getElementById('galleryStrip'),
  gigList: document.getElementById('gigList'),
  fixtures: document.getElementById('fixtures'),
  hoursTable: document.getElementById('hoursTable'),
  whatsOnList: document.getElementById('whatsOnList'),
  videoList: document.getElementById('videoList'),
  lockBtn: document.getElementById('lockBtn'),
  admin: document.getElementById('adminModal'),
  passField: document.getElementById('passField'),
  unlockBtn: document.getElementById('unlockBtn'),
  lockState: document.getElementById('lockState'),
  heroInput: document.getElementById('heroInput'),
  galleryInput: document.getElementById('galleryInput'),
  clearGallery: document.getElementById('clearGallery'),
  gigInput: document.getElementById('gigInput'),
  gigMeta: document.getElementById('gigMeta'),
  resetGigs: document.getElementById('resetGigs'),
  fxRows: document.getElementById('fxRows'),
  videosInput: document.getElementById('videosInput'),
  aboutText: document.getElementById('aboutText'),
  aboutInput: document.getElementById('aboutInput'),
  telephone: document.getElementById('telephone'),
  telInput: document.getElementById('telInput'),
  fbLink: document.getElementById('fbLink'),
  fbTitleInput: document.getElementById('fbTitleInput'),
  fbUrlInput: document.getElementById('fbUrlInput'),
  address: document.getElementById('address'),
  addrInput: document.getElementById('addrInput'),
  offersInput: document.getElementById('offersInput'),
  woRows: document.getElementById('woRows'),
  hrRows: document.getElementById('hrRows'),
  saveBtn: document.getElementById('saveBtn'),
  footer: document.getElementById('siteFooter'),
};

// Default data
const defaultData = {
  gallery: [], hero: null,
  gigs: [
    {img:null, title:"Manhattan Nights", subtitle:"Sat, Nov 1 at 9:15pm", blurb:"5‑piece cover band • free entry"},
    {img:null, title:"Lone Sea Breakers", subtitle:"Sat, Nov 8 at 9:00pm", blurb:"Original rock covers • free entry"},
    {img:null, title:"Headcase", subtitle:"Sat, Nov 15 at 8:00pm", blurb:"Classic rock and more"},
    {img:null, title:"Resident DJ", subtitle:"Every Friday 10:00pm", blurb:"Party anthems til late"},
  ],
  fixtures: [
    {home:"Man United", away:"Liverpool", time:"Sun, Nov 2 · 3:00 PM", channel:"Sky Sports"},
    {home:"Arsenal", away:"Chelsea", time:"Mon, Nov 3 · 5:30 PM", channel:"BT Sport"},
    {home:"Man City", away:"Tottenham", time:"Tue, Nov 4 · 2:00 PM", channel:"Sky Sports"},
  ],
  videos: [],
  about: document.getElementById('aboutText')?.textContent || "",
  tel: "01234 567890",
  fb: {title:"The Phoenix Bar", url:"#"},
  address: "3–4 The High Street, Royal Wootton Bassett, SN4 7BS",
  offers: ["Happy Hour Mon–Fri 4–6pm","2‑for‑£10 cocktails every Friday","Local ales on rotation"],
  whatsOn: {
    Mon:"Open Mic", Tue:"Pub Quiz", Wed:"Acoustic Night",
    Thu:"DJ & 2‑for‑£10 Cocktails", Fri:"Live Band", Sat:"Live Music", Sun:"Chilled Classics"
  },
  hours: {
    Monday:"12:00 – 23:00", Tuesday:"12:00 – 23:00", Wednesday:"12:00 – 23:00",
    Thursday:"12:00 – 23:00", Friday:"12:00 – 01:00", Saturday:"12:00 – 01:00", Sunday:"12:00 – 23:00"
  }
};

const KEY = 'phoenix-site';
let data = {...defaultData, ...(JSON.parse(localStorage.getItem(KEY) || '{}'))};

function save(){ localStorage.setItem(KEY, JSON.stringify(data)); }

// Renderers
function renderHero(){
  if(data.hero) els.heroImg.src = data.hero;
}
function renderGallery(){
  els.galleryStrip.innerHTML = "";
  data.gallery.forEach(src=>{
    const img = new Image(); img.src = src; img.alt = "Gallery photo";
    els.galleryStrip.appendChild(img);
  });
}
function renderGigs(){
  els.gigList.innerHTML = "";
  data.gigs.slice(0,4).forEach(g=>{
    const card = document.createElement('div');
    card.className = 'gig-card';
    card.innerHTML = `<div>${g.img?`<img src="${g.img}" alt="Gig poster">`:``}</div>
      <h3>${g.title||""}</h3>
      <div><em>${g.subtitle||""}</em></div>
      <div>${g.blurb||""}</div>`;
    els.gigList.appendChild(card);
  });
}
function renderFixtures(){
  els.fixtures.innerHTML = "";
  data.fixtures.slice(0,3).forEach(fx=>{
    const d = document.createElement('div');
    d.className = 'fixture';
    d.innerHTML = `<div class="teams"><strong>${fx.home}</strong> vs <strong>${fx.away}</strong></div>
      <div class="ftime">${fx.time}</div>
      <div class="channel">${fx.channel}</div>`;
    els.fixtures.appendChild(d);
  });
}
function renderVideos(){
  els.videoList.innerHTML = "";
  data.videos.forEach(u=>{
    let embed = u;
    if(/youtube\.com|youtu\.be/.test(u)){
      const idMatch = u.match(/(?:v=|be\/)([^&\s]+)/); const id = idMatch? idMatch[1]:null;
      if(id) embed = `https://www.youtube.com/embed/${id}`;
      const ifr = document.createElement('iframe'); ifr.src = embed; ifr.allowFullscreen = true; ifr.loading='lazy';
      els.videoList.appendChild(ifr);
    } else if(/\.(mp4|webm|ogg)$/i.test(u)){
      const v = document.createElement('video'); v.controls=true; v.src=u; els.videoList.appendChild(v);
    } else {
      const a=document.createElement('a'); a.href=u; a.textContent=u; a.target="_blank"; els.videoList.appendChild(a);
    }
  });
}
function renderAboutContact(){
  els.aboutText.textContent = data.about;
  els.telephone.textContent = data.tel;
  els.telephone.href = `tel:${data.tel.replace(/\s+/g,'')}`;
  els.fbLink.textContent = data.fb.title;
  els.fbLink.href = data.fb.url || '#';
  els.address.textContent = data.address;
}
function renderOffers(){
  const ul = document.getElementById('drinkOffers'); ul.innerHTML="";
  data.offers.forEach(line=>{ const li=document.createElement('li'); li.textContent=line; ul.appendChild(li); });
}
function renderWhatsOn(){
  els.whatsOnList.innerHTML = "";
  Object.entries(data.whatsOn).forEach(([day,text])=>{
    const div = document.createElement('div'); div.className='cream card';
    div.innerHTML = `<strong>${day}</strong><span style="float:right">${text}</span>`;
    els.whatsOnList.appendChild(div);
  });
}
function renderHours(){
  els.hoursTable.innerHTML="";
  Object.entries(data.hours).forEach(([day,hrs])=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${day}</td><td>${hrs}</td>`;
    els.hoursTable.appendChild(tr);
  });
}

function renderAll(){ renderHero(); renderGallery(); renderGigs(); renderFixtures(); renderVideos(); renderAboutContact(); renderOffers(); renderWhatsOn(); renderHours(); }
renderAll();

// Admin reveal: 5 taps on footer
let tapCount=0, tapTimer=null;
els.footer.addEventListener('click', ()=>{
  tapCount++; clearTimeout(tapTimer);
  tapTimer = setTimeout(()=>tapCount=0, 4000);
  if(tapCount>=5){
    els.lockBtn.hidden = false;
    tapCount=0;
    setTimeout(()=>{ els.lockBtn.classList.add('wiggle'); setTimeout(()=>els.lockBtn.classList.remove('wiggle'),800); },0);
  }
});

// Modal open
els.lockBtn.addEventListener('click', ()=>{
  els.admin.showModal();
  els.lockState.textContent = localStorage.getItem('unlocked')==='1' ? 'Unlocked ✓' : 'Locked';
  fillAdmin();
});

els.unlockBtn.addEventListener('click', ()=>{
  if(els.passField.value === PASS){
    localStorage.setItem('unlocked','1');
    els.lockState.textContent = 'Unlocked ✓';
  } else {
    localStorage.setItem('unlocked','0');
    alert('Wrong passphrase');
  }
});

function ensureUnlocked(){
  if(localStorage.getItem('unlocked')!=='1'){ alert('Unlock first'); return false; }
  return true;
}

// Admin form population
function fillAdmin(){
  els.aboutInput.value = data.about;
  els.telInput.value = data.tel;
  els.fbTitleInput.value = data.fb.title;
  els.fbUrlInput.value = data.fb.url || "";
  els.addrInput.value = data.address;
  els.offersInput.value = data.offers.join('\n');

  // Whats On rows
  els.woRows.innerHTML="";
  const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  days.forEach(d=>{
    const inp = document.createElement('input'); inp.value = data.whatsOn[d]||""; inp.dataset.day=d;
    const lbl = document.createElement('label'); lbl.textContent=d;
    const wrap = document.createElement('div'); wrap.append(lbl,inp);
    els.woRows.appendChild(wrap);
  });

  // Hours rows
  els.hrRows.innerHTML="";
  const fullDays = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
  fullDays.forEach(d=>{
    const inp = document.createElement('input'); inp.value = data.hours[d]||""; inp.dataset.day=d;
    const lbl = document.createElement('label'); lbl.textContent=d;
    const wrap = document.createElement('div'); wrap.append(lbl,inp);
    els.hrRows.appendChild(wrap);
  });

  // Fixtures rows (3)
  els.fxRows.innerHTML="";
  for(let i=0;i<3;i++){
    const row = document.createElement('div');
    row.innerHTML = `<input placeholder="Home" value="${data.fixtures[i]?.home||''}">
      <input placeholder="Away" value="${data.fixtures[i]?.away||''}">
      <input placeholder="Date & time / channel" value="${data.fixtures[i]?.time||''} — ${data.fixtures[i]?.channel||''}">`;
    els.fxRows.appendChild(row);
  }

  // Gig meta rows (4)
  els.gigMeta.innerHTML="";
  for(let i=0;i<4;i++){
    const wrap = document.createElement('div'); wrap.className='gig-meta-row';
    wrap.innerHTML = `<input placeholder="Gig ${i+1} title" value="${data.gigs[i]?.title||''}">
      <input placeholder="Date & time" value="${data.gigs[i]?.subtitle||''}">
      <input placeholder="Short blurb" style="grid-column:1/-1" value="${data.gigs[i]?.blurb||''}">`;
    els.gigMeta.appendChild(wrap);
  }

  // Videos
  els.videosInput.value = (data.videos||[]).join('\n');
}

// File inputs
function fileToDataURL(file){ return new Promise(res=>{ const r=new FileReader(); r.onload=()=>res(r.result); r.readAsDataURL(file); }); }

els.heroInput.addEventListener('change', async e=>{
  if(!ensureUnlocked()) return;
  const f = e.target.files[0]; if(!f) return;
  data.hero = await fileToDataURL(f); save(); renderHero();
});
els.galleryInput.addEventListener('change', async e=>{
  if(!ensureUnlocked()) return;
  const arr=[]; for(const f of e.target.files){ arr.push(await fileToDataURL(f)); }
  data.gallery = arr; save(); renderGallery();
});
els.clearGallery.addEventListener('click', ()=>{ if(!ensureUnlocked()) return; data.gallery=[]; save(); renderGallery(); });
els.gigInput.addEventListener('change', async e=>{
  if(!ensureUnlocked()) return;
  const files=[...e.target.files].slice(0,4);
  for(let i=0;i<4;i++){ data.gigs[i]=data.gigs[i]||{}; data.gigs[i].img = files[i]? await fileToDataURL(files[i]): null; }
  save(); renderGigs();
});
els.resetGigs.addEventListener('click', ()=>{ if(!ensureUnlocked()) return; data.gigs = defaultData.gigs.map(g=>({...g, img:null})); save(); renderGigs(); });

// Save admin text fields
els.saveBtn.addEventListener('click', ()=>{
  if(!ensureUnlocked()) return;

  data.about = els.aboutInput.value.trim();
  data.tel = els.telInput.value.trim();
  data.fb = {title: els.fbTitleInput.value.trim(), url: els.fbUrlInput.value.trim()};
  data.address = els.addrInput.value.trim();
  data.offers = els.offersInput.value.split(/\n+/).map(s=>s.trim()).filter(Boolean);

  // Whats On
  [...els.woRows.querySelectorAll('input')].forEach(inp=>{ data.whatsOn[inp.dataset.day]=inp.value; });

  // Hours
  [...els.hrRows.querySelectorAll('input')].forEach(inp=>{ data.hours[inp.dataset.day]=inp.value; });

  // Fixtures
  const rows = [...els.fxRows.children];
  data.fixtures = rows.map(r=>{
    const [home,away,dt] = r.querySelectorAll('input');
    let time="", channel="";
    if(dt.value.includes('—')){
      [time, channel] = dt.value.split('—').map(s=>s.trim());
    } else {
      time = dt.value.trim();
    }
    return {home:home.value.trim(), away:away.value.trim(), time, channel};
  }).slice(0,3);

  // Videos
  data.videos = els.videosInput.value.split(/\n+/).map(s=>s.trim()).filter(Boolean);

  save(); renderAll(); alert('Saved!');
});

// Ensure modal scrollable on mobile
document.getElementById('adminModal').addEventListener('close', ()=>{
  // hide lock again to keep it unobtrusive
  els.lockBtn.hidden = true;
});
