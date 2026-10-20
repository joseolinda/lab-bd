(() => {
  'use strict';
  const lessons = [...document.querySelectorAll('.lesson')];
  const checks = [...document.querySelectorAll('[data-check]')];
  const nav = document.getElementById('lesson-nav');
  const storageKey = 's4-primeiro-postgres-v1';
  const state = { checks: {}, answers: {} };
  let current = 0;
  let canStore = true;
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
    if (saved && typeof saved === 'object') {
      if (saved.checks && typeof saved.checks === 'object') state.checks = saved.checks;
      if (saved.answers && typeof saved.answers === 'object') state.answers = saved.answers;
    }
  } catch (_) { canStore = false; }

  function persist() {
    if (!canStore) return;
    try { localStorage.setItem(storageKey, JSON.stringify(state)); }
    catch (_) {
      canStore = false;
      document.getElementById('storage-status').textContent = 'Seu navegador não permitiu salvar o progresso. As atividades continuam funcionando nesta aba.';
    }
  }

  lessons.forEach((lesson, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'nav-step';
    button.dataset.index = String(index);
    button.setAttribute('aria-controls', lesson.id);
    const number = document.createElement('span');
    number.className = 'nav-number';
    number.textContent = String(index + 1).padStart(2, '0');
    const label = document.createElement('span');
    label.className = 'nav-label';
    label.textContent = lesson.dataset.title;
    const status = document.createElement('span');
    status.className = 'nav-status';
    status.setAttribute('aria-hidden', 'true');
    button.append(number, label, status);
    button.addEventListener('click', () => go(index, true));
    nav.append(button);
  });

  function updateProgress() {
    const marked = checks.filter(check => check.checked).length;
    const progress = document.getElementById('course-progress');
    progress.max = checks.length;
    progress.value = marked;
    document.getElementById('progress-label').textContent = `${marked} de ${checks.length} verificações marcadas`;
    lessons.forEach((lesson, index) => {
      const localChecks = [...lesson.querySelectorAll('[data-check]')];
      const done = localChecks.length > 0 && localChecks.every(check => check.checked);
      const button = nav.children[index];
      button.classList.toggle('done', done);
      button.querySelector('.nav-status').textContent = done ? '✓' : '';
      button.setAttribute('aria-label', `${index + 1}. ${lesson.dataset.title}${done ? ', verificações marcadas' : ''}`);
    });
  }

  checks.forEach(check => {
    check.checked = state.checks[check.dataset.check] === true;
    check.addEventListener('change', () => {
      state.checks[check.dataset.check] = check.checked;
      updateProgress();
      persist();
    });
  });

  function displayAnswer(quiz, value) {
    const feedback = quiz.querySelector('.feedback');
    const correct = value === quiz.dataset.correct;
    feedback.className = `feedback ${correct ? 'correct' : 'incorrect'}`;
    feedback.textContent = `${correct ? 'Isso mesmo. ' : 'Reveja a escolha. '}${feedback.dataset.explanation}`;
  }

  document.querySelectorAll('[data-quiz]').forEach(quiz => {
    const saved = state.answers[quiz.dataset.quiz];
    const matching = [...quiz.querySelectorAll('input[type="radio"]')].find(input => input.value === saved);
    if (matching) { matching.checked = true; displayAnswer(quiz, saved); }
    quiz.querySelector('[data-check-answer]').addEventListener('click', () => {
      const selected = quiz.querySelector('input:checked');
      const feedback = quiz.querySelector('.feedback');
      if (!selected) { feedback.className = 'feedback incorrect'; feedback.textContent = 'Escolha uma alternativa para conferir sua resposta.'; return; }
      state.answers[quiz.dataset.quiz] = selected.value;
      displayAnswer(quiz, selected.value);
      persist();
    });
    quiz.querySelectorAll('input').forEach(input => input.addEventListener('change', () => {
      const feedback = quiz.querySelector('.feedback');
      feedback.textContent = '';
      feedback.className = 'feedback';
      delete state.answers[quiz.dataset.quiz];
      persist();
    }));
  });

  function go(index, focus) {
    current = Math.max(0, Math.min(lessons.length - 1, index));
    lessons.forEach((lesson, i) => {
      lesson.hidden = i !== current;
      nav.children[i].classList.toggle('active', i === current);
      if (i === current) nav.children[i].setAttribute('aria-current', 'step');
      else nav.children[i].removeAttribute('aria-current');
    });
    document.getElementById('previous').disabled = current === 0;
    document.getElementById('next').disabled = current === lessons.length - 1;
    document.getElementById('step-counter').textContent = `Missão ${current + 1} de ${lessons.length}`;
    try { history.replaceState(null, '', `#${lessons[current].id}`); } catch (_) { /* file:// pode restringir History. */ }
    document.title = `S4 · ${lessons[current].dataset.title} · PostgreSQL`;
    if (focus) {
      const heading = lessons[current].querySelector('h1');
      heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
      heading.scrollIntoView({ block: 'start', behavior: 'instant' });
    }
  }

  document.getElementById('previous').addEventListener('click', () => go(current - 1, true));
  document.getElementById('next').addEventListener('click', () => go(current + 1, true));
  window.addEventListener('hashchange', () => {
    const index = lessons.findIndex(lesson => `#${lesson.id}` === location.hash);
    if (index >= 0) go(index, true);
  });

  function personalize() {
    const values = {
      user: document.getElementById('student-user').value.trim() || 'seu_usuario',
      db: document.getElementById('student-db').value.trim() || 'aluno_nomealuno'
    };
    document.querySelectorAll('[data-value]').forEach(element => { element.textContent = values[element.dataset.value]; });
  }
  document.getElementById('student-user').addEventListener('input', personalize);
  document.getElementById('student-db').addEventListener('input', personalize);
  let printDetails = [];
  window.addEventListener('beforeprint', () => {
    printDetails = [...document.querySelectorAll('details')].map(element => ({ element, open: element.open }));
    printDetails.forEach(({ element }) => { element.open = true; });
  });
  window.addEventListener('afterprint', () => {
    printDetails.forEach(({ element, open }) => { element.open = open; });
    printDetails = [];
  });
  document.getElementById('print').addEventListener('click', () => window.print());
  document.getElementById('reset').addEventListener('click', () => {
    if (!window.confirm('Limpar as marcações e as respostas desta aula neste navegador? Os objetos criados no pgAdmin não serão alterados.')) return;
    state.checks = {};
    state.answers = {};
    checks.forEach(check => { check.checked = false; });
    document.querySelectorAll('[data-quiz] input').forEach(input => { input.checked = false; });
    document.querySelectorAll('.feedback').forEach(feedback => { feedback.textContent = ''; feedback.className = 'feedback'; });
    updateProgress();
    persist();
  });

  document.getElementById('download').addEventListener('click', () => {
    const answered = [...document.querySelectorAll('[data-quiz]')];
    const correct = answered.filter(quiz => state.answers[quiz.dataset.quiz] === quiz.dataset.correct).length;
    const lines = ['S4 · Primeiro contato com PostgreSQL', `Banco informado: ${document.getElementById('student-db').value.trim() || '(não informado)'}`, '', 'Autoavaliação do estudante — não verifica o banco de dados.', '', ...checks.map(check => `${check.checked ? '[x]' : '[ ]'} ${check.parentElement.textContent.trim()}`), '', `Questões conferidas e corretas: ${correct} de ${answered.length}.`, '', 'Bilhete de saída:', document.getElementById('exit-ticket').value.trim() || '(não preenchido)', '', 'Apresente também os objetos reais no pgAdmin ao professor.'];
    const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'registro-aula-postgresql.txt';
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    document.getElementById('download-status').textContent = 'Registro preparado para download. Apresente-o com sua demonstração no pgAdmin.';
  });

  if (!canStore) document.getElementById('storage-status').textContent = 'Seu navegador não permitiu recuperar o progresso. As atividades continuam funcionando nesta aba.';
  updateProgress();
  const initial = lessons.findIndex(lesson => `#${lesson.id}` === location.hash);
  go(initial >= 0 ? initial : 0, false);
})();
