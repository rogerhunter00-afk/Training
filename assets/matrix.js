(function(){
  const { initLayout, loadState, getBestAttempt, formatLocal, addMonths, COURSE_TITLE } = window.ALSApp;
  const main = initLayout('Training Matrix');
  const state = loadState();
  if(!state.settings.showTrainingMatrixPage){
    main.innerHTML='<section class="card"><h2>Training matrix disabled</h2></section>'; return;
  }
  const best = getBestAttempt(state);
  const completed = state.course.completedAtISO || best?.submittedAtISO || '';
  const due = completed ? addMonths(completed, state.settings.refresherMonths) : '';

  function exportJSON(){
    const data={
      learnerName: state.learner.name,
      course: COURSE_TITLE,
      completionDateISO: completed,
      score: best?.score || 0,
      total: 20,
      refresherDueISO: due,
      suggestedAuthorisationLevel: 'Level 0 Awareness'
    };
    const blob=new Blob([JSON.stringify(data,null,2)], {type:'application/json'});
    const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='training-matrix.json'; a.click();
  }

  main.innerHTML=`<section class="card"><h2>Training Matrix</h2>
    <div class="table-wrap"><table><thead><tr><th>Learner</th><th>Course</th><th>Completion</th><th>Score</th><th>Refresher Due</th><th>Suggested Level</th></tr></thead>
    <tbody><tr><td>${state.learner.name || '—'}</td><td>${COURSE_TITLE}</td><td>${formatLocal(completed)}</td><td>${best?`${best.score}/20`:'—'}</td><td>${formatLocal(due)}</td><td>Level 0 Awareness</td></tr></tbody></table></div>
    <button id="matrixExport" class="btn">Export JSON</button>
  </section>`;
  main.querySelector('#matrixExport').onclick=exportJSON;
})();
