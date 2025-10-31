/* Phoenix Bar app.js - admin + rendering */
(() => {
  const qs = sel => document.querySelector(sel);
  const qsa = sel => Array.from(document.querySelectorAll(sel));
  const storeKey = 'phoenixData.v4';
  const passphrase = 'Nugget07';

  const defaults = {
    about: qs('#aboutText')?.textContent.trim() || '',
    phone: '01234 567890',
    fbTitle: 'The Phoenix Bar',
    fbUrl: '#',
    address: '3–4 The High Street, Royal Wootton Bassett, SN4 7BS',
    offers: ['Happy Hour Mon–Fri 4–6pm','2-for-£10 cocktails every Friday','Local ales on rotation'],
    whatsOn: ['Open Mic','Pub Quiz','Acoustic Night','DJ & 2-for-£10 Cocktails','Live Band','Live Music','Chilled Classics'],
    opening: ['12:00 – 23:00','12:00 – 23:00','12:00 – 23:00','12:00 – 23:00','12:00 – 01:00','12:00 – 01:00','12:00 – 23:00'],
    fixtures: [
      {home:'Man United',away:'Liverpool',time:'Sun, Nov 2 · 3:00 PM',channel:'Sky Sports'},
      {home:'Arsenal',away:'Chelsea',time:'Mon, Nov 3 · 5:30 PM',channel:'BT Sport'},
      {home:'Man City',away:'Tottenham',time:'Tue, Nov 4 · 2:00 PM',channel:'Sky Sports'},
    ],
    gigs: [
      {title:'Manhattan Nights', when:'Sat, Nov 1 at 9:15pm', blurb:'5‑piece cover band • free entry', img:null},
      {title:'Lone Sea Breakers', when:'Sat, Nov 8 at 9:00pm', blurb:'Original rock covers • free entry', img:null},
      {title:'', when:'', blurb:'', img:null},
      {title:'', when:'', blurb:'', img:null},
    ],
    gallery: [],
    hero: null
  };

  function load(){
    try{
      const raw = localStorage.getItem(storeKey);
      if(!raw) return {...defaults};
      const data = JSON.parse(raw);
      return {...defaults, ...data};
    }catch(e){ return {...defaults}; }
  }
  function save(data){
    localStorage.setItem(storeKey, JSON.stringify(data));
  }

  const data = load();

  // Render helpers
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const longDays = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

  // Title year
  qs('#year').textContent = new Date().getFullYear();

  // Hero
  if(data.hero) qs('#heroImg').src = data.hero;

  // About & contact
  qs('#aboutText').textContent = data.about;
  qs('#tel').textContent = data.phone;
  qs('#tel').href = 'tel:' + data.phone.replace(/\s+/g,'');
  qs('#fb').textContent = data.fbTitle;
  qs('#fb').href = data.fbUrl || '#';
  qs('#addr').textContent = data.address;

  // Offers
  const offersList = qs('#offersList'); offersList.innerHTML='';
  data.offers.forEach(line => { if(line.trim()){ const li = document.createElement('li'); li.textContent=line; offersList.appendChild(li);} });

  // What’s On cards
  const wo = qs('#whatsRows'); wo.innerHTML='';
  days.forEach((d,i)=>{
    const div = document.createElement('div');
    div.className='col panel';
    div.innerHTML = `<h3 style="margin-top:0">${d}</h3><p>${(data.whatsOn[i]||'').trim()}</p>`;
    wo.appendChild(div);
  });

  // Opening times table
  const tt = qs('#timesTable'); tt.innerHTML='';
  longDays.forEach((d,i)=>{
    const row = document.createElement('div');
    row.className='fixture';
    row.innerHTML = `<strong style="font-style:italic">${d}</strong><span>${(data.opening[i]||'').trim()}</span>`;
    tt.appendChild(row);
  });

  // Gigs (up to 4)
  function renderGigs(){
    const wrap = qs('#gigsWrap'); wrap.innerHTML='';
    data.gigs.slice(0,4).forEach(g => {
      if(!(g.title||g.when||g.blurb||g.img)) return;
      const card = document.createElement('div');
      card.className='card';
      let img = g.img ? `<img src="${g.img}" alt="${g.title}">` : '';
      card.innerHTML = `${img}<div class="body"><h3>${g.title||''}</h3><p><span>${g.when||''}</span></p><p>${g.blurb||''}</p></div>`;
      wrap.appendChild(card);
    });
  }
  renderGigs();

  // Fixtures (next 3)
  function renderFixtures(){
    const wrap = qs('#fixturesWrap'); wrap.innerHTML='';
    data.fixtures.slice(0,3).forEach(f => {
      const div = document.createElement('div');
      div.className='fixture';
      div.innerHTML = `<div><strong>${f.home}</strong> vs <strong>${f.away}</strong><div style="opacity:.8">${f.time}</div></div><span class="badge">${f.channel||''}</span>`;
      wrap.appendChild(div);
    });
  }
  renderFixtures();

  // Gallery
  function renderGallery(){
    const wrap = qs('#galleryWrap'); wrap.innerHTML='';
    data.gallery.forEach(src => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `<img src="${src}" alt="Gallery photo">`;
      wrap.appendChild(card);
    });
  }
  renderGallery();

  // ================= Admin ================
  const lockBtn = qs('#lockBtn');
  const admin = qs('#admin');
  const adminBody = qs('#adminBody');
  const passInput = qs('#pass');
  const lockState = qs('#lockState');
  const unlockBtn = qs('#unlockBtn');
  const closeAdmin = qs('#closeAdmin');

  // Corner long-press to reveal lock button
  let pressTimer;
  function startPress(e){
    const w = window.innerWidth, h = window.innerHeight;
    const x = (e.touches?e.touches[0].clientX:e.clientX);
    const y = (e.touches?e.touches[0].clientY:e.clientY);
    if(x > w-80 && y > h-80){
      pressTimer = setTimeout(()=> lockBtn.classList.add('show'), 1000);
    }
  }
  function cancelPress(){ clearTimeout(pressTimer); }
  document.addEventListener('touchstart', startPress, {passive:true});
  document.addEventListener('touchend', cancelPress);
  document.addEventListener('mousedown', startPress);
  document.addEventListener('mouseup', cancelPress);

  lockBtn.addEventListener('click', ()=>{
    admin.classList.remove('hidden');
    admin.style.display='flex';
  });
  closeAdmin.addEventListener('click', ()=>{
    admin.classList.add('hidden');
    admin.style.display='none';
  });

  function setLocked(v){
    if(v){
      lockState.textContent = 'Locked';
      adminBody.classList.add('hidden');
    } else {
      lockState.textContent = 'Unlocked ✓';
      adminBody.classList.remove('hidden');
    }
  }
  setLocked(true);

  unlockBtn.addEventListener('click', ()=>{
    if((passInput.value||'').trim() === passphrase){
      setLocked(false);
    } else {
      alert('Wrong passphrase.');
    }
  });

  // Admin controls
  // Fill inputs
  qs('#aboutInput').value = data.about;
  qs('#telInput').value = data.phone;
  qs('#fbTitleInput').value = data.fbTitle;
  qs('#fbUrlInput').value = data.fbUrl;
  qs('#addrInput').value = data.address;
  qs('#offersInput').value = data.offers.join('\n');

  // Whats On & Opening Times grids
  const woGrid = qs('#woGrid'); const otGrid = qs('#otGrid');
  days.forEach((d,i)=>{
    const w = document.createElement('div');
    w.innerHTML = `<label>${d}<br><input data-wo="${i}" value="${data.whatsOn[i]||''}"></label>`;
    woGrid.appendChild(w);
    const o = document.createElement('div');
    o.innerHTML = `<label>${d}<br><input data-ot="${i}" value="${data.opening[i]||''}"></label>`;
    otGrid.appendChild(o);
  });

  // Fixtures inputs
  const fxGrid = qs('#fxGrid'); fxGrid.innerHTML='';
  for(let i=0;i<3;i++){
    const f = data.fixtures[i] || {home:'',away:'',time:'',channel:''};
    const row = document.createElement('div');
    row.className='grid';
    row.innerHTML = `
      <input placeholder="Home" data-fxh="${i}" value="${f.home||''}">
      <input placeholder="Away" data-fxa="${i}" value="${f.away||''}">
      <input placeholder="Date & time" data-fxt="${i}" value="${f.time||''}">
      <input placeholder="Channel" data-fxc="${i}" value="${f.channel||''}">
    `;
    fxGrid.appendChild(row);
  }

  // Gig meta inputs (title/date/blurb for up to 4)
  const gm = qs('#gigMeta'); gm.innerHTML='';
  for(let i=0;i<4;i++){
    const g = data.gigs[i] || {title:'',when:'',blurb:'',img:null};
    const box = document.createElement('div');
    box.innerHTML = `
      <label>Title<br><input data-gt="${i}" value="${g.title||''}"></label>
      <label>Date & time<br><input data-gw="${i}" value="${g.when||''}"></label>
      <label>Blurb<br><input data-gb="${i}" value="${g.blurb||''}"></label>
    `;
    gm.appendChild(box);
  }

  // File pickers
  function filesToDataURLs(files, cb){
    const out = []; let i=0;
    function next(){
      if(i>=files.length) return cb(out);
      const file = files[i++];
      const reader = new FileReader();
      reader.onload = e => { out.push(e.target.result); next(); };
      reader.readAsDataURL(file);
    }
    next();
  }

  qs('#heroFile').addEventListener('change', e=>{
    const file = e.target.files[0]; if(!file) return;
    const r = new FileReader();
    r.onload = ev => { data.hero = ev.target.result; qs('#heroImg').src = data.hero; save(data); };
    r.readAsDataURL(file);
  });

  qs('#galleryFiles').addEventListener('change', e=>{
    filesToDataURLs(e.target.files, urls => {
      data.gallery = urls; renderGallery(); save(data);
    });
  });
  qs('#clearGallery').addEventListener('click', ()=>{
    if(confirm('Clear gallery?')){ data.gallery = []; renderGallery(); save(data); }
  });

  qs('#gigFiles').addEventListener('change', e=>{
    filesToDataURLs(e.target.files, urls => {
      for(let i=0;i<4;i++){
        data.gigs[i] = data.gigs[i] || {title:'',when:'',blurb:'',img:null};
        data.gigs[i].img = urls[i] || data.gigs[i].img || null;
      }
      renderGigs(); save(data);
    });
  });
  qs('#resetGigs').addEventListener('click', ()=>{
    if(confirm('Reset gigs?')){
      data.gigs = defaults.gigs.map(x=>({...x, img:null}));
      renderGigs(); save(data);
    }
  });

  // Save button
  qs('#saveBtn').addEventListener('click', ()=>{
    data.about = qs('#aboutInput').value.trim();
    data.phone = qs('#telInput').value.trim();
    data.fbTitle = qs('#fbTitleInput').value.trim();
    data.fbUrl = qs('#fbUrlInput').value.trim();
    data.address = qs('#addrInput').value.trim();
    data.offers = qs('#offersInput').value.split('\n').map(s=>s.trim()).filter(Boolean);

    days.forEach((d,i)=>{
      data.whatsOn[i] = qs(`[data-wo="${i}"]`).value;
      data.opening[i] = qs(`[data-ot="${i}"]`).value;
    });

    for(let i=0;i<3;i++){
      data.fixtures[i] = {
        home: qs(`[data-fxh="${i}"]`).value,
        away: qs(`[data-fxa="${i}"]`).value,
        time: qs(`[data-fxt="${i}"]`).value,
        channel: qs(`[data-fxc="${i}"]`).value,
      }
    }

    for(let i=0;i<4;i++){
      data.gigs[i] = data.gigs[i] || {title:'',when:'',blurb:'',img:null};
      data.gigs[i].title = qs(`[data-gt="${i}"]`).value;
      data.gigs[i].when = qs(`[data-gw="${i}"]`).value;
      data.gigs[i].blurb = qs(`[data-gb="${i}"]`).value;
    }

    save(data);
    // Re-render changed parts
    qs('#aboutText').textContent = data.about;
    qs('#tel').textContent = data.phone; qs('#tel').href = 'tel:'+data.phone.replace(/\s+/g,'');
    qs('#fb').textContent = data.fbTitle; qs('#fb').href = data.fbUrl || '#';
    qs('#addr').textContent = data.address;
    // offers
    const offersList = qs('#offersList'); offersList.innerHTML=''; data.offers.forEach(l=>{const li=document.createElement('li'); li.textContent=l; offersList.appendChild(li)});
    // whats on
    qsa('#whatsRows .col p').forEach((p,i)=>p.textContent=data.whatsOn[i]||'');
    // opening
    qsa('#timesTable .fixture span').forEach((s,i)=>s.textContent=data.opening[i]||'');
    renderFixtures(); renderGigs();
    alert('Saved.');
  });

})();