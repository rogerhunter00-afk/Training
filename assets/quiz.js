(function(){
  const { initLayout, loadState, updateState, uuid } = window.ALSApp;
  const main = initLayout('Final Assessment');
  if(!loadState().learner.name){ location.href='index.html'; }

  const QUESTIONS_PER_SECTION = 5;

  const questions = [
    {id:'Q1',type:'single',text:'HSWA employee duties:',options:{A:'Provide safe systems and training',B:'Take reasonable care and cooperate with safety arrangements',C:'Inspect fixed wiring every year',D:'Only electricians have safety duties'},correct:['B'],exp:'Employees must take reasonable care and cooperate with safety arrangements.'},
    {id:'Q2',type:'single',text:'Live work under EAWR acceptable:',options:{A:'Whenever faster',B:'If under 230V',C:'Only if unreasonable to make dead AND precautions taken',D:'If wear gloves'},correct:['C'],exp:'Dead working is default; live work is rare and tightly controlled.'},
    {id:'Q3',type:'multi',text:'Common hazards:',options:{A:'Water ingress near sockets',B:'Overloaded extension leads',C:'Taped cable repairs',D:'Correctly rated fuses'},correct:['A','B','C'],exp:'Correctly rated fuses are not a hazard.'},
    {id:'Q4',type:'single',critical:true,text:'First action if someone receiving shock:',options:{A:'Pull away',B:'Turn off/isolate power if safe',C:'Give water',D:'Call manager first'},correct:['B'],exp:'Never touch casualty if still live; isolate power first if safe.'},
    {id:'Q5',type:'single',text:'“Competent” means:',options:{A:'Watched someone else',B:'Training/knowledge/experience + know limits',C:'Long time on site',D:'Have tools'},correct:['B'],exp:'Competence includes limits, not just tenure.'},
    {id:'Q6',type:'single',text:'Warning sign:',options:{A:'Warm plug',B:'Burning smell',C:'Nuisance tripping',D:'All of the above'},correct:['D'],exp:'All listed can indicate electrical danger.'},
    {id:'Q7',type:'order',critical:true,text:'Safe isolation order:',options:['Identify','Shut down','Isolate','Lock off + tag','Prove dead','Re-check'],correct:['Identify','Shut down','Isolate','Lock off + tag','Prove dead','Re-check'],exp:'Order must match exactly.'},
    {id:'Q8',type:'single',text:'Why prove–test–prove:',options:{A:'warm meter',B:'confirm tester works before and after',C:'paperwork only',D:'reduce battery use'},correct:['B'],exp:'Confirms the tester is functioning both sides of test.'},
    {id:'Q9',type:'multi',text:'NOT allowed unless authorised:',options:{A:'Reset trip once after basic checks (if procedure allows)',B:'Bypass interlock',C:'Live fault finding inside panel',D:'Replace damaged plug without training'},correct:['B','C','D'],exp:'A may be allowed by procedure; others require authorisation.'},
    {id:'Q10',type:'single',text:'Damaged cable:',options:{A:'tape it',B:'isolate/remove, label DO NOT USE, report',C:'hide it',D:'only report if trips'},correct:['B'],exp:'Quarantine and report immediately.'},
    {id:'Q11',type:'single',text:'Asked to remove your lock:',options:{A:'remove if promise careful',B:'remove if manager',C:'do not remove; only applier removes when safe',D:'swap locks'},correct:['C'],exp:'One person, one lock, one key.'},
    {id:'Q12',type:'multi',text:'Stored energy electrical:',options:{A:'capacitors in VSDs/inverters',B:'springs in door closers',C:'UPS/back-feeds',D:'hydraulic pressure'},correct:['A','C'],exp:'Electrical stored energy includes capacitors and UPS/back-feeds.'},
    {id:'Q13',type:'single',text:'Electrical fire:',options:{A:'water',B:'alarm, isolate if safe, correct extinguisher (CO₂), evacuate if unsure',C:'open panels to ventilate',D:'ignore if small'},correct:['B'],exp:'Prioritise alarm and safe isolation/evacuation.'},
    {id:'Q14',type:'single',text:'Reasonably practicable:',options:{A:'supervisor says',B:'balance risk reduction vs time/cost/effort proportional to risk',C:'cheapest',D:'avoid paperwork'},correct:['B'],exp:'Proportionate risk control is key.'},
    {id:'Q15',type:'multi',text:'Housekeeping:',options:{A:'cabinets closed/sealed',B:'wash-down near open electrics',C:'lint/dust control',D:'maintain glands/IP'},correct:['A','C','D'],exp:'Never wash down near open electrical equipment.'},
    {id:'Q16',type:'single',text:'Unclear labels:',options:{A:'guess',B:'proceed',C:'stop and escalate; don’t rely on labels alone',D:'ask operator'},correct:['C'],exp:'Stop and escalate unknown isolation points.'},
    {id:'Q17',type:'single',text:'RCD T tests:',options:{A:'replace formal inspections',B:'part of broader planned regime',C:'illegal',D:'hourly'},correct:['B'],exp:'RCD tests are one element of planned assurance.'},
    {id:'Q18',type:'multi',text:'Burning smell + buzzing cabinet:',options:{A:'isolate if safe',B:'keep running',C:'report and keep others away',D:'open cabinet immediately'},correct:['A','C'],exp:'Isolate if safe, secure area, report.'},
    {id:'Q19',type:'single',text:'Supports compliance evidence:',options:{A:'“we do it safely”',B:'documented training + planned inspection/testing + defect reporting trail',C:'verbal handover only',D:'PAT sticker on everything'},correct:['B'],exp:'Documented records create auditable evidence.'},
    {id:'Q20',type:'single',text:'Most important rule:',options:{A:'wear PPE always',B:'if it’s not isolated, it’s live',C:'reset trips twice',D:'never report near misses'},correct:['B'],exp:'Assume live until proven isolated.'}
  ];

  const sections = Array.from({length: Math.ceil(questions.length / QUESTIONS_PER_SECTION)}, (_, i) =>
    questions.slice(i * QUESTIONS_PER_SECTION, (i + 1) * QUESTIONS_PER_SECTION)
  );

  let activeSection = 0;
  let latestResult = null;
  let orderState = [...questions.find(q=>q.id==='Q7').options].sort(()=>Math.random()-0.5);

  function getCurrentAnswers(){
    return loadState().quiz.currentAttempt?.answers || {};
  }

  function ensureCurrentAttempt(){
    const state = loadState();
    const existing = state.quiz.currentAttempt?.answers || {};
    if(Object.keys(existing).length){
      const storedOrder = existing.Q7?.split(' -> ').filter(Boolean);
      if(storedOrder?.length === questions.find(q=>q.id==='Q7').correct.length){
        orderState = storedOrder;
      }
      return;
    }
    updateState(s=>{
      s.quiz.currentAttempt = {
        attemptId: uuid('attempt'),
        startedAtISO: new Date().toISOString(),
        answers: {}
      };
    });
  }

  function isAnswered(q, answers){
    const val = answers[q.id] || '';
    if(q.type === 'multi') return Boolean(val && val.split(',').filter(Boolean).length);
    return Boolean(String(val).trim());
  }

  function saveAnswer(questionId, value){
    updateState(s=>{
      s.quiz.currentAttempt = s.quiz.currentAttempt || { attemptId: uuid('attempt'), startedAtISO: new Date().toISOString(), answers: {} };
      s.quiz.currentAttempt.answers = s.quiz.currentAttempt.answers || {};
      s.quiz.currentAttempt.answers[questionId] = value;
    });
  }

  function goToQuestion(questionId){
    const index = questions.findIndex(q=>q.id===questionId);
    activeSection = Math.max(0, Math.floor(index / QUESTIONS_PER_SECTION));
    latestResult = null;
    render();
  }

  function render(){
    const s = loadState();
    const attempts = s.quiz.attempts || [];
    const answers = getCurrentAnswers();
    const unanswered = questions.filter(q=>!isAnswered(q, answers)).length;
    const activeQuestions = sections[activeSection];

    main.innerHTML = `<section class="card"><h2>Final Assessment (20 Questions)</h2>
      <p>Pass mark: 80% (16/20) and critical questions Q4 + Q7 must be correct.</p>
      <div class="quiz-progress-head">
        <p><strong>Section ${activeSection+1} of ${sections.length}</strong> (${activeQuestions[0].id}–${activeQuestions[activeQuestions.length-1].id})</p>
        <p class="muted">Unanswered questions: <strong>${unanswered}</strong></p>
      </div>
      <div class="quiz-index" id="quizIndex"></div>
      <form id="quizForm"></form>
      <div class="nav-buttons">
        <button class="btn secondary" type="button" id="backSection" ${activeSection===0?'disabled':''}>Back</button>
        <button class="btn" type="button" id="nextSection" ${activeSection===sections.length-1?'disabled':''}>Next</button>
      </div>
      ${activeSection===sections.length-1 ? `<div class="quiz-sticky-submit"><button class="btn" id="submitQuiz" type="button">Submit assessment</button></div>` : ''}
      ${latestResult ? renderResultCard(latestResult) : ''}
      <section class="card inset"><h3>Attempt history</h3><ul>${attempts.map(a=>`<li>${new Date(a.submittedAtISO||a.startedAtISO).toLocaleString()} — ${a.score}/20 ${a.passed?'PASS':'FAIL'} ${a.criticalPassed?'':'(critical not met)'}</li>`).join('') || '<li>No attempts yet.</li>'}</ul></section>
    </section>`;

    const indexWrap = main.querySelector('#quizIndex');
    questions.forEach((q, i)=>{
      const done = isAnswered(q, answers);
      indexWrap.insertAdjacentHTML('beforeend', `<button type="button" class="idx-chip ${done?'done':'todo'}" data-qid="${q.id}">${i+1}. ${q.id} ${done?'✓':'•'}</button>`);
    });
    indexWrap.querySelectorAll('[data-qid]').forEach(btn=>btn.onclick=()=>goToQuestion(btn.dataset.qid));

    const form = main.querySelector('#quizForm');
    activeQuestions.forEach(q=>form.append(renderQuestion(q, answers)));

    main.querySelector('#backSection').onclick = ()=>{ activeSection = Math.max(0, activeSection - 1); render(); };
    main.querySelector('#nextSection').onclick = ()=>{ activeSection = Math.min(sections.length - 1, activeSection + 1); render(); };
    const submitBtn = main.querySelector('#submitQuiz');
    if(submitBtn) submitBtn.onclick = submit;

    if(latestResult){
      main.querySelector('#reviewAnswers')?.addEventListener('click', ()=>{
        const firstMissed = latestResult.missed[0];
        activeSection = firstMissed ? Math.floor(questions.findIndex(q=>q.id===firstMissed) / QUESTIONS_PER_SECTION) : 0;
        latestResult = null;
        render();
      });
      main.querySelector('#retakeQuiz')?.addEventListener('click', ()=>{
        activeSection = 0;
        latestResult = null;
        orderState = [...questions.find(q=>q.id==='Q7').options].sort(()=>Math.random()-0.5);
        updateState(st=>{
          st.quiz.currentAttempt = { attemptId: uuid('attempt'), startedAtISO: new Date().toISOString(), answers: {} };
        });
        render();
      });
    }
  }

  function renderQuestion(q, answers){
    const fs = document.createElement('fieldset');
    fs.className = 'card inset';
    const done = isAnswered(q, answers);
    fs.innerHTML = `<legend>${q.id}. ${q.text}${q.critical?' (Critical)':''} <span class="q-state ${done?'done':'todo'}">${done?'Completed':'Unanswered'}</span></legend>`;

    if(q.type==='single' || q.type==='multi'){
      const selected = (answers[q.id] || '').split(',').filter(Boolean);
      Object.entries(q.options).forEach(([k,v])=>{
        const checked = selected.includes(k) ? 'checked' : '';
        fs.insertAdjacentHTML('beforeend', `<label><input type="${q.type==='multi'?'checkbox':'radio'}" name="${q.id}" value="${k}" ${checked}>${k}: ${v}</label>`);
      });
      fs.querySelectorAll(`input[name="${q.id}"]`).forEach(input=>{
        input.addEventListener('change', ()=>{
          if(q.type==='single'){
            saveAnswer(q.id, input.value);
          } else {
            const values = [...fs.querySelectorAll(`input[name="${q.id}"]:checked`)].map(i=>i.value).sort();
            saveAnswer(q.id, values.join(','));
          }
          render();
        });
      });
    } else {
      const list = document.createElement('div');
      list.id = 'orderQ7';
      const renderOrder = ()=>{
        list.innerHTML = '';
        orderState.forEach((item, i)=>{
          const row = document.createElement('div');
          row.className = 'order-row';
          row.innerHTML = `<span>${i+1}. ${item}</span><span><button type="button" class="btn tiny" data-up="${i}" ${i===0?'disabled':''}>↑</button><button type="button" class="btn tiny" data-down="${i}" ${i===orderState.length-1?'disabled':''}>↓</button></span>`;
          list.append(row);
        });
        list.querySelectorAll('[data-up]').forEach(b=>b.onclick=()=>{
          const i = +b.dataset.up;
          [orderState[i-1], orderState[i]] = [orderState[i], orderState[i-1]];
          saveAnswer(q.id, orderState.join(' -> '));
          renderOrder();
          render();
        });
        list.querySelectorAll('[data-down]').forEach(b=>b.onclick=()=>{
          const i = +b.dataset.down;
          [orderState[i+1], orderState[i]] = [orderState[i], orderState[i+1]];
          saveAnswer(q.id, orderState.join(' -> '));
          renderOrder();
          render();
        });
      };
      renderOrder();
      fs.append(list);
    }
    return fs;
  }

  function submit(){
    const answers = getCurrentAnswers();
    let score = 0;
    const missed = [];
    questions.forEach(q=>{
      if(q.type==='single'){
        const val = answers[q.id] || '';
        if(val===q.correct[0]) score++; else missed.push(q.id);
      } else if(q.type==='multi'){
        const vals = (answers[q.id] || '').split(',').filter(Boolean).sort();
        const ok = vals.join(',')===q.correct.slice().sort().join(',');
        if(ok) score++; else missed.push(q.id);
      } else {
        const order = (answers[q.id] || '').split(' -> ').filter(Boolean);
        const ok = order.join('|')===q.correct.join('|');
        if(ok) score++; else missed.push(q.id);
      }
    });

    const criticalPassed = !missed.includes('Q4') && !missed.includes('Q7');
    const passed = score>=16 && criticalPassed;
    const now = new Date().toISOString();
    const existing = loadState().quiz.currentAttempt || {};
    const attempt = {
      attemptId: existing.attemptId || uuid('attempt'),
      startedAtISO: existing.startedAtISO || now,
      submittedAtISO: now,
      score,
      total: 20,
      passed,
      criticalPassed,
      answers,
      missed
    };

    updateState(s=>{
      s.quiz.attempts.push(attempt);
      const best=s.quiz.attempts.slice().sort((a,b)=>b.score-a.score)[0];
      s.quiz.bestAttemptId = best?.attemptId || attempt.attemptId;
      s.quiz.currentAttempt = { attemptId: uuid('attempt'), startedAtISO: now, answers: {} };
      if(passed) s.course.completedAtISO = now;
    });

    latestResult = { ...attempt, explanations: questions.filter(q=>missed.includes(q.id)) };
    activeSection = sections.length - 1;
    render();
  }

  function renderResultCard(result){
    const missedList = result.explanations.length
      ? `<ul>${result.explanations.map(q=>`<li><strong>${q.id}</strong>: ${q.exp}</li>`).join('')}</ul>`
      : '<p>Excellent work — no incorrect answers.</p>';

    return `<section class="card inset quiz-result">
      <h3>Assessment Result</h3>
      <p><strong>Score:</strong> ${result.score}/${result.total}</p>
      <p><strong>Status:</strong> ${result.passed ? 'PASS' : 'FAIL'}</p>
      <p><strong>Critical questions passed:</strong> ${result.criticalPassed ? 'Yes' : 'No'}</p>
      <h4>Incorrect questions & explanations</h4>
      ${missedList}
      <div class="nav-buttons">
        <button type="button" class="btn secondary" id="reviewAnswers">Review Answers</button>
        <button type="button" class="btn" id="retakeQuiz">Retake</button>
        ${result.passed ? '<a class="btn" href="certificate.html">Go to Certificate</a>' : ''}
      </div>
    </section>`;
  }

  ensureCurrentAttempt();
  saveAnswer('Q7', getCurrentAnswers().Q7 || orderState.join(' -> '));
  render();
})();
