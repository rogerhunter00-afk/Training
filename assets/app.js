(function(){
  const STORAGE_KEY = 'als_electrical_safety_v1';
  const COURSE_TITLE = 'Electrical Safety Awareness & Safe Isolation (UK)';
  const VERSION = '1.0.0';
  const DEFAULT_SETTINGS = {
    enableLevel2PracticalSignoff: true,
    requirePracticalSignoffForCertificate: false,
    refresherMonths: 12,
    showTrainingMatrixPage: true
  };
  const moduleTitles = [
    'Welcome & Rules',
    'UK Legal Duties',
    'Competency & Limits',
    'Instruction, Training, Supervision',
    'Training Evidence & Practical Sign-off',
    'Hazards & Warning Signs',
    'Controls & Safe Isolation',
    'Inspection, Testing, Housekeeping',
    'Emergencies & Reporting'
  ];

  function uuid(prefix='id'){ return `${prefix}-${Math.random().toString(36).slice(2, 10)}`; }

  function createDefaultState(){
    return {
      version: VERSION,
      siteName: '',
      learner: { name: '', createdAtISO: '' },
      settings: { ...DEFAULT_SETTINGS },
      course: {
        currentModuleIndex: 0,
        moduleCompletion: new Array(moduleTitles.length).fill(false),
        moduleInteractions: {},
        startedAtISO: '',
        completedAtISO: ''
      },
      quiz: { attempts: [], bestAttemptId: '' },
      practicalSignoff: { required: false, records: [] }
    };
  }

  function mergeState(base, incoming){
    const next = { ...base, ...(incoming || {}) };
    next.learner = { ...base.learner, ...(incoming?.learner || {}) };
    next.settings = { ...base.settings, ...(incoming?.settings || {}) };
    next.course = { ...base.course, ...(incoming?.course || {}) };
    next.course.moduleCompletion = Array.isArray(next.course.moduleCompletion)
      ? moduleTitles.map((_, i) => Boolean(next.course.moduleCompletion[i]))
      : new Array(moduleTitles.length).fill(false);
    next.course.moduleInteractions = next.course.moduleInteractions || {};
    next.quiz = { attempts: [], bestAttemptId: '', ...(incoming?.quiz || {}) };
    next.quiz.attempts = Array.isArray(next.quiz.attempts) ? next.quiz.attempts : [];
    next.practicalSignoff = {
      required: Boolean(incoming?.practicalSignoff?.required || next.settings.requirePracticalSignoffForCertificate),
      records: Array.isArray(incoming?.practicalSignoff?.records) ? incoming.practicalSignoff.records : []
    };
    return next;
  }

  function loadState(){
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if(!raw){
        const initial = createDefaultState();
        saveState(initial);
        return initial;
      }
      return mergeState(createDefaultState(), JSON.parse(raw));
    } catch {
      const fallback = createDefaultState();
      saveState(fallback);
      return fallback;
    }
  }

  function saveState(state){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function updateState(mutator){
    const state = loadState();
    const draft = structuredClone(state);
    mutator(draft);
    draft.practicalSignoff.required = draft.settings.requirePracticalSignoffForCertificate;
    saveState(draft);
    window.dispatchEvent(new CustomEvent('als-state-updated', { detail: draft }));
    return draft;
  }

  function formatLocal(iso){
    if(!iso) return '—';
    const d = new Date(iso);
    return isNaN(d) ? '—' : d.toLocaleString();
  }

  function addMonths(iso, months){
    const date = new Date(iso);
    if (isNaN(date)) return '';
    date.setMonth(date.getMonth() + Number(months || 0));
    return date.toISOString();
  }

  function getBestAttempt(state){
    const bestId = state.quiz.bestAttemptId;
    const attempts = state.quiz.attempts || [];
    return attempts.find(a => a.attemptId === bestId) || attempts.slice().sort((a,b)=>b.score-a.score)[0] || null;
  }

  function getLatestPassSignoff(state){
    return (state.practicalSignoff.records || []).filter(r=>r.result==='pass').sort((a,b)=>new Date(b.signedAtISO)-new Date(a.signedAtISO))[0] || null;
  }

  function imageFallback(img){
    const label = img.getAttribute('alt') || 'Training image unavailable';
    const text = encodeURIComponent(label);
    img.onerror = null;
    img.src = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 360'><rect width='640' height='360' fill='%23e2e8f0'/><rect x='20' y='20' width='600' height='320' rx='16' fill='%23cbd5e1'/><text x='320' y='158' text-anchor='middle' fill='%231e293b' font-size='28' font-family='Arial,sans-serif'>Image unavailable</text><text x='320' y='198' text-anchor='middle' fill='%231e293b' font-size='20' font-family='Arial,sans-serif'>${text}</text></svg>`;
  }

  function ensureToastRegion(){
    let region = document.querySelector('#toastRegion');
    if(region) return region;
    region = document.createElement('div');
    region.id = 'toastRegion';
    region.className = 'toast-region';
    region.setAttribute('aria-live', 'polite');
    region.setAttribute('aria-atomic', 'true');
    document.body.append(region);
    return region;
  }

  function showToast(message, options = {}){
    const { type = 'info', title = '', duration = 4500 } = options;
    const region = ensureToastRegion();
    const toast = document.createElement('section');
    toast.className = `toast ${type === 'error' ? 'error' : ''}`;
    toast.setAttribute('role', type === 'error' ? 'alert' : 'status');
    toast.innerHTML = `${title ? `<strong>${title}</strong>` : ''}<p>${message}</p><button type="button" class="btn tiny secondary" aria-label="Dismiss notification">Dismiss</button>`;
    const dismiss = ()=>toast.remove();
    toast.querySelector('button')?.addEventListener('click', dismiss);
    region.append(toast);
    if(duration > 0){ setTimeout(dismiss, duration); }
  }

  function buildNav(state){
    const showMatrix = state.settings.showTrainingMatrixPage;
    return `
      <button class="nav-toggle" aria-expanded="false" aria-controls="sidebarNav">Menu</button>
      <aside class="sidebar" id="sidebarNav">
        <h2>Course</h2>
        <ul>
          <li><a href="index.html">Home</a></li>
          <li><a href="course.html">Modules</a></li>
          <li><a href="quiz.html">Final Assessment</a></li>
          <li><a href="certificate.html">Certificate</a></li>
          <li><a href="signoff.html">Practical Sign-off</a></li>
          ${showMatrix ? '<li><a href="matrix.html">Training Matrix</a></li>' : ''}
        </ul>
      </aside>`;
  }

  function initLayout(pageTitle){
    const state = loadState();
    document.title = `${pageTitle} | ${COURSE_TITLE}`;
    const app = document.querySelector('#app');
    app.insertAdjacentHTML('afterbegin', `
      <header class="topbar">
        <div>
          <h1>${COURSE_TITLE}</h1>
          <p class="subline">Estimated duration: 35–55 minutes</p>
        </div>
        <div class="top-actions">
          <p aria-live="polite">Learner: <strong id="learnerDisplay">${state.learner.name || 'Not set'}</strong></p>
          <button id="settingsBtn" class="btn secondary">Settings</button>
        </div>
      </header>
      <div class="layout">${buildNav(state)}<main id="mainContent" tabindex="-1"></main></div>
      <footer class="site-footer">Awareness training only; does not authorise electrical work. Always follow site rules, permits, and competency requirements.</footer>
      <div class="modal hidden" id="settingsModal" role="dialog" aria-modal="true" aria-labelledby="settingsTitle">
        <div class="modal-card">
          <h2 id="settingsTitle">Settings</h2>
          <form id="settingsForm">
            <label>Site name<input name="siteName" type="text" value="${state.siteName || ''}"></label>
            <label>Learner full name<input required name="learnerName" type="text" value="${state.learner.name || ''}"></label>
            <p class="hint">Certificate will reflect current stored name.</p>
            <label>Refresher months<input name="refresherMonths" type="number" min="1" value="${state.settings.refresherMonths}"></label>
            <label class="inline"><input type="checkbox" name="enableLevel2PracticalSignoff" ${state.settings.enableLevel2PracticalSignoff ? 'checked':''}>Enable Level 2 practical sign-off</label>
            <label class="inline"><input type="checkbox" name="requirePracticalSignoffForCertificate" ${state.settings.requirePracticalSignoffForCertificate ? 'checked':''}>Require practical sign-off for certificate</label>
            <label class="inline"><input type="checkbox" name="showTrainingMatrixPage" ${state.settings.showTrainingMatrixPage ? 'checked':''}>Show training matrix page</label>
            <div class="modal-actions">
              <button type="submit" class="btn">Save settings</button>
              <button type="button" id="resetProgress" class="btn danger">Reset progress</button>
              <button type="button" id="closeSettings" class="btn secondary">Close</button>
            </div>
          </form>
        </div>
      </div>
      <div class="modal hidden" id="resetConfirmModal" role="dialog" aria-modal="true" aria-labelledby="resetConfirmTitle">
        <div class="modal-card">
          <h2 id="resetConfirmTitle">Reset progress?</h2>
          <p>This will delete all module progress, quiz attempts, and sign-off records.</p>
          <div class="modal-actions">
            <button type="button" id="confirmReset" class="btn danger">Yes, reset</button>
            <button type="button" id="cancelReset" class="btn secondary">Cancel</button>
          </div>
        </div>
      </div>`);

    const navToggle = app.querySelector('.nav-toggle');
    const sidebar = app.querySelector('#sidebarNav');
    navToggle?.addEventListener('click', ()=>{
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      sidebar.classList.toggle('open');
    });

    const settingsModal = app.querySelector('#settingsModal');
    const resetConfirmModal = app.querySelector('#resetConfirmModal');
    let lastFocusedEl = null;

    const getFocusable = (modal)=>[...modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')].filter(el=>!el.disabled);
    const openModal = (modal)=>{
      lastFocusedEl = document.activeElement;
      modal.classList.remove('hidden');
      getFocusable(modal)[0]?.focus();
    };
    const closeModal = (modal)=>{
      modal.classList.add('hidden');
      lastFocusedEl?.focus();
    };
    const trapTab = (evt, modal)=>{
      if(evt.key !== 'Tab') return;
      const focusable = getFocusable(modal);
      if(!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if(evt.shiftKey && document.activeElement === first){ evt.preventDefault(); last.focus(); }
      if(!evt.shiftKey && document.activeElement === last){ evt.preventDefault(); first.focus(); }
    };

    [settingsModal, resetConfirmModal].forEach((modal)=>{
      modal?.addEventListener('keydown', (evt)=>{
        if(evt.key === 'Escape') closeModal(modal);
        trapTab(evt, modal);
      });
    });

    app.querySelector('#settingsBtn')?.addEventListener('click',()=>openModal(settingsModal));
    app.querySelector('#closeSettings')?.addEventListener('click',()=>closeModal(settingsModal));

    app.querySelector('#settingsForm')?.addEventListener('submit',(e)=>{
      e.preventDefault();
      const fd = new FormData(e.target);
      const learnerName = String(fd.get('learnerName') || '').trim();
      if(!learnerName){ showToast('Learner name is required.', { type: 'error' }); return; }
      updateState(s=>{
        s.siteName = String(fd.get('siteName') || '').trim();
        s.learner.name = learnerName;
        s.learner.createdAtISO ||= new Date().toISOString();
        s.settings.refresherMonths = Math.max(1, Number(fd.get('refresherMonths') || 12));
        s.settings.enableLevel2PracticalSignoff = fd.get('enableLevel2PracticalSignoff') === 'on';
        s.settings.requirePracticalSignoffForCertificate = fd.get('requirePracticalSignoffForCertificate') === 'on';
        s.settings.showTrainingMatrixPage = fd.get('showTrainingMatrixPage') === 'on';
      });
      document.querySelector('#learnerDisplay').textContent = learnerName;
      closeModal(settingsModal);
      showToast('Settings saved.');
    });

    app.querySelector('#resetProgress')?.addEventListener('click',()=>{
      openModal(resetConfirmModal);
    });
    app.querySelector('#cancelReset')?.addEventListener('click',()=>closeModal(resetConfirmModal));
    app.querySelector('#confirmReset')?.addEventListener('click',()=>{
      const learner = loadState().learner;
      const fresh = createDefaultState();
      fresh.learner = learner;
      saveState(fresh);
      location.href = 'index.html';
    });

    window.addEventListener('als-state-updated', (evt)=>{
      document.querySelector('#learnerDisplay').textContent = evt.detail.learner.name || 'Not set';
    });

    return app.querySelector('#mainContent');
  }

  window.ALSApp = {
    STORAGE_KEY,
    VERSION,
    COURSE_TITLE,
    moduleTitles,
    uuid,
    loadState,
    saveState,
    updateState,
    formatLocal,
    addMonths,
    initLayout,
    showToast,
    imageFallback,
    getBestAttempt,
    getLatestPassSignoff
  };
})();
