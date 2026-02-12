(function(){
  const { loadState, updateState, initLayout, moduleTitles } = window.ALSApp;
  const main = initLayout('Course Modules');
  const total = moduleTitles.length;

  const modules = [
    { title: 'Module 0 — Welcome & Rules', duration:'2 mins', required: 'm0_ack', content: module0 },
    { title: 'Module 1 — UK Legal Duties', duration:'6–8 mins', required: 'm1_mcq', content: module1 },
    { title: 'Module 2 — Competency & Limits', duration:'5–7 mins', required: 'm2_scenarios', content: module2 },
    { title: 'Module 2A — Instruction, Training, Supervision', duration:'10–12 mins', required: 'm2a_ack_check', content: module2a },
    { title: 'Module 2B — Training Evidence & Practical Sign-off', duration:'8–10 mins', required: 'm2b_mini', content: module2b },
    { title: 'Module 3 — Hazards & Warning Signs', duration:'8 mins', required: 'm3_hazard', content: module3 },
    { title: 'Module 4 — Controls & Safe Isolation', duration:'12–18 mins', required: 'm4_order', content: module4 },
    { title: 'Module 5 — Inspection, Testing, Housekeeping', duration:'6 mins', required: 'm5_evidence', content: module5 },
    { title: 'Module 6 — Emergencies & Reporting', duration:'6 mins', required: 'm6_branch', content: module6 }
  ];

  function getState(){ return loadState(); }
  function getInteractionState(){ return getState().course.moduleInteractions || {}; }
  function isDone(key){ return Boolean(getInteractionState()[key]); }
  function setDone(key,val=true){ updateState(s=>{ s.course.moduleInteractions[key]=val; }); render(); }
  function saveInteraction(key, value){ updateState(s=>{ s.course.moduleInteractions[key] = value; }); }

  function render(){
    const state = getState();
    const idx = Math.min(state.course.currentModuleIndex || 0, modules.length-1);
    const mod = modules[idx];
    const completionCount = state.course.moduleCompletion.filter(Boolean).length;
    const pct = Math.round((completionCount / total) * 100);
    main.innerHTML = `
      <section class="progress-wrap" aria-label="Course progress">
        <p>Module ${idx+1} of ${total}</p>
        <div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"><span style="width:${pct}%"></span></div>
      </section>
      <article class="card">
        <h2>${mod.title}</h2>
        <p class="muted">Estimated time: ${mod.duration}</p>
        <div id="moduleContent"></div>
        <div class="nav-buttons">
          <button class="btn secondary" id="prevBtn" ${idx===0?'disabled':''}>Previous</button>
          <button class="btn" id="nextBtn" ${!isDone(mod.required)?'disabled':''}>${idx===modules.length-1?'Go to Final Assessment':'Next'}</button>
        </div>
      </article>`;
    mod.content(main.querySelector('#moduleContent'));

    main.querySelector('#prevBtn').onclick = ()=> updateState(s=>{ s.course.currentModuleIndex=Math.max(0,idx-1); });
    main.querySelector('#nextBtn').onclick = ()=>{
      updateState(s=>{
        s.course.moduleCompletion[idx]=true;
        if(!s.course.startedAtISO) s.course.startedAtISO = new Date().toISOString();
        if(idx<modules.length-1) s.course.currentModuleIndex=idx+1;
        else s.course.completedAtISO = new Date().toISOString();
      });
      if(idx===modules.length-1) location.href='quiz.html';
      else render();
    };
  }

  function conceptPanel({title, visual, explanation, terms, tryId}){
    return `<section class="concept-panel" aria-label="${title}">
      <div class="concept-visual">${visual}</div>
      <div class="concept-copy">
        <h3>${title}</h3>
        <p>${explanation}</p>
        <ul>${terms.map(t=>`<li>${t}</li>`).join('')}</ul>
      </div>
      <div class="try-block" id="${tryId}"><h4>Try it</h4></div>
    </section>`;
  }

  function module0(el){
    el.innerHTML = `<p>Purpose: prevent shock, burns/arc flash, fire, and secondary injuries. Applies to anyone using, cleaning, isolating, inspecting, or working near electrics.</p>
    <p><strong>Core rule:</strong> If it’s not isolated, it’s live.</p>
    <p class="alert">Passing this course does not make you an electrician and does not authorise panel work, live testing, or fixed wiring modifications.</p>
    <label class="inline"><input id="m0" type="checkbox" ${isDone('m0_ack')?'checked':''}>I understand this is awareness training and I must work within my competency and site rules.</label>`;
    el.querySelector('#m0').addEventListener('change',e=>setDone('m0_ack',e.target.checked));
  }

  function dutyMapSvg(){
    return `<svg viewBox="0 0 640 280" role="img" aria-label="Duty map of employer and employee duties">
      <rect x="10" y="10" width="620" height="260" rx="14" fill="#f8fafc" stroke="#cbd5e1"/>
      <rect x="30" y="44" width="270" height="210" rx="12" fill="#dbeafe"/>
      <rect x="340" y="44" width="270" height="210" rx="12" fill="#dcfce7"/>
      <text x="165" y="34" text-anchor="middle" font-size="18" font-weight="700">Employer duties</text>
      <text x="475" y="34" text-anchor="middle" font-size="18" font-weight="700">Employee duties</text>
      <circle cx="70" cy="78" r="16" fill="#1d4ed8"/><text x="70" y="83" font-size="16" text-anchor="middle" fill="white">🛡</text>
      <circle cx="70" cy="130" r="16" fill="#1d4ed8"/><text x="70" y="136" font-size="14" text-anchor="middle" fill="white">⚙</text>
      <circle cx="70" cy="182" r="16" fill="#1d4ed8"/><text x="70" y="188" font-size="14" text-anchor="middle" fill="white">👁</text>
      <text x="95" y="84" font-size="13">Safe systems of work</text>
      <text x="95" y="136" font-size="13">Maintain equipment</text>
      <text x="95" y="188" font-size="13">Training + supervision</text>
      <circle cx="380" cy="88" r="16" fill="#16a34a"/><text x="380" y="94" font-size="14" text-anchor="middle" fill="white">👤</text>
      <circle cx="380" cy="145" r="16" fill="#16a34a"/><text x="380" y="151" font-size="14" text-anchor="middle" fill="white">🤝</text>
      <circle cx="380" cy="202" r="16" fill="#16a34a"/><text x="380" y="208" font-size="14" text-anchor="middle" fill="white">⛔</text>
      <text x="405" y="94" font-size="13">Take reasonable care</text>
      <text x="405" y="151" font-size="13">Cooperate with controls</text>
      <text x="405" y="208" font-size="13">Do not interfere with safety devices</text>
    </svg>`;
  }

  function module1(el){
    const cards = [
      ['Provide safe systems of work','Employer'],
      ['Provide training and supervision','Employer'],
      ['Maintain equipment','Employer'],
      ['Take reasonable care','Employee'],
      ['Cooperate with arrangements','Employee'],
      ['Do not interfere with safety devices','Employee']
    ];
    const choices = {};
    el.innerHTML = conceptPanel({
      title: 'Duty Map: who is responsible for what?',
      visual: dutyMapSvg(),
      explanation: 'UK duties work as a paired system: employers create safe conditions and workers follow those controls in practice.',
      terms: ['HSWA s.2: employer systems/equipment/training.', 'HSWA s.7-8: worker care/cooperation/no interference.', 'EAWR: prevent danger; dead working is the default.'],
      tryId: 'm1try'
    }) + `<div class="quiz-mini" id="m1checks"></div>`;

    const tryEl = el.querySelector('#m1try');
    tryEl.innerHTML += `<p>Sort each duty card into the correct column (click card, then assign button).</p>
      <div class="sort-grid" id="dutySort"></div>
      <div class="assign-controls"><button class="btn tiny" id="assignEmployer">Assign to Employer</button><button class="btn tiny secondary" id="assignEmployee">Assign to Employee</button></div>
      <p class="feedback" id="sortFb"></p>
      <p class="recap hidden" id="m1recap">Recap: Employer controls make safe work possible; employee behaviours keep those controls effective.</p>`;
    const sortEl = tryEl.querySelector('#dutySort');
    cards.forEach(([text], i)=>{
      sortEl.insertAdjacentHTML('beforeend', `<button class="duty-card" data-id="${i}" aria-pressed="false">${text}<span class="pill">Unassigned</span></button>`);
    });
    let selected = null;
    sortEl.querySelectorAll('.duty-card').forEach(btn=>btn.addEventListener('click',()=>{
      selected = btn.dataset.id;
      sortEl.querySelectorAll('.duty-card').forEach(c=>c.classList.remove('selected'));
      btn.classList.add('selected');
    }));
    function assign(col){
      if(selected===null) return;
      choices[selected]=col;
      const card = sortEl.querySelector(`[data-id="${selected}"]`);
      card.querySelector('.pill').textContent = col;
      card.classList.remove('selected');
      selected=null;
      checkSort();
    }
    tryEl.querySelector('#assignEmployer').onclick=()=>assign('Employer');
    tryEl.querySelector('#assignEmployee').onclick=()=>assign('Employee');

    function checkSort(){
      const done = cards.every((_,i)=>choices[i]);
      if(!done) return;
      const wrong = cards.filter(([,correct],i)=>choices[i]!==correct);
      const fb = tryEl.querySelector('#sortFb');
      if(!wrong.length){
        fb.textContent = 'Great sorting. Why this matters: legal duties only work when both columns are fulfilled. Common mistake: assuming training alone shifts all responsibility to workers.';
        tryEl.querySelector('#m1recap').classList.remove('hidden');
        renderQuickChecks();
      } else {
        fb.textContent = `Review these cards: ${wrong.map(w=>w[0]).join('; ')}.`;
      }
    }

    function renderQuickChecks(){
      const c = el.querySelector('#m1checks');
      c.innerHTML = `<fieldset><legend>Check 1: From the duty map, employee duties include?</legend>
        <label><input type="radio" name="m1q1" value="A">Provide all training systems</label>
        <label><input type="radio" name="m1q1" value="B">Take reasonable care and cooperate</label></fieldset><p class="feedback" id="m1f1"></p>
        <fieldset><legend>Check 2: Live work acceptable when?</legend>
        <label><input type="radio" name="m1q2" value="A">Whenever faster</label>
        <label><input type="radio" name="m1q2" value="B">Only if unreasonable to make dead and precautions taken</label></fieldset><p class="feedback" id="m1f2"></p>`;
      c.querySelectorAll('input').forEach(i=>i.addEventListener('change',()=>{
        const a1=c.querySelector('input[name="m1q1"]:checked')?.value;
        const a2=c.querySelector('input[name="m1q2"]:checked')?.value;
        c.querySelector('#m1f1').textContent=a1 ? (a1==='B'?'Correct: this sits in the employee column.':'Not quite; that sits in the employer column.') : '';
        c.querySelector('#m1f2').textContent=a2 ? (a2==='B'?'Correct: decision flow should prefer dead working.':'Not correct; speed is never justification alone.') : '';
        if(a1&&a2) setDone('m1_mcq', true);
      }));
    }
  }

  function ladderSvg(){
    return `<svg viewBox="0 0 640 230" role="img" aria-label="Competency ladder levels 0 to 3"><rect x="20" y="20" width="600" height="180" rx="14" fill="#f8fafc" stroke="#cbd5e1"/>
      ${[0,1,2,3].map(i=>`<rect x="${40+i*145}" y="60" width="120" height="110" rx="10" fill="${['#e2e8f0','#bfdbfe','#93c5fd','#60a5fa'][i]}"/><text x="${100+i*145}" y="88" text-anchor="middle" font-size="18" font-weight="700">L${i}</text>`).join('')}
      <text x="100" y="116" text-anchor="middle" font-size="12">Awareness only</text><text x="245" y="116" text-anchor="middle" font-size="12">Routine user checks</text><text x="390" y="116" text-anchor="middle" font-size="12">Task-specific isolations</text><text x="535" y="116" text-anchor="middle" font-size="12">Panel/live testing</text>
      <text x="320" y="46" text-anchor="middle" font-size="16" font-weight="700">Escalate as risk and complexity rise</text></svg>`;
  }

  function module2(el){
    const scenarios = [
      {text:'Visual pre-use check on plug top and cable', level:1, good:'Within scope', icon:'🔍'},
      {text:'Bypass guard interlock to keep line running', level:3, good:'Not within scope', icon:'🚫'},
      {text:'Reset a tripped MCB once after basic checks', level:1, good:'Within scope', icon:'🔁'},
      {text:'Open distribution board to diagnose fault', level:3, good:'Escalate', icon:'⚡'},
      {text:'Replace damaged extension lead with approved spare', level:2, good:'Within scope', icon:'🧰'},
      {text:'Investigate repeated burning smell in panel area', level:3, good:'Escalate', icon:'🔥'}
    ];
    el.innerHTML = conceptPanel({title:'Competency Ladder', visual:ladderSvg(), explanation:'Authorisation should match competency level. If the task pushes into panel access, live testing, or uncertain conditions, STOP and escalate.', terms:['L0-L1: awareness and basic user checks.', 'L2: trained task-specific isolation activity.', 'L3: specialist electrical work only.'], tryId:'m2try'});
    const tryEl = el.querySelector('#m2try');
    tryEl.innerHTML += '<div id="scenarioCards" class="scenario-grid"></div><p class="feedback" id="m2fb"></p><p class="recap hidden" id="m2recap">Recap: if the ladder says L3, your safest action is usually Escalate.</p>';
    const sc = tryEl.querySelector('#scenarioCards');
    const picked = {};
    scenarios.forEach((s,i)=>{
      sc.insertAdjacentHTML('beforeend', `<div class="scenario-card"><h4>${s.icon} ${s.text}</h4><p class="muted">Ladder level: <strong>L${s.level}</strong></p>
      <div class="choice-row">${['Within scope','Not within scope','Escalate'].map(c=>`<button class="btn tiny secondary" data-i="${i}" data-c="${c}">${c}</button>`).join('')}</div><p class="feedback" id="m2f${i}"></p></div>`);
    });
    sc.querySelectorAll('button').forEach(btn=>btn.onclick=()=>{
      const i = Number(btn.dataset.i); const choice = btn.dataset.c; picked[i]=choice;
      const s = scenarios[i];
      const ok = choice===s.good;
      const reason = ok ? `Correct. This is Level ${s.level}: ${s.level>=3?'specialist/high-risk task.':'authorised basic task.'}` : `This is Level ${s.level}; better action is "${s.good}".`;
      sc.querySelector(`#m2f${i}`).textContent = `${reason} Why this matters: wrong scope decisions expose people to live hazards. Common mistake: treating urgency as competence.`;
      if(Object.keys(picked).length===scenarios.length){
        setDone('m2_scenarios', true);
        tryEl.querySelector('#m2recap').classList.remove('hidden');
      }
    });
  }

  function stopEscalateSvg(){
    return `<svg viewBox="0 0 640 210" role="img" aria-label="Stop and escalate warning panel"><rect x="10" y="10" width="620" height="190" rx="12" fill="#fff1f2" stroke="#fecdd3"/>
      ${['Smell','Heat','Water','Trips','Unlabelled'].map((n,i)=>`<g transform="translate(${40+i*118},55)"><circle cx="40" cy="40" r="34" fill="#ef4444"/><text x="40" y="46" text-anchor="middle" font-size="20" fill="white">${['👃','🌡','💧','⚠','❓'][i]}</text><text x="40" y="96" text-anchor="middle" font-size="12">${n}</text></g>`).join('')}
      <text x="320" y="28" text-anchor="middle" font-size="18" font-weight="700">STOP & ESCALATE triggers</text></svg>`;
  }

  function module2a(el){
    const hazards = ['Burning smell', 'Abnormal heat', 'Water near electrical equipment', 'Repeated unexplained tripping', 'Unlabelled isolator'];
    const selected = new Set();
    el.innerHTML = conceptPanel({title:'Stop & Escalate', visual:stopEscalateSvg(), explanation:'Some signs always require immediate STOP because they indicate uncertain electrical state.', terms:['Stop task and keep others clear.', 'Escalate to authorised electrical person.', 'Record what was observed.'], tryId:'m2atry'});
    const t = el.querySelector('#m2atry');
    t.innerHTML += `<p>Select all conditions requiring immediate STOP (hotspots or checklist).</p><div class="hotspot-list" id="stopList"></div><button class="btn" id="stopCheck">Check</button><p id="m2afb" class="feedback"></p>`;
    const l=t.querySelector('#stopList');
    hazards.forEach((h,i)=>l.insertAdjacentHTML('beforeend',`<label><input type="checkbox" data-i="${i}">${h}</label>`));
    l.querySelectorAll('input').forEach(ch=>ch.addEventListener('change',()=>{ ch.checked ? selected.add(Number(ch.dataset.i)) : selected.delete(Number(ch.dataset.i)); }));
    t.querySelector('#stopCheck').onclick=()=>{
      const ok = selected.size===hazards.length;
      t.querySelector('#m2afb').textContent = ok ? 'Correct. All listed triggers are immediate STOP signals. Why this matters: unknown electrical conditions can escalate quickly. Common mistake: continuing while “just observing”.' : 'Select every trigger shown in the warning panel.';
      if(ok) setDone('m2a_ack_check', true);
    };
  }

  function module2b(el){
    const mustHave = ['Training record','Assessment result','Authorisation scope','Supervision record','Refresher due date'];
    el.innerHTML = conceptPanel({title:'Evidence Chain', visual:`<svg viewBox="0 0 700 170" role="img" aria-label="Evidence chain from training to refresher">
      <rect x="20" y="35" width="100" height="50" rx="8" fill="#bfdbfe"/><rect x="130" y="35" width="100" height="50" rx="8" fill="#bfdbfe"/><rect x="240" y="35" width="120" height="50" rx="8" fill="#bfdbfe"/><rect x="370" y="35" width="110" height="50" rx="8" fill="#bfdbfe"/><rect x="490" y="35" width="90" height="50" rx="8" fill="#bfdbfe"/><rect x="590" y="35" width="90" height="50" rx="8" fill="#bfdbfe"/>
      <text x="70" y="65" text-anchor="middle" font-size="12">Training</text><text x="180" y="65" text-anchor="middle" font-size="12">Assessment</text><text x="300" y="65" text-anchor="middle" font-size="12">Authorisation</text><text x="425" y="65" text-anchor="middle" font-size="12">Supervision</text><text x="535" y="65" text-anchor="middle" font-size="12">Records</text><text x="635" y="65" text-anchor="middle" font-size="12">Refresher</text>
      <path d="M120 60H130M230 60H240M360 60H370M480 60H490M580 60H590" stroke="#1d4ed8" stroke-width="3" marker-end="url(#a)"/>
      <defs><marker id="a" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#1d4ed8"/></marker></defs></svg>`, explanation:'Auditors look for a chain of evidence proving the system works, not single statements.', terms:['Evidence should show competence + scope + oversight.', 'Records must be current and traceable.', 'Refreshers prevent skill fade.'], tryId:'m2btry'})
      + `<div class="quiz-mini" id="m2bmini"></div>`;
    const t=el.querySelector('#m2btry');
    t.innerHTML += '<div id="recordTiles" class="tile-grid"></div><button class="btn" id="recordCheck">Build defensible record</button><p id="recordFb" class="feedback"></p>';
    const opts=[...mustHave,'Manager says “competent” verbally','No date shown'];
    const rt=t.querySelector('#recordTiles');
    opts.forEach(o=>rt.insertAdjacentHTML('beforeend',`<label class="tile"><input type="checkbox" value="${o}">${o}</label>`));
    t.querySelector('#recordCheck').onclick=()=>{
      const selected=[...rt.querySelectorAll('input:checked')].map(i=>i.value).sort();
      const ok=selected.join('|')===mustHave.slice().sort().join('|');
      t.querySelector('#recordFb').textContent = ok ? 'Strong record built. Why this matters: you can evidence system + competence. Common mistake: relying on verbal assurances only.' : `Model set includes: ${mustHave.join(', ')}.`;
      renderMini();
    };

    function renderMini(){
      const mini = el.querySelector('#m2bmini');
      mini.innerHTML = `<h4>Knowledge checks T1-T6</h4>
      ${[
        ['T1','Training records should include scope and dates.', ['True'], 'True'],
        ['T2','A statement "experienced" is enough evidence.', ['True','False'], 'False'],
        ['T3','Authorisation should be role-specific.', ['True','False'], 'True'],
        ['T4','Refresher intervals can be ignored if no incidents.', ['True','False'], 'False'],
        ['T5','Supervision records help show control in practice.', ['True','False'], 'True'],
        ['T6','Evidence chain links training to reassessment.', ['True','False'], 'True']
      ].map(([id,q,opts,ans])=>`<fieldset><legend>${id}: ${q}</legend>${opts.map(o=>`<label><input type="radio" name="${id}" value="${o}">${o}</label>`).join('')}<p class="feedback" id="${id}fb"></p></fieldset>`).join('')}`;
      mini.querySelectorAll('input').forEach(i=>i.addEventListener('change',()=>{
        let all = true;
        ['T1','T2','T3','T4','T5','T6'].forEach(id=>{
          const ans = {T1:'True',T2:'False',T3:'True',T4:'False',T5:'True',T6:'True'}[id];
          const value = mini.querySelector(`input[name="${id}"]:checked`)?.value;
          if(!value) all=false;
          mini.querySelector(`#${id}fb`).textContent = value ? (value===ans ? 'Correct with evidence-based reasoning.' : `Not correct. ${id} answer is ${ans}.`) : '';
        });
        if(all) setDone('m2b_mini', true);
      }));
    }
  }

  function module3(el){
    const hazards=[
      {id:'h1', name:'Damaged cable sheath', x:120, y:130},
      {id:'h2', name:'Wet floor near socket', x:250, y:155},
      {id:'h3', name:'Overloaded plug strip', x:340, y:150},
      {id:'h4', name:'Open panel cover', x:450, y:85},
      {id:'h5', name:'Extension lead coiled + warm', x:185, y:180},
      {id:'h6', name:'Loose plug with discoloration', x:290, y:120}
    ];
    const found = new Set();
    const hazardPhotos = [
      { src:'assets/training-images/co2-extinguisher-outdoor.jpg', alt:'CO2 extinguisher with horn and hose', caption:'Correct extinguisher type for electrical fire response.' },
      { src:'assets/training-images/co2-extinguisher-wall.jpg', alt:'Wall mounted CO2 extinguisher under sign', caption:'Check clear access and correct signage.' },
      { src:'assets/training-images/open-distribution-board.jpg', alt:'Open electrical distribution board', caption:'Open panels and exposed internals are a restricted hazard.' },
      { src:'assets/training-images/flooded-electrical-cabinet.jpg', alt:'Electrical cabinet in flood water', caption:'Water plus electrics: isolate and establish exclusion zone immediately.' },
      { src:'assets/training-images/consumer-unit-breakers.jpg', alt:'Consumer unit with labelled breakers', caption:'Isolation points must be identified before work starts.' },
      { src:'assets/training-images/damaged-plug.jpg', alt:'Damaged plug with exposed wiring', caption:'Damaged plugs are immediate remove-from-service defects.' },
      { src:'assets/training-images/overloaded-extension-strip.jpg', alt:'Overloaded extension strip with many adapters', caption:'Overloaded adaptors increase overheating and fire risk.' },
      { src:'assets/training-images/high-voltage-warning-sign.jpg', alt:'Danger of death high voltage warning sign', caption:'Warning signs are controls; do not bypass barriers.' },
      { src:'assets/training-images/high-voltage-triangle.jpg', alt:'Yellow high-voltage hazard triangle symbol', caption:'Recognise the symbol and stop before entry.' }
    ];

    el.innerHTML = conceptPanel({title:'Hazard Heatmap', visual:`<svg viewBox="0 0 620 260" role="img" aria-label="Workshop hazard scene">
      <rect x="10" y="10" width="600" height="240" rx="12" fill="#f8fafc" stroke="#cbd5e1"/>
      <rect x="40" y="70" width="180" height="90" fill="#d1fae5"/><rect x="230" y="60" width="130" height="110" fill="#e5e7eb"/><rect x="390" y="45" width="160" height="120" fill="#e2e8f0"/>
      <circle cx="250" cy="175" r="30" fill="#bfdbfe" opacity="0.65"/>
      ${hazards.map(h=>`<circle class="haz-dot" id="dot-${h.id}" cx="${h.x}" cy="${h.y}" r="12" fill="#ef4444" data-id="${h.id}" tabindex="0" role="button" aria-label="Hazard hotspot ${h.name}"/>`).join('')}
      <text x="25" y="240" font-size="12">Tap/click red hotspots or use hazard list.</text></svg>`, explanation:'Find visible warning signs before any electrical task starts.', terms:['Identify and quarantine unsafe equipment.', 'Report defects with clear location details.', 'Never continue work around active hazards.'], tryId:'m3try'});
    const t=el.querySelector('#m3try');
    t.innerHTML += `<div class="hotspot-list" id="hazardList"></div><p class="feedback" id="hazFb"></p><p class="recap hidden" id="hazRecap">Next action: quarantine affected equipment, prevent use, report to supervisor/maintenance, and record defect details.</p>
      <section class="photo-gallery-wrap"><h4>Photo-based hazard recognition</h4><p class="muted">Use these site photos to practise spotting electrical risk indicators.</p><div class="photo-gallery" id="hazardPhotos"></div></section>`;
    const hl=t.querySelector('#hazardList');
    hazards.forEach((h,i)=>hl.insertAdjacentHTML('beforeend',`<button class="btn tiny secondary" data-id="${h.id}">Select hazard ${i+1}: ${h.name}</button>`));

    function markHazard(id){
      found.add(id);
      const dot = el.querySelector(`#dot-${id}`);
      if(dot){ dot.classList.add('found'); }
      const complete = found.size===hazards.length;
      t.querySelector('#hazFb').textContent = `Found ${found.size}/${hazards.length} hazards.` + (complete ? ' Great spotting. Why this matters: early identification prevents escalation. Common mistake: only checking obvious damage.' : '');
      if(complete){
        t.querySelector('#hazRecap').classList.remove('hidden');
        setDone('m3_hazard', true);
      }
    }

    el.querySelectorAll('.haz-dot').forEach(dot=>{
      dot.addEventListener('click',()=>markHazard(dot.dataset.id));
      dot.addEventListener('keydown',e=>{ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); markHazard(dot.dataset.id); } });
    });
    hl.querySelectorAll('button').forEach(b=>b.onclick=()=>markHazard(b.dataset.id));

    const hp = t.querySelector('#hazardPhotos');
    hazardPhotos.forEach(photo=>{
      hp.insertAdjacentHTML('beforeend', `<figure class="photo-card"><img src="${photo.src}" alt="${photo.alt}" loading="lazy"><figcaption>${photo.caption}</figcaption></figure>`);
    });
  }

  function energyPathSvg(state){
    const off = state.includes('Isolate');
    const locked = state.includes('Lock off + tag');
    const proved = state.includes('Prove dead');
    return `<svg viewBox="0 0 700 260" role="img" aria-label="Energy path and isolation status">
      <rect x="20" y="20" width="660" height="220" rx="12" fill="#f8fafc" stroke="#cbd5e1"/>
      <rect x="50" y="90" width="120" height="70" rx="10" fill="#bfdbfe"/><text x="110" y="130" text-anchor="middle">Supply</text>
      <rect x="280" y="90" width="140" height="70" rx="10" fill="${off?'#fecaca':'#bbf7d0'}"/><text x="350" y="130" text-anchor="middle">Isolator ${off?'OFF':'ON'}</text>
      <rect x="520" y="90" width="120" height="70" rx="10" fill="#bfdbfe"/><text x="580" y="130" text-anchor="middle">Machine</text>
      <path d="M170 125 H280" stroke="#1d4ed8" stroke-width="8" stroke-linecap="round"/>
      <path d="M420 125 H520" stroke="#1d4ed8" stroke-width="8" stroke-linecap="round" stroke-dasharray="${off?'8 10':'0'}"/>
      ${locked?'<rect x="332" y="56" width="36" height="24" rx="6" fill="#f59e0b"/><path d="M340 56v-10a8 8 0 0 1 16 0v10" fill="none" stroke="#334155" stroke-width="3"/><text x="350" y="190" text-anchor="middle" font-size="12">Padlock + tag, key retained</text><text x="350" y="205" text-anchor="middle" font-size="11">Multi-lock hasp if team working</text>':''}
      ${proved?'<rect x="70" y="184" width="560" height="36" rx="8" fill="#e0f2fe"/><text x="350" y="207" text-anchor="middle" font-size="12">Prove-Test-Prove loop: proving unit → circuit → proving unit</text>':''}
    </svg>`;
  }

  function module4(el){
    const order=['Identify','Shut down','Isolate','Lock off + tag','Prove dead','Re-check'];
    let items=['Isolate','Identify','Prove dead','Re-check','Shut down','Lock off + tag'];
    el.innerHTML = conceptPanel({title:'Safe Isolation Energy Path', visual:`<div id="energyVisual">${energyPathSvg([])}</div>`, explanation:'Isolation is a physical break in the energy path, secured by lock-off and verified by prove-test-prove.', terms:['One person, one lock, own key retained.', 'Prohibition tag required.', 'Never remove another person’s lock.'], tryId:'m4try'}) + `<div class="callout">Common mistakes: relying on labels only; taping over breakers; removing others’ locks.</div>`;
    const t=el.querySelector('#m4try');
    t.innerHTML += `<h4>Sequence Builder</h4><div id="seq"></div><button class="btn" id="validateOrder">Validate order</button><p id="seqFb" class="feedback"></p>
      <h4>Tester check</h4><p>Pick the suitable tester for prove-dead process:</p>
      <div class="choice-row" id="testerPick"><button class="btn tiny secondary" data-v="wrong">Non-contact pen only</button><button class="btn tiny secondary" data-v="right">Two-pole voltage indicator with proving unit</button><button class="btn tiny secondary" data-v="wrong">Improvised lamp/test screwdriver</button></div><p class="feedback" id="testerFb"></p>`;

    const renderSeq=()=>{
      const seq=el.querySelector('#seq'); seq.innerHTML='';
      items.forEach((it,i)=>{
        seq.insertAdjacentHTML('beforeend', `<div class="order-row"><span>${i+1}. ${it}</span><span><button class="btn tiny" data-up="${i}" ${i===0?'disabled':''}>↑</button><button class="btn tiny" data-down="${i}" ${i===items.length-1?'disabled':''}>↓</button></span></div>`);
      });
      seq.querySelectorAll('[data-up]').forEach(b=>b.onclick=()=>{const i=Number(b.dataset.up); [items[i-1],items[i]]=[items[i],items[i-1]]; renderSeq(); updateVisual();});
      seq.querySelectorAll('[data-down]').forEach(b=>b.onclick=()=>{const i=Number(b.dataset.down); [items[i+1],items[i]]=[items[i],items[i+1]]; renderSeq(); updateVisual();});
    };
    const updateVisual = ()=>{ el.querySelector('#energyVisual').innerHTML = energyPathSvg(items.slice(0,3)); };
    renderSeq(); updateVisual();

    let testerRight = false;
    el.querySelector('#validateOrder').onclick=()=>{
      const ok=items.join('|')===order.join('|');
      el.querySelector('#seqFb').textContent = ok ? 'Correct sequence. Why this matters: sequence failures can leave hidden live energy. Common mistake: proving dead before lock-off.' : 'Sequence is incorrect. Keep adjusting and observe visual changes.';
      if(ok && testerRight) setDone('m4_order',true);
    };
    el.querySelectorAll('#testerPick button').forEach(b=>b.onclick=()=>{
      testerRight = b.dataset.v==='right';
      el.querySelector('#testerFb').textContent = testerRight ? 'Correct: use a suitable two-pole indicator and prove before and after testing the circuit.' : 'Not suitable. You need a reliable tester and a prove-test-prove method.';
      if(testerRight && items.join('|')===order.join('|')) setDone('m4_order',true);
    });
  }

  function module5(el){
    const correct=['Formal inspection records','PAT where required','EICR schedule','RCD user test logs','Defect close-out reports','Housekeeping checklist'];
    el.innerHTML = conceptPanel({title:'Planned Regime', visual:`<svg viewBox="0 0 680 170" role="img" aria-label="Inspection timeline"><rect x="20" y="20" width="640" height="120" rx="12" fill="#f8fafc" stroke="#cbd5e1"/><line x1="50" y1="80" x2="630" y2="80" stroke="#1d4ed8" stroke-width="5"/>
      <circle cx="90" cy="80" r="12" fill="#2563eb"/><text x="90" y="110" text-anchor="middle" font-size="12">User checks</text>
      <circle cx="210" cy="80" r="12" fill="#2563eb"/><text x="210" y="110" text-anchor="middle" font-size="12">Formal inspections</text>
      <circle cx="330" cy="80" r="12" fill="#2563eb"/><text x="330" y="110" text-anchor="middle" font-size="12">PAT (where needed)</text>
      <circle cx="470" cy="80" r="12" fill="#2563eb"/><text x="470" y="110" text-anchor="middle" font-size="12">Fixed install cycle</text>
      <circle cx="600" cy="80" r="12" fill="#2563eb"/><text x="600" y="110" text-anchor="middle" font-size="12">Review + improve</text></svg>`, explanation:'Compliance is evidenced by a repeated regime, not one-off checks.', terms:['Frequent user checks catch visible defects.', 'Formal inspections verify condition.', 'Records prove follow-through on defects.'], tryId:'m5try'});
    const t=el.querySelector('#m5try');
    const opts=[...correct,'Unlabelled verbal assurances','Photo with no date'];
    t.innerHTML += '<div class="tile-grid" id="ev"></div><button class="btn" id="evBtn">Choose evidence</button><p class="feedback" id="evFb"></p>';
    const ev=t.querySelector('#ev'); opts.forEach(o=>ev.insertAdjacentHTML('beforeend',`<label class="tile"><input type="checkbox" value="${o}">${o}</label>`));
    t.querySelector('#evBtn').onclick=()=>{
      const selected=[...ev.querySelectorAll('input:checked')].map(i=>i.value);
      const ok=selected.length===correct.length&&selected.every(x=>correct.includes(x));
      t.querySelector('#evFb').textContent=ok ? 'Correct evidence selected. Why this matters: records demonstrate active control. Common mistake: counting undocumented assurances as evidence.' : `Evidence should include: ${correct.join(', ')}.`;
      if(ok) setDone('m5_evidence',true);
    };
  }

  function module6(el){
    const report = getInteractionState().m6_report || {};
    const emergencyPhotos = [
      { src:'assets/training-images/co2-extinguisher-outdoor.jpg', alt:'CO2 extinguisher', caption:'Use CO₂ on electrical fire only when trained and route is safe.' },
      { src:'assets/training-images/lockout-hasp-machine.jpg', alt:'Lockout hasp on machine brake', caption:'Lock-out should physically prevent restart during intervention.' },
      { src:'assets/training-images/lockout-hasp-and-padlock.jpg', alt:'Lockout hasp and padlock set', caption:'One person one lock: never remove another person’s lock.' },
      { src:'assets/training-images/test-probe.jpg', alt:'Two-pole test probe', caption:'Prove-test-prove requires suitable test equipment.' },
      { src:'assets/training-images/isolator-internals.jpg', alt:'Internal wiring of switch/isolator', caption:'Internal components are for authorised persons only.' },
      { src:'assets/training-images/tagged-control-panel.jpg', alt:'Tagged control room panel', caption:'Tags communicate status and prevent unsafe restart.' }
    ];

    el.innerHTML = `<section class="scenario-sim"><h3>Scenario A: Electric shock</h3><p>Worker appears in contact with live equipment.</p>
      <div class="step-choice" data-s="a1"><p>Step 1:</p><button class="btn tiny secondary" data-next="wrong">Touch casualty to pull away</button><button class="btn tiny secondary" data-next="right">Isolate power source if safe</button></div>
      <div class="step-choice hidden" data-s="a2"><p>Step 2:</p><button class="btn tiny secondary" data-next="right">Call emergency help and follow site response</button><button class="btn tiny secondary" data-next="wrong">Resume work and monitor</button></div>
      <p class="feedback" id="aFb"></p></section>
      <section class="scenario-sim"><h3>Scenario B: Electrical fire</h3><p>Smoke from electrical cabinet.</p>
      <div class="step-choice" data-s="b1"><p>Step 1:</p><button class="btn tiny secondary" data-next="right">Raise alarm immediately</button><button class="btn tiny secondary" data-next="wrong">Open cabinet to inspect flames</button></div>
      <div class="step-choice hidden" data-s="b2"><p>Step 2:</p><button class="btn tiny secondary" data-next="right">Isolate if safe; use CO₂ only if trained and safe</button><button class="btn tiny secondary" data-next="wrong">Use water extinguisher on live cabinet</button></div>
      <p class="feedback" id="bFb"></p></section>
      <section class="concept-panel"><div class="try-block"><h4>Report builder</h4>
      <label>Location / asset<input type="text" id="rLoc" value="${report.location||''}"></label>
      <label>Observations<textarea id="rObs">${report.observations||''}</textarea></label>
      <label>Controls applied<textarea id="rCtl">${report.controls||''}</textarea></label>
      <label>Who notified<input type="text" id="rWho" value="${report.notified||''}"></label>
      <button class="btn" id="buildReport">Generate model report</button><pre id="reportOut" class="report-box"></pre></div></section>
      <section class="photo-gallery-wrap"><h3>Emergency response reference photos</h3><div class="photo-gallery" id="emergencyPhotos"></div></section>`;

    const state = {a:false,b:false};
    function wireScenario(prefix){
      const s1 = el.querySelector(`[data-s="${prefix}1"]`);
      const s2 = el.querySelector(`[data-s="${prefix}2"]`);
      const fb = el.querySelector(`#${prefix}Fb`);
      s1.querySelectorAll('button').forEach(btn=>btn.onclick=()=>{
        if(btn.dataset.next==='right'){ s2.classList.remove('hidden'); fb.textContent='Good first action.'; }
        else fb.textContent='Dangerous choice. Why this matters: acting before isolation can injure you too. Common mistake: rushing to touch/inspect.';
      });
      s2.querySelectorAll('button').forEach(btn=>btn.onclick=()=>{
        if(btn.dataset.next==='right'){ fb.textContent='Correct sequence completed.'; state[prefix]=true; }
        else fb.textContent='Incorrect. Prioritise safe isolation/alarm and trained response.';
        if(state.a && state.b) setDone('m6_branch', true);
      });
    }
    wireScenario('a'); wireScenario('b');

    el.querySelector('#buildReport').onclick=()=>{
      const draft = {
        location: el.querySelector('#rLoc').value.trim(),
        observations: el.querySelector('#rObs').value.trim(),
        controls: el.querySelector('#rCtl').value.trim(),
        notified: el.querySelector('#rWho').value.trim()
      };
      saveInteraction('m6_report', draft);
      const model = `Electrical Incident Report\nLocation/Asset: ${draft.location || '[add location]'}\nObservations: ${draft.observations || '[add observations]'}\nImmediate controls applied: ${draft.controls || '[add controls]'}\nNotified: ${draft.notified || '[add names/roles]'}\nStatus: Escalated for authorised electrical review.`;
      el.querySelector('#reportOut').textContent = model;
    };

    const ep = el.querySelector('#emergencyPhotos');
    emergencyPhotos.forEach(photo=>{
      ep.insertAdjacentHTML('beforeend', `<figure class="photo-card"><img src="${photo.src}" alt="${photo.alt}" loading="lazy"><figcaption>${photo.caption}</figcaption></figure>`);
    });
  }

  if(!loadState().learner.name){ location.href='index.html'; }
  render();
})();
