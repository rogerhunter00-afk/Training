(function(){
  const { initLayout, loadState, formatLocal, addMonths, getBestAttempt, getLatestPassSignoff, COURSE_TITLE } = window.ALSApp;
  const main = initLayout('Certificate');

  function completionId(date){
    const pad=n=>String(n).padStart(2,'0');
    return `${date.getFullYear()}${pad(date.getMonth()+1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
  }

  function exportData(state, attempt, generatedISO){
    const dueISO = addMonths(state.course.completedAtISO || generatedISO, state.settings.refresherMonths);
    const latestPass = getLatestPassSignoff(state);
    return {
      course: COURSE_TITLE,
      version: '1.0.0',
      siteName: state.siteName || '',
      learnerName: state.learner.name || '',
      completedAtISO: state.course.completedAtISO || generatedISO,
      completedAtLocalDisplay: formatLocal(state.course.completedAtISO || generatedISO),
      score: attempt?.score || 0,
      total: 20,
      passed: Boolean(attempt?.passed),
      criticalPassed: Boolean(attempt?.criticalPassed),
      refresherDueISO: dueISO,
      answers: attempt?.answers || {},
      attemptId: attempt?.attemptId || '',
      attemptHistoryCount: state.quiz.attempts.length,
      practicalSignoff: latestPass || null
    };
  }

  function downloadJSON(obj){
    const blob = new Blob([JSON.stringify(obj,null,2)], {type:'application/json'});
    const a=document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `electrical-safety-results-${(obj.learnerName || 'learner').replace(/\s+/g,'-').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function render(){
    const state = loadState();
    const attempt = getBestAttempt(state);
    const requireSignoff = state.settings.requirePracticalSignoffForCertificate;
    const passSignoff = getLatestPassSignoff(state);
    const generated = new Date();
    const generatedISO = generated.toISOString();
    const canShow = attempt?.passed && (!requireSignoff || passSignoff);

    const latestPassSummary = passSignoff
      ? `${formatLocal(passSignoff.signedAtISO)} — ${passSignoff.learnerName || state.learner.name || 'Learner'} / ${passSignoff.supervisorName}`
      : 'No practical pass sign-off recorded yet.';

    if(!attempt){
      main.innerHTML = `<section class="card"><h2>No quiz attempt found</h2>
        <p>Complete the final assessment first. ${requireSignoff ? 'This site also requires a practical pass sign-off before a certificate can be issued.' : 'A practical sign-off is optional for certificate issue on this site.'}</p>
        <div class="nav-buttons"><a class="btn" href="quiz.html">Go to quiz</a>${requireSignoff ? '<a class="btn secondary" href="signoff.html">Open practical sign-off</a>' : ''}</div>
      </section>`;
      return;
    }

    const courseComplete = Boolean(state.course.completedAtISO);
    const quizPass = Boolean(attempt?.passed);
    const practicalPass = Boolean(passSignoff);
    const practicalStepRequired = requireSignoff;

    const timelineItems = [
      { label: 'Course complete', complete: courseComplete, detail: courseComplete ? formatLocal(state.course.completedAtISO) : 'Not completed yet.' },
      { label: 'Quiz pass', complete: quizPass, detail: quizPass ? `Passed (${attempt.score}/20)` : 'Pass the final assessment to continue.' },
      { label: practicalStepRequired ? 'Practical sign-off (required)' : 'Practical sign-off (optional)', complete: !practicalStepRequired || practicalPass, detail: practicalPass ? latestPassSummary : (practicalStepRequired ? 'Required by current settings before certificate release.' : 'Optional by current settings.') }
    ];

    const journeyCard = `<section class="card"><h2>Certificate journey</h2>
      <p>${requireSignoff ? 'Practical sign-off is required for certificate issue on this site.' : 'Practical sign-off is optional for certificate issue on this site.'}</p>
      <ol>${timelineItems.map(item=>`<li><strong>${item.complete ? '✓' : '○'} ${item.label}</strong><br><small>${item.detail}</small></li>`).join('')}</ol>
      <p><strong>Latest practical pass record:</strong> ${latestPassSummary}</p>
      ${attempt.passed && requireSignoff && !passSignoff ? '<div class="nav-buttons"><a class="btn" href="signoff.html">Complete practical sign-off</a></div>' : ''}
    </section>`;

    if(!canShow){
      main.innerHTML = `${journeyCard}<section class="card"><h2>Certificate not yet available</h2>
        <p>${attempt.passed ? 'Your quiz is passed, but certificate release is blocked until a practical pass sign-off is saved.' : 'You have not met quiz pass criteria yet, so certificate release is blocked.'}</p>
        <div class="nav-buttons"><a class="btn" href="${attempt.passed?'signoff.html':'quiz.html'}">${attempt.passed?'Open practical sign-off':'Retake quiz'}</a>${attempt.passed ? '<a class="btn secondary" href="quiz.html">Review quiz result</a>' : ''}</div>
      </section>`;
      return;
    }

    const certId=completionId(generated);
    const dueISO = addMonths(state.course.completedAtISO || generatedISO, state.settings.refresherMonths);
    const payload = exportData(state, attempt, generatedISO);

    main.innerHTML = `${journeyCard}<section class="certificate" id="certArea">
      <h2>Certificate of Completion</h2>
      <p class="cert-pass">PASS</p>
      <p>This certifies that <strong>${state.learner.name}</strong> has completed:</p>
      <h3>${COURSE_TITLE}</h3>
      ${state.siteName ? `<p>Site: ${state.siteName}</p>`:''}
      <p>Completed: ${formatLocal(state.course.completedAtISO || generatedISO)}</p>
      <p>Score: <strong>${attempt.score}/20</strong></p>
      <p>Completion ID: <code>${certId}</code></p>
      <p>Refresher due: ${formatLocal(dueISO)}</p>
      ${passSignoff ? `<p>Practical sign-off: ${passSignoff.supervisorName} (${formatLocal(passSignoff.signedAtISO)})</p>`:'<p>Practical sign-off: Optional and not recorded.</p>'}
    </section>
    <div class="nav-buttons"><button class="btn" id="printBtn">Print / Save as PDF</button><button class="btn secondary" id="downloadBtn">Download results (JSON)</button></div>`;

    document.querySelector('#printBtn').onclick=()=>window.print();
    document.querySelector('#downloadBtn').onclick=()=>downloadJSON(payload);
  }

  render();
})();
