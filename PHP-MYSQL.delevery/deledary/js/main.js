/* ============== PARCELX — Shared JS ============== */

// ----- Particles background -----
function initParticles(count = 30){
  const wrap = document.querySelector('.particles');
  if(!wrap) return;
  for(let i=0;i<count;i++){
    const s = document.createElement('span');
    const size = Math.random()*4+2;
    s.style.width = s.style.height = size+'px';
    s.style.left = Math.random()*100+'%';
    s.style.animationDuration = (Math.random()*15+10)+'s';
    s.style.animationDelay = (Math.random()*-20)+'s';
    s.style.background = Math.random()>.5 ? '#ff6a00' : '#3b82f6';
    s.style.boxShadow = `0 0 12px ${s.style.background}`;
    s.style.opacity = (Math.random()*.5+.2);
    wrap.appendChild(s);
  }
}

// ----- Animated counters -----
function initCounters(){
  const els = document.querySelectorAll('[data-count]');
  if(!els.length) return;
  const io = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(!e.isIntersecting) return;
      const el = e.target;
      const target = +el.dataset.count;
      const dur = 1600;
      const start = performance.now();
      const suffix = el.dataset.suffix || '';
      function tick(now){
        const p = Math.min(1,(now-start)/dur);
        const eased = 1 - Math.pow(1-p,3);
        el.textContent = Math.floor(target*eased).toLocaleString()+suffix;
        if(p<1) requestAnimationFrame(tick);
        else el.textContent = target.toLocaleString()+suffix;
      }
      requestAnimationFrame(tick);
      io.unobserve(el);
    });
  },{threshold:.4});
  els.forEach(el=>io.observe(el));
}

// ----- Tracking demo -----
function initTracking(){
  const form = document.getElementById('trackForm');
  if(!form) return;
  const items = document.querySelectorAll('.tl-item');
  const line = document.querySelector('.tl-line');
  function animate(activeIndex){
    items.forEach((it,i)=>{
      setTimeout(()=>{
        it.classList.toggle('active', i<=activeIndex);
      }, i*250);
    });
    if(line){
      const total = items.length;
      const pct = ((activeIndex+1)/total)*100;
      const wrap = document.querySelector('.timeline');
      const h = wrap.offsetHeight - 20;
      setTimeout(()=>{ line.style.height = (h*pct/100)+'px'; }, 100);
    }
  }
  // initial
  setTimeout(()=>animate(2), 300);
  form.addEventListener('submit', e=>{
    e.preventDefault();
    const id = document.getElementById('trackId').value.trim() || 'PX-918273';
    document.getElementById('trackedId').textContent = id;
    // fake stage based on length
    const stage = Math.min(4, Math.max(0, id.length % 5));
    animate(stage);
  });
}

// ----- Send Parcel multi-step -----
function initSendForm(){
  const wrap = document.getElementById('sendForm');
  if(!wrap) return;
  const panes = wrap.querySelectorAll('.fpane');
  const steps = document.querySelectorAll('.s-step');
  const bar = document.querySelector('.stepper .bar');
  let i = 0;
  const max = panes.length-1;
  function update(){
    panes.forEach((p,idx)=>p.classList.toggle('active', idx===i));
    steps.forEach((s,idx)=>{
      s.classList.toggle('active', idx===i);
      s.classList.toggle('done', idx<i);
    });
    if(bar){
      const w = (i/(max)) * 88; // 88% available between 6%->94%
      bar.style.width = w+'%';
    }
    if(i===max) buildSummary();
  }
  wrap.addEventListener('click', e=>{
    if(e.target.matches('[data-next]')){
      if(i<max){ i++; update(); }
    }
    if(e.target.matches('[data-prev]')){
      if(i>0){ i--; update(); }
    }
  });
  // live price
  const weight = document.getElementById('weight');
  const ptype = document.getElementById('ptype');
  const price = document.getElementById('price');
  function calc(){
    if(!weight||!price) return;
    const w = parseFloat(weight.value)||0;
    const base = ptype && ptype.value==='express' ? 12 : ptype && ptype.value==='overnight' ? 22 : 6;
    const p = (base + w*1.5).toFixed(2);
    price.textContent = '$'+p;
  }
  weight && weight.addEventListener('input', calc);
  ptype && ptype.addEventListener('change', calc);
  calc();

  function buildSummary(){
    const sum = document.getElementById('summary');
    if(!sum) return;
    const get = id => (document.getElementById(id)||{}).value || '—';
    const data = {
      'Sender': `${get('sname')} • ${get('sphone')}`,
      'From': get('saddr'),
      'Receiver': `${get('rname')} • ${get('rphone')}`,
      'To': get('raddr'),
      'Parcel': `${get('ptype')} • ${get('weight')}kg`,
      'Notes': get('notes'),
      'Estimated Price': price.textContent,
      'ETA': '2-4 business days'
    };
    sum.innerHTML = Object.entries(data).map(([k,v])=>`
      <div class="row"><div class="k">${k}</div><div class="v">${v}</div></div>
    `).join('');
  }

  const submit = document.getElementById('submitParcel');
  submit && submit.addEventListener('click', e=>{
    e.preventDefault();
    const id = 'PX-' + Math.floor(100000+Math.random()*900000);
    location.href = `success.html?id=${id}`;
  });

  update();
}

// ----- Auth tabs -----
function initAuth(){
  const tabs = document.querySelectorAll('.auth-tabs button');
  if(!tabs.length) return;
  tabs.forEach(t=>t.addEventListener('click',()=>{
    tabs.forEach(x=>x.classList.remove('active'));
    t.classList.add('active');
    document.querySelectorAll('.auth-pane').forEach(p=>p.style.display='none');
    document.getElementById(t.dataset.tab).style.display='block';
  }));
}

// ----- Success page -----
function initSuccess(){
  const out = document.getElementById('successId');
  if(!out) return;
  const params = new URLSearchParams(location.search);
  out.textContent = params.get('id') || 'PX-' + Math.floor(100000+Math.random()*900000);
  // confetti
  const c = document.createElement('div');
  c.className = 'confetti';
  document.body.appendChild(c);
  const colors = ['#ff6a00','#3b82f6','#22c55e','#ffffff','#ff9248'];
  for(let i=0;i<120;i++){
    const p = document.createElement('i');
    p.style.left = Math.random()*100+'%';
    p.style.background = colors[Math.floor(Math.random()*colors.length)];
    p.style.animationDuration = (Math.random()*2+2.5)+'s';
    p.style.animationDelay = (Math.random()*1.2)+'s';
    p.style.transform = `rotate(${Math.random()*360}deg)`;
    c.appendChild(p);
  }
  setTimeout(()=>c.remove(), 6000);
}

// ----- Dashboard -----
function initDashboard(){
  const svg = document.getElementById('lineChart');
  if(!svg) return;

  // Animated line chart
  const data = [12,18,14,28,22,36,30,44,38,52,48,64];
  const w = 600, h = 220, pad = 30;
  const max = Math.max(...data);
  const stepX = (w - pad*2) / (data.length-1);
  const pts = data.map((v,i)=>[pad + i*stepX, h - pad - (v/max)*(h - pad*2)]);
  const path = pts.map((p,i)=>`${i===0?'M':'L'}${p[0]},${p[1]}`).join(' ');
  const area = path + ` L${pts.at(-1)[0]},${h-pad} L${pts[0][0]},${h-pad} Z`;
  svg.setAttribute('viewBox',`0 0 ${w} ${h}`);
  svg.innerHTML = `
    <defs>
      <linearGradient id="lg" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="#ff6a00" stop-opacity=".55"/>
        <stop offset="100%" stop-color="#ff6a00" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="lgline" x1="0" x2="1">
        <stop offset="0%" stop-color="#ff6a00"/>
        <stop offset="100%" stop-color="#3b82f6"/>
      </linearGradient>
    </defs>
    ${[0,1,2,3,4].map(i=>`<line x1="${pad}" x2="${w-pad}" y1="${pad+i*((h-pad*2)/4)}" y2="${pad+i*((h-pad*2)/4)}" stroke="rgba(255,255,255,.05)"/>`).join('')}
    <path d="${area}" fill="url(#lg)" opacity="0">
      <animate attributeName="opacity" from="0" to="1" dur="1.2s" fill="freeze"/>
    </path>
    <path d="${path}" fill="none" stroke="url(#lgline)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1">
      <animate attributeName="stroke-dashoffset" from="1" to="0" dur="1.6s" fill="freeze"/>
    </path>
    ${pts.map(p=>`<circle cx="${p[0]}" cy="${p[1]}" r="4" fill="#0a1020" stroke="#ff6a00" stroke-width="2" opacity="0"><animate attributeName="opacity" from="0" to="1" dur=".4s" begin="1.4s" fill="freeze"/></circle>`).join('')}
  `;

  // Pie chart
  const pie = document.querySelector('.pie');
  if(pie){
    const seg = [{l:'Delivered', v:62, c:'#ff6a00'},{l:'In Transit', v:24, c:'#3b82f6'},{l:'Pending', v:10, c:'#facc15'},{l:'Failed', v:4, c:'#ef4444'}];
    let acc=0; const stops = seg.map(s=>{const from=acc; acc+=s.v; return `${s.c} ${from}% ${acc}%`;}).join(',');
    setTimeout(()=>{ pie.style.background = `conic-gradient(${stops})`; }, 200);
    const legend = document.querySelector('.legend');
    if(legend){
      legend.innerHTML = seg.map(s=>`<div class="l-row"><span class="sw" style="background:${s.c}"></span>${s.l} <strong style="margin-left:auto;color:#fff">${s.v}%</strong></div>`).join('');
    }
  }
}

// ----- Init on load -----
document.addEventListener('DOMContentLoaded', ()=>{
  initParticles();
  initCounters();
  initTracking();
  initSendForm();
  initAuth();
  initSuccess();
  initDashboard();
});
