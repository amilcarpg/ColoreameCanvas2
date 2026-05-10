const MAX_CANVAS_SIZE = 1200;
const TOLERANCE = 20;
const UNDO_LIMIT = 10;
const MOBILE_UNDO_LIMIT = 6;
const CONTOUR_LUMA_LIMIT = 150;
const CONTOUR_CHANNEL_SPREAD_LIMIT = 50;
const CONTOUR_ALPHA_LIMIT = 20;
const ANALYTICS_ID = "G-RTJTM1J5LK";
const ADSENSE_CLIENT = "ca-pub-2193465688766661";
const GOOGLE_CONSENT_DENIED = {
  analytics_storage: "denied",
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
};
const COLORS = [
  { name: "rojo", hex: "#ef5350" },
  { name: "rosa", hex: "#ec407a" },
  { name: "morado", hex: "#ab47bc" },
  { name: "azul", hex: "#5c6bc0" },
  { name: "celeste", hex: "#42a5f5" },
  { name: "turquesa", hex: "#26a69a" },
  { name: "verde", hex: "#66bb6a" },
  { name: "amarillo", hex: "#ffee58" },
  { name: "naranja", hex: "#ffca28" },
  { name: "coral", hex: "#ff7043" },
  { name: "café", hex: "#8d6e63" },
  { name: "gris", hex: "#78909c" },
];

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const paletteEl = document.getElementById("palette");
const assetSelect = document.getElementById("assetSelect");
const assetGallery = document.getElementById("assetGallery");
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
let analyticsLoaded = false;
let adsLoaded = false;
let gtagDefaultsInitialized = false;

function setStatus(text) {
  statusEl.textContent = text;
}

function getActiveColorLabel() {
  return `Color activo: ${activeColor.name}`;
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
  COLORS.forEach((color) => {
    const swatch = document.createElement("button");
    swatch.type = "button";
    swatch.className = "color-swatch";
    swatch.style.background = color.hex;
    swatch.setAttribute("aria-label", `Color ${color.name}`);
    swatch.setAttribute("title", color.name);
    if (color === activeColor) swatch.classList.add("active");
    swatch.addEventListener("click", () => {
      activeColor = color;
      document
        .querySelectorAll(".color-swatch")
        .forEach((el) => el.classList.remove("active"));
      swatch.classList.add("active");
      setStatus(getActiveColorLabel());
    });
    paletteEl.appendChild(swatch);
  });
}

function selectAsset(asset) {
  if (!asset || currentAsset === asset) return;
  currentAsset = asset;
  assetSelect.value = asset.src;
  updateActiveAssetButton();
  loadImage(currentAsset.src);
}

function updateActiveAssetButton() {
  if (!assetGallery) return;
  assetGallery.querySelectorAll(".asset-thumb").forEach((button) => {
    const isActive = button.dataset.src === currentAsset?.src;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function buildAssetSelect() {
  assetSelect.innerHTML = "";
  if (assetGallery) assetGallery.innerHTML = "";
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

    if (assetGallery) {
      const button = document.createElement("button");
      const image = document.createElement("img");
      const label = document.createElement("span");
      button.type = "button";
      button.className = "asset-thumb";
      button.dataset.src = asset.src;
      button.setAttribute("aria-label", `Elegir ${asset.label}`);
      button.setAttribute("aria-pressed", String(index === 0));
      image.src = asset.src;
      image.alt = "";
      image.loading = "lazy";
      label.textContent = asset.label;
      button.append(image, label);
      button.addEventListener("click", () => selectAsset(asset));
      assetGallery.appendChild(button);
    }
  });
  assetSelect.addEventListener("change", () => {
    const selected = ASSETS_LIST.find((asset) => asset.src === assetSelect.value);
    if (!selected) return;
    selectAsset(selected);
  });
  updateActiveAssetButton();
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

function getUndoLimit() {
  return window.matchMedia("(max-width: 700px)").matches
    ? MOBILE_UNDO_LIMIT
    : UNDO_LIMIT;
}

function pushUndoRegion(snapshot) {
  if (!snapshot) return;
  undoStack.push(snapshot);
  const undoLimit = getUndoLimit();
  while (undoStack.length > undoLimit) {
    undoStack.shift();
  }
  updateUndoButton();
}

function createUndoRegion(sourceData, width, bounds) {
  const regionWidth = bounds.maxX - bounds.minX + 1;
  const regionHeight = bounds.maxY - bounds.minY + 1;
  const snapshot = ctx.createImageData(regionWidth, regionHeight);
  for (let row = 0; row < regionHeight; row += 1) {
    const sourceStart = ((bounds.minY + row) * width + bounds.minX) * 4;
    const sourceEnd = sourceStart + regionWidth * 4;
    const targetStart = row * regionWidth * 4;
    snapshot.data.set(sourceData.subarray(sourceStart, sourceEnd), targetStart);
  }
  return {
    x: bounds.minX,
    y: bounds.minY,
    imageData: snapshot,
  };
}

function trimUndoStack() {
  const undoLimit = getUndoLimit();
  if (undoStack.length > undoLimit) {
    undoStack = undoStack.slice(-undoLimit);
  }
  updateUndoButton();
}

function undo() {
  if (undoStack.length === 0 || fillInProgress) return;
  const prev = undoStack.pop();
  ctx.putImageData(prev.imageData, prev.x, prev.y);
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

function getLuma(r, g, b) {
  return r * 0.299 + g * 0.587 + b * 0.114;
}

function isContourColor(data, dataIndex) {
  const alpha = data[dataIndex + 3];
  if (alpha <= CONTOUR_ALPHA_LIMIT) return false;
  const r = data[dataIndex];
  const g = data[dataIndex + 1];
  const b = data[dataIndex + 2];
  const spread = Math.max(r, g, b) - Math.min(r, g, b);
  return getLuma(r, g, b) <= CONTOUR_LUMA_LIMIT &&
    spread <= CONTOUR_CHANNEL_SPREAD_LIMIT;
}

function floodFillAsync(startX, startY, fillColor, tolerance) {
  if (fillInProgress) return;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { data, width, height } = imageData;
  const originalData = originalImageData?.data;
  const startIndex = (startY * width + startX) * 4;
  if (originalData && isContourColor(originalData, startIndex)) {
    setStatus("Toca una zona blanca para pintar");
    return;
  }

  const targetColor = [
    data[startIndex],
    data[startIndex + 1],
    data[startIndex + 2],
    data[startIndex + 3],
  ];

  if (colorWithinTolerance(targetColor, fillColor, tolerance)) return;

  fillInProgress = true;
  updateUndoButton();

  const beforeData = new Uint8ClampedArray(data);
  const visited = new Uint8Array(width * height);
  const queue = [];
  let head = 0;
  let changedCount = 0;
  const bounds = {
    minX: width,
    minY: height,
    maxX: 0,
    maxY: 0,
  };
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
      if (originalData && isContourColor(originalData, dataIndex)) {
        continue;
      }
      const currentColor = [
        data[dataIndex],
        data[dataIndex + 1],
        data[dataIndex + 2],
        data[dataIndex + 3],
      ];

      if (!colorWithinTolerance(currentColor, targetColor, tolerance)) {
        continue;
      }

      if (colorWithinTolerance(currentColor, fillColor, 0)) {
        continue;
      }

      data[dataIndex] = fillColor[0];
      data[dataIndex + 1] = fillColor[1];
      data[dataIndex + 2] = fillColor[2];
      data[dataIndex + 3] = fillColor[3];
      changedCount += 1;
      bounds.minX = Math.min(bounds.minX, px);
      bounds.minY = Math.min(bounds.minY, py);
      bounds.maxX = Math.max(bounds.maxX, px);
      bounds.maxY = Math.max(bounds.maxY, py);

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
      if (changedCount > 0) {
        pushUndoRegion(createUndoRegion(beforeData, width, bounds));
        setStatus(getActiveColorLabel());
      }
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
    updateActiveAssetButton();
    setStatus(getActiveColorLabel());
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
  floodFillAsync(point.x, point.y, hexToRgba(activeColor.hex), TOLERANCE);
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
window.addEventListener("resize", trimUndoStack);

// TODO: Para imágenes muy grandes, considerar mover floodFillAsync a un Web Worker.

const consentBanner = document.getElementById("consentBanner");
const consentAccept = document.getElementById("consentAccept");
const consentReject = document.getElementById("consentReject");
const CONSENT_KEY = "coloreame_consent_v1";

function loadScript(src, options = {}) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    if (options.crossOrigin) {
      script.crossOrigin = options.crossOrigin;
    }
    script.addEventListener("load", resolve, { once: true });
    script.addEventListener("error", reject, { once: true });
    document.head.appendChild(script);
  });
}

function initGtagDefaults() {
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() {
    window.dataLayer.push(arguments);
  };
  if (gtagDefaultsInitialized) return;
  gtagDefaultsInitialized = true;
  window.gtag("consent", "default", GOOGLE_CONSENT_DENIED);
}

function loadAnalytics() {
  if (analyticsLoaded) return;
  analyticsLoaded = true;
  initGtagDefaults();
  loadScript(`https://www.googletagmanager.com/gtag/js?id=${ANALYTICS_ID}`)
    .then(() => {
      window.gtag("js", new Date());
      window.gtag("config", ANALYTICS_ID, { anonymize_ip: true });
    })
    .catch(() => {
      analyticsLoaded = false;
    });
}

function loadAds() {
  if (adsLoaded) return;
  adsLoaded = true;
  window.adsbygoogle = window.adsbygoogle || [];
  window.adsbygoogle.requestNonPersonalizedAds = 1;
  loadScript(
    `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`,
    { crossOrigin: "anonymous" }
  ).catch(() => {
    adsLoaded = false;
  });
}

function loadThirdPartyServices() {
  loadAnalytics();
  loadAds();
}

function applyConsent(mode) {
  initGtagDefaults();
  const granted = mode === "granted";
  window.gtag("consent", "update", {
    analytics_storage: granted ? "granted" : "denied",
    ad_storage: granted ? "granted" : "denied",
    ad_user_data: granted ? "granted" : "denied",
    ad_personalization: "denied",
  });
  if (granted) loadThirdPartyServices();
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
