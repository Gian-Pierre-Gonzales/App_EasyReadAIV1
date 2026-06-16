// ===== NAVIGATION =====
function navigate(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(screenId);
  if (target) {
    target.classList.add('active');
    target.scrollTop = 0;
  }
}

// ===== INIT LUCIDE ICONS =====
document.addEventListener('DOMContentLoaded', () => {
  if (typeof lucide !== 'undefined') lucide.createIcons();
});

// ===== SPLASH AUTO-NAVIGATE =====
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => navigate('screen-login'), 2000);
});

// ===== HIGH CONTRAST =====
let highContrast = false;

function toggleHighContrast(btn) {
  highContrast = !highContrast;
  document.body.classList.toggle('high-contrast', highContrast);
  btn.setAttribute('aria-pressed', highContrast.toString());

  // Sync with settings toggle
  const settingsToggle = document.getElementById('toggle-contrast');
  if (settingsToggle) settingsToggle.checked = highContrast;
}

function applyContrast(checkbox) {
  highContrast = checkbox.checked;
  document.body.classList.toggle('high-contrast', highContrast);

  // Sync home grid button
  const contrastBtn = document.querySelector('.grid-card:nth-child(1)');
  if (contrastBtn) contrastBtn.setAttribute('aria-pressed', highContrast.toString());
}

// ===== LARGE FONT =====
let largeFont = false;

function toggleLargeFont(btn) {
  largeFont = !largeFont;
  document.body.classList.toggle('large-font', largeFont);
  btn.setAttribute('aria-pressed', largeFont.toString());
}

// ===== SIMPLE MODE =====
let simpleMode = false;

function toggleSimpleMode(btn) {
  simpleMode = !simpleMode;
  document.body.classList.toggle('simple-mode', simpleMode);
  btn.setAttribute('aria-pressed', simpleMode.toString());

  const settingsToggle = document.getElementById('toggle-simple');
  if (settingsToggle) settingsToggle.checked = simpleMode;
}

function applySimpleMode(checkbox) {
  simpleMode = checkbox.checked;
  document.body.classList.toggle('simple-mode', simpleMode);
}

// ===== FONT SIZE (READER) =====
let currentFontSize = 15;

function changeFontSize(delta) {
  const readerText = document.getElementById('reader-text');
  if (!readerText) return;

  if (delta === 0) {
    currentFontSize = 15; // reset
  } else {
    currentFontSize = Math.min(26, Math.max(11, currentFontSize + delta));
  }
  readerText.style.fontSize = currentFontSize + 'px';
}

// ===== TEXT TO SPEECH =====
function speakContent() {
  const text = document.getElementById('reader-text')?.innerText;
  if (!text) return;

  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  } else {
    alert('Tu navegador no soporta síntesis de voz.');
  }
}

// ===== VOICE RECOGNITION =====
let isListening = false;
let recognition = null;
let voiceTimeout = null;

function toggleVoice() {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    const statusEl = document.getElementById('listening-status');
    if (statusEl) {
      statusEl.textContent = '⚠ Navegador no compatible';
      statusEl.classList.add('inactive');
      statusEl.style.color = '#e53935';
    }
    return;
  }

  if (isListening) {
    stopListening();
  } else {
    startListening();
  }
}

function startListening() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = 'es-ES';
  recognition.continuous = false;
  recognition.interimResults = true;

  const statusEl = document.getElementById('listening-status');
  const transcriptEl = document.getElementById('transcript-output');
  const voiceBtn = document.getElementById('voice-btn');
  const botAvatar = document.querySelector('.bot-avatar');

  recognition.onstart = () => {
    isListening = true;
    statusEl.textContent = 'Escuchando...';
    statusEl.style.color = '';
    statusEl.classList.remove('inactive');
    voiceBtn.textContent = 'Detener';
    voiceBtn.style.background = '#cc0000';
    botAvatar?.classList.add('listening');

    // Timeout: 10 seconds without voice
    voiceTimeout = setTimeout(() => {
      if (isListening) {
        statusEl.textContent = 'No se detectó voz (tiempo agotado)';
        statusEl.style.color = '#e53935';
        stopListening();
      }
    }, 10000);
  };

  recognition.onresult = (event) => {
    // Clear timeout on any result
    if (voiceTimeout) { clearTimeout(voiceTimeout); voiceTimeout = null; }

    let transcript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }
    transcriptEl.textContent = transcript;
    handleVoiceCommand(transcript.toLowerCase().trim());
  };

  recognition.onerror = (event) => {
    console.error('Voice error:', event.error);
    if (voiceTimeout) { clearTimeout(voiceTimeout); voiceTimeout = null; }
    if (event.error === 'not-allowed') {
      statusEl.textContent = '⚠ Permiso de micrófono denegado';
      statusEl.style.color = '#e53935';
    } else if (event.error === 'no-speech') {
      statusEl.textContent = 'No se detectó voz';
      statusEl.style.color = '#e53935';
    }
    stopListening();
  };

  recognition.onend = () => {
    if (voiceTimeout) { clearTimeout(voiceTimeout); voiceTimeout = null; }
    stopListening();
  };

  recognition.start();
}

function stopListening() {
  isListening = false;
  if (recognition) recognition.stop();

  const statusEl = document.getElementById('listening-status');
  const voiceBtn = document.getElementById('voice-btn');
  const botAvatar = document.querySelector('.bot-avatar');

  if (statusEl) {
    statusEl.textContent = 'Listo';
    statusEl.classList.add('inactive');
  }
  if (voiceBtn) {
    voiceBtn.textContent = 'Hablar';
    voiceBtn.style.background = '';
  }
  botAvatar?.classList.remove('listening');
}

function handleVoiceCommand(command) {
  if (command.includes('inicio') || command.includes('home')) {
    setTimeout(() => navigate('screen-home'), 500);
  } else if (command.includes('leer') || command.includes('información') || command.includes('informacion')) {
    setTimeout(() => navigate('screen-reader'), 500);
  } else if (command.includes('configuración') || command.includes('configuracion') || command.includes('ajustes')) {
    setTimeout(() => navigate('screen-settings'), 500);
  } else if (command.includes('alto contraste') || command.includes('contraste')) {
    const contrastBtn = document.querySelector('.grid-card:nth-child(1)');
    if (contrastBtn) toggleHighContrast(contrastBtn);
  } else if (command.includes('letra grande') || command.includes('fuente grande')) {
    const fontBtn = document.querySelector('.grid-card:nth-child(2)');
    if (fontBtn) toggleLargeFont(fontBtn);
  }
}

// ===== LOGIN VALIDATION =====
const USERS_KEY = 'easyread_users';
const SESSION_KEY = 'easyread_session';

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function setSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

function getSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY));
  } catch (e) {
    return null;
  }
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

function validateLogin() {
  const emailInput = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');
  const emailError = document.getElementById('email-error');
  const passwordError = document.getElementById('password-error');

  let valid = true;

  // Reset errors
  emailInput.classList.remove('error');
  passwordInput.classList.remove('error');
  emailError.classList.remove('visible');
  passwordError.classList.remove('visible');
  emailError.textContent = '';
  passwordError.textContent = '';

  const email = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value;

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    emailError.textContent = 'El correo es obligatorio';
    emailError.classList.add('visible');
    emailInput.classList.add('error');
    valid = false;
  } else if (!emailRegex.test(email)) {
    emailError.textContent = 'Formato de correo inválido';
    emailError.classList.add('visible');
    emailInput.classList.add('error');
    valid = false;
  }

  // Password validation
  if (!password) {
    passwordError.textContent = 'La contraseña es obligatoria';
    passwordError.classList.add('visible');
    passwordInput.classList.add('error');
    valid = false;
  } else if (password.length < 6) {
    passwordError.textContent = 'Mínimo 6 caracteres';
    passwordError.classList.add('visible');
    passwordInput.classList.add('error');
    valid = false;
  }

  if (!valid) return;

  // Check user in localStorage
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    passwordError.textContent = 'Correo o contraseña incorrectos';
    passwordError.classList.add('visible');
    passwordInput.classList.add('error');
    return;
  }

  // Login success
  setSession(user);
  updateGreeting(user.name);
  navigate('screen-home');
}

function validateRegister() {
  const nameInput = document.getElementById('reg-name');
  const emailInput = document.getElementById('reg-email');
  const passwordInput = document.getElementById('reg-password');
  const confirmInput = document.getElementById('reg-confirm');

  const nameError = document.getElementById('reg-name-error');
  const emailError = document.getElementById('reg-email-error');
  const passwordError = document.getElementById('reg-password-error');
  const confirmError = document.getElementById('reg-confirm-error');

  let valid = true;

  // Reset all
  [nameInput, emailInput, passwordInput, confirmInput].forEach(i => i.classList.remove('error'));
  [nameError, emailError, passwordError, confirmError].forEach(e => { e.classList.remove('visible'); e.textContent = ''; });

  const name = nameInput.value.trim();
  const email = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value;
  const confirm = confirmInput.value;

  // Name
  if (!name || name.length < 3) {
    nameError.textContent = 'El nombre debe tener al menos 3 caracteres';
    nameError.classList.add('visible');
    nameInput.classList.add('error');
    valid = false;
  }

  // Email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    emailError.textContent = 'El correo es obligatorio';
    emailError.classList.add('visible');
    emailInput.classList.add('error');
    valid = false;
  } else if (!emailRegex.test(email)) {
    emailError.textContent = 'Formato de correo inválido';
    emailError.classList.add('visible');
    emailInput.classList.add('error');
    valid = false;
  } else {
    // Check if email already exists
    const users = getUsers();
    if (users.find(u => u.email === email)) {
      emailError.textContent = 'Este correo ya está registrado';
      emailError.classList.add('visible');
      emailInput.classList.add('error');
      valid = false;
    }
  }

  // Password
  if (!password) {
    passwordError.textContent = 'La contraseña es obligatoria';
    passwordError.classList.add('visible');
    passwordInput.classList.add('error');
    valid = false;
  } else if (password.length < 6) {
    passwordError.textContent = 'Mínimo 6 caracteres';
    passwordError.classList.add('visible');
    passwordInput.classList.add('error');
    valid = false;
  }

  // Confirm
  if (!confirm) {
    confirmError.textContent = 'Confirma tu contraseña';
    confirmError.classList.add('visible');
    confirmInput.classList.add('error');
    valid = false;
  } else if (confirm !== password) {
    confirmError.textContent = 'Las contraseñas no coinciden';
    confirmError.classList.add('visible');
    confirmInput.classList.add('error');
    valid = false;
  }

  if (!valid) return;

  // Register user
  const users = getUsers();
  const newUser = { id: Date.now(), name, email, password, createdAt: new Date().toISOString() };
  users.push(newUser);
  saveUsers(users);

  alert('¡Cuenta creada exitosamente! Ahora inicia sesión.');
  navigate('screen-login');

  // Pre-fill email in login
  document.getElementById('login-email').value = email;
}

function updateGreeting(name) {
  const greeting = document.querySelector('.greeting');
  if (greeting) {
    greeting.innerHTML = `Hola, <strong>${name}</strong>`;
  }
}

function logout() {
  clearSession();
  navigate('screen-login');
}

function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  if (input.type === 'password') {
    input.type = 'text';
    btn.innerHTML = '<i data-lucide="eye-off"></i>';
  } else {
    input.type = 'password';
    btn.innerHTML = '<i data-lucide="eye"></i>';
  }
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

// Auto-login if session exists
document.addEventListener('DOMContentLoaded', () => {
  const session = getSession();
  if (session) {
    updateGreeting(session.name);
  }
});


// ===== SURVEY (LIKERT) =====
const SURVEY_STORAGE_KEY = 'easyread_surveys';

const surveyQuestions = [
  'La aplicación es fácil de usar',
  'El modo alto contraste mejora la legibilidad',
  'El asistente de voz responde correctamente',
  'La función de lectura en voz alta es útil',
  'La configuración es intuitiva y accesible',
  'El tamaño del texto se ajusta adecuadamente',
  'Recomendaría esta app a personas con discapacidad'
];

// Step navigation
const stepQuestions = { 0: [], 1: [1, 2, 3], 2: [4, 5], 3: [6, 7] };

function goToStep(step) {
  const currentStep = document.querySelector('.survey-step.active');
  const currentStepNum = parseInt(currentStep?.dataset.step || '0');

  // Validate step 0 (user data)
  if (currentStepNum === 0 && step > 0) {
    const name = document.getElementById('survey-name')?.value.trim();
    const age = document.getElementById('survey-age')?.value;

    // Clear previous errors
    document.querySelectorAll('#screen-survey .survey-question').forEach(q => q.classList.remove('has-error'));

    if (!name || name.length < 3) {
      const nameQ = document.getElementById('survey-name')?.closest('.survey-question');
      if (nameQ) nameQ.classList.add('has-error');
      alert('El nombre debe tener al menos 3 caracteres');
      return;
    }
    if (!age || isNaN(age) || !Number.isInteger(Number(age)) || age < 10 || age > 120) {
      const ageQ = document.getElementById('survey-age')?.closest('.survey-question');
      if (ageQ) ageQ.classList.add('has-error');
      alert('Ingresa una edad válida (número entero entre 10 y 120)');
      return;
    }
  }

  // Validate current step before moving forward (questions)
  if (step > currentStepNum && currentStepNum > 0) {
    const questionsToValidate = stepQuestions[currentStepNum] || [];
    // Clear previous errors
    document.querySelectorAll('.survey-step.active .survey-question').forEach(q => q.classList.remove('has-error'));

    for (const qNum of questionsToValidate) {
      const selected = document.querySelector(`input[name="q${qNum}"]:checked`);
      if (!selected) {
        const questionEl = document.querySelector(`.survey-question[data-question="${qNum}"]`);
        if (questionEl) questionEl.classList.add('has-error');
        alert(`Por favor responde la pregunta ${qNum} antes de continuar`);
        return;
      }
    }
  }

  // Switch steps
  document.querySelectorAll('.survey-step').forEach(s => s.classList.remove('active'));
  const targetStep = document.querySelector(`.survey-step[data-step="${step}"]`);
  if (targetStep) {
    targetStep.classList.add('active');
    const surveyScreen = document.getElementById('screen-survey');
    if (surveyScreen) surveyScreen.scrollTop = 0;
  }

  // Update progress bar
  updateSurveyProgress(step);
}

function updateSurveyProgress(step) {
  const totalSteps = 4; // 0, 1, 2, 3
  const percent = Math.round((step / (totalSteps - 1)) * 100);
  const fill = document.getElementById('survey-progress-fill');
  const text = document.getElementById('survey-progress-text');
  if (fill) fill.style.width = percent + '%';
  if (text) text.textContent = percent + '%';
}

function getSurveyData() {
  try {
    return JSON.parse(localStorage.getItem(SURVEY_STORAGE_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveSurveyData(data) {
  localStorage.setItem(SURVEY_STORAGE_KEY, JSON.stringify(data));
}

// Handle form submission
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('survey-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const answers = [];
      for (let i = 1; i <= 7; i++) {
        const selected = document.querySelector(`input[name="q${i}"]:checked`);
        if (!selected) {
          alert(`Por favor responde la pregunta ${i}`);
          return;
        }
        answers.push(parseInt(selected.value));
      }

      const comments = document.getElementById('survey-comments')?.value || '';
      const userName = document.getElementById('survey-name')?.value.trim() || 'Anónimo';
      const userAge = parseInt(document.getElementById('survey-age')?.value) || 0;
      const userDisability = document.getElementById('survey-disability')?.value || '';

      const entry = {
        id: Date.now(),
        date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        userName,
        userAge,
        userDisability,
        answers,
        comments,
        average: (answers.reduce((a, b) => a + b, 0) / answers.length).toFixed(1)
      };

      const data = getSurveyData();
      data.push(entry);
      saveSurveyData(data);

      form.style.display = 'none';
      showReport();
    });
  }
});

function showReport() {
  const report = document.getElementById('survey-report');
  if (!report) return;

  const data = getSurveyData();
  report.style.display = 'flex';

  document.getElementById('report-count').textContent = `Respuestas registradas: ${data.length}`;

  // Calculate averages per question
  const qAverages = surveyQuestions.map((_, qi) => {
    const sum = data.reduce((acc, entry) => acc + entry.answers[qi], 0);
    return (sum / data.length).toFixed(1);
  });

  // Render bars
  const barsContainer = document.getElementById('report-bars');
  barsContainer.innerHTML = qAverages.map((avg, i) => `
    <div class="report-bar-item">
      <div class="report-bar-label">
        <span>${surveyQuestions[i]}</span>
        <span>${avg}/5</span>
      </div>
      <div class="report-bar-track">
        <div class="report-bar-fill" style="width: ${(avg / 5) * 100}%"></div>
      </div>
    </div>
  `).join('');

  // General stats
  const allAverages = data.map(d => parseFloat(d.average));
  const generalAvg = (allAverages.reduce((a, b) => a + b, 0) / allAverages.length).toFixed(1);
  const maxScore = Math.max(...allAverages).toFixed(1);
  const minScore = Math.min(...allAverages).toFixed(1);

  document.getElementById('stat-avg').textContent = generalAvg;
  document.getElementById('stat-max').textContent = maxScore;
  document.getElementById('stat-min').textContent = minScore;

  // History
  const historyContainer = document.getElementById('report-history');
  historyContainer.innerHTML = `
    <h3>Historial de respuestas</h3>
    ${data.slice(-10).reverse().map(entry => `
      <div class="history-entry">
        <span><strong>${entry.userName || 'Anónimo'}</strong> (${entry.userAge || '?'} años)</span>
        <span>${entry.average}/5</span>
      </div>
    `).join('')}
  `;
}

function resetSurvey() {
  const form = document.getElementById('survey-form');
  const report = document.getElementById('survey-report');

  if (form) {
    form.style.display = 'flex';
    form.reset();
    // Reset to step 0
    document.querySelectorAll('.survey-step').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.survey-question').forEach(q => q.classList.remove('has-error'));
    const step0 = document.querySelector('.survey-step[data-step="0"]');
    if (step0) step0.classList.add('active');
    // Reset progress
    updateSurveyProgress(0);
  }
  if (report) report.style.display = 'none';
}

function exportReport() {
  const data = getSurveyData();
  if (data.length === 0) {
    alert('No hay datos para exportar');
    return;
  }

  // Calculate averages
  const qAverages = surveyQuestions.map((_, qi) => {
    const sum = data.reduce((acc, entry) => acc + entry.answers[qi], 0);
    return (sum / data.length).toFixed(1);
  });

  const allAverages = data.map(d => parseFloat(d.average));
  const generalAvg = (allAverages.reduce((a, b) => a + b, 0) / allAverages.length).toFixed(1);

  // Generate HTML report
  const reportHTML = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <title>Reporte Encuesta EasyRead AI</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
    h1 { color: #7B2FFF; }
    h2 { color: #333; margin-top: 24px; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    th { background: #7B2FFF; color: #fff; padding: 10px; text-align: left; }
    td { padding: 10px; border: 1px solid #ddd; }
    tr:nth-child(even) td { background: #f9f6ff; }
    .stat { display: inline-block; background: #f0e8ff; padding: 12px 24px; border-radius: 12px; margin: 6px; text-align: center; }
    .stat-val { font-size: 28px; font-weight: 800; color: #7B2FFF; display: block; }
    .stat-lbl { font-size: 11px; color: #666; }
    .bar { height: 14px; background: #e8e0f5; border-radius: 7px; margin: 4px 0 12px; }
    .bar-fill { height: 100%; background: #7B2FFF; border-radius: 7px; }
    .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #999; }
  </style>
</head>
<body>
  <h1>📊 Reporte de Encuesta — EasyRead AI</h1>
  <p>Total de respuestas: <strong>${data.length}</strong></p>
  <p>Fecha de generación: ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</p>

  <div style="text-align:center; margin: 24px 0;">
    <div class="stat"><span class="stat-val">${generalAvg}</span><span class="stat-lbl">Promedio General</span></div>
    <div class="stat"><span class="stat-val">${Math.max(...allAverages).toFixed(1)}</span><span class="stat-lbl">Máximo</span></div>
    <div class="stat"><span class="stat-val">${Math.min(...allAverages).toFixed(1)}</span><span class="stat-lbl">Mínimo</span></div>
  </div>

  <h2>Resultados por pregunta</h2>
  <table>
    <tr><th>#</th><th>Pregunta</th><th>Promedio</th><th>Visual</th></tr>
    ${surveyQuestions.map((q, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${q}</td>
      <td><strong>${qAverages[i]}/5</strong></td>
      <td><div class="bar"><div class="bar-fill" style="width:${(qAverages[i] / 5) * 100}%"></div></div></td>
    </tr>`).join('')}
  </table>

  <h2>Historial de respuestas</h2>
  <table>
    <tr><th>Nombre</th><th>Edad</th><th>Discapacidad</th><th>Promedio</th><th>Fecha</th><th>Comentarios</th></tr>
    ${data.map(entry => `
    <tr>
      <td>${entry.userName || 'Anónimo'}</td>
      <td>${entry.userAge || '—'}</td>
      <td>${entry.userDisability || '—'}</td>
      <td>${entry.average}/5</td>
      <td>${entry.date}</td>
      <td>${entry.comments || '—'}</td>
    </tr>`).join('')}
  </table>

  <div class="footer">
    <p>EasyRead AI — Encuesta de Satisfacción (Escala de Likert)</p>
    <p>Desarrollado por: Gonzales Pradinett, Gian Pierre (U22210810) | Rios Pineda, Diego (U22206216)</p>
  </div>
</body>
</html>`;

  // Download as HTML file
  const blob = new Blob([reportHTML], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `reporte_encuesta_easyread_${Date.now()}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
