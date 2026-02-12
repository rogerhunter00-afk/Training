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

  function module0(el){
    el.innerHTML = `<p>Purpose: prevent shock, burns/arc flash, fire, and secondary injuries. Applies to anyone using, cleaning, isolating, inspecting, or working near electrics.</p>
    <p><strong>Core rule:</strong> If it’s not isolated, it’s live.</p>
    <p class="alert">Passing this course does not make you an electrician and does not authorise panel work, live testing, or fixed wiring modifications.</p>
    <label class="inline"><input id="m0" type="checkbox" ${isDone('m0_ack')?'checked':''}>I understand this is awareness training and I must work within my competency and site rules.</label>`;
    el.querySelector('#m0').addEventListener('change',e=>setDone('m0_ack',e.target.checked));
  }

  function module1(el){
    el.innerHTML = `<ul>
      <li><strong>Employer duties (HSWA s.2):</strong> safe systems, safe equipment, training, supervision, maintenance.</li>
      <li><strong>Employee duties (HSWA s.7 & s.8):</strong> take reasonable care, cooperate, do not interfere with safety devices.</li>
      <li><strong>EAWR 1989:</strong> prevent danger; live work only if unreasonable to make dead and precautions are taken (rare).</li>
    </ul>
    <div class="quiz-mini">
      <fieldset><legend>Check 1: Employee duties include?</legend>
        <label><input type="radio" name="m1q1" value="A">Provide all training systems</label>
        <label><input type="radio" name="m1q1" value="B">Take reasonable care and cooperate</label>
      </fieldset>
      <p id="m1f1" class="feedback"></p>
      <fieldset><legend>Check 2: Live work acceptable when?</legend>
        <label><input type="radio" name="m1q2" value="A">Whenever faster</label>
        <label><input type="radio" name="m1q2" value="B">Only if unreasonable to make dead and precautions taken</label>
      </fieldset>
      <p id="m1f2" class="feedback"></p>
    </div>`;
    const check=()=>{
      const a1=el.querySelector('input[name="m1q1"]:checked')?.value;
      const a2=el.querySelector('input[name="m1q2"]:checked')?.value;
      el.querySelector('#m1f1').textContent=a1? (a1==='B'?'Correct.':'Not quite: employees take care and cooperate.') : '';
      el.querySelector('#m1f2').textContent=a2? (a2==='B'?'Correct.':'Not quite: only when dead working is unreasonable and precautions exist.') : '';
      if(a1&&a2) setDone('m1_mcq', true);
    };
    el.querySelectorAll('input').forEach(i=>i.addEventListener('change',check));
  }

  function module2(el){
    const scenarios=[
      ['Visual pre-use check on plug top and cable','Within scope'],
      ['Bypass a guard interlock to keep production running','Not within scope'],
      ['Reset a tripped breaker repeatedly without checks','Not within scope'],
      ['Operate emergency stop when danger appears','Within scope'],
      ['Unknown isolator label during breakdown','Escalate'],
      ['Live diagnostics inside panel without authorisation','Not within scope']
    ];
    let done=0;
    el.innerHTML = `<p>Competence = training + experience + knowledge + knowing limits.</p>
    <ul><li>Typical allowed tasks: visual checks, operate isolators/E-stops, lock-off/tag-off only if trained/authorised, reset trips once only if procedure permits.</li>
    <li>Not allowed unless authorised: live fault finding in panels, fixed wiring modifications, bypassing interlocks.</li></ul>
    <div id="scenarios"></div>`;
    const container=el.querySelector('#scenarios');
    scenarios.forEach((s,i)=>{
      const card=document.createElement('fieldset');
      card.className='card inset';
      card.innerHTML=`<legend>Scenario ${i+1}</legend><p>${s[0]}</p>
      <label><input type="radio" name="s${i}" value="Within scope">Within scope</label>
      <label><input type="radio" name="s${i}" value="Not within scope">Not within scope</label>
      <label><input type="radio" name="s${i}" value="Escalate">Escalate</label>
      <p class="feedback" id="sf${i}"></p>`;
      container.append(card);
      card.querySelectorAll('input').forEach(inp=>inp.addEventListener('change',()=>{
        const selected=card.querySelector('input:checked')?.value;
        card.querySelector(`#sf${i}`).textContent = selected===s[1] ? 'Good decision.' : `Preferred response: ${s[1]}.`;
        done = [...container.querySelectorAll('fieldset')].filter(fs=>fs.querySelector('input:checked')).length;
        if(done===scenarios.length) setDone('m2_scenarios',true);
      }));
    });
  }

  function module2a(el){
    const checks = [
      'Burning smell from cabinet', 'Buzzing panel noise', 'Hot plug/socket', 'Water ingress near electrics', 'Repeated trips',
      'Unknown isolator', 'Damaged cabinet/exposed parts', 'Recurring VSD faults', 'No permit for panel opening', 'Role outside authorised level'
    ];
    let answered=0;
    el.innerHTML = `<p><strong>Instruction</strong>: what site tells you (rules, allowed/not allowed, local hazards, emergency actions).</p>
    <p><strong>Training</strong>: skills demonstrated (safe isolation awareness, inspections, quarantine/label, escalation).</p>
    <p><strong>Supervision</strong>: controls until competence proven; more risk = more supervision.</p>
    <div class="table-wrap"><table><caption>Authorisation levels</caption><thead><tr><th>Level</th><th>Typical scope</th><th>Restrictions</th></tr></thead>
    <tbody>
    <tr><td>Level 0 Awareness</td><td>Recognise hazards, stop work, report, use E-stops</td><td>No isolations as work control; no panel access</td></tr>
    <tr><td>Level 1 User/Operator</td><td>Pre-use checks, operate controls</td><td>No lock-off/tag-off; no plug/cable work unless authorised</td></tr>
    <tr><td>Level 2 Trained Maintainer</td><td>Isolate defined equipment, lock-off/tag-off, verify isolation as trained</td><td>No panel work/live testing/fixed wiring mods</td></tr>
    <tr><td>Level 3 Electrical Competent Person</td><td>Diagnostics, panel work, installation/modification under method statement/permits</td><td>Must follow permits and safe systems</td></tr>
    </tbody></table></div>
    <p class="alert">Passing this course does not make you an electrician and does not authorise panel work/live testing/fixed wiring modifications.</p>
    <p><strong>What to report:</strong> asset/location; what observed; controls applied; photos if safe; who notified.</p>
    <label class="inline"><input id="m2aAck" type="checkbox" ${isDone('m2a_ack')?'checked':''}>I will work within my authorised level and escalate if outside scope.</label>
    <h3>Stop or Proceed? Checklist</h3><div id="checklist"></div>`;
    el.querySelector('#m2aAck').addEventListener('change',e=>{setDone('m2a_ack',e.target.checked); evaluate();});
    const c=el.querySelector('#checklist');
    checks.forEach((txt,i)=>{
      const row=document.createElement('label');
      row.innerHTML=`<input type="radio" name="stop${i}" value="stop">Stop & escalate <input type="radio" name="stop${i}" value="proceed">Proceed
      <span>${txt}</span>`;
      c.append(row);
      row.querySelectorAll('input').forEach(inp=>inp.addEventListener('change',()=>{answered=[...c.querySelectorAll('div.done')].length;}));
    });
    c.querySelectorAll('label').forEach((lab,idx)=>{
      lab.querySelectorAll('input').forEach(inp=>inp.addEventListener('change',()=>{
        if(lab.classList.contains('done')) return;
        lab.classList.add('done');
        answered = c.querySelectorAll('label.done').length;
        evaluate();
      }));
    });
    function evaluate(){ if(answered===checks.length && isDone('m2a_ack')) setDone('m2a_ack_check',true); }
  }

  function module2b(el){
    const answers={T1:['C'],T2:['C'],T3:['A','B','D'],T4:['B'],T5:['C'],T6:['B']};
    el.innerHTML = `<ul>
      <li>Auditors expect: training matrix/levels, course outline, assessment method, refresher schedule, incident triggers, defect/report trail.</li>
      <li>Blended assessment: online knowledge + optional on-site observation for Level 2 authorisation.</li>
      <li>Refresher default annual (12 months); earlier after incident, change, role change, gap, or long absence.</li>
    </ul>
    <p><a class="btn secondary" href="signoff.html">Open printable Observed Safe Isolation Sign-off form</a></p>
    <h3>Mini quiz (ungraded)</h3><div id="mini"></div>`;
    const q=[
      ['T1','Refresher default period?',['A 3 months','B 6 months','C 12 months']],
      ['T2','Which evidence supports audit trail?',['A verbal note','B none','C records']],
      ['T3','Select refresher triggers',['A incident','B process change','C sunny day','D role change']],
      ['T4','Optional Level 2 signoff is usually?',['A online only','B on-site observation']],
      ['T5','Training matrix should show?',['A favourite colour','B lunch rota','C level/expiry']],
      ['T6','Defect trail should include?',['A rumours','B report actions']] 
    ];
    const mini=el.querySelector('#mini');
    q.forEach(([id,text,opts])=>{
      const fs=document.createElement('fieldset');
      fs.innerHTML=`<legend>${id}: ${text}</legend>${opts.map((o,idx)=>`<label><input ${id==='T3'?'type="checkbox"':'type="radio"'} name="${id}" value="${String.fromCharCode(65+idx)}">${o}</label>`).join('')}
      <p class="feedback" id="${id}fb"></p>`;
      mini.append(fs);
    });
    const btn=document.createElement('button'); btn.className='btn'; btn.textContent='Check answers'; mini.append(btn);
    btn.onclick=()=>{
      let complete=true;
      Object.entries(answers).forEach(([id,correct])=>{
        const selected=[...mini.querySelectorAll(`[name="${id}"]:checked`)].map(i=>i.value).sort();
        if(selected.length===0) complete=false;
        const ok=selected.join(',')===correct.slice().sort().join(',');
        mini.querySelector(`#${id}fb`).textContent = ok ? `Correct (${correct.join(', ')})` : `Answer: ${correct.join(', ')}`;
      });
      if(complete) setDone('m2b_mini',true);
    };
  }

  function module3(el){
    const hazards=[
      ['Damaged plugs/cables',true],['Water near sockets',true],['Loose/overheated terminals',true],['Overloaded sockets',true],['Earthing/bonding issues',true],
      ['Defeated interlocks',true],['Correct fuse rating',false],['Stored energy in VSD/capacitors',true],['Back-feeds from UPS/generator/PV',true],['Burning smell/buzzing/flicker',true]
    ];
    el.innerHTML='<p>Hazards include damaged equipment, water ingress, overheating, overload, earthing faults, defeated interlocks, incorrect fuses, stored energy, and back-feeds. Warning signs: smell, buzzing, warmth, discoloration, flicker, nuisance tripping.</p><div id="haz"></div><button class="btn" id="checkHaz">Check selection</button><p class="feedback" id="hazFb"></p>';
    const haz=el.querySelector('#haz');
    hazards.forEach(([t])=>{haz.insertAdjacentHTML('beforeend',`<label><input type="checkbox" value="${t}">${t}</label>`);});
    el.querySelector('#checkHaz').onclick=()=>{
      const selected=[...haz.querySelectorAll('input:checked')].map(i=>i.value);
      const correct=hazards.filter(h=>h[1]).map(h=>h[0]);
      const ok = selected.length===correct.length && selected.every(s=>correct.includes(s));
      el.querySelector('#hazFb').textContent = ok ? 'Correct hazard set selected.' : `Correct hazards: ${correct.join('; ')}.`;
      setDone('m3_hazard',true);
    };
  }

  function module4(el){
    const order=['Identify','Shut down','Isolate','Lock off + tag','Prove dead','Re-check'];
    let items=['Isolate','Identify','Prove dead','Re-check','Shut down','Lock off + tag'];
    el.innerHTML=`<p>Controls hierarchy: eliminate, engineer, admin, PPE.</p>
    <ol><li>Identify</li><li>Shut down normally</li><li>Isolate</li><li>Lock off + tag</li><li>Prove dead (prove–test–prove)</li><li>Re-check stored energy / try-start where safe</li></ol>
    <p><strong>Golden rules:</strong> one person one lock; keep own key; never remove someone else’s lock; verify not labels; refit guards/close cabinets before re-energising.</p>
    <p>Permit triggers include panel opening, critical process isolation, temporary supplies, high-risk wet zones, work at height, and confined spaces.</p>
    <h3>Sequence builder</h3><div id="seq"></div><button class="btn" id="validateOrder">Validate order</button><p id="seqFb" class="feedback"></p>`;

    const renderSeq=()=>{
      const seq=el.querySelector('#seq'); seq.innerHTML='';
      items.forEach((it,i)=>{
        const row=document.createElement('div'); row.className='order-row';
        row.innerHTML=`<span>${i+1}. ${it}</span><span><button class="btn tiny" data-up="${i}" ${i===0?'disabled':''}>↑</button><button class="btn tiny" data-down="${i}" ${i===items.length-1?'disabled':''}>↓</button></span>`;
        seq.append(row);
      });
      seq.querySelectorAll('[data-up]').forEach(b=>b.onclick=()=>{const i=Number(b.dataset.up); [items[i-1],items[i]]=[items[i],items[i-1]]; renderSeq();});
      seq.querySelectorAll('[data-down]').forEach(b=>b.onclick=()=>{const i=Number(b.dataset.down); [items[i+1],items[i]]=[items[i],items[i+1]]; renderSeq();});
    };
    renderSeq();
    el.querySelector('#validateOrder').onclick=()=>{
      const ok=items.join('|')===order.join('|');
      el.querySelector('#seqFb').textContent = ok ? 'Correct sequence.' : 'Sequence is incorrect. Keep adjusting.';
      if(ok) setDone('m4_order',true);
    };
  }

  function module5(el){
    const correct=['Formal inspection records','PAT where required','EICR schedule','RCD user test logs','Defect close-out reports'];
    el.innerHTML='<p>Use visual checks and formal inspection/testing regimes. Maintain housekeeping: cabinets closed/sealed, dust control, no wash-down near electrical equipment, maintain glands/IP.</p><div id="ev"></div><button class="btn" id="evBtn">Check evidence</button><p class="feedback" id="evFb"></p>';
    const opts=[...correct,'Unlabelled verbal assurances'];
    const ev=el.querySelector('#ev'); opts.forEach(o=>ev.insertAdjacentHTML('beforeend',`<label><input type="checkbox" value="${o}">${o}</label>`));
    el.querySelector('#evBtn').onclick=()=>{
      const selected=[...ev.querySelectorAll('input:checked')].map(i=>i.value);
      const ok=selected.length===correct.length&&selected.every(x=>correct.includes(x));
      el.querySelector('#evFb').textContent=ok?'Correct evidence selected.':`Evidence should include: ${correct.join(', ')}.`;
      setDone('m5_evidence',true);
    };
  }

  function module6(el){
    el.innerHTML=`<h3>Shock scenario</h3><p>Coworker appears stuck to machine and shaking.</p>
    <label><input type="radio" name="shock" value="A">Grab casualty immediately</label>
    <label><input type="radio" name="shock" value="B">Isolate power first if safe, then emergency response</label>
    <h3>Fire scenario</h3><p>Electrical cabinet has smoke/flames.</p>
    <label><input type="radio" name="fire" value="A">Use water hose</label>
    <label><input type="radio" name="fire" value="B">Raise alarm, isolate if safe, CO₂ if safe, evacuate if unsure</label>
    <p id="m6fb" class="feedback"></p>`;
    el.querySelectorAll('input').forEach(i=>i.addEventListener('change',()=>{
      const s=el.querySelector('input[name="shock"]:checked')?.value;
      const f=el.querySelector('input[name="fire"]:checked')?.value;
      if(s&&f){
        el.querySelector('#m6fb').textContent = s==='B' && f==='B' ? 'Correct action paths.' : 'Review emergency priorities and choose safest path.';
        setDone('m6_branch',true);
      }
    }));
  }

  if(!loadState().learner.name){ location.href='index.html'; }
  render();
})();
