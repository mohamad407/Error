/* =====================================================================
   BIRTHDAY WEBSITE FOR NASREEN — script.js
   Vanilla JS only. Sections are progressively enhanced on load.
===================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------------- LOADER ---------------- */
  const loader = document.getElementById('loader');
  window.addEventListener('load', () => {
    setTimeout(() => loader.classList.add('hide'), 900);
  });
  setTimeout(() => loader.classList.add('hide'), 2600); // fallback

  /* ---------------- CUSTOM CURSOR ---------------- */
  const cursorDot = document.getElementById('cursorDot');
  const cursorRing = document.getElementById('cursorRing');
  let lastSparkle = 0, lastHeart = 0;
  window.addEventListener('mousemove', (e) => {
    cursorDot.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%,-50%)`;
    cursorRing.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%,-50%)`;

    const now = Date.now();
    if (now - lastSparkle > 90) {
      lastSparkle = now;
      spawnCursorFX(e.clientX, e.clientY, 'sparkle');
    }
    if (now - lastHeart > 260) {
      lastHeart = now;
      spawnCursorFX(e.clientX, e.clientY, 'heart');
    }
  });
  document.addEventListener('click', (e) => rippleEffect(e.clientX, e.clientY));

  function spawnCursorFX(x, y, type) {
    const el = document.createElement('div');
    if (type === 'sparkle') {
      el.className = 'cursor-sparkle';
      el.textContent = ['✨','⭐','💫'][Math.floor(Math.random()*3)];
      el.style.left = (x + (Math.random()*16-8)) + 'px';
      el.style.top = (y + (Math.random()*16-8)) + 'px';
    } else {
      el.className = 'mouse-heart';
      el.textContent = '💗';
      el.style.left = (x + (Math.random()*20-10)) + 'px';
      el.style.top = (y + (Math.random()*20-10)) + 'px';
    }
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1000);
  }

  function rippleEffect(x, y) {
    const r = document.createElement('div');
    r.style.position = 'fixed';
    r.style.left = x + 'px';
    r.style.top = y + 'px';
    r.style.width = '10px';
    r.style.height = '10px';
    r.style.borderRadius = '50%';
    r.style.border = '2px solid rgba(255,215,120,.8)';
    r.style.transform = 'translate(-50%,-50%)';
    r.style.pointerEvents = 'none';
    r.style.zIndex = 9995;
    r.style.transition = 'all .6s cubic-bezier(.22,1,.36,1)';
    document.body.appendChild(r);
    requestAnimationFrame(() => {
      r.style.width = '70px';
      r.style.height = '70px';
      r.style.opacity = '0';
    });
    setTimeout(() => r.remove(), 650);
  }

  /* ---------------- SCROLL PROGRESS + DOT NAV ---------------- */
  const progress = document.getElementById('scrollProgress');
  const sections = Array.from(document.querySelectorAll('.screen'));
  const dotNav = document.getElementById('dotNav');
  sections.forEach((s, i) => {
    const a = document.createElement('a');
    a.href = `#${s.id}`;
    a.title = s.dataset.title || '';
    dotNav.appendChild(a);
  });
  const dots = Array.from(dotNav.children);

  function onScroll() {
    const scrollTop = window.scrollY;
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (docH > 0 ? (scrollTop/docH)*100 : 0) + '%';

    let activeIdx = 0;
    sections.forEach((s, i) => {
      if (scrollTop >= s.offsetTop - window.innerHeight*0.5) activeIdx = i;
    });
    dots.forEach((d, i) => d.classList.toggle('active', i === activeIdx));
  }
  window.addEventListener('scroll', onScroll);
  onScroll();

  /* ---------------- REVEAL ON SCROLL ---------------- */
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('in'); });
  }, { threshold: 0.2 });
  revealEls.forEach(el => revealObserver.observe(el));

  /* ---------------- MUSIC (soft procedural ambience) ---------------- */
  const musicBtn = document.getElementById('musicBtn');
  const musicIcon = document.getElementById('musicIcon');
  let audioCtx = null, musicPlaying = false, musicTimer = null, masterGain = null;
  const notes = [523.25, 587.33, 659.25, 783.99, 880.00, 659.25, 587.33]; // C major-ish gentle sequence
  function playNote(freq, time, dur) {
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0, time);
    g.gain.linearRampToValueAtTime(0.06, time + 0.05);
    g.gain.linearRampToValueAtTime(0, time + dur);
    osc.connect(g); g.connect(masterGain);
    osc.start(time); osc.stop(time + dur + 0.05);
  }
  function scheduleLoop() {
    if (!musicPlaying) return;
    const now = audioCtx.currentTime;
    notes.forEach((f, i) => playNote(f, now + i*0.6, 0.9));
    musicTimer = setTimeout(scheduleLoop, notes.length*600);
  }
  musicBtn.addEventListener('click', () => {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = audioCtx.createGain();
      masterGain.gain.value = 0.5;
      masterGain.connect(audioCtx.destination);
    }
    musicPlaying = !musicPlaying;
    musicIcon.textContent = musicPlaying ? '🎶' : '🎵';
    if (musicPlaying) { audioCtx.resume(); scheduleLoop(); }
    else { clearTimeout(musicTimer); }
  });

  /* ---------------- CONFETTI ---------------- */
  function confettiBurst(container, count = 60) {
    const colors = ['#ff6fb5','#f0c419','#8e54c9','#c9a7eb','#fff'];
    for (let i = 0; i < count; i++) {
      const c = document.createElement('div');
      const size = 6 + Math.random()*6;
      c.style.position = 'fixed';
      c.style.left = '50%';
      c.style.top = '40%';
      c.style.width = size + 'px';
      c.style.height = size*0.4 + 'px';
      c.style.background = colors[Math.floor(Math.random()*colors.length)];
      c.style.zIndex = 9000;
      c.style.borderRadius = '2px';
      c.style.pointerEvents = 'none';
      const angle = Math.random()*Math.PI*2;
      const dist = 150 + Math.random()*260;
      const dx = Math.cos(angle)*dist, dy = Math.sin(angle)*dist - 100;
      c.style.transition = `transform ${1+Math.random()}s cubic-bezier(.22,1,.36,1), opacity ${1+Math.random()}s`;
      (container || document.body).appendChild(c);
      requestAnimationFrame(() => {
        c.style.transform = `translate(${dx}px, ${dy+260}px) rotate(${Math.random()*720}deg)`;
        c.style.opacity = '0';
      });
      setTimeout(() => c.remove(), 2200);
    }
  }

  /* ---------------- HEART EXPLOSION ---------------- */
  function heartExplosion(x, y, target) {
    for (let i = 0; i < 14; i++) {
      const h = document.createElement('div');
      h.textContent = ['❤️','💖','💗','💕'][Math.floor(Math.random()*4)];
      h.style.position = 'absolute';
      h.style.left = x + 'px';
      h.style.top = y + 'px';
      h.style.fontSize = (14 + Math.random()*14) + 'px';
      h.style.pointerEvents = 'none';
      h.style.zIndex = 50;
      h.style.transition = 'all .9s cubic-bezier(.22,1,.36,1)';
      target.appendChild(h);
      const angle = Math.random()*Math.PI*2;
      const dist = 40 + Math.random()*90;
      requestAnimationFrame(() => {
        h.style.transform = `translate(${Math.cos(angle)*dist}px, ${Math.sin(angle)*dist - 40}px) scale(1.3)`;
        h.style.opacity = '0';
      });
      setTimeout(() => h.remove(), 950);
    }
  }

  /* ---------------- FIREWORKS CANVAS ENGINE ---------------- */
  function initFireworks(canvasId, intervalMs = 3500) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    function resize() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function launch() {
      const x = canvas.width * (0.2 + Math.random()*0.6);
      const y = canvas.height * (0.2 + Math.random()*0.4);
      const color = `hsl(${Math.random()*360},90%,70%)`;
      const count = 34;
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI*2*i)/count;
        const speed = 1.5 + Math.random()*2.2;
        particles.push({
          x, y, color,
          vx: Math.cos(angle)*speed,
          vy: Math.sin(angle)*speed,
          life: 1
        });
      }
    }

    function tick() {
      ctx.clearRect(0,0,canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'lighter';
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.02; p.life -= 0.016;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI*2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(p.life,0);
        ctx.fill();
      });
      particles = particles.filter(p => p.life > 0);
      ctx.globalAlpha = 1;
      requestAnimationFrame(tick);
    }
    tick();
    launch();
    setInterval(launch, intervalMs);
  }
  initFireworks('fireworksCanvas1', 4200);
  initFireworks('fireworksCanvas2', 3600);

  /* ---------------- GENERIC FLOATER GENERATOR ---------------- */
  function spawnFloaters(container, emojis, count, animName, durRange, sizeRange) {
    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.className = 'floater';
      el.textContent = emojis[Math.floor(Math.random()*emojis.length)];
      const size = sizeRange[0] + Math.random()*(sizeRange[1]-sizeRange[0]);
      const dur = durRange[0] + Math.random()*(durRange[1]-durRange[0]);
      el.style.left = Math.random()*100 + '%';
      el.style.fontSize = size + 'px';
      el.style.setProperty('--drift', (Math.random()*80-40)+'px');
      el.style.animation = `${animName} ${dur}s linear ${Math.random()*dur}s infinite`;
      el.style.opacity = '0.9';
      container.appendChild(el);
    }
  }
  const floaters1 = document.getElementById('floaters1');
  spawnFloaters(floaters1, ['❤️','💕','💖'], 14, 'riseUp', [7,13], [14,26]);
  spawnFloaters(floaters1, ['🌸','🌺'], 10, 'fallDown', [8,14], [14,22]);
  spawnFloaters(floaters1, ['🎈'], 6, 'riseUp', [10,16], [22,32]);
  spawnFloaters(floaters1, ['🦋'], 5, 'riseUp', [9,15], [18,24]);
  spawnFloaters(floaters1, ['✨','⭐'], 12, 'riseUp', [6,11], [10,16]);

  /* ---------------- INTRO SEQUENCE ---------------- */
  const introStars = document.getElementById('introStars');
  for (let i = 0; i < 90; i++) {
    const s = document.createElement('span');
    s.style.left = Math.random()*100 + '%';
    s.style.top = Math.random()*100 + '%';
    s.style.animationDelay = (Math.random()*3) + 's';
    introStars.appendChild(s);
  }
  const typeLine = document.getElementById('typeLine');
  const giftWrap = document.getElementById('giftWrap');
  const introMsg = 'Someone very special is celebrating today...';
  let ti = 0;
  function typeChar() {
    if (ti <= introMsg.length) {
      typeLine.textContent = introMsg.slice(0, ti);
      ti++;
      setTimeout(typeChar, 55);
    } else {
      giftWrap.classList.add('show');
    }
  }
  setTimeout(typeChar, 900);

  const giftBox = document.getElementById('giftBox');
  giftBox.addEventListener('click', () => {
    if (giftBox.classList.contains('opened')) return;
    giftBox.classList.add('opened');
    confettiBurst(document.getElementById('intro'), 80);
    for (let i=0;i<10;i++){
      setTimeout(()=>spawnCursorFX(
        giftBox.getBoundingClientRect().left+60,
        giftBox.getBoundingClientRect().top,
        'sparkle'
      ), i*60);
    }
    setTimeout(() => {
      document.getElementById('page1').scrollIntoView({ behavior: 'smooth' });
    }, 1000);
  });

  document.querySelectorAll('[data-scroll-next]').forEach(btn => {
    btn.addEventListener('click', () => {
      const next = btn.closest('.screen').nextElementSibling;
      if (next) next.scrollIntoView({ behavior: 'smooth' });
    });
  });

  /* ---------------- PAGE 2: TIMELINE ---------------- */
  const journeyData = [
    { icon:'🧸', title:'Childhood', text:'Two little kids sharing one room, one blanket, and endless mischief.' },
    { icon:'😂', title:'Funny Memories', text:'The jokes only we understand, and the laughs that still make us cry-laugh.' },
    { icon:'🤣', title:'Laughing Together', text:'Every silly moment turned into a memory we still bring up today.' },
    { icon:'🤝', title:'Helping Each Other', text:'Through every tough day, you were the hand I could always hold.' },
    { icon:'🌱', title:'Growing Together', text:'From kids to adults, but somehow, still each other\'s best friend.' },
  ];
  const timeline = document.getElementById('timeline');
  journeyData.forEach(item => {
    const card = document.createElement('div');
    card.className = 'tl-card reveal';
    card.innerHTML = `<span class="tl-icon">${item.icon}</span>
      <div class="tl-title">${item.title}</div>
      <div class="tl-text">${item.text}</div>`;
    card.addEventListener('click', (e) => heartExplosion(e.offsetX, e.offsetY, card));
    timeline.appendChild(card);
    revealObserver.observe(card);
  });
  // reuse tl-card fade/zoom via .reveal.in already; add class 'tl-card' triggers own transition

  /* ---------------- PAGE 3: GALLERY ---------------- */
  const galleryData = [
    { icon:'👶', caption:'Baby Days' },
    { icon:'🎂', caption:'Birthday Cakes Past' },
    { icon:'🏖️', caption:'That Beach Trip' },
    { icon:'🎓', caption:'Graduation Day' },
    { icon:'🎊', caption:'Festival Fun' },
    { icon:'📸', caption:'Just Us Two' },
  ];
  const galleryGrid = document.getElementById('galleryGrid');
  const lightbox = document.getElementById('lightbox');
  const lightboxArt = document.getElementById('lightboxArt');
  const lightboxCaption = document.getElementById('lightboxCaption');
  galleryData.forEach((g, i) => {
    const card = document.createElement('div');
    card.className = 'g-card';
    card.style.animationDelay = (i*0.3) + 's';
    card.innerHTML = `<div class="g-art">${g.icon}</div><div class="g-caption">${g.caption}</div>`;
    card.addEventListener('click', () => {
      lightboxArt.textContent = g.icon;
      lightboxCaption.textContent = g.caption;
      lightbox.classList.add('show');
    });
    galleryGrid.appendChild(card);
  });
  document.getElementById('lightboxClose').addEventListener('click', () => lightbox.classList.remove('show'));
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.classList.remove('show'); });

  /* ---------------- PAGE 4: 20 REASONS ---------------- */
  const reasons = [
    ['😊','Your Smile'],['💗','Your Kindness'],['❤️','Your Love'],['🤗','Your Care'],
    ['💪','Your Strength'],['🌞','Your Happiness'],['🙌','Your Support'],['✨','Your Positivity'],
    ['🧠','Your Wisdom'],['🎨','Your Creativity'],['🕊️','Your Patience'],['😇','Your Honesty'],
    ['🌷','Your Grace'],['🔥','Your Courage'],['🤲','Your Generosity'],['📖','Your Faith'],
    ['🎧','Your Taste in Everything'],['🍲','Your Cooking'],['🧭','Your Guidance'],['👑','Simply You']
  ];
  const reasonsGrid = document.getElementById('reasonsGrid');
  reasons.forEach((r, i) => {
    const card = document.createElement('div');
    card.className = 'r-card reveal';
    card.innerHTML = `<div class="r-num">${String(i+1).padStart(2,'0')}</div>
      <div class="r-icon">${r[0]}</div><div class="r-label">${r[1]}</div>`;
    card.addEventListener('mouseenter', () => spawnMiniHearts(card));
    reasonsGrid.appendChild(card);
    revealObserver.observe(card);
  });
  function spawnMiniHearts(card){
    const rect = card.getBoundingClientRect();
    for(let i=0;i<3;i++){
      setTimeout(()=>{
        const h = document.createElement('div');
        h.textContent = '💗';
        h.style.position='fixed';
        h.style.left = (rect.left + rect.width/2)+'px';
        h.style.top = (rect.top)+'px';
        h.style.pointerEvents='none';
        h.style.zIndex=60;
        h.style.transition='all 1s ease-out';
        document.body.appendChild(h);
        requestAnimationFrame(()=>{
          h.style.transform = `translate(${Math.random()*40-20}px,-60px)`;
          h.style.opacity='0';
        });
        setTimeout(()=>h.remove(),1000);
      }, i*120);
    }
  }

  /* ---------------- PAGE 5: MAGIC GARDEN ---------------- */
  const wishes = [
    'Stay Happy Forever 🌸','May Allah Bless You 🌙','May Your Dreams Come True ✨',
    'May Success Always Follow You 🌟','Live Life Full of Laughter 😄','Endless Love Coming Your Way ❤️'
  ];
  const gardenGround = document.getElementById('gardenGround');
  const flowerEmojis = ['🌷','🌸','🌻','🌺','🌹','🪷'];
  for (let i = 0; i < 14; i++) {
    const f = document.createElement('div');
    f.className = 'flower';
    f.textContent = flowerEmojis[i % flowerEmojis.length];
    f.style.animationDelay = (Math.random()*2)+'s';
    f.addEventListener('click', () => showWish('wishBubble', wishes[Math.floor(Math.random()*wishes.length)]));
    gardenGround.appendChild(f);
  }
  const gardenBirds = document.getElementById('gardenBirds');
  for (let i=0;i<4;i++){
    const b = document.createElement('div');
    b.className='bird'; b.textContent='🕊️';
    b.style.top = (10+Math.random()*30)+'%';
    b.style.animationDuration = (14+Math.random()*8)+'s';
    b.style.animationDelay = (Math.random()*8)+'s';
    gardenBirds.appendChild(b);
  }
  const gardenButterflies = document.getElementById('gardenButterflies');
  for (let i=0;i<5;i++){
    const b = document.createElement('div');
    b.className='butterfly'; b.textContent='🦋';
    b.style.top = (30+Math.random()*50)+'%';
    b.style.animationDuration = (10+Math.random()*8)+'s';
    b.style.animationDelay = (Math.random()*6)+'s';
    gardenButterflies.appendChild(b);
  }
  function showWish(bubbleId, text) {
    const bubble = document.getElementById(bubbleId);
    bubble.textContent = text;
    bubble.classList.add('show');
    clearTimeout(bubble._t);
    bubble._t = setTimeout(() => bubble.classList.remove('show'), 2600);
  }

  /* ---------------- PAGE 6: LETTER ---------------- */
  const letterFull = `My Dearest Nasreen,

From childhood fights over the last piece of cake, to becoming each other's biggest supporters — you have always been my favorite person to annoy and to love.

Thank you for every laugh, every lecture, and every late-night talk that made me who I am.

Today I just want you to know: no matter the distance or the years, you will always be my baby sister and my hero.`;
  const letterText = document.getElementById('letterText');
  let letterTyped = false;
  const letterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !letterTyped) {
        letterTyped = true;
        let li = 0;
        function typeLetter() {
          if (li <= letterFull.length) {
            letterText.textContent = letterFull.slice(0, li);
            li += 2;
            setTimeout(typeLetter, 18);
          }
        }
        typeLetter();
      }
    });
  }, { threshold: 0.3 });
  letterObserver.observe(document.getElementById('page6'));

  /* ---------------- PAGE 7: SIBLINGS ANIMATION ---------------- */
  const brotherFig = document.getElementById('brotherFig');
  const sisterFig = document.getElementById('sisterFig');
  const flowerEmoji = document.getElementById('flowerEmoji');
  const presentEmoji = document.getElementById('presentEmoji');
  const stageCaption = document.getElementById('stageCaption');
  document.getElementById('playSiblingBtn').addEventListener('click', playSiblingScene);

  function playSiblingScene() {
    brotherFig.style.transition = 'transform 2.2s cubic-bezier(.22,1,.36,1)';
    sisterFig.style.transition = 'transform 2.2s cubic-bezier(.22,1,.36,1)';
    brotherFig.style.transform = 'translateX(46%)';
    sisterFig.style.transform = 'translateX(-46%) scaleX(-1)';
    setCaption('walking closer...');

    setTimeout(() => {
      flowerEmoji.style.opacity = '1';
      flowerEmoji.style.transform = 'translateY(-14px)';
      setCaption('here, these are for you 💐');
    }, 2300);

    setTimeout(() => {
      flowerEmoji.style.opacity = '0';
      presentEmoji.style.opacity = '1';
      presentEmoji.style.transform = 'translateY(-14px)';
      setCaption('and... happy birthday! 🎁');
    }, 3800);

    setTimeout(() => {
      presentEmoji.style.opacity = '0';
      brotherFig.style.transform = 'translateX(20%)';
      sisterFig.style.transform = 'translateX(-20%) scaleX(-1)';
      setCaption('biggest hug ever 🤗');
      confettiBurst(document.getElementById('page7'), 60);
      heartExplosion(window.innerWidth/2, window.innerHeight/2, document.getElementById('siblingStage'));
    }, 5300);

    setTimeout(() => { setCaption(''); }, 8500);
  }
  function setCaption(text) {
    stageCaption.textContent = text;
    stageCaption.classList.toggle('show', !!text);
  }

  /* ---------------- PAGE 8: WISH TREE ---------------- */
  const treeWishes = [
    'May your smile never fade 🌟','Success in everything you touch 🏆','Health, wealth & happiness 💫',
    'A life full of love ❤️','Every dream within reach 🌙','Laughter every single day 😄',
    'Strength for every storm 🌈','Blessings beyond measure 🙏','Adventures worth remembering 🧳',
    'Peace in your heart always ☁️'
  ];
  const leavesLayer = document.getElementById('leavesLayer');
  const leafEmojis = ['🍃','🍂','🌿'];
  function spawnLeaf() {
    const leaf = document.createElement('div');
    leaf.className = 'leaf';
    leaf.textContent = leafEmojis[Math.floor(Math.random()*leafEmojis.length)];
    const x = 40 + Math.random()*60;
    const y = 20 + Math.random()*45;
    leaf.style.left = x + '%';
    leaf.style.top = y + '%';
    leaf.style.animationDelay = (Math.random()*2)+'s';
    leaf.addEventListener('click', () => {
      if (leaf.classList.contains('falling')) return;
      leaf.classList.add('falling');
      showWish('treeWishBubble', treeWishes[Math.floor(Math.random()*treeWishes.length)]);
      setTimeout(() => {
        leaf.remove();
        spawnLeaf();
      }, 1500);
    });
    leavesLayer.appendChild(leaf);
  }
  for (let i = 0; i < 18; i++) spawnLeaf();

  /* ---------------- PAGE 9: CAKE ---------------- */
  const candles = document.getElementById('candles');
  const candlePositions = 5;
  for (let i = 0; i < candlePositions; i++) {
    const c = document.createElement('div');
    c.className = 'candle';
    c.innerHTML = '<div class="flame"></div>';
    candles.appendChild(c);
  }
  const smokeLayer = document.getElementById('smokeLayer');
  for (let i=0;i<6;i++){
    const s = document.createElement('div');
    s.className='smoke';
    s.style.left = (10+Math.random()*80)+'%';
    smokeLayer.appendChild(s);
  }
  const cakeHint = document.getElementById('cakeHint');
  let blown = false;
  document.getElementById('blowBtn').addEventListener('click', () => {
    if (blown) return;
    blown = true;
    document.querySelectorAll('#candles .flame').forEach((f, i) => {
      setTimeout(() => f.classList.add('out'), i*120);
    });
    document.querySelectorAll('.smoke').forEach((s,i) => {
      setTimeout(()=> s.classList.add('go'), 300 + i*100);
    });
    setTimeout(() => {
      confettiBurst(document.getElementById('page9'), 90);
      cakeHint.textContent = 'Wish made! May it all come true 🎉';
    }, 600);
  });

  /* ---------------- PAGE 10: MEMORY SKY ---------------- */
  const memoryTexts = [
    'That summer we couldn\'t stop laughing 😂','The day you taught me to ride a bike 🚲',
    'Our secret midnight snack raids 🍪','When you covered for me (don\'t tell mom) 🤫',
    'That road trip playlist we still love 🎶','The time we got lost but had the best day 🗺️',
    'Every birthday we\'ve celebrated together 🎂','The silly nicknames only we use 😄'
  ];
  const skyStars = document.getElementById('skyStars');
  for (let i = 0; i < 120; i++) {
    const s = document.createElement('div');
    s.className = 'sky-star';
    s.style.left = Math.random()*100+'%';
    s.style.top = Math.random()*90+'%';
    s.style.animationDelay = (Math.random()*3)+'s';
    if (i < memoryTexts.length*4 && i % 4 === 0) {
      const text = memoryTexts[i/4 % memoryTexts.length];
      s.addEventListener('click', () => showWish('skyWishBubble', text));
      s.style.width = '7px'; s.style.height = '7px';
      s.style.boxShadow = '0 0 8px #fff';
    }
    skyStars.appendChild(s);
  }
  function shootingStar() {
    const s = document.createElement('div');
    s.className = 'shooting-star';
    const startX = Math.random()*60+20;
    s.style.left = startX+'%';
    s.style.top = (Math.random()*30)+'%';
    s.style.transition = 'all 1.2s linear';
    skyStars.appendChild(s);
    requestAnimationFrame(() => {
      s.style.transform = 'translate(220px,140px)';
      s.style.opacity = '0';
    });
    setTimeout(() => s.remove(), 1300);
  }
  setInterval(shootingStar, 3500);

  /* ---------------- PAGE 11: TREASURE CHEST ---------------- */
  const chestWrap = document.getElementById('chestWrap');
  const chestLid = document.getElementById('chestLid');
  const chestLight = document.getElementById('chestLight');
  const chestGlow = document.querySelector('.chest-glow');
  const chestMsg = document.getElementById('chestMsg');
  let chestOpened = false;
  chestWrap.addEventListener('click', () => {
    if (chestOpened) return;
    chestOpened = true;
    chestLid.classList.add('open');
    chestLight.classList.add('show');
    chestGlow.classList.add('show');
    spawnFloaters(document.getElementById('page11'), ['🦋'], 6, 'riseUp', [3,5], [18,24]);
    confettiBurst(document.getElementById('page11'), 50);
    setTimeout(() => {
      chestMsg.textContent = "You'll Always Be My Favourite Sister ❤️";
      chestMsg.classList.add('show');
    }, 500);
  });

  /* ---------------- FINAL PAGE ---------------- */
  const lanterns = document.getElementById('lanterns');
  for (let i = 0; i < 10; i++) {
    const l = document.createElement('div');
    l.className = 'lantern';
    l.textContent = '🏮';
    l.style.left = Math.random()*100+'%';
    l.style.setProperty('--drift', (Math.random()*60-30)+'px');
    l.style.animationDuration = (12+Math.random()*8)+'s';
    l.style.animationDelay = (Math.random()*10)+'s';
    lanterns.appendChild(l);
  }
  document.getElementById('replayBtn').addEventListener('click', () => {
    document.getElementById('intro').scrollIntoView({ behavior: 'smooth' });
    if (giftBox.classList.contains('opened')) {
      giftBox.classList.remove('opened');
    }
  });

});
