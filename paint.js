const MAX_CANVAS_SIZE = 1200;
const TOLERANCE = 20;
const UNDO_LIMIT = 10;
const LINE_ALPHA_THRESHOLD = 16;
const LINE_BRIGHTNESS_THRESHOLD = 245;
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

const CATEGORY_LABELS = {
  animales: "Animales",
  vehiculos: "Vehículos",
  navidad: "Navidad",
  fantasia: "Fantasía",
  dinosaurios: "Dinosaurios",
  princesas: "Princesas",
};

const SAFE_QUERY_VALUE = /^[a-z0-9-]{1,64}$/;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const paletteEl = document.getElementById("palette");
const assetSelect = document.getElementById("assetSelect");
const undoBtn = document.getElementById("undoBtn");
const resetBtn = document.getElementById("resetBtn");
const saveBtn = document.getElementById("saveBtn");
const allBtn = document.getElementById("allBtn");
const statusEl = document.getElementById("status");
const canvasWrap = document.querySelector(".canvas-wrap");
const zoomInBtn = document.getElementById("zoomInBtn");
const zoomOutBtn = document.getElementById("zoomOutBtn");
const zoomResetBtn = document.getElementById("zoomResetBtn");
const zoomValueEl = document.getElementById("zoomValue");
const browseNoteEl = document.getElementById("browseNote");
const contextTitleEl = document.getElementById("contextTitle");
const contextMetaEl = document.getElementById("contextMeta");
const appLeadEl = document.getElementById("appLead");
const RAW_ASSETS_LIST = Array.isArray(window.ASSETS) ? window.ASSETS : [];
const ASSETS_LIST = RAW_ASSETS_LIST.filter(isValidAssetRecord);
const ASSET_BY_SLUG = new Map(ASSETS_LIST.map((asset) => [asset.slug, asset]));
const VALID_CATEGORIES = new Set(
  ASSETS_LIST.map((asset) => asset.category).filter(Boolean)
);

const currentUrl = new URL(window.location.href);
const requestedAssetSlug = normalizeQueryParam(currentUrl.searchParams.get("asset"));
const requestedCategory = normalizeQueryParam(
  currentUrl.searchParams.get("category")
);
const requestedAsset = requestedAssetSlug
  ? ASSET_BY_SLUG.get(requestedAssetSlug) || null
  : null;

let activeColor = COLORS[0];
let originalImageData = null;
let undoStack = [];
let fillInProgress = false;
let isImageLoaded = false;
let fitRaf = null;
let imageLoadRequestId = 0;
let fillRequestId = 0;
let activeCategory = getSanitizedCategory(
  requestedCategory,
  requestedAsset?.category || ""
);
let visibleAssets = getVisibleAssets();
let currentAsset = getInitialAsset();
let lineMask = null;
let hasUnsavedChanges = false;
let exitGuardActive = false;
let allowExitAfterConfirm = false;
let zoomLevel = 1;
const fillWorker = createFillWorker();

function isValidAssetRecord(asset) {
  return Boolean(
    asset &&
      typeof asset.label === "string" &&
      typeof asset.slug === "string" &&
      typeof asset.category === "string" &&
      typeof asset.src === "string" &&
      SAFE_QUERY_VALUE.test(asset.slug) &&
      SAFE_QUERY_VALUE.test(asset.category) &&
      asset.src.startsWith("assets/") &&
      /\.(png|svg)$/i.test(asset.src)
  );
}

function normalizeQueryParam(value) {
  if (typeof value !== "string") return "";
  const trimmed = value.trim().toLowerCase();
  return SAFE_QUERY_VALUE.test(trimmed) ? trimmed : "";
}

function getSanitizedCategory(category, fallback = "") {
  if (category && VALID_CATEGORIES.has(category)) return category;
  if (fallback && VALID_CATEGORIES.has(fallback)) return fallback;
  return "";
}

function getVisibleAssets() {
  if (!activeCategory) return [...ASSETS_LIST];
  const filtered = ASSETS_LIST.filter((asset) => asset.category === activeCategory);
  return filtered.length > 0 ? filtered : [...ASSETS_LIST];
}

function getInitialAsset() {
  if (requestedAsset && visibleAssets.some((asset) => asset.slug === requestedAsset.slug)) {
    return requestedAsset;
  }

  const featured = visibleAssets.find((asset) => asset.featured);
  return featured || visibleAssets[0] || null;
}

function setStatus(text) {
  statusEl.textContent = text;
}

function ensureExitGuard() {
  if (exitGuardActive) return;
  window.history.pushState({ paintExitGuard: true }, "", window.location.href);
  exitGuardActive = true;
}

function setUnsavedChanges(value) {
  hasUnsavedChanges = Boolean(value);
  if (hasUnsavedChanges) {
    ensureExitGuard();
  }
}

function isCanvasPristine() {
  if (!originalImageData) return true;
  const current = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  const original = originalImageData.data;

  if (current.length !== original.length) return false;

  for (let index = 0; index < current.length; index += 1) {
    if (current[index] !== original[index]) return false;
  }

  return true;
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
  if (visibleAssets.length === 0) {
    assetSelect.disabled = true;
    setStatus("No hay dibujos disponibles.");
    return;
  }

  assetSelect.disabled = false;

  visibleAssets.forEach((asset) => {
    const option = document.createElement("option");
    option.value = asset.slug || asset.src;
    option.textContent = asset.label;
    if (currentAsset && option.value === (currentAsset.slug || currentAsset.src)) {
      option.selected = true;
    }
    assetSelect.appendChild(option);
  });
}

function createFillWorker() {
  if (typeof Worker !== "function") return null;

  try {
    return new Worker("paint-worker.js?v=20260713-2");
  } catch {
    return null;
  }
}

function getCategoryLabel(category) {
  return CATEGORY_LABELS[category] || "Dibujos";
}

function updateContext() {
  const countLabel = `${visibleAssets.length} dibujo${visibleAssets.length === 1 ? "" : "s"}`;
  const categoryText = activeCategory
    ? `${getCategoryLabel(activeCategory)} · ${countLabel}`
    : `${countLabel} disponibles`;

  if (contextTitleEl) {
    contextTitleEl.textContent = currentAsset
      ? currentAsset.label
      : "PaintMe.club";
  }

  if (contextMetaEl) {
    contextMetaEl.textContent = categoryText;
  }

  if (appLeadEl) {
    appLeadEl.textContent = activeCategory
      ? `Explora la categoría ${getCategoryLabel(activeCategory).toLowerCase()} y pinta por regiones con un clic o toque.`
      : "Elige un dibujo y pinta por regiones con un clic o toque.";
  }

  if (browseNoteEl) {
    browseNoteEl.textContent = activeCategory
      ? `Estás viendo ${getCategoryLabel(activeCategory)}. Puedes cambiar de dibujo dentro de esta categoría o usar “Ver todos”.`
      : "Estás viendo todos los dibujos disponibles. Elige uno desde la lista y empieza a colorear.";
  }

  if (allBtn) {
    allBtn.hidden = !activeCategory;
    allBtn.disabled = !activeCategory;
  }

  document.title = currentAsset
    ? `${currentAsset.label} para colorear | PaintMe.club`
    : "Colorea con balde de pintura | PaintMe.club";
}

function syncUrl() {
  const nextUrl = new URL(window.location.href);
  nextUrl.searchParams.delete("asset");
  nextUrl.searchParams.delete("category");

  if (activeCategory) {
    nextUrl.searchParams.set("category", activeCategory);
  }

  if (currentAsset?.slug) {
    nextUrl.searchParams.set("asset", currentAsset.slug);
  }

  window.history.replaceState({}, "", nextUrl);
}

function normalizeInitialUrlState() {
  const requestedCategoryIsValid = requestedCategory && VALID_CATEGORIES.has(requestedCategory);
  const requestedAssetIsValid = requestedAssetSlug && ASSET_BY_SLUG.has(requestedAssetSlug);
  const assetCategory = requestedAsset?.category || "";
  const shouldNormalize =
    Boolean(currentUrl.searchParams.get("asset")) !== Boolean(requestedAssetIsValid) ||
    Boolean(currentUrl.searchParams.get("category")) !== Boolean(requestedCategoryIsValid) ||
    (requestedAssetIsValid &&
      requestedCategoryIsValid &&
      assetCategory &&
      requestedCategory !== assetCategory);

  if (!shouldNormalize) return;
  syncUrl();
}

function updateUndoButton() {
  undoBtn.disabled = undoStack.length === 0 || fillInProgress;
  resetBtn.disabled = !originalImageData || fillInProgress;
  saveBtn.disabled = !originalImageData || fillInProgress;
}

function updateZoomUi() {
  if (zoomValueEl) {
    zoomValueEl.textContent = `${Math.round(zoomLevel * 100)}%`;
  }

  if (zoomOutBtn) {
    zoomOutBtn.disabled = zoomLevel <= 1;
  }

  if (zoomInBtn) {
    zoomInBtn.disabled = zoomLevel >= 3;
  }
}

function fitCanvasToContainer() {
  if (!canvasWrap || canvas.width === 0 || canvas.height === 0) return;
  const styles = getComputedStyle(canvasWrap);
  const paddingX =
    parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight);
  const paddingY =
    parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);
  const innerWidth = Math.max(0, canvasWrap.clientWidth - paddingX);
  const maxDisplayWidth = 980;
  const maxDisplayHeight = Math.min(window.innerHeight * 0.6, 720);
  const baseScale = Math.min(
    innerWidth / canvas.width,
    maxDisplayWidth / canvas.width,
    Math.max(240, maxDisplayHeight - paddingY) / canvas.height
  );
  const scale = Math.max(0.1, baseScale) * zoomLevel;
  const displayWidth = Math.round(canvas.width * scale);
  const displayHeight = Math.round(canvas.height * scale);
  canvas.style.width = `${displayWidth}px`;
  canvas.style.height = `${displayHeight}px`;
  updateZoomUi();
}

function setZoom(nextZoom) {
  zoomLevel = Math.min(3, Math.max(1, nextZoom));
  scheduleFit();
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
  setUnsavedChanges(!isCanvasPristine());
  updateUndoButton();
}

function reset() {
  if (!originalImageData || fillInProgress) return;
  ctx.putImageData(originalImageData, 0, 0);
  undoStack = [];
  setUnsavedChanges(false);
  updateUndoButton();
}

function save() {
  if (!originalImageData || fillInProgress) return;
  canvas.toBlob((blob) => {
    if (!blob) return;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    const safeName = currentAsset?.slug || "colorea";
    link.download = `${safeName}.png`;
    link.click();
    URL.revokeObjectURL(link.href);
    setUnsavedChanges(false);
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

function buildLineMask(imageData) {
  const { data, width, height } = imageData;
  const nextMask = new Uint8Array(width * height);

  for (let index = 0; index < data.length; index += 4) {
    const alpha = data[index + 3];
    if (alpha < LINE_ALPHA_THRESHOLD) continue;

    const brightness = (data[index] + data[index + 1] + data[index + 2]) / 3;
    if (brightness <= LINE_BRIGHTNESS_THRESHOLD) {
      nextMask[index / 4] = 1;
    }
  }

  return nextMask;
}

function isLinePixel(x, y) {
  if (!lineMask) return false;
  return lineMask[y * canvas.width + x] === 1;
}

function canStartFill(imageData, startX, startY, fillColor, tolerance) {
  if (isLinePixel(startX, startY)) {
    setStatus("Las líneas del dibujo están protegidas.");
    return false;
  }

  const startIndex = (startY * imageData.width + startX) * 4;
  const targetColor = [
    imageData.data[startIndex],
    imageData.data[startIndex + 1],
    imageData.data[startIndex + 2],
    imageData.data[startIndex + 3],
  ];

  if (colorWithinTolerance(targetColor, fillColor, tolerance)) {
    setStatus(`Color activo: ${activeColor}`);
    return false;
  }

  return true;
}

function floodFillFallback(startX, startY, fillColor, tolerance, imageData) {
  if (fillInProgress) return false;
  const workingImageData =
    imageData || ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { data, width, height } = workingImageData;
  const startIndex = (startY * width + startX) * 4;
  const targetColor = [
    data[startIndex],
    data[startIndex + 1],
    data[startIndex + 2],
    data[startIndex + 3],
  ];

  if (isLinePixel(startX, startY)) {
    setStatus("Las líneas del dibujo están protegidas.");
    return false;
  }

  if (colorWithinTolerance(targetColor, fillColor, tolerance)) return false;

  fillInProgress = true;
  setStatus("Pintando...");
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

      if (lineMask?.[idx]) {
        continue;
      }

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
      ctx.putImageData(workingImageData, 0, 0);
      requestAnimationFrame(step);
    } else {
      ctx.putImageData(workingImageData, 0, 0);
      fillInProgress = false;
      updateUndoButton();
    }
  };

  requestAnimationFrame(step);
  return true;
}

function drawLoadedSource(sourceWidth, sourceHeight, draw) {
  let scale = 1;
  if (sourceWidth > MAX_CANVAS_SIZE || sourceHeight > MAX_CANVAS_SIZE) {
    scale = Math.min(MAX_CANVAS_SIZE / sourceWidth, MAX_CANVAS_SIZE / sourceHeight);
  }
  canvas.width = Math.round(sourceWidth * scale);
  canvas.height = Math.round(sourceHeight * scale);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  draw(canvas.width, canvas.height);
  originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  lineMask = buildLineMask(originalImageData);
  undoStack = [];
  isImageLoaded = true;
  setUnsavedChanges(false);
  zoomLevel = 1;
  updateUndoButton();
  setStatus(`Color activo: ${activeColor}`);
  scheduleFit();
  updateContext();
  syncUrl();
}

async function loadImage(src) {
  const requestId = ++imageLoadRequestId;
  isImageLoaded = false;
  setStatus("Cargando imagen...");

  try {
    if (typeof createImageBitmap === "function") {
      const response = await fetch(src, { cache: "force-cache" });
      if (!response.ok) {
        throw new Error(`No se pudo descargar ${src}`);
      }
      const blob = await response.blob();
      const bitmap = await createImageBitmap(blob);

      if (requestId !== imageLoadRequestId) {
        bitmap.close?.();
        return;
      }

      drawLoadedSource(bitmap.width, bitmap.height, (drawWidth, drawHeight) => {
        ctx.drawImage(bitmap, 0, 0, drawWidth, drawHeight);
      });
      bitmap.close?.();
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.decoding = "async";
    img.fetchPriority = "high";
    img.src = src;
    await img.decode();

    if (requestId !== imageLoadRequestId) return;

    drawLoadedSource(img.width, img.height, (drawWidth, drawHeight) => {
      ctx.drawImage(img, 0, 0, drawWidth, drawHeight);
    });
  } catch {
    if (requestId !== imageLoadRequestId) return;
    isImageLoaded = false;
    setStatus(
      "No se pudo cargar la imagen. Verifica el archivo seleccionado en /assets/"
    );
  }
}

function floodFillAsync(startX, startY, fillColor, tolerance, imageData) {
  if (!fillWorker) {
    return floodFillFallback(startX, startY, fillColor, tolerance, imageData);
  }

  if (fillInProgress) return false;

  const workingImageData =
    imageData || ctx.getImageData(0, 0, canvas.width, canvas.height);
  const startIndex = (startY * canvas.width + startX) * 4;
  const targetColor = [
    workingImageData.data[startIndex],
    workingImageData.data[startIndex + 1],
    workingImageData.data[startIndex + 2],
    workingImageData.data[startIndex + 3],
  ];

  if (isLinePixel(startX, startY)) {
    setStatus("Las líneas del dibujo están protegidas.");
    return false;
  }

  if (colorWithinTolerance(targetColor, fillColor, tolerance)) return false;

  fillInProgress = true;
  setStatus("Pintando...");
  updateUndoButton();

  const requestId = ++fillRequestId;

  const handleMessage = (event) => {
    const { id, buffer } = event.data || {};
    if (id !== requestId || !buffer) return;

    fillWorker.removeEventListener("message", handleMessage);
    fillWorker.removeEventListener("error", handleError);

    const result = new Uint8ClampedArray(buffer);
    const filledImage = new ImageData(result, canvas.width, canvas.height);
    ctx.putImageData(filledImage, 0, 0);
    fillInProgress = false;
    setStatus(`Color activo: ${activeColor}`);
    updateUndoButton();
  };

  const handleError = () => {
    fillWorker.removeEventListener("message", handleMessage);
    fillWorker.removeEventListener("error", handleError);
    fillInProgress = false;
    setStatus("No se pudo completar el pintado. Intenta de nuevo.");
    updateUndoButton();
  };

  fillWorker.addEventListener("message", handleMessage);
  fillWorker.addEventListener("error", handleError);
  fillWorker.postMessage(
    {
      id: requestId,
      width: canvas.width,
      height: canvas.height,
      startX,
      startY,
      fillColor,
      tolerance,
      lineMask,
      buffer: workingImageData.data.buffer,
    },
    [workingImageData.data.buffer]
  );

  return true;
}

function selectAssetBySlug(slug) {
  const selected = visibleAssets.find((asset) => asset.slug === slug);
  if (!selected) return;
  currentAsset = selected;
  assetSelect.value = selected.slug || selected.src;
  loadImage(selected.src);
}

function clearCategoryFilter() {
  activeCategory = "";
  visibleAssets = [...ASSETS_LIST];
  currentAsset = visibleAssets.find((asset) => asset.slug === currentAsset?.slug)
    || visibleAssets.find((asset) => asset.featured)
    || visibleAssets[0]
    || null;
  buildAssetSelect();
  updateContext();
  if (currentAsset) {
    selectAssetBySlug(currentAsset.slug);
  }
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
  const fillColor = hexToRgba(activeColor);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  if (!canStartFill(imageData, point.x, point.y, fillColor, TOLERANCE)) return;
  pushUndo();
  if (floodFillAsync(point.x, point.y, fillColor, TOLERANCE, imageData)) {
    setUnsavedChanges(true);
  }
});

assetSelect.addEventListener("change", () => {
  selectAssetBySlug(assetSelect.value);
});

undoBtn.addEventListener("click", undo);
resetBtn.addEventListener("click", reset);
saveBtn.addEventListener("click", save);

if (allBtn) {
  allBtn.addEventListener("click", clearCategoryFilter);
}

zoomInBtn?.addEventListener("click", () => {
  setZoom(zoomLevel + 0.25);
});

zoomOutBtn?.addEventListener("click", () => {
  setZoom(zoomLevel - 0.25);
});

zoomResetBtn?.addEventListener("click", () => {
  setZoom(1);
});

buildPalette();
buildAssetSelect();
updateContext();
normalizeInitialUrlState();
if (currentAsset) {
  selectAssetBySlug(currentAsset.slug);
}
updateUndoButton();
updateZoomUi();

window.addEventListener("resize", scheduleFit);
window.addEventListener("popstate", () => {
  if (!exitGuardActive) return;

  if (allowExitAfterConfirm) {
    allowExitAfterConfirm = false;
    return;
  }

  if (!hasUnsavedChanges) {
    exitGuardActive = false;
    window.history.back();
    return;
  }

  const shouldLeave = window.confirm(
    "Tienes cambios sin guardar. Si sales ahora, perderás tu dibujo. ¿Quieres salir?"
  );

  if (shouldLeave) {
    allowExitAfterConfirm = true;
    exitGuardActive = false;
    window.history.back();
    return;
  }

  window.history.pushState({ paintExitGuard: true }, "", window.location.href);
});

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

  if (granted && typeof window.loadThirdPartyScript === "function") {
    window
      .loadThirdPartyScript(
        "adsense",
        "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2193465688766661",
        {
          crossOrigin: "anonymous",
        }
      )
      .catch(() => {});
  }
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
