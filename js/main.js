/* ====== Gửi Man An 💖 – main.js ====== */
(function () {
  'use strict';

  const $ = (s) => document.querySelector(s);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- CẤU HÌNH NỘI DUNG ---------- */
  const NAME = 'MAN AN';
  const TOP_LINE = 'CHÚC MỪNG 20/10';

  const LETTER = [
    'Man An à,',
    'Anh không giỏi nói những lời hoa mỹ, nên anh làm cái web nhỏ này để nói thay anh.',
    'Cảm ơn em vì đã đến bên anh, vì những ngày bình thường bỗng trở nên đáng nhớ chỉ vì có em ở đó.',
    'Cảm ơn em vì luôn kiên nhẫn với anh, vì những cái ôm, những lời nhắn lúc khuya, và cả những lần giận dỗi dễ thương nữa.',
    'Nhân ngày 20/10, anh chúc vợ iu của anh luôn xinh đẹp, luôn vui vẻ, và luôn được yêu thương thật nhiều - mà người yêu em nhiều nhất chắc chắn là anh rồi.',
    'Dù nắng mưa bao mùa, thì tình anh vẫn luôn ở đây mà. 💖'
  ];

  // Lời bài hát hiện theo nhạc (giây)
  const LYRICS = [
    [1.0, 'Vì đã lỡ yêu em rồi'],
    [4.0, 'Chẳng dám hứa xa xôi'],
    [7.0, 'Cứ nhắm mắt em lại, ya feel my love'],
    [11.0, 'Dù nắng mưa bao mùa'],
    [13.5, 'Thì tình anh vẫn luôn đây mà'],
    [16.0, 'Chẳng phải kiếm đâu xa'],
    [19.0, 'Vẫn giữ đó bầu trời riêng chúng ta'],
    [23.0, 'Để gió mang đi về một nơi không người']
  ];

  /* ---------- NHẠC NỀN ---------- */
  const bgm = $('#bgm');
  const musicBtn = $('#musicBtn');
  const lyricEl = $('#lyric');
  let musicOn = false;

  function playMusic() {
    bgm.volume = 0.9;
    const p = bgm.play();
    if (p && p.then) {
      p.then(() => setMusic(true)).catch(() => setMusic(false));
    } else setMusic(true);
  }
  function setMusic(on) {
    musicOn = on;
    musicBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    musicBtn.innerHTML = on ? '<i class="fa-solid fa-music"></i>' : '<i class="fa-solid fa-volume-xmark"></i>';
    if (!on) lyricEl.classList.remove('show');
  }
  musicBtn.addEventListener('click', () => {
    if (musicOn) { bgm.pause(); setMusic(false); } else playMusic();
  });

  let lastLyric = -1;
  bgm.addEventListener('timeupdate', () => {
    const t = bgm.currentTime;
    let idx = -1;
    for (let i = 0; i < LYRICS.length; i++) if (t >= LYRICS[i][0]) idx = i;
    if (idx !== lastLyric) {
      lastLyric = idx;
      if (idx < 0) { lyricEl.classList.remove('show'); return; }
      lyricEl.classList.remove('show');
      // restart animation
      void lyricEl.offsetWidth;
      lyricEl.textContent = LYRICS[idx][1];
      lyricEl.classList.add('show');
    }
  });
  bgm.addEventListener('seeked', () => { lastLyric = -1; });

  /* ---------- CANVAS: CHỮ BAY (galaxy) ---------- */
  const gCanvas = $('#galaxy');
  const gCtx = gCanvas.getContext('2d');
  const CHARS = 'MANANMANAN❤AEIOU0123456789LOVEYEUEM';
  let letters = [];
  let galaxyAlpha = 1;
  let W = 0, H = 0, DPR = 1;

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    [gCanvas, hCanvas].forEach((c) => {
      c.width = W * DPR; c.height = H * DPR;
      c.style.width = W + 'px'; c.style.height = H + 'px';
      c.getContext('2d').setTransform(DPR, 0, 0, DPR, 0, 0);
    });
  }

  function newLetter(init) {
    return {
      x: (Math.random() - 0.5) * W * 1.6,
      y: (Math.random() - 0.5) * H * 1.6,
      z: init ? Math.random() * 1200 + 100 : 1300,
      ch: CHARS[Math.floor(Math.random() * CHARS.length)],
      hue: Math.random() < 0.5 ? 330 : 45
    };
  }

  function drawGalaxy() {
    gCtx.clearRect(0, 0, W, H);
    if (galaxyAlpha <= 0) return;
    const cx = W / 2, cy = H / 2;
    const speed = reduceMotion ? 0.6 : 3.2;
    for (const l of letters) {
      l.z -= speed;
      if (l.z < 20) Object.assign(l, newLetter(false));
      const f = 420 / l.z;
      const sx = cx + l.x * f, sy = cy + l.y * f;
      const size = Math.max(6, 30 * f);
      const a = Math.min(1, (1300 - l.z) / 900) * galaxyAlpha;
      gCtx.font = `700 ${size}px "Playfair Display", serif`;
      gCtx.fillStyle = `hsla(${l.hue}, 90%, ${l.hue === 45 ? 72 : 78}%, ${a * 0.85})`;
      gCtx.shadowColor = `hsla(${l.hue}, 90%, 70%, ${a})`;
      gCtx.shadowBlur = 12;
      gCtx.fillText(l.ch, sx, sy);
    }
    gCtx.shadowBlur = 0;
  }

  /* ---------- CANVAS: TIM & CÁNH HOA BAY ---------- */
  const hCanvas = $('#hearts');
  const hCtx = hCanvas.getContext('2d');
  let particles = [];
  let spawnRate = 0.35; // hạt / frame

  function drawHeart(ctx, x, y, s, color, rot) {
    ctx.save();
    ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    ctx.beginPath();
    ctx.moveTo(0, 0.35);
    ctx.bezierCurveTo(-0.9, -0.5, -0.3, -1.1, 0, -0.45);
    ctx.bezierCurveTo(0.3, -1.1, 0.9, -0.5, 0, 0.35);
    ctx.closePath();
    ctx.fillStyle = color; ctx.fill();
    ctx.restore();
  }
  function drawPetal(ctx, x, y, s, color, rot) {
    ctx.save();
    ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    ctx.beginPath();
    ctx.ellipse(0, 0, 0.55, 1, 0, 0, Math.PI * 2);
    ctx.fillStyle = color; ctx.fill();
    ctx.restore();
  }

  function spawnParticle(x, y, burst) {
    const petal = Math.random() < 0.3;
    particles.push({
      x: x !== undefined ? x : Math.random() * W,
      y: y !== undefined ? y : H + 20,
      vx: burst ? (Math.random() - 0.5) * 9 : (Math.random() - 0.5) * 0.8,
      vy: burst ? -(Math.random() * 9 + 3) : -(Math.random() * 1.2 + 0.7),
      s: Math.random() * 10 + (burst ? 8 : 6),
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.08,
      life: 1,
      decay: burst ? 0.012 : 0.0035,
      petal,
      color: petal
        ? `hsla(${340 + Math.random() * 15}, 100%, ${80 + Math.random() * 12}%,`
        : `hsla(${325 + Math.random() * 30}, 95%, ${62 + Math.random() * 18}%,`,
      sway: Math.random() * Math.PI * 2
    });
  }

  function drawParticles() {
    hCtx.clearRect(0, 0, W, H);
    if (!reduceMotion && Math.random() < spawnRate) spawnParticle();
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.sway += 0.03;
      p.x += p.vx + Math.sin(p.sway) * 0.5;
      p.y += p.vy;
      p.vy += p.life < 0.5 && p.vy < -1 ? 0.02 : 0; // chậm dần khi lên cao
      p.rot += p.vr;
      p.life -= p.decay;
      if (p.life <= 0 || p.y < -40) { particles.splice(i, 1); continue; }
      const col = p.color + Math.min(1, p.life * 1.4) + ')';
      if (p.petal) drawPetal(hCtx, p.x, p.y, p.s * 0.7, col, p.rot);
      else drawHeart(hCtx, p.x, p.y, p.s, col, Math.sin(p.rot) * 0.4);
    }
    if (particles.length > 500) particles.splice(0, particles.length - 500);
  }

  function burstHearts(n, x, y) {
    for (let i = 0; i < n; i++) spawnParticle(x ?? W / 2, y ?? H * 0.55, true);
  }

  /* ---------- VÒNG LẶP ---------- */
  function loop() {
    drawGalaxy();
    drawParticles();
    requestAnimationFrame(loop);
  }

  /* ---------- SPARKLE KHI CHẠM ---------- */
  const sparkLayer = $('#sparkles');
  const EMOJIS = ['❤️', '💖', '💘', '💝', '💗', '✨', '🌸'];
  function spark(x, y, count = 6) {
    for (let i = 0; i < count; i++) {
      const el = document.createElement('span');
      el.className = 'spark';
      el.textContent = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
      el.style.left = x + 'px'; el.style.top = y + 'px';
      el.style.setProperty('--x', (Math.random() - 0.5) * 220 + 'px');
      el.style.setProperty('--y', -(Math.random() * 180 + 60) + 'px');
      el.style.setProperty('--r', (Math.random() - 0.5) * 240 + 'deg');
      el.style.fontSize = Math.random() * 14 + 16 + 'px';
      sparkLayer.appendChild(el);
      setTimeout(() => el.remove(), 1700);
    }
  }
  document.addEventListener('pointerdown', (e) => spark(e.clientX, e.clientY, 5));
  let moveTick = 0;
  document.addEventListener('pointermove', (e) => {
    if (reduceMotion) return;
    if (++moveTick % 6 === 0) spark(e.clientX, e.clientY, 1);
  });

  $('#fxBtn').addEventListener('click', () => {
    burstHearts(140);
    spawnRate = Math.min(1.6, spawnRate + 0.3);
    setTimeout(() => (spawnRate = Math.max(0.35, spawnRate - 0.3)), 6000);
  });

  /* ---------- CHUYỂN CẢNH ---------- */
  function showScene(id) {
    document.querySelectorAll('.scene').forEach((s) => s.classList.toggle('active', s.id === id));
  }

  /* ---------- CẢNH 2: GHÉP CHỮ ---------- */
  function buildLetters(el, text) {
    el.innerHTML = '';
    for (const ch of text) {
      const span = document.createElement('span');
      if (ch === ' ') { span.className = 'space'; span.innerHTML = '&nbsp;'; }
      else span.textContent = ch;
      span.style.setProperty('--dx', (Math.random() - 0.5) * 140 + 'vw');
      span.style.setProperty('--dy', (Math.random() - 0.5) * 140 + 'vh');
      span.style.setProperty('--rot', (Math.random() - 0.5) * 720 + 'deg');
      span.style.transitionDelay = Math.random() * 0.6 + 's';
      el.appendChild(span);
    }
  }

  function runReveal() {
    showScene('scene-reveal');
    const top = $('#revealTop'), name = $('#revealName');
    const status = $('#revealStatus'), done = $('#revealDone');
    buildLetters(top, TOP_LINE);
    buildLetters(name, NAME);
    status.classList.remove('hide'); done.classList.remove('show');
    top.classList.remove('in'); name.classList.remove('in');

    setTimeout(() => { name.classList.add('in'); }, 900);
    setTimeout(() => { top.classList.add('in'); }, 1500);
    setTimeout(() => {
      status.classList.add('hide'); done.classList.add('show');
      burstHearts(90);
      // mờ dần galaxy chữ
      const fade = setInterval(() => { galaxyAlpha -= 0.04; if (galaxyAlpha <= 0) { galaxyAlpha = 0; clearInterval(fade); } }, 60);
    }, 2800);
    setTimeout(() => { showScene('scene-card'); burstHearts(60); }, 5600);
  }

  $('#decodeBtn').addEventListener('click', () => {
    playMusic();
    runReveal();
  });

  /* ---------- CẢNH 3 → 4: MỞ THƯ ---------- */
  const envelope = $('#envelope');
  const letterBody = $('#letterBody');
  const letterSign = $('#letterSign');
  const paperActions = document.querySelector('.paper-actions');
  const envHint = $('#envHint');
  let typingTimer = null;

  $('#openLetterBtn').addEventListener('click', () => {
    if (!musicOn) playMusic();
    envelope.classList.remove('open');
    envHint.style.opacity = 1;
    letterBody.innerHTML = '';
    letterSign.classList.remove('show'); paperActions.classList.remove('show');
    showScene('scene-letter');
  });

  $('#burstBtn').addEventListener('click', (e) => {
    burstHearts(160, e.clientX, e.clientY);
    spark(e.clientX, e.clientY, 12);
  });

  envelope.addEventListener('click', () => {
    if (envelope.classList.contains('open')) return;
    envelope.classList.add('open');
    envHint.style.opacity = 0;
    burstHearts(50, W / 2, H / 2);
    setTimeout(typeLetter, 1400);
  });

  function typeLetter() {
    clearTimeout(typingTimer);
    letterBody.innerHTML = '';
    letterSign.classList.remove('show'); paperActions.classList.remove('show');
    const cursor = document.createElement('span'); cursor.className = 'cursor';
    letterBody.appendChild(cursor);
    const full = LETTER.join('\n\n');
    let i = 0;
    const speed = reduceMotion ? 2 : 38;
    (function step() {
      if (i < full.length) {
        const ch = full[i++];
        cursor.insertAdjacentText('beforebegin', ch);
        letterBody.scrollIntoView({ block: 'nearest' });
        const paper = letterBody.closest('.paper'); if (paper) paper.scrollTop = paper.scrollHeight;
        typingTimer = setTimeout(step, ch === '\n' ? speed * 8 : /[,.!?]/.test(ch) ? speed * 5 : speed);
      } else {
        cursor.remove();
        letterSign.classList.add('show'); paperActions.classList.add('show');
        burstHearts(120);
      }
    })();
  }

  $('#replayBtn').addEventListener('click', typeLetter);
  $('#backCardBtn').addEventListener('click', () => { clearTimeout(typingTimer); showScene('scene-card'); });

  /* ---------- KHỞI ĐỘNG ---------- */
  window.addEventListener('resize', resize);
  resize();
  letters = Array.from({ length: reduceMotion ? 40 : 160 }, () => newLetter(true));
  for (let i = 0; i < 25; i++) spawnParticle(Math.random() * W, Math.random() * H);
  loop();

  // Nhảy nhanh tới một cảnh để kiểm tra: ?scene=reveal | card | letter | letter-open
  const jump = new URLSearchParams(location.search).get('scene') || document.body.dataset.scene;
  if (jump === 'reveal') runReveal();
  else if (jump === 'card') { galaxyAlpha = 0; showScene('scene-card'); }
  else if (jump === 'letter' || jump === 'letter-open') {
    galaxyAlpha = 0; showScene('scene-letter');
    if (jump === 'letter-open') setTimeout(() => envelope.click(), 300);
  }
})();
