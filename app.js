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

function toggleVoice() {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    alert('Tu navegador no soporta reconocimiento de voz. Prueba con Chrome.');
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
    statusEl.classList.remove('inactive');
    voiceBtn.textContent = 'Detener';
    voiceBtn.style.background = '#cc0000';
    botAvatar?.classList.add('listening');
  };

  recognition.onresult = (event) => {
    let transcript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }
    transcriptEl.textContent = transcript;
    handleVoiceCommand(transcript.toLowerCase().trim());
  };

  recognition.onerror = (event) => {
    console.error('Voice error:', event.error);
    stopListening();
  };

  recognition.onend = () => {
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
document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.querySelector('#screen-login .btn-primary');
  if (loginBtn) {
    loginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email')?.value.trim();
      const password = document.getElementById('login-password')?.value;

      if (!email || !password) {
        alert('Por favor ingresa tu correo y contraseña.');
        return;
      }
      navigate('screen-home');
    });
  }
});
