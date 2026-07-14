const MAX_CANVAS_SIZE = 1200;
const UNDO_LIMIT = 20;
const LINE_ALPHA_THRESHOLD = 238;
const LINE_DARKNESS_MULTIPLIER = 1.5;
const MAX_COLOR_CHANNEL_SPREAD = 24;
const MAX_COLORED_PIXEL_RATIO = 0.01;
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
const ctx = canvas.getContext("2d", { willReadFrequently: true });
const paletteEl = document.getElementById("palette");
const assetSelect = document.getElementById("assetSelect");
const brushSizeInput = document.getElementById("brushSize");
const brushSizeValue = document.getElementById("brushSizeValue");
const eraserBtn = document.getElementById("eraserBtn");
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
const ASSETS_LIST = RAW_ASSETS_LIST.filter(isValidPngAssetRecord);
const ASSET_BY_SLUG = new Map(ASSETS_LIST.map((asset) => [asset.slug, asset]));
const VALID_CATEGORIES = new Set(
  ASSETS_LIST.map((asset) => asset.category).filter(Boolean)
);

const paintLayer = document.createElement("canvas");
const paintCtx = paintLayer.getContext("2d", { willReadFrequently: true });
const lineLayer = document.createElement("canvas");
const lineCtx = lineLayer.getContext("2d", { willReadFrequently: true });

const currentUrl = new URL(window.location.href);
const requestedAssetSlug = normalizeQueryParam(currentUrl.searchParams.get("asset"));
const requestedCategory = normalizeQueryParam(
  currentUrl.searchParams.get("category")
);
const requestedAsset = requestedAssetSlug
  ? ASSET_BY_SLUG.get(requestedAssetSlug) || null
  : null;

let activeColor = COLORS[0];
let brushSize = Number(brushSizeInput?.value || 18);
let eraseMode = false;
let undoStack = [];
let isImageLoaded = false;
let isDrawing = false;
let lastPoint = null;
let fitRaf = null;
let imageLoadRequestId = 0;
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

function isValidPngAssetRecord(asset) {
  return Boolean(
    asset &&
      typeof asset.label === "string" &&
      typeof asset.slug === "string" &&
      typeof asset.category === "string" &&
      typeof asset.src === "string" &&
      SAFE_QUERY_VALUE.test(asset.slug) &&
      SAFE_QUERY_VALUE.test(asset.category) &&
      asset.src.startsWith("assets/") &&
      /\.png$/i.test(asset.src)
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
  window.history.pushState({ brushExitGuard: true }, "", window.location.href);
  exitGuardActive = true;
}

function setUnsavedChanges(value) {
  hasUnsavedChanges = Boolean(value);
  if (hasUnsavedChanges) {
    ensureExitGuard();
  }
}

function isPaintLayerBlank() {
  const { data } = paintCtx.getImageData(0, 0, paintLayer.width, paintLayer.height);

  for (let index = 3; index < data.length; index += 4) {
    if (data[index] !== 0) return false;
  }

  return true;
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
      eraseMode = false;
      syncToolButtons();
      document
        .querySelectorAll(".color-swatch")
        .forEach((el) => el.classList.remove("active"));
      swatch.classList.add("active");
      setStatus(`Pincel activo: ${color}`);
    });
    paletteEl.appendChild(swatch);
  });
}

function buildAssetSelect() {
  assetSelect.innerHTML = "";
  if (visibleAssets.length === 0) {
    assetSelect.disabled = true;
    setStatus("No hay dibujos PNG disponibles.");
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

function getCategoryLabel(category) {
  return CATEGORY_LABELS[category] || "Dibujos";
}

function updateContext() {
  const countLabel = `${visibleAssets.length} PNG${visibleAssets.length === 1 ? "" : "s"}`;
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
      ? `Explora ${getCategoryLabel(activeCategory).toLowerCase()} y pinta PNGs en blanco y negro con pincel.`
      : "Elige un dibujo PNG en blanco y negro y pinta a mano con pincel.";
  }

  if (browseNoteEl) {
    browseNoteEl.textContent = activeCategory
      ? `Estás viendo ${getCategoryLabel(activeCategory)}. Esta página solo muestra archivos PNG.`
      : "Estás viendo todos los dibujos PNG disponibles. Los SVG no aparecen en el modo pincel.";
  }

  if (allBtn) {
    allBtn.hidden = !activeCategory;
    allBtn.disabled = !activeCategory;
  }

  document.title = currentAsset
    ? `${currentAsset.label} con pincel | PaintMe.club`
    : "Colorea con pincel | PaintMe.club";
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
  const disabled = !isImageLoaded;
  undoBtn.disabled = disabled || undoStack.length === 0;
  resetBtn.disabled = disabled;
  saveBtn.disabled = disabled;
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

function syncToolButtons() {
  if (!eraserBtn) return;
  eraserBtn.classList.toggle("active", eraseMode);
  eraserBtn.setAttribute("aria-pressed", eraseMode ? "true" : "false");
}

function updateBrushSize() {
  brushSize = Number(brushSizeInput.value);
  brushSizeValue.textContent = `${brushSize} px`;
}

function resizeLayers(width, height) {
  canvas.width = width;
  canvas.height = height;
  paintLayer.width = width;
  paintLayer.height = height;
  lineLayer.width = width;
  lineLayer.height = height;
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

function isBlackAndWhiteCanvas(sourceCtx, width, height) {
  const { data } = sourceCtx.getImageData(0, 0, width, height);
  let checkedPixels = 0;
  let coloredPixels = 0;

  for (let index = 0; index < data.length; index += 4) {
    const alpha = data[index + 3];
    if (alpha < 12) continue;

    const red = data[index];
    const green = data[index + 1];
    const blue = data[index + 2];
    checkedPixels += 1;

    if (Math.max(red, green, blue) - Math.min(red, green, blue) > MAX_COLOR_CHANNEL_SPREAD) {
      coloredPixels += 1;
    }
  }

  return checkedPixels === 0 || coloredPixels / checkedPixels <= MAX_COLORED_PIXEL_RATIO;
}

function buildLineLayer(sourceCanvas) {
  lineCtx.clearRect(0, 0, lineLayer.width, lineLayer.height);
  lineCtx.drawImage(sourceCanvas, 0, 0);

  const imageData = lineCtx.getImageData(0, 0, lineLayer.width, lineLayer.height);
  const data = imageData.data;
  lineMask = new Uint8Array(lineLayer.width * lineLayer.height);

  for (let index = 0; index < data.length; index += 4) {
    const red = data[index];
    const green = data[index + 1];
    const blue = data[index + 2];
    const alpha = data[index + 3];
    const brightness = (red + green + blue) / 3;
    const lineAlpha = Math.max(0, LINE_ALPHA_THRESHOLD - brightness);

    data[index] = 0;
    data[index + 1] = 0;
    data[index + 2] = 0;
    data[index + 3] = Math.min(255, lineAlpha * LINE_DARKNESS_MULTIPLIER, alpha);
    lineMask[index / 4] = data[index + 3] > 0 ? 1 : 0;
  }

  lineCtx.putImageData(imageData, 0, 0);
}

function renderComposite() {
  ctx.save();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(paintLayer, 0, 0);
  ctx.drawImage(lineLayer, 0, 0);
  ctx.restore();
}

function pushUndo() {
  if (!isImageLoaded) return;
  const snapshot = paintCtx.getImageData(0, 0, paintLayer.width, paintLayer.height);
  undoStack.push(snapshot);
  if (undoStack.length > UNDO_LIMIT) {
    undoStack.shift();
  }
  updateUndoButton();
}

function undo() {
  if (undoStack.length === 0 || !isImageLoaded) return;
  const prev = undoStack.pop();
  paintCtx.putImageData(prev, 0, 0);
  setUnsavedChanges(!isPaintLayerBlank());
  renderComposite();
  updateUndoButton();
}

function reset() {
  if (!isImageLoaded) return;
  paintCtx.clearRect(0, 0, paintLayer.width, paintLayer.height);
  undoStack = [];
  setUnsavedChanges(false);
  renderComposite();
  updateUndoButton();
}

function save() {
  if (!isImageLoaded) return;
  renderComposite();
  canvas.toBlob((blob) => {
    if (!blob) return;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    const safeName = currentAsset?.slug || "pincel";
    link.download = `${safeName}-pincel.png`;
    link.click();
    URL.revokeObjectURL(link.href);
    setUnsavedChanges(false);
  });
}

function getCanvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const x = (event.clientX - rect.left) * scaleX;
  const y = (event.clientY - rect.top) * scaleY;
  if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) return null;
  return { x, y };
}

function drawBrushSegment(from, to) {
  if (!from || !to) return;

  paintCtx.save();
  paintCtx.lineCap = "round";
  paintCtx.lineJoin = "round";
  paintCtx.lineWidth = brushSize;

  if (eraseMode) {
    paintCtx.globalCompositeOperation = "destination-out";
    paintCtx.strokeStyle = "rgba(0, 0, 0, 1)";
  } else {
    paintCtx.globalCompositeOperation = "source-over";
    paintCtx.strokeStyle = activeColor;
  }

  paintCtx.beginPath();
  paintCtx.moveTo(from.x, from.y);
  paintCtx.lineTo(to.x, to.y);
  paintCtx.stroke();
  paintCtx.restore();

  if (lineMask) {
    paintCtx.save();
    paintCtx.globalCompositeOperation = "destination-out";
    paintCtx.drawImage(lineLayer, 0, 0);
    paintCtx.restore();
  }

  renderComposite();
}

function startStroke(event) {
  event.preventDefault();
  if (!isImageLoaded) {
    setStatus("La imagen aún está cargando...");
    return;
  }

  const point = getCanvasPoint(event);
  if (!point) return;

  isDrawing = true;
  lastPoint = point;
  canvas.setPointerCapture?.(event.pointerId);
  pushUndo();
  drawBrushSegment(point, point);
  setUnsavedChanges(true);
  setStatus(eraseMode ? "Borrando..." : "Pintando con pincel...");
}

function continueStroke(event) {
  if (!isDrawing) return;
  event.preventDefault();

  const point = getCanvasPoint(event);
  if (!point || !lastPoint) return;

  drawBrushSegment(lastPoint, point);
  lastPoint = point;
}

function endStroke(event) {
  if (!isDrawing) return;
  isDrawing = false;
  lastPoint = null;
  canvas.releasePointerCapture?.(event.pointerId);
  setStatus(eraseMode ? "Borrador activo" : `Pincel activo: ${activeColor}`);
  updateUndoButton();
}

function drawLoadedSource(sourceWidth, sourceHeight, draw) {
  let scale = 1;
  if (sourceWidth > MAX_CANVAS_SIZE || sourceHeight > MAX_CANVAS_SIZE) {
    scale = Math.min(MAX_CANVAS_SIZE / sourceWidth, MAX_CANVAS_SIZE / sourceHeight);
  }

  const drawWidth = Math.round(sourceWidth * scale);
  const drawHeight = Math.round(sourceHeight * scale);
  const sourceCanvas = document.createElement("canvas");
  const sourceCtx = sourceCanvas.getContext("2d", { willReadFrequently: true });

  sourceCanvas.width = drawWidth;
  sourceCanvas.height = drawHeight;
  resizeLayers(drawWidth, drawHeight);
  paintCtx.clearRect(0, 0, paintLayer.width, paintLayer.height);
  draw(sourceCtx, drawWidth, drawHeight);

  if (!isBlackAndWhiteCanvas(sourceCtx, drawWidth, drawHeight)) {
    throw new Error("El modo pincel solo acepta PNG en blanco y negro.");
  }

  buildLineLayer(sourceCanvas);
  undoStack = [];
  isImageLoaded = true;
  setUnsavedChanges(false);
  zoomLevel = 1;
  renderComposite();
  updateUndoButton();
  setStatus(`Pincel activo: ${activeColor}`);
  scheduleFit();
  updateContext();
  syncUrl();
}

async function loadImage(src) {
  const requestId = ++imageLoadRequestId;
  isImageLoaded = false;
  updateUndoButton();
  setStatus("Cargando PNG...");

  try {
    if (!/\.png$/i.test(src)) {
      throw new Error("El modo pincel solo acepta PNG.");
    }

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

      drawLoadedSource(bitmap.width, bitmap.height, (targetCtx, drawWidth, drawHeight) => {
        targetCtx.drawImage(bitmap, 0, 0, drawWidth, drawHeight);
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

    drawLoadedSource(img.width, img.height, (targetCtx, drawWidth, drawHeight) => {
      targetCtx.drawImage(img, 0, 0, drawWidth, drawHeight);
    });
  } catch {
    if (requestId !== imageLoadRequestId) return;
    isImageLoaded = false;
    updateUndoButton();
    setStatus("No se pudo cargar. Usa un PNG en blanco y negro desde /assets/.");
  }
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

canvas.addEventListener("pointerdown", startStroke);
canvas.addEventListener("pointermove", continueStroke);
canvas.addEventListener("pointerup", endStroke);
canvas.addEventListener("pointercancel", endStroke);
canvas.addEventListener("pointerleave", endStroke);

assetSelect.addEventListener("change", () => {
  selectAssetBySlug(assetSelect.value);
});

brushSizeInput.addEventListener("input", updateBrushSize);
eraserBtn.addEventListener("click", () => {
  eraseMode = !eraseMode;
  syncToolButtons();
  setStatus(eraseMode ? "Borrador activo" : `Pincel activo: ${activeColor}`);
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
updateBrushSize();
syncToolButtons();
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

  window.history.pushState({ brushExitGuard: true }, "", window.location.href);
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
        "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js",
        {
          async: true,
          crossorigin: "anonymous",
          dataset: { adClient: "ca-pub-0000000000000000" },
        }
      )
      .catch(() => {});
  }
}

function setConsent(mode) {
  localStorage.setItem(CONSENT_KEY, mode);
  applyConsent(mode);
  if (consentBanner) consentBanner.style.display = "none";
}

const savedConsent = localStorage.getItem(CONSENT_KEY);
if (savedConsent === "granted" || savedConsent === "denied") {
  applyConsent(savedConsent);
} else if (consentBanner) {
  consentBanner.style.display = "block";
}

consentAccept?.addEventListener("click", () => setConsent("granted"));
consentReject?.addEventListener("click", () => setConsent("denied"));
