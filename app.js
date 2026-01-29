const MAX_CANVAS_SIZE = 1200;
const TOLERANCE = 20;
const UNDO_LIMIT = 10;
const COLORS = [
  "#ef5350",
  "#ec407a",
  "#ab47bc",
  "#5c6bc0",
  "#42a5f5",
  "#26a69a",
  "#66bb6a",
  "#ffee58",
  "#ffca28",
  "#ff7043",
  "#8d6e63",
  "#78909c",
];

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const paletteEl = document.getElementById("palette");
const assetSelect = document.getElementById("assetSelect");
const undoBtn = document.getElementById("undoBtn");
const resetBtn = document.getElementById("resetBtn");
const saveBtn = document.getElementById("saveBtn");
const statusEl = document.getElementById("status");
const canvasWrap = document.querySelector(".canvas-wrap");
const ASSETS_LIST = Array.isArray(window.ASSETS) ? window.ASSETS : [];

let activeColor = COLORS[0];
let originalImageData = null;
let undoStack = [];
let fillInProgress = false;
let currentAsset = ASSETS_LIST[0];
let isImageLoaded = false;
let fitRaf = null;

function setStatus(text) {
  statusEl.textContent = text;
}

function hexToRgba(hex) {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r, g, b, 255];
}

function buildPalette() {
  paletteEl.innerHTML = "";
  COLORS.forEach((color, index) => {
    const swatch = document.createElement("button");
    swatch.type = "button";
    swatch.className = "color-swatch";
    swatch.style.background = color;
    swatch.setAttribute("aria-label", `Color ${index + 1}`);
    if (color === activeColor) swatch.classList.add("active");
    swatch.addEventListener("click", () => {
      activeColor = color;
      document
        .querySelectorAll(".color-swatch")
        .forEach((el) => el.classList.remove("active"));
      swatch.classList.add("active");
      setStatus(`Color activo: ${color}`);
    });
    paletteEl.appendChild(swatch);
  });
}

function buildAssetSelect() {
  assetSelect.innerHTML = "";
  if (ASSETS_LIST.length === 0) {
    assetSelect.disabled = true;
    setStatus("No hay assets configurados en assets-list.js");
    return;
  }
  ASSETS_LIST.forEach((asset, index) => {
    const option = document.createElement("option");
    option.value = asset.src;
    option.textContent = asset.label;
    if (index === 0) option.selected = true;
    assetSelect.appendChild(option);
  });
  assetSelect.addEventListener("change", () => {
    const selected = ASSETS_LIST.find((asset) => asset.src === assetSelect.value);
    if (!selected) return;
    currentAsset = selected;
    loadImage(currentAsset.src);
  });
}

function updateUndoButton() {
  undoBtn.disabled = undoStack.length === 0 || fillInProgress;
  resetBtn.disabled = !originalImageData || fillInProgress;
  saveBtn.disabled = !originalImageData || fillInProgress;
}

function fitCanvasToContainer() {
  if (!canvasWrap || canvas.width === 0 || canvas.height === 0) return;
  const styles = getComputedStyle(canvasWrap);
  const paddingX =
    parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight);
  const innerWidth = Math.max(0, canvasWrap.clientWidth - paddingX);
  const maxDisplayWidth = 980;
  const maxDisplayHeight = Math.min(window.innerHeight * 0.6, 720);
  const scale = Math.min(
    innerWidth / canvas.width,
    maxDisplayWidth / canvas.width,
    maxDisplayHeight / canvas.height
  );
  const displayWidth = Math.round(canvas.width * scale);
  const displayHeight = Math.round(canvas.height * scale);
  canvas.style.width = `${displayWidth}px`;
  canvas.style.height = `${displayHeight}px`;
}

function scheduleFit() {
  if (fitRaf) cancelAnimationFrame(fitRaf);
  fitRaf = requestAnimationFrame(() => {
    fitCanvasToContainer();
    fitRaf = null;
  });
}

function pushUndo() {
  if (!originalImageData) return;
  const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
  undoStack.push(snapshot);
  if (undoStack.length > UNDO_LIMIT) {
    undoStack.shift();
  }
  updateUndoButton();
}

function undo() {
  if (undoStack.length === 0 || fillInProgress) return;
  const prev = undoStack.pop();
  ctx.putImageData(prev, 0, 0);
  updateUndoButton();
}

function reset() {
  if (!originalImageData || fillInProgress) return;
  ctx.putImageData(originalImageData, 0, 0);
  undoStack = [];
  updateUndoButton();
}

function save() {
  if (!originalImageData || fillInProgress) return;
  canvas.toBlob((blob) => {
    if (!blob) return;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "colorea.png";
    link.click();
    URL.revokeObjectURL(link.href);
  });
}

function getCanvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const x = Math.floor((event.clientX - rect.left) * scaleX);
  const y = Math.floor((event.clientY - rect.top) * scaleY);
  if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) return null;
  return { x, y };
}

function colorWithinTolerance(a, b, tol) {
  return (
    Math.abs(a[0] - b[0]) <= tol &&
    Math.abs(a[1] - b[1]) <= tol &&
    Math.abs(a[2] - b[2]) <= tol &&
    Math.abs(a[3] - b[3]) <= tol
  );
}

function floodFillAsync(startX, startY, fillColor, tolerance) {
  if (fillInProgress) return;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { data, width, height } = imageData;
  const startIndex = (startY * width + startX) * 4;
  const targetColor = [
    data[startIndex],
    data[startIndex + 1],
    data[startIndex + 2],
    data[startIndex + 3],
  ];

  if (colorWithinTolerance(targetColor, fillColor, tolerance)) return;

  fillInProgress = true;
  updateUndoButton();

  const visited = new Uint8Array(width * height);
  const queue = [];
  let head = 0;
  queue.push(startY * width + startX);

  const maxPerFrame = 30000;

  const step = () => {
    let count = 0;
    while (head < queue.length && count < maxPerFrame) {
      const idx = queue[head++];
      if (visited[idx]) continue;
      visited[idx] = 1;
      const px = idx % width;
      const py = (idx / width) | 0;
      const dataIndex = idx * 4;
      const currentColor = [
        data[dataIndex],
        data[dataIndex + 1],
        data[dataIndex + 2],
        data[dataIndex + 3],
      ];

      if (!colorWithinTolerance(currentColor, targetColor, tolerance)) {
        continue;
      }

      data[dataIndex] = fillColor[0];
      data[dataIndex + 1] = fillColor[1];
      data[dataIndex + 2] = fillColor[2];
      data[dataIndex + 3] = fillColor[3];

      if (px > 0) queue.push(idx - 1);
      if (px < width - 1) queue.push(idx + 1);
      if (py > 0) queue.push(idx - width);
      if (py < height - 1) queue.push(idx + width);
      count += 1;
    }

    if (head < queue.length) {
      ctx.putImageData(imageData, 0, 0);
      requestAnimationFrame(step);
    } else {
      ctx.putImageData(imageData, 0, 0);
      fillInProgress = false;
      updateUndoButton();
    }
  };

  requestAnimationFrame(step);
}

function loadImage(src) {
  const img = new Image();
  img.crossOrigin = "anonymous";
  isImageLoaded = false;
  setStatus("Cargando imagen...");
  img.src = src;
  img.onload = () => {
    let scale = 1;
    if (img.width > MAX_CANVAS_SIZE || img.height > MAX_CANVAS_SIZE) {
      scale = Math.min(MAX_CANVAS_SIZE / img.width, MAX_CANVAS_SIZE / img.height);
    }
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    undoStack = [];
    isImageLoaded = true;
    updateUndoButton();
    setStatus(`Color activo: ${activeColor}`);
    scheduleFit();
  };

  img.onerror = () => {
    isImageLoaded = false;
    setStatus(
      "No se pudo cargar la imagen. Verifica el archivo seleccionado en /assets/"
    );
  };
}

canvas.addEventListener("pointerdown", (event) => {
  if (fillInProgress) return;
  event.preventDefault();
  if (!isImageLoaded) {
    setStatus("La imagen aún está cargando...");
    return;
  }
  const point = getCanvasPoint(event);
  if (!point) return;
  pushUndo();
  floodFillAsync(point.x, point.y, hexToRgba(activeColor), TOLERANCE);
});

undoBtn.addEventListener("click", undo);
resetBtn.addEventListener("click", reset);
saveBtn.addEventListener("click", save);

buildPalette();
buildAssetSelect();
if (currentAsset) {
  loadImage(currentAsset.src);
}
updateUndoButton();

window.addEventListener("resize", scheduleFit);

// TODO: Para imágenes muy grandes, considerar mover floodFillAsync a un Web Worker.

const consentBanner = document.getElementById("consentBanner");
const consentAccept = document.getElementById("consentAccept");
const consentReject = document.getElementById("consentReject");
const CONSENT_KEY = "coloreame_consent_v1";

function applyConsent(mode) {
  if (typeof gtag !== "function") return;
  const granted = mode === "granted";
  gtag("consent", "update", {
    analytics_storage: granted ? "granted" : "denied",
    ad_storage: granted ? "granted" : "denied",
    ad_user_data: granted ? "granted" : "denied",
    ad_personalization: granted ? "granted" : "denied",
  });
}

function showConsentBanner() {
  if (!consentBanner) return;
  consentBanner.style.display = "block";
}

function hideConsentBanner() {
  if (!consentBanner) return;
  consentBanner.style.display = "none";
}

function initConsent() {
  if (!consentBanner) return;
  const saved = localStorage.getItem(CONSENT_KEY);
  if (saved === "granted" || saved === "denied") {
    applyConsent(saved);
    hideConsentBanner();
    return;
  }
  showConsentBanner();
}

if (consentAccept) {
  consentAccept.addEventListener("click", () => {
    localStorage.setItem(CONSENT_KEY, "granted");
    applyConsent("granted");
    hideConsentBanner();
  });
}

if (consentReject) {
  consentReject.addEventListener("click", () => {
    localStorage.setItem(CONSENT_KEY, "denied");
    applyConsent("denied");
    hideConsentBanner();
  });
}

initConsent();
