/* ════════════════════════════════════════════════════════
   IRONWAY LOGISTICS — Interactive JavaScript
   ════════════════════════════════════════════════════════ */

'use strict';

// ── Nav scroll effect ────────────────────────────────────
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
});

// ── Live clock ───────────────────────────────────────────
const liveTimeEl = document.getElementById('liveTime');
function updateClock() {
  if (!liveTimeEl) return;
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  liveTimeEl.textContent = `${h}:${m}:${s}`;
}
updateClock();
setInterval(updateClock, 1000);

// ── Counter animations ───────────────────────────────────
function animateCounter(el, target, duration = 1800) {
  const isDecimal = !Number.isInteger(target);
  let start = null;
  const step = (timestamp) => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const val = progress * target;
    el.textContent = isDecimal ? val.toFixed(1) : Math.floor(val).toLocaleString();
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = isDecimal ? target.toFixed(1) : target.toLocaleString();
  };
  requestAnimationFrame(step);
}

// Intersection observer for counters
const counterEls = document.querySelectorAll('[data-target]');
const counterObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseFloat(el.dataset.target);
      animateCounter(el, target);
      counterObs.unobserve(el);
    }
  });
}, { threshold: 0.5 });
counterEls.forEach(el => counterObs.observe(el));

// ── Map view filter buttons ──────────────────────────────
const mapBtns = document.querySelectorAll('.map-btn');
mapBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    mapBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// ── Truck marker interaction → tooltip ──────────────────
const tooltip = document.getElementById('mapTooltip');
const trucks = document.querySelectorAll('.truck-marker');

const truckData = {
  'IW-0041': { driver: 'R. Martinez', origin: 'Chicago, IL', dest: 'Dallas, TX', eta: '14:32 CST', speed: '68 mph', pct: 63, status: 'ON TIME' },
  'IW-0078': { driver: 'D. Thompson', origin: 'Dallas, TX', dest: 'Atlanta, GA', eta: '17:22 CST', speed: '57 mph', pct: 41, status: 'DELAY +47m' },
  'IW-0112': { driver: 'K. Osei',     origin: 'Atlanta, GA', dest: 'Miami, FL',  eta: '18:05 CST', speed: '71 mph', pct: 22, status: 'ON TIME' },
  'IW-0055': { driver: 'H. Chen',     origin: 'Denver, CO',  dest: 'Chicago, IL', eta: '09:15 CST', speed: '65 mph', pct: 88, status: 'ON TIME' },
};

trucks.forEach(truck => {
  truck.addEventListener('mouseenter', () => {
    const id = truck.dataset.id;
    const d = truckData[id];
    if (!d || !tooltip) return;
    tooltip.querySelector('.map-tooltip__id').textContent = id;
    tooltip.querySelectorAll('.map-tooltip__row')[0].querySelector('span:last-child').textContent = d.driver;
    tooltip.querySelectorAll('.map-tooltip__row')[1].querySelector('span:last-child').textContent = d.origin;
    tooltip.querySelectorAll('.map-tooltip__row')[2].querySelector('span:last-child').textContent = d.dest;
    tooltip.querySelectorAll('.map-tooltip__row')[3].querySelector('span:last-child').textContent = d.eta;
    tooltip.querySelectorAll('.map-tooltip__row')[4].querySelector('span:last-child').textContent = d.speed;
    tooltip.querySelector('.map-tooltip__progress span').textContent = `${d.pct}% complete`;
    tooltip.querySelector('.progress-fill').style.width = `${d.pct}%`;
    tooltip.style.opacity = '1';
    tooltip.style.transform = 'translateY(0)';
  });

  truck.addEventListener('mouseleave', () => {
    tooltip.style.opacity = '0';
    tooltip.style.transform = 'translateY(4px)';
  });
});

// Initialize tooltip hidden
if (tooltip) {
  tooltip.style.opacity = '0';
  tooltip.style.transform = 'translateY(4px)';
  tooltip.style.transition = 'opacity 0.25s, transform 0.25s';
}

// ── Shipment list → map highlight ───────────────────────
const shipmentItems = document.querySelectorAll('.shipment-item');
shipmentItems.forEach(item => {
  item.addEventListener('click', () => {
    shipmentItems.forEach(s => s.classList.remove('shipment-item--active'));
    item.classList.add('shipment-item--active');
    const truckId = item.dataset.truck;
    trucks.forEach(t => {
      t.style.zIndex = t.id === truckId ? '20' : '10';
      t.querySelector('.truck-marker__dot').style.transform =
        t.id === truckId ? 'scale(1.6)' : '';
    });
    // Simulate tooltip update
    if (truckId && tooltip) {
      const el = document.getElementById(truckId);
      if (el) {
        const id = el.dataset.id;
        const d = truckData[id];
        if (d) {
          tooltip.querySelector('.map-tooltip__id').textContent = id;
          tooltip.querySelectorAll('.map-tooltip__row')[0].querySelector('span:last-child').textContent = d.driver;
          tooltip.querySelectorAll('.map-tooltip__row')[1].querySelector('span:last-child').textContent = d.origin;
          tooltip.querySelectorAll('.map-tooltip__row')[2].querySelector('span:last-child').textContent = d.dest;
          tooltip.querySelectorAll('.map-tooltip__row')[3].querySelector('span:last-child').textContent = d.eta;
          tooltip.querySelectorAll('.map-tooltip__row')[4].querySelector('span:last-child').textContent = d.speed;
          tooltip.querySelector('.map-tooltip__progress span').textContent = `${d.pct}% complete`;
          tooltip.querySelector('.progress-fill').style.width = `${d.pct}%`;
          tooltip.style.opacity = '1';
          tooltip.style.transform = 'translateY(0)';
        }
      }
    }
  });
});

// ── Truck positions animation (simulated movement) ───────
const truckPositions = {
  truck1: { x: 35, y: 42, dx: 0.04, dy: -0.02 },
  truck2: { x: 58, y: 55, dx: 0.05, dy:  0.01 },
  truck3: { x: 72, y: 35, dx: 0.03, dy:  0.02 },
  truck4: { x: 20, y: 58, dx: 0.06, dy: -0.03 },
};

function moveTrucks() {
  Object.entries(truckPositions).forEach(([id, pos]) => {
    pos.x += pos.dx;
    pos.y += pos.dy;
    // Keep within bounds
    if (pos.x > 90 || pos.x < 10) pos.dx *= -1;
    if (pos.y > 80 || pos.y < 20) pos.dy *= -1;
    const el = document.getElementById(id);
    if (el) {
      el.style.left = `${pos.x}%`;
      el.style.top  = `${pos.y}%`;
    }
  });
}
setInterval(moveTrucks, 100);

// ── Waveform animation ────────────────────────────────────
const wavePolyline = document.getElementById('wavePolyline');
let wavePhase = 0;
function animateWave() {
  if (!wavePolyline) return;
  const points = [];
  for (let x = 0; x <= 300; x += 5) {
    const y = 30
      + Math.sin((x * 0.04) + wavePhase) * 10
      + Math.sin((x * 0.08) + wavePhase * 1.3) * 5
      + Math.random() * 2;
    points.push(`${x},${y}`);
  }
  wavePolyline.setAttribute('points', points.join(' '));
  wavePhase += 0.06;
}
setInterval(animateWave, 60);

// ── Activity log auto-scroll + add new entries ────────────
const feed = document.getElementById('activityFeed');
const logEvents = [
  { type: 'info', msg: 'Route IW-0091 pre-calculated — departure 06:00 CST' },
  { type: 'ok',   msg: 'IW-0041 delivery confirmed: Chicago warehouse — signed by J. Kowalski' },
  { type: 'warn', msg: 'IW-0078 approaching low fuel threshold — nearest stop: Exit 142A' },
  { type: 'info', msg: 'Weather reroute savings YTD: $42,810 in fuel + carrier fees' },
  { type: 'ok',   msg: 'IW-0112 load docs verified — temperature log within spec' },
  { type: 'info', msg: '3 loads pre-assigned for tomorrow — coverage confidence: 97%' },
];
let logIdx = 0;

function addLogEntry() {
  if (!feed) return;
  const event = logEvents[logIdx % logEvents.length];
  logIdx++;
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  const entry = document.createElement('div');
  entry.className = `log-entry log-entry--${event.type}`;
  entry.style.opacity = '0';
  entry.style.transform = 'translateX(-8px)';
  entry.style.transition = 'opacity 0.4s, transform 0.4s';
  entry.innerHTML = `<span class="log-time">${h}:${m}:${s}</span><span class="log-msg">${event.msg}</span>`;
  feed.insertBefore(entry, feed.firstChild);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      entry.style.opacity = '1';
      entry.style.transform = 'translateX(0)';
    });
  });
  // Remove oldest if too many
  while (feed.children.length > 7) {
    feed.removeChild(feed.lastChild);
  }
}
setInterval(addLogEntry, 5000);

// ── AI Chat Interface ─────────────────────────────────────
const chatInput = document.getElementById('chatInput');
const chatSend  = document.getElementById('chatSend');
const chatMessages = document.getElementById('chatMessages');
const aiThinking = document.getElementById('aiThinking');
const suggestions = document.querySelectorAll('.ai-suggestion');

const aiResponses = {
  default: [
    "I'm analyzing current network data. Based on real-time telemetry, all active units are within acceptable operational parameters except IW-0078 which has a current delay advisory.",
    "Processing your request. Fleet efficiency is running at 94.6% of optimal capacity. I recommend pre-positioning two standby units in the Dallas hub for anticipated demand tomorrow.",
    "Understood. I've cross-referenced HOS logs, weather data, and load manifests. Your risk exposure for next 12 hours is LOW across all active corridors.",
    "Route optimization complete. By shifting IW-0055 to I-90W instead of I-80, we project a 41-minute gain and $280 fuel savings. Shall I apply this change?",
  ],
  schedule: "Tomorrow's schedule: 8 dispatches confirmed, 3 pending load confirmations. Peak departure window 04:00–07:00 CST from Chicago hub. Drivers H. Chen, R. Martinez, and D. Thompson are shift-ready. Pre-loading begins at 22:00 tonight.",
  delay: "Delay risk assessment: IW-0078 remains at MEDIUM risk due to US-287 weather. IW-0041 shows LOW risk — minor congestion at I-55/I-80 interchange resolved. All others LOW risk. Overall network risk score: 18/100.",
  fuel: "Fuel optimization complete. Recommending 3 additional fuel stops for active fleet: Pilot Loves Exit 142A (IW-0078), TA Exit 211B (IW-0112), and Flying J Exit 87 (IW-0055). Estimated savings: $1,240 vs current routing.",
};

let aiResponseIdx = 0;

function getAIResponse(msg) {
  const lower = msg.toLowerCase();
  if (lower.includes('tomorrow') || lower.includes('schedule')) return aiResponses.schedule;
  if (lower.includes('delay') || lower.includes('risk')) return aiResponses.delay;
  if (lower.includes('fuel')) return aiResponses.fuel;
  return aiResponses.default[aiResponseIdx++ % aiResponses.default.length];
}

function appendMessage(text, isUser = false) {
  const msg = document.createElement('div');
  msg.className = `chat-msg chat-msg--${isUser ? 'user' : 'ai'}`;
  const now = new Date();
  const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  msg.innerHTML = `
    <div class="chat-msg__bubble">${text}</div>
    <span class="chat-msg__time">${time}</span>
  `;
  msg.style.opacity = '0';
  msg.style.transform = `translateX(${isUser ? '10px' : '-10px'})`;
  msg.style.transition = 'opacity 0.3s, transform 0.3s';
  chatMessages.appendChild(msg);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      msg.style.opacity = '1';
      msg.style.transform = 'translateX(0)';
    });
  });
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendMessage(text) {
  if (!text.trim()) return;
  appendMessage(text, true);
  if (chatInput) chatInput.value = '';

  // Show thinking
  if (aiThinking) {
    aiThinking.parentElement.style.display = '';
    aiThinking.style.display = 'inline-flex';
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // AI response after delay
  setTimeout(() => {
    if (aiThinking) aiThinking.style.display = 'none';
    const response = getAIResponse(text);
    appendMessage(response, false);
  }, 1200 + Math.random() * 600);
}

if (chatSend) chatSend.addEventListener('click', () => sendMessage(chatInput.value));
if (chatInput) {
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage(chatInput.value);
  });
}
suggestions.forEach(btn => {
  btn.addEventListener('click', () => sendMessage(btn.dataset.msg));
});

// ── Scroll-reveal (fade-up on scroll) ────────────────────
const revealEls = document.querySelectorAll(
  '.service-card, .fleet-card, .numbers__item, .tele-card, .ai-metric'
);
revealEls.forEach((el, i) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = `opacity 0.6s var(--ease) ${(i % 5) * 0.08}s, transform 0.6s var(--ease) ${(i % 5) * 0.08}s`;
});
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      revealObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
revealEls.forEach(el => revealObs.observe(el));

// ── Contact form ──────────────────────────────────────────
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type="submit"]');
    btn.textContent = 'Request Submitted ✓';
    btn.style.background = 'var(--ok)';
    btn.style.color = '#fff';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = 'Submit Request →';
      btn.style.background = '';
      btn.style.color = '';
      btn.disabled = false;
      contactForm.reset();
    }, 3000);
  });
}

// ── Smooth section entry class ────────────────────────────
const sectionObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in-view');
    }
  });
}, { threshold: 0.05 });
document.querySelectorAll('section').forEach(s => sectionObs.observe(s));

// ── Mobile nav (burger) ───────────────────────────────────
const burger = document.getElementById('burger');
if (burger) {
  burger.addEventListener('click', () => {
    const links = document.querySelector('.nav__links');
    const cta   = document.querySelector('.nav__cta');
    if (links) {
      const open = links.style.display === 'flex';
      links.style.display = open ? 'none' : 'flex';
      links.style.flexDirection = 'column';
      links.style.position = 'absolute';
      links.style.top = '70px';
      links.style.left = '0';
      links.style.right = '0';
      links.style.background = 'rgba(6,14,31,0.97)';
      links.style.padding = '20px var(--gutter)';
      links.style.gap = '16px';
      links.style.borderBottom = '1px solid rgba(255,255,255,0.08)';
      if (cta) cta.style.display = open ? 'none' : 'block';
    }
  });
}
