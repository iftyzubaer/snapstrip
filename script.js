// ── STATE ──
let stream = null;
let shotCount = 3;
let shots = [];
let currentFilter = 'none';
let currentBorder = 'dark';
let showDate = true;
let showBrand = true;
let isCapturing = false;
let currentLayout = '3';

// ── MOBILE TAB SWITCHING ──
const isMobile = () => globalThis.innerWidth <= 768;

// On desktop, ensure right panel is never hidden
function syncDesktop() {
if (!isMobile()) {
    document.getElementById('panelLeft').classList.remove('tab-hidden');
    document.getElementById('panelRight').classList.remove('tab-hidden');
}
}
globalThis.addEventListener('resize', syncDesktop);
syncDesktop();

function switchTab(tab) {
const left  = document.getElementById('panelLeft');
const right = document.getElementById('panelRight');
const btnC  = document.getElementById('tabCam');
const btnS  = document.getElementById('tabStrip');
if (tab === 'cam') {
    left.classList.remove('tab-hidden');
    right.classList.add('tab-hidden');
    btnC.classList.add('active');
    btnS.classList.remove('active');
} else {
    right.classList.remove('tab-hidden');
    left.classList.add('tab-hidden');
    btnS.classList.add('active');
    btnC.classList.remove('active');
}
}

// ── INIT ──
updateStrip();
updateDate();

function updateDate() {
const now = new Date();
const dateStr = now.toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }).toUpperCase();
document.getElementById('stripDateEl').textContent = showDate ? dateStr : '';
}

// ── CAMERA ──
async function startCamera() {
try {
    stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 960 } },
    audio: false
    });
    const video = document.getElementById('video');
    video.srcObject = stream;
    video.style.display = 'block';
    document.getElementById('camPlaceholder').style.display = 'none';
    document.getElementById('startBtn').textContent = '✓ Camera On';
    document.getElementById('startBtn').disabled = true;
    document.getElementById('captureBtn').disabled = false;
    setStatus('Camera ready! Choose your layout and hit Take Photos.');
    applyFilter();
} catch (e) {
    console.error('Camera error:', e);
    setStatus('Camera access denied. Please allow camera in your browser.');
}
}

// ── FILTER ──
function setFilter(btn, filter) {
document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
btn.classList.add('active');
currentFilter = filter;
applyFilter();
}

function applyFilter() {
const video = document.getElementById('video');
video.className = filter => `filter-${filter}`;
video.className = currentFilter === 'none' ? '' : `filter-${currentFilter}`;
}

// ── LAYOUT ──
function setLayout(btn, layout) {
document.querySelectorAll('.layout-opt').forEach(b => b.classList.remove('active'));
btn.classList.add('active');
currentLayout = layout;
shotCount = layout === 'grid' ? 4 : Number.parseInt(layout);
shots = [];
updateStrip();
updateDots();
updateProgress();
document.getElementById('progressLabel').textContent = `0 / ${shotCount}`;
document.getElementById('downloadBtn').disabled = true;
document.getElementById('printBtn').disabled = true;
document.getElementById('retakeRow').innerHTML = '';
}

// ── BORDER ──
function setBorder(el, border) {
document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
el.classList.add('active');
currentBorder = border;
updateStrip();
}

// ── TOGGLES ──
function toggleDate() {
showDate = !showDate;
const t = document.getElementById('dateToggle');
t.classList.toggle('on', showDate);
updateDate();
}

function toggleBrand() {
showBrand = !showBrand;
const t = document.getElementById('brandToggle');
t.classList.toggle('on', showBrand);
document.getElementById('stripBrand').style.opacity = showBrand ? '1' : '0';
}

// ── CAPTURE FLOW ──
async function startCapture() {
if (isCapturing || !stream) return;
isCapturing = true;
shots = [];
updateStrip();
document.getElementById('captureBtn').disabled = true;
document.getElementById('downloadBtn').disabled = true;
document.getElementById('printBtn').disabled = true;
updateProgress();

for (let i = 0; i < shotCount; i++) {
    setStatus(`Get ready… shot ${i + 1} of ${shotCount}`);
    await countdown();
    await captureShot(i);
    updateDots();
    updateProgress();
    if (i < shotCount - 1) await sleep(800);
}

isCapturing = false;
document.getElementById('captureBtn').disabled = false;
document.getElementById('downloadBtn').disabled = false;
document.getElementById('printBtn').disabled = false;
setStatus('Looking good! Download or print your strip below ↓');
buildRetakeRow();
// Auto-switch to strip tab on mobile when done
if (isMobile()) switchTab('strip');
}

async function countdown() {
const overlay = document.getElementById('countdown');
const numEl = document.getElementById('countNum');
overlay.classList.add('active');
for (let n = 3; n >= 1; n--) {
    numEl.textContent = n;
    numEl.style.animation = 'none';
    numEl.offsetHeight; // reflow
    numEl.style.animation = 'countPulse 1s ease-out';
    await sleep(1000);
}
overlay.classList.remove('active');
}

async function captureShot(index) {
const video = document.getElementById('video');
const canvas = document.getElementById('captureCanvas');
const ctx = canvas.getContext('2d');

canvas.width = video.videoWidth || 640;
canvas.height = video.videoHeight || 480;

// Mirror flip
ctx.save();
ctx.translate(canvas.width, 0);
ctx.scale(-1, 1);

// Apply filter via CSS to canvas
const filterMap = {
    none: 'none',
    bw: 'grayscale(1) contrast(1.1)',
    warm: 'sepia(0.4) saturate(1.3) brightness(1.05)',
    cool: 'hue-rotate(20deg) saturate(0.85) brightness(1.05)',
    grain: 'contrast(1.15) brightness(0.95) saturate(1.1)',
    fade: 'contrast(0.85) brightness(1.1) saturate(0.7)',
};
ctx.filter = filterMap[currentFilter] || 'none';
ctx.drawImage(video, 0, 0);
ctx.restore();

// Flash!
const flash = document.getElementById('flash');
flash.classList.add('go');
setTimeout(() => flash.classList.remove('go'), 120);

const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
shots[index] = dataUrl;
updateStrip();

// Dot captured
const dots = document.querySelectorAll('.shot-dot');
if (dots[index]) dots[index].classList.add('captured');

await sleep(200);
}

// ── STRIP RENDER ──
function updateStrip() {
const strip = document.getElementById('filmStrip');
const footer = document.getElementById('stripFooter');

// Border class
strip.className = 'film-strip';
if (currentLayout === 'grid') strip.classList.add('layout-grid');
if (currentBorder !== 'dark') strip.classList.add(`border-${currentBorder}`);

footer.className = 'strip-footer';
if (currentBorder !== 'dark') footer.style.background = '';

const count = currentLayout === 'grid' ? 4 : Number.parseInt(currentLayout);
strip.innerHTML = '';

for (let i = 0; i < count; i++) {
    const div = document.createElement('div');
    div.className = 'strip-photo' + (shots[i] ? '' : ' empty');
    if (shots[i]) {
    const img = document.createElement('img');
    img.src = shots[i];
    div.appendChild(img);
    }
    strip.appendChild(div);
}

updateDate();
}

// ── DOTS ──
function updateDots() {
const dotsContainer = document.getElementById('shotDots');
const count = currentLayout === 'grid' ? 4 : Number.parseInt(currentLayout);
dotsContainer.innerHTML = '';
for (let i = 0; i < count; i++) {
    const d = document.createElement('div');
    d.className = 'shot-dot' + (shots[i] ? ' captured' : '');
    dotsContainer.appendChild(d);
}
}

// ── PROGRESS ──
function updateProgress() {
const count = currentLayout === 'grid' ? 4 : Number.parseInt(currentLayout);
const pct = (shots.filter(Boolean).length / count) * 100;
document.getElementById('progressFill').style.width = pct + '%';
document.getElementById('progressLabel').textContent = `${shots.filter(Boolean).length} / ${count}`;
}

// ── RETAKE ──
function buildRetakeRow() {
const count = currentLayout === 'grid' ? 4 : Number.parseInt(currentLayout);
const row = document.getElementById('retakeRow');
row.innerHTML = '';
for (let i = 0; i < count; i++) {
    const btn = document.createElement('button');
    btn.className = 'btn-retake';
    btn.textContent = `#${i+1}`;
    btn.title = `Retake shot ${i+1}`;
    btn.onclick = () => retakeShot(i);
    row.appendChild(btn);
}
}

async function retakeShot(index) {
if (isCapturing || !stream) return;
isCapturing = true;
// Go back to camera tab on mobile for retake
if (isMobile()) switchTab('cam');
setStatus(`Retaking shot ${index + 1}…`);
await countdown();
shots[index] = null;
await captureShot(index);
isCapturing = false;
setStatus('Retake done! Looking great.');
// Return to strip after retake
if (isMobile()) switchTab('strip');
}

// ── DOWNLOAD HELPERS ──
function getFooterTextColor() {
if (currentBorder === 'dark') {
    return '#555';
} else if (currentBorder === 'white' || currentBorder === 'cream') {
    return '#aaa';
} else {
    return 'rgba(255,255,255,0.6)';
}
}

function drawFooter(ctx, footerY, W, padding, footerH, bgMap, textColor) {
ctx.fillStyle = bgMap[currentBorder] || '#111';
ctx.fillRect(0, footerY, W, footerH);

if (showBrand) {
    ctx.fillStyle = textColor;
    ctx.font = 'italic 14px "Georgia", serif';
    ctx.fillText('SnapStrip', padding, footerY + 28);
}

if (showDate) {
    const dateStr = new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }).toUpperCase();
    ctx.fillStyle = textColor;
    ctx.font = '10px "Courier New", monospace';
    ctx.textAlign = 'right';
    ctx.fillText(dateStr, W - padding, footerY + 28);
}
}

// ── DOWNLOAD ──
async function downloadStrip() {
const count = currentLayout === 'grid' ? 4 : Number.parseInt(currentLayout);
const isGrid = currentLayout === 'grid';
const W = 400, photoH = 300, gap = 10, padding = isGrid ? 24 : 20;
const footerH = 44;
let totalH;
if (isGrid) {
    totalH = padding * 2 + photoH * 2 + gap + footerH;
} else {
    totalH = padding * 2 + photoH * count + gap * (count - 1) + footerH;
}

const canvas = document.createElement('canvas');
canvas.width = W;
canvas.height = totalH;
const ctx = canvas.getContext('2d');

// Background
const bgMap = { dark:'#111', white:'#fff', cream:'#f5f0e8', red:'#c0392b', green:'#4a7c59' };
ctx.fillStyle = bgMap[currentBorder] || '#111';
ctx.fillRect(0, 0, W, totalH);

// Photos
const photoW = isGrid ? (W - padding * 2 - gap) / 2 : W - padding * 2;
const filterMap = {
    none: 'none', bw: 'grayscale(1) contrast(1.1)',
    warm: 'sepia(0.4) saturate(1.3) brightness(1.05)',
    cool: 'hue-rotate(20deg) saturate(0.85) brightness(1.05)',
    grain: 'contrast(1.15)', fade: 'contrast(0.85) brightness(1.1) saturate(0.7)',
};
ctx.filter = filterMap[currentFilter] || 'none';

for (let i = 0; i < count; i++) {
    if (!shots[i]) continue;
    const img = new Image();
    img.src = shots[i];
    await new Promise(r => { img.onload = r; });

    let x, y;
    if (isGrid) {
    x = padding + (i % 2) * (photoW + gap);
    y = padding + Math.floor(i / 2) * (photoH + gap);
    } else {
    x = padding;
    y = padding + i * (photoH + gap);
    }
    ctx.drawImage(img, x, y, photoW, photoH);
}

ctx.filter = 'none';

// Footer
const footerY = totalH - footerH;
const textColor = getFooterTextColor();
drawFooter(ctx, footerY, W, padding, footerH, bgMap, textColor);

const a = document.createElement('a');
a.download = `snapstrip-${Date.now()}.png`;
a.href = canvas.toDataURL('image/png');
a.click();
}

// ── PRINT ──
function printStrip() {
globalThis.print();
}

// ── RESET ──
function resetAll() {
shots = [];
updateStrip();
updateDots();
updateProgress();
document.getElementById('downloadBtn').disabled = true;
document.getElementById('printBtn').disabled = true;
document.getElementById('retakeRow').innerHTML = '';
document.getElementById('progressLabel').textContent = `0 / ${currentLayout === 'grid' ? 4 : Number.parseInt(currentLayout)}`;
setStatus('Fresh start! Hit Take Photos when ready.');
if (isMobile()) switchTab('cam');
}

// ── HELPERS ──
function setStatus(msg) {
document.getElementById('statusMsg').textContent = msg;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── INIT DOTS ──
updateDots();