/* =========================================================
   DIGITAL LOVE LETTER — script.js
   Semua logika interaksi: amplop -> surat -> musik & confetti.
   Ganti path audio di index.html untuk mengganti sound effect.
========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* -------------------------------------------------------
     ELEMENT REFERENCES
  ------------------------------------------------------- */
  const envelope       = document.getElementById('envelope');
  const openingScene   = document.getElementById('opening-scene');
  const letterScene    = document.getElementById('letter-scene');
  const ambientLayer   = document.getElementById('ambient-particles');
  const confettiLayer  = document.getElementById('confetti-layer');
  const sparklesLayer  = document.querySelector('.sparkles');
  const vinyl           = document.getElementById('vinyl');
  const btnPlay         = document.getElementById('btn-play');
  const btnPause        = document.getElementById('btn-pause');

  const sfxVibration    = document.getElementById('sfx-vibration');
  const sfxPaperRustle  = document.getElementById('sfx-paper-rustle');
  const bgMusic         = document.getElementById('bg-music');

  let hasOpened = false;

  /* -------------------------------------------------------
     SAFE AUDIO PLAY
     Placeholder audio mungkin belum ada / belum bisa autoplay,
     jadi semua play() dibungkus supaya tidak melempar error
     dan menghentikan animasi.
  ------------------------------------------------------- */
  function safePlay(audioEl){
    if (!audioEl) return;
    audioEl.currentTime = 0;
    const p = audioEl.play();
    if (p && p.catch) p.catch(() => { /* diabaikan: aset belum tersedia */ });
  }
  function safePause(audioEl){
    if (!audioEl) return;
    audioEl.pause();
  }

  /* -------------------------------------------------------
     AMBIENT PARTICLES (opening scene)
  ------------------------------------------------------- */
  function buildAmbientParticles(count = 26){
    if (!ambientLayer) return;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i++){
      const mote = document.createElement('span');
      mote.className = 'mote';
      const size = (Math.random() * 3 + 1.5).toFixed(1);
      mote.style.setProperty('--s', `${size}px`);
      mote.style.setProperty('--dur', `${(Math.random() * 10 + 10).toFixed(1)}s`);
      mote.style.setProperty('--delay', `${(Math.random() * 6).toFixed(1)}s`);
      mote.style.left = `${Math.random() * 100}%`;
      mote.style.top = `${Math.random() * 100}%`;
      frag.appendChild(mote);
    }
    ambientLayer.appendChild(frag);
  }

  /* -------------------------------------------------------
     SPARKLES (around the paper on the letter scene)
  ------------------------------------------------------- */
  function buildSparkles(count = 12){
    if (!sparklesLayer) return;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i++){
      const s = document.createElement('span');
      s.className = 'sparkle';
      const size = (Math.random() * 5 + 4).toFixed(1);
      s.style.setProperty('--s', `${size}px`);
      s.style.setProperty('--delay', `${(Math.random() * 2.8).toFixed(2)}s`);
      s.style.left = `${Math.random() * 100}%`;
      s.style.top = `${Math.random() * 100}%`;
      frag.appendChild(s);
    }
    sparklesLayer.appendChild(frag);
  }

  /* -------------------------------------------------------
     CONFETTI — muncul ~3 detik setelah surat terbuka
  ------------------------------------------------------- */
  function launchConfetti(count = 46){
    if (!confettiLayer) return;
    const colors = ['#e3a6b4', '#cda45e', '#f2c9d2', '#7c2d42', '#fbf5ec'];

    for (let i = 0; i < count; i++){
      const piece = document.createElement('span');
      piece.className = 'confetti-piece';

      const size = Math.random() * 7 + 5;
      const isCircle = Math.random() > 0.5;
      piece.style.width = `${size}px`;
      piece.style.height = `${size * (isCircle ? 1 : 0.4)}px`;
      piece.style.borderRadius = isCircle ? '50%' : '2px';
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.left = `${Math.random() * 100}%`;

      const duration = (Math.random() * 1.8 + 2.4).toFixed(2);
      const drift = `${(Math.random() * 160 - 80).toFixed(0)}px`;
      const spin = `${(Math.random() * 540 + 180).toFixed(0)}deg`;

      piece.style.setProperty('--drift', drift);
      piece.style.setProperty('--spin', spin);
      piece.style.animationDuration = `${duration}s`;
      piece.style.animationDelay = `${(Math.random() * 0.5).toFixed(2)}s`;

      confettiLayer.appendChild(piece);

      setTimeout(() => piece.remove(), (parseFloat(duration) + 1) * 1000);
    }
  }

  /* -------------------------------------------------------
     REVEAL-ON-VIEW (staggered fade+rise for letter content)
  ------------------------------------------------------- */
  function revealLetterContent(){
    const items = document.querySelectorAll('[data-reveal]');
    items.forEach((el, i) => {
      setTimeout(() => el.classList.add('in-view'), i * 180);
    });
  }

  /* -------------------------------------------------------
     ENVELOPE INTERACTION
  ------------------------------------------------------- */
  function openEnvelope(){
    if (hasOpened) return;
    hasOpened = true;

    // stop the idle wiggle + its vibration sfx
    envelope.classList.add('no-wiggle');
    safePause(sfxVibration);

    // crossfade closed -> open artwork + start the letter rising
    // (see .envelope-open-back/front and .envelope-letter in style.css)
    envelope.classList.add('is-opened');

    // paper rustle right as the letter starts sliding out (~.55s delay)
    setTimeout(() => safePlay(sfxPaperRustle), 550);

    // once the letter has fully emerged, cross-fade scenes
    setTimeout(() => {
      transitionToLetterScene();
    }, 1750);
  }

  function transitionToLetterScene(){
    openingScene.classList.add('fade-out');

    setTimeout(() => {
      openingScene.setAttribute('hidden', '');
      letterScene.removeAttribute('hidden');

      // force reflow so the opacity transition actually runs
      void letterScene.offsetWidth;
      letterScene.classList.add('is-visible');

      revealLetterContent();
      launchConfetti();

      // music starts automatically now that the user has interacted
      startMusic();
    }, 500);
  }

  /* -------------------------------------------------------
     MUSIC + VINYL CONTROLS
  ------------------------------------------------------- */
  function startMusic(){
    safePlay(bgMusic);
    vinyl.classList.add('is-playing');
  }
  function pauseMusic(){
    safePause(bgMusic);
    vinyl.classList.remove('is-playing');
  }

  btnPlay?.addEventListener('click', startMusic);
  btnPause?.addEventListener('click', pauseMusic);

  /* -------------------------------------------------------
     EVENTS
  ------------------------------------------------------- */
  envelope.addEventListener('click', openEnvelope);
  envelope.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' '){
      e.preventDefault();
      openEnvelope();
    }
  });

  /* -------------------------------------------------------
     INIT
  ------------------------------------------------------- */
  buildAmbientParticles();
  buildSparkles();
  safePlay(sfxVibration); // gentle idle loop while envelope wiggles

});
