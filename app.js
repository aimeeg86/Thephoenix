/* ===================
   Phoenix Bar app
   - data in localStorage
   - media (images/videos) in IndexedDB
   - admin lock via 5 taps on footer
=================== */

const PASS = 'Nugget07';
const LS = {
  about:'pb_about',
  offers:'pb_offers',          // array of strings
  whatsOn:'pb_whats_on',       // array 7
  times:'pb_open_times',       // array 7
  fixtures:'pb_fixtures',      // array 3 of {home,away,date,time,channel}
  gigs:'pb_gigs',              // array 4 of {title,datetime,blurb,posterId}
  contact:'pb_contact',        // {phone, fbTitle, fbUrl, address}
  galleryOrder:'pb_gallery_ids'// array of blob ids
};

// ============== IndexedDB helper ==============
const DB_NAME='pb_media_db';
let dbPromise;
function openDB(){
  if(dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject)=>{
    const req = indexedDB.open(DB_NAME,1);
    req.onupgradeneeded = (e)=>{
      const db = req.result;
      if(!db.objectStoreNames.contains('media')){
        db.createObjectStore('media',{keyPath:'id'});
      }
    };
    req.onsuccess = ()=> resolve(req.result);
    req.onerror = ()=> reject(req.error);
  });
  return dbPromise;
}
async function putBlob(id, blob){
  const db = await openDB();
  return new Promise((res,rej)=>{
    const tx = db.transaction('media','readwrite');
    tx.objectStore('media').put({id, blob, ts:Date.now()});
    tx.oncomplete=()=>res(id);
    tx.onerror=()=>rej(tx.error);
  });
}
async function getBlob(id){
  const db = await openDB();
  return new Promise((res,rej)=>{
    const tx = db.transaction('media','readonly');
    const r = tx.objectStore('media').get(id);
    r.onsuccess=()=> res(r.result?.blob || null);
    r.onerror=()=> rej(r.error);
  });
}
async function delBlob(id){
  const db = await openDB();
  return new Promise((res,rej)=>{
    const tx = db.transaction('media','readwrite');
    tx.objectStore('media').delete(id);
    tx.oncomplete=()=>res();
    tx.onerror=()=>rej(tx.error);
  });
}

/* ======= Utilities ======= */
const $ = sel => document.querySelector(sel);
function setLS(k,v){ localStorage.setItem(k, JSON.stringify(v)); }
function getLS(k, dflt){
  try{ return JSON.parse(localStorage.getItem(k)) ?? dflt; }
  catch{ return dflt; }
}
function el(tag, attrs={}, children=[]){
  const e = document.createElement(tag);
  Object.entries(attrs).forEach(([k,v])=>{
    if(k==='class') e.className=v;
    else if(k==='html') e.innerHTML=v;
    else e.setAttribute(k,v);
  });
  children.forEach(c=> e.append(c));
  return e;
}

/* ======= DOM refs ======= */
const aboutText = $('#aboutText');
const offersList = $('#drinkOffers');
const whatsOnList = $('#whatsOnList');
const openingTimes = $('#openingTimes');
const gallery = $('#gallery');
const videos = $('#videos');
const gigsWrap = $('#gigs');
const fixturesWrap = $('#fixtures');
const heroImage = $('#heroImage');

/* ======= Defaults (first run) ======= */
const DEFAULTS={
  about: "Welcome to The Phoenix Bar, your local pub on Royal Wootton Bassett High Street! Dogs are always welcome, the pints are cheap, and there’s never a dull moment.",
  offers: ["Happy Hour Mon–Fri 4–6pm","2-for-£10 cocktails every Friday","Local ales on rotation"],
  whatsOn: ["Open Mic","Pub Quiz","Acoustic Night","DJ & 2-for-£10 Cocktails","Live Band","Live Music","Chilled Classics"],
  times: ["12:00 – 23:00","12:00 – 23:00","12:00 – 23:00","12:00 – 23:00","12:00 – 01:00","12:00 – 01:00","12:00 – 23:00"],
  fixtures: [
    {home:"Man United",away:"Liverpool",date:"Sun Nov 2",time:"3:00 PM",channel:"Sky Sports"},
    {home:"Arsenal",away:"Chelsea",date:"Mon Nov 3",time:"5:30 PM",channel:"BT Sport"},
    {home:"Man City",away:"Tottenham",date:"Tue Nov 4",time:"2:00 PM",channel:"Sky Sports"}
  ],
  gigs: [
    {title:"Manhattan Nights",datetime:"Sat, Nov 1 at 9:15pm",blurb:"5-piece cover band • free entry",posterId:null},
    {title:"Lone Sea Breakers",datetime:"Sat, Nov 8 at 9:00pm",blurb:"Original rock covers • free entry",posterId:null},
    {title:"TBA",datetime:"Date & time",blurb:"",posterId:null},
    {title:"TBA",datetime:"Date & time",blurb:"",posterId:null}
  ],
  contact:{phone:"", fbTitle:"The Phoenix Bar", fbUrl:"", address:""},
  galleryIds:[]
};
/* Init defaults once */
if(!localStorage.getItem(LS.whatsOn)){
  setLS(LS.about, DEFAULTS.about);
  setLS(LS.offers, DEFAULTS.offers);
  setLS(LS.whatsOn, DEFAULTS.whatsOn);
  setLS(LS.times, DEFAULTS.times);
  setLS(LS.fixtures, DEFAULTS.fixtures);
  setLS(LS.gigs, DEFAULTS.gigs);
  setLS(LS.contact, DEFAULTS.contact);
  setLS(LS.galleryOrder, DEFAULTS.galleryIds);
}

/* ======= Renderers ======= */
function renderAbout(){
  aboutText.textContent = getLS(LS.about, DEFAULTS.about);
}
function renderOffers(){
  const offers = getLS(LS.offers, DEFAULTS.offers);
  offersList.innerHTML='';
  offers.forEach(t=> offersList.append(el('li',{html:t})));
}
function renderWhatsOn(){
  const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const items = getLS(LS.whatsOn, DEFAULTS.whatsOn);
  whatsOnList.innerHTML='';
  days.forEach((d,i)=>{
    whatsOnList.append(el('dt',{html:`<strong>${d}</strong>`}));
    whatsOnList.append(el('dd',{html:items[i] || ''}));
  });
}
function renderTimes(){
  const labels = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
  const rows = getLS(LS.times, DEFAULTS.times);
  openingTimes.innerHTML='';
  labels.forEach((lab,i)=>{
    const tr = el('tr',{},[ el('td',{html:`<strong>${lab}</strong>`}), el('td',{html:rows[i]||''}) ]);
    openingTimes.append(tr);
  });
}
async function renderGallery(){
  const ids = getLS(LS.galleryOrder, []);
  gallery.innerHTML='';
  for(const id of ids){
    const blob = await getBlob(id);
    if(blob){
      const url = URL.createObjectURL(blob);
      const img = el('img',{src:url, alt:'Photo'});
      gallery.append(img);
    }
  }
}
async function renderVideos(){
  const vids = getLS('pb_videos', []); // [{id}]
  videos.innerHTML='';
  for(const v of vids){
    const blob = await getBlob(v.id);
    if(blob){
      const url = URL.createObjectURL(blob);
      const video = el('video',{src:url, controls:true});
      videos.append(video);
    }
  }
}
async function renderHero(){
  const hid = getLS('pb_hero_id', null);
  if(hid){
    const b = await getBlob(hid);
    if(b){
      heroImage.src = URL.createObjectURL(b);
    }
  }
}
async function renderGigs(){
  const gigs = getLS(LS.gigs, DEFAULTS.gigs);
  gigsWrap.innerHTML='';
  for(const g of gigs){
    const wrap = el('div',{class:'gig'});
    if(g.posterId){
      const b = await getBlob(g.posterId);
      if(b){
        const url = URL.createObjectURL(b);
        wrap.append(el('img',{src:url,alt:g.title}));
      }
    }
    const p = el('div',{class:'p'});
    p.append(el('div',{class:'title',html:g.title}));
    p.append(el('div',{class:'meta',html:g.datetime}));
    p.append(el('div',{html:g.blurb}));
    wrap.append(p);
    gigsWrap.append(wrap);
  }
}
function renderFixtures(){
  const fixtures = getLS(LS.fixtures, DEFAULTS.fixtures);
  fixturesWrap.innerHTML='';
  fixtures.forEach(f=>{
    const card = el('div',{class:'card', html:`
      <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;">
        <div>
          <div style="font-weight:800;font-size:22px">${f.home} <span style="opacity:.7">vs</span> ${f.away}</div>
          <div style="opacity:.8">${f.date} · ${f.time}</div>
        </div>
        <span class="badge">${f.channel||''}</span>
      </div>
    `});
    fixturesWrap.append(card);
  });
}

/* ======= Badges ======= */
const style = document.createElement('style');
style.textContent = `.badge{background:#f4d27a;padding:6px 10px;border-radius:10px;box-shadow:0 6px 14px rgba(0,0,0,.2)}`;
document.head.append(style);

/* ======= Admin (lock & modal) ======= */
const lockBtn = document.getElementById('lockBtn');
const adminModal = document.getElementById('adminModal');
const footer = document.getElementById('siteFooter');
let tapCount=0; let tapTimer=null;

footer.addEventListener('click', ()=>{
  tapCount++;
  if(tapTimer) clearTimeout(tapTimer);
  tapTimer = setTimeout(()=> tapCount=0, 1800);
  if(tapCount>=5){
    lockBtn.style.display='flex';
    tapCount=0;
    setTimeout(()=> lockBtn.classList.add('pop'),10);
  }
});
lockBtn.addEventListener('click', ()=> adminModal.showModal());

/* Unlock logic */
const passInput = document.getElementById('passInput');
const unlockBtn = document.getElementById('unlockBtn');
const lockState = document.getElementById('lockState');
let unlocked=false;
unlockBtn.addEventListener('click', ()=>{
  if(passInput.value===PASS){
    unlocked=true;
    lockState.textContent='Unlocked ✓';
    document.querySelectorAll('#adminModal input, #adminModal textarea').forEach(i=> i.disabled=false);
  }else{
    lockState.textContent='Wrong passphrase';
  }
});

/* ======= Build Admin form fields ======= */
const daysShort = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const daysLong  = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

/* Offers list inputs */
const offersInputs = document.getElementById('offersInputs');
function rebuildOffersInputs(){
  offersInputs.innerHTML='';
  const offers = getLS(LS.offers, DEFAULTS.offers);
  offers.forEach((t,i)=>{
    const row = el('div',{},[ el('input',{value:t, 'data-i':i}) ]);
    offersInputs.append(row);
  });
}
document.getElementById('addOffer').addEventListener('click', ()=>{
  const arr = getLS(LS.offers, DEFAULTS.offers);
  arr.push('');
  setLS(LS.offers, arr);
  rebuildOffersInputs();
});

/* What's on inputs */
const whatsOnInputs = document.getElementById('whatsOnInputs');
function rebuildWhatsOnInputs(){
  whatsOnInputs.innerHTML='';
  const data = getLS(LS.whatsOn, DEFAULTS.whatsOn);
  daysShort.forEach((lab,i)=>{
    const row = el('div',{class:'row'},[
      el('label',{style:'min-width:64px'},[document.createTextNode(lab)]),
      el('input',{'data-i':i, value:data[i]||''})
    ]);
    whatsOnInputs.append(row);
  });
}

/* Times inputs */
const timesInputs = document.getElementById('timesInputs');
function rebuildTimesInputs(){
  timesInputs.innerHTML='';
  const data = getLS(LS.times, DEFAULTS.times);
  daysShort.forEach((lab,i)=>{
    const row = el('div',{class:'row'},[
      el('label',{style:'min-width:64px'},[document.createTextNode(lab)]),
      el('input',{'data-i':i, value:data[i]||''})
    ]);
    timesInputs.append(row);
  });
}

/* Fixtures (3) */
const fixturesInputs = document.getElementById('fixturesInputs');
function rebuildFixturesInputs(){
  fixturesInputs.innerHTML='';
  const data = getLS(LS.fixtures, DEFAULTS.fixtures).slice(0,3);
  while(data.length<3) data.push({home:'',away:'',date:'',time:'',channel:''});
  data.forEach((f,i)=>{
    const row = el('div',{class:'row'},[
      el('input',{placeholder:'Home', value:f.home||'', 'data-i':i, 'data-k':'home'}),
      el('input',{placeholder:'Away', value:f.away||'', 'data-i':i, 'data-k':'away'}),
      el('input',{placeholder:'Date', value:f.date||'', 'data-i':i, 'data-k':'date'}),
      el('input',{placeholder:'Time', value:f.time||'', 'data-i':i, 'data-k':'time'}),
      el('input',{placeholder:'Channel', value:f.channel||'', 'data-i':i, 'data-k':'channel'}),
    ]);
    fixturesInputs.append(row);
  });
}

/* About & contact inputs */
const aboutInput = document.getElementById('aboutInput');
const phoneInput = document.getElementById('phoneInput');
const fbTitleInput = document.getElementById('fbTitleInput');
const fbUrlInput = document.getElementById('fbUrlInput');
const addressInput = document.getElementById('addressInput');

function populateAdminFields(){
  aboutInput.value = getLS(LS.about, DEFAULTS.about);
  const c = getLS(LS.contact, DEFAULTS.contact);
  phoneInput.value = c.phone||''; fbTitleInput.value=c.fbTitle||''; fbUrlInput.value=c.fbUrl||''; addressInput.value=c.address||'';
  rebuildOffersInputs(); rebuildWhatsOnInputs(); rebuildTimesInputs(); rebuildFixturesInputs();
}
adminModal.addEventListener('close', ()=>{
  // hide lock when closing; must re-tap footer to show
  document.getElementById('lockBtn').style.display='none';
});
adminModal.addEventListener('show', populateAdminFields);

/* ======= File inputs ======= */
const heroFile = document.getElementById('heroFile');
heroFile.addEventListener('change', async e=>{
  if(!unlocked) return;
  const f = e.target.files[0]; if(!f) return;
  const id = 'hero_'+Date.now();
  await putBlob(id, f);
  setLS('pb_hero_id', id);
  renderHero();
});

const galleryFiles = document.getElementById('galleryFiles');
galleryFiles.addEventListener('change', async e=>{
  if(!unlocked) return;
  const ids = getLS(LS.galleryOrder, []);
  for(const f of e.target.files){
    const id = 'gal_'+Date.now()+'_'+Math.random().toString(36).slice(2,7);
    await putBlob(id, f);
    ids.push(id);
  }
  setLS(LS.galleryOrder, ids);
  renderGallery();
});
document.getElementById('clearGallery').addEventListener('click', async ()=>{
  if(!unlocked) return;
  const ids = getLS(LS.galleryOrder, []);
  for(const id of ids) await delBlob(id);
  setLS(LS.galleryOrder, []);
  renderGallery();
});

const gigFiles = document.getElementById('gigFiles');
gigFiles.addEventListener('change', async e=>{
  if(!unlocked) return;
  const gigs = getLS(LS.gigs, DEFAULTS.gigs);
  let i=0;
  for(const f of e.target.files){
    if(i>=4) break;
    const id = 'gig_'+Date.now()+'_'+i;
    await putBlob(id,f);
    gigs[i].posterId=id;
    i++;
  }
  setLS(LS.gigs, gigs);
  renderGigs();
});
document.getElementById('resetGigs').addEventListener('click', ()=>{
  if(!unlocked) return;
  setLS(LS.gigs, DEFAULTS.gigs);
  renderGigs();
});

const videoFiles = document.getElementById('videoFiles');
videoFiles.addEventListener('change', async e=>{
  if(!unlocked) return;
  const vids = getLS('pb_videos', []);
  for(const f of e.target.files){
    const id = 'vid_'+Date.now()+'_'+Math.random().toString(36).slice(2,7);
    await putBlob(id,f);
    vids.push({id});
  }
  localStorage.setItem('pb_videos', JSON.stringify(vids));
  renderVideos();
});
document.getElementById('clearVideos').addEventListener('click', async ()=>{
  if(!unlocked) return;
  const vids = getLS('pb_videos', []);
  for(const v of vids) await delBlob(v.id);
  localStorage.setItem('pb_videos', JSON.stringify([]));
  renderVideos();
});

/* ======= Save button ======= */
document.getElementById('saveBtn').addEventListener('click', (e)=>{
  e.preventDefault();
  if(!unlocked){ alert('Unlock first'); return; }

  setLS(LS.about, aboutInput.value);

  const c = {phone:phoneInput.value, fbTitle:fbTitleInput.value, fbUrl:fbUrlInput.value, address:addressInput.value};
  setLS(LS.contact, c);

  // offers
  const offers = Array.from(offersInputs.querySelectorAll('input')).map(i=>i.value).filter(Boolean);
  setLS(LS.offers, offers);

  // whats on
  const w = Array.from(whatsOnInputs.querySelectorAll('input')).map(i=>i.value);
  setLS(LS.whatsOn, w);

  // times
  const t = Array.from(timesInputs.querySelectorAll('input')).map(i=>i.value);
  setLS(LS.times, t);

  // fixtures
  const rows = fixturesInputs.querySelectorAll('.row');
  const fx = Array.from(rows).map(r=>{
    const [home,away,date,time,channel] = r.querySelectorAll('input');
    return {home:home.value, away:away.value, date:date.value, time:time.value, channel:channel.value};
  });
  setLS(LS.fixtures, fx.slice(0,3));

  populateAdminFields();
  renderAll();
  adminModal.close();
});

/* ======= Render all ======= */
function renderContact(){
  const c = getLS(LS.contact, DEFAULTS.contact);
  const wrap = el('div',{});
  if(c.address) wrap.append(el('div',{html:`<strong>Address:</strong> ${c.address}`}));
  if(c.phone) wrap.append(el('div',{html:`<strong>Telephone:</strong> ${c.phone}`}));
  if(c.fbTitle||c.fbUrl){
    const t = c.fbTitle || 'Facebook';
    const url = c.fbUrl || '#';
    wrap.append(el('div',{html:`<strong>Facebook:</strong> <a href="${url}" target="_blank" rel="noopener">${t}</a>`}));
  }
  document.getElementById('contactCard').innerHTML='';
  document.getElementById('contactCard').append(wrap);
}
function renderAll(){
  renderHero(); renderAbout(); renderOffers(); renderWhatsOn(); renderGigs(); renderFixtures(); renderTimes(); renderGallery(); renderVideos(); renderContact();
}
renderAll();
