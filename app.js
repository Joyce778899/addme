// AddMe Lite - minimal two-shot composer
const video = document.getElementById('video');
const overlay = document.getElementById('overlay');
const canvas = document.getElementById('canvas');

const btnStart = document.getElementById('btnStart');
const btnShotA = document.getElementById('btnShotA');
const btnShotB = document.getElementById('btnShotB');
const ghostAlpha = document.getElementById('ghostAlpha');

const sectionEditor = document.getElementById('editor');
const brushSize = document.getElementById('brushSize');
const feather = document.getElementById('feather');
const btnErase = document.getElementById('btnErase');
const btnRestore = document.getElementById('btnRestore');
const btnResetMask = document.getElementById('btnResetMask');
const btnExport = document.getElementById('btnExport');
const exportLink = document.getElementById('exportLink');

let stream = null;
let shotA = null;
let shotB = null;
let maskCanvas = null;
let maskCtx = null;
let mode = 'erase'; // 'erase' or 'restore'

// Start camera
btnStart.onclick = async () => {
  try {
    const ideal = window.innerWidth > window.innerHeight ? { width: {ideal: 1920}, height: {ideal: 1080} } : { width: {ideal: 1080}, height: {ideal: 1920} };
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', ...ideal },
      audio: false
    });
    video.srcObject = stream;
    await video.play();
    sizeCanvases();
    btnShotA.disabled = false;
    btnStart.disabled = true;
  } catch (e) {
    alert('Camera start failed: ' + e.message);
  }
};

function sizeCanvases() {
  const w = video.videoWidth || 1080;
  const h = video.videoHeight || 1920;
  overlay.width = w; overlay.height = h;
}

ghostAlpha.oninput = () => drawGhost();

function drawGhost() {
  const ctx = overlay.getContext('2d');
  ctx.clearRect(0,0,overlay.width, overlay.height);
  if (!shotA) return;
  ctx.globalAlpha = parseFloat(ghostAlpha.value);
  ctx.drawImage(shotA, 0, 0, overlay.width, overlay.height);
  ctx.globalAlpha = 1.0;
}

function captureFrame() {
  const c = document.createElement('canvas');
  c.width = overlay.width;
  c.height = overlay.height;
  const ctx = c.getContext('2d');
  ctx.drawImage(video, 0, 0, c.width, c.height);
  const img = new Image();
  img.src = c.toDataURL('image/png');
  return img;
}

btnShotA.onclick = () => {
  shotA = captureFrame();
  shotA.onload = () => drawGhost();
  btnShotB.disabled = false;
  btnShotA.disabled = true;
};

btnShotB.onclick = () => {
  shotB = captureFrame();
  enterEditor();
};

function enterEditor() {
  if (!shotA || !shotB) { alert('Need both shots'); return; }
  sectionEditor.classList.remove('hidden');

  const w = overlay.width, h = overlay.height;
  canvas.width = w; canvas.height = h;

  maskCanvas = document.createElement('canvas');
  maskCanvas.width = w; maskCanvas.height = h;
  maskCtx = maskCanvas.getContext('2d');
  maskCtx.fillStyle = 'black'; // black = hide B
  maskCtx.fillRect(0,0,w,h);

  redraw();

  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);

  btnErase.onclick = () => { mode = 'erase'; btnErase.classList.add('active'); btnRestore.classList.remove('active'); };
  btnRestore.onclick = () => { mode = 'restore'; btnRestore.classList.add('active'); btnErase.classList.remove('active'); };
  btnResetMask.onclick = () => { maskCtx.fillStyle='black'; maskCtx.fillRect(0,0,maskCanvas.width,maskCanvas.height); redraw(); };
  btnExport.onclick = doExport;
}

function redraw() {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0,0,canvas.width, canvas.height);
  // draw A
  if (shotA.complete) ctx.drawImage(shotA, 0, 0, canvas.width, canvas.height);

  // B masked by maskCanvas
  const bLayer = document.createElement('canvas');
  bLayer.width = canvas.width; bLayer.height = canvas.height;
  const bctx = bLayer.getContext('2d');
  bctx.drawImage(shotB, 0,0, bLayer.width, bLayer.height);
  bctx.globalCompositeOperation = 'destination-in';
  bctx.drawImage(maskCanvas, 0,0);
  ctx.drawImage(bLayer, 0,0);
}

let painting = false;
function onPointerDown(e) { painting = true; paint(e); }
function onPointerMove(e) { if (painting) paint(e); }
function onPointerUp() { painting = false; }

function getPos(e) {
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (canvas.width / rect.width);
  const y = (e.clientY - rect.top) * (canvas.height / rect.height);
  return {x,y};
}

function paint(e) {
  const {x,y} = getPos(e);
  const r = parseInt(document.getElementById('brushSize').value,10);
  const f = parseFloat(document.getElementById('feather').value);
  const g = maskCtx.createRadialGradient(x,y, r*f, x,y, r);
  if (mode === 'erase') {
    g.addColorStop(0,'rgba(255,255,255,1)');
    g.addColorStop(1,'rgba(255,255,255,0)');
    maskCtx.globalCompositeOperation = 'lighter';
  } else {
    g.addColorStop(0,'rgba(0,0,0,1)');
    g.addColorStop(1,'rgba(0,0,0,0)');
    maskCtx.globalCompositeOperation = 'source-over';
  }
  maskCtx.fillStyle = g;
  maskCtx.beginPath();
  maskCtx.arc(x,y,r,0,Math.PI*2);
  maskCtx.fill();
  redraw();
}

function doExport() {
  const out = document.createElement('canvas');
  out.width = canvas.width; out.height = canvas.height;
  const octx = out.getContext('2d');
  octx.drawImage(shotA, 0,0,out.width,out.height);
  const bLayer = document.createElement('canvas');
  bLayer.width = out.width; bLayer.height = out.height;
  const bctx = bLayer.getContext('2d');
  bctx.drawImage(shotB,0,0,out.width,out.height);
  bctx.globalCompositeOperation = 'destination-in';
  bctx.drawImage(maskCanvas,0,0);
  octx.drawImage(bLayer,0,0);
  const url = out.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = url; link.download = 'addme_merged.png'; link.textContent = 'Download merged PNG';
  const exportLink = document.getElementById('exportLink');
  exportLink.innerHTML = ''; exportLink.appendChild(link);
}
