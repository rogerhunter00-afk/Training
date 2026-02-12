(function(){
  const { initLayout, loadState, updateState, uuid, formatLocal } = window.ALSApp;
  const main=initLayout('Practical Sign-off');
  const state=loadState();

  main.innerHTML=`<section class="card print-sheet"><h2>Observed Safe Isolation Sign-off</h2>
    <form id="signoffForm">
      <label>Learner name<input name="learnerName" type="text" required value="${state.learner.name || ''}"></label>
      <label>Supervisor name<input name="supervisorName" type="text" required></label>
      <label>Site / location<input name="siteLocation" type="text"></label>
      <label>Equipment / asset<input name="equipment" type="text"></label>
      <fieldset><legend>Result</legend>
        <label><input type="radio" name="result" value="pass" required>Pass</label>
        <label><input type="radio" name="result" value="fail">Fail</label>
      </fieldset>
      <fieldset><legend>Checklist</legend>
        <label><input type="checkbox" name="identify">Identify</label>
        <label><input type="checkbox" name="shutdown">Shutdown</label>
        <label><input type="checkbox" name="isolate">Isolate</label>
        <label><input type="checkbox" name="lockTag">Lock off + tag</label>
        <label><input type="checkbox" name="verify">Verify isolation</label>
        <label><input type="checkbox" name="storedEnergy">Stored energy checks</label>
        <label><input type="checkbox" name="restore">Restore safely</label>
      </fieldset>
      <label>Notes<textarea name="notes" rows="3"></textarea></label>
      <div class="nav-buttons"><button class="btn" type="submit">Save sign-off</button><button class="btn secondary" type="button" id="printSignoff">Print form</button></div>
    </form>
  </section>
  <section class="card"><h3>Saved records</h3><ul id="records"></ul></section>`;

  const recordsEl=main.querySelector('#records');
  function renderRecords(){
    const records=loadState().practicalSignoff.records || [];
    recordsEl.innerHTML = records.length ? records.map(r=>`<li>${formatLocal(r.signedAtISO)} — ${r.learnerName} / ${r.supervisorName} — ${r.result.toUpperCase()}</li>`).join('') : '<li>No records yet.</li>';
  }
  renderRecords();

  main.querySelector('#signoffForm').addEventListener('submit',(e)=>{
    e.preventDefault();
    const fd=new FormData(e.target);
    const rec={
      recordId: uuid('signoff'),
      learnerName: String(fd.get('learnerName')||'').trim(),
      supervisorName: String(fd.get('supervisorName')||'').trim(),
      signedAtISO: new Date().toISOString(),
      siteLocation: String(fd.get('siteLocation')||'').trim(),
      equipment: String(fd.get('equipment')||'').trim(),
      result: fd.get('result')==='fail'?'fail':'pass',
      notes: String(fd.get('notes')||'').trim(),
      checks: {
        identify: fd.get('identify')==='on', shutdown: fd.get('shutdown')==='on', isolate: fd.get('isolate')==='on', lockTag: fd.get('lockTag')==='on', verify: fd.get('verify')==='on', storedEnergy: fd.get('storedEnergy')==='on', restore: fd.get('restore')==='on'
      }
    };
    updateState(s=>{ s.practicalSignoff.records.push(rec); if(!s.learner.name) s.learner.name=rec.learnerName; });
    alert('Sign-off saved.');
    e.target.reset();
    renderRecords();
  });

  main.querySelector('#printSignoff').onclick=()=>window.print();
})();
