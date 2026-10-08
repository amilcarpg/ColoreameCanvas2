const MAX_CANVAS_SIZE = 1200;
const TOLERANCE = 20;
const UNDO_LIMIT = 10;
const LINE_ALPHA_THRESHOLD = 16;
const LINE_BRIGHTNESS_THRESHOLD = 245;
const COLORS = window.PaintMe?.PALETTES?.base?.colors || [];

const CATEGORY_LABELS = window.PaintMe?.CATEGORY_LABELS || {};

const SAFE_QUERY_VALUE = /^[a-z0-9-]{1,64}$/;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const paletteEl = document.getElementById("palette");
const assetSelect = document.getElementById("assetSelect");
const assetSearch = document.getElementById("assetSearch");
const categoryFiltersEl = document.getElementById("categoryFilters");
const assetGallery = document.getElementById("assetGallery");
const galleryBrowser = document.getElementById("galleryBrowser");
const paletteSelect = document.getElementById("paletteSelect");
const customColorInput = document.getElementById("customColor");
const restoreBtn = document.getElementById("restoreBtn");
const undoBtn = document.getElementById("undoBtn");
const redoBtn = document.getElementById("redoBtn");
const resetBtn = document.getElementById("resetBtn");
const saveBtn = document.getElementById("saveBtn");
const nextBtn = document.getElementById("nextBtn");
const surpriseBtn = document.getElementById("surpriseBtn");
const allBtn = document.getElementById("allBtn");
const statusEl = document.getElementById("status");
const localSaveStatus = document.getElementById("localSaveStatus");
const retrySaveBtn = document.getElementById("retrySaveBtn");
const exportStatus = document.getElementById("exportStatus");
const pngPreviewBtn = document.getElementById("pngPreviewBtn");
const resetDialog = document.getElementById("resetDialog");
const canvasWrap = document.querySelector(".canvas-wrap");
const zoomResetBtn = document.getElementById("zoomResetBtn");
const browseNoteEl = document.getElementById("browseNote");
const contextTitleEl = document.getElementById("contextTitle");
const contextMetaEl = document.getElementById("contextMeta");
const appLeadEl = document.getElementById("appLead");
const RAW_ASSETS_LIST = Array.isArray(window.ASSETS) ? window.ASSETS : [];
const ASSETS_LIST = RAW_ASSETS_LIST.filter(isValidAssetRecord);
const PM = window.PaintMe;
if (!window.PaintMeEditorUI?.buildGallery || !PM?.PALETTES?.base || !PM?.createAutosaveController || !window.PaintMeFill?.createTask) {
  if (statusEl) statusEl.textContent = "No se pudo iniciar el editor. Recarga la página para cargar sus herramientas.";
  canvas.style.pointerEvents = "none";
  document.querySelectorAll(".controls button").forEach((button) => { button.disabled = true; });
  throw new Error("PaintMe: faltan las herramientas compartidas del editor");
}
const PALETTES = PM.PALETTES;
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
const history = PM.createHistory(UNDO_LIMIT, 32 * 1024 * 1024);
const undoStack = history.past;
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
let isPinching = false;
let pinchStartDistance = 0;
let pinchStartZoom = 1;
let pinchStartCenter = null;
let pinchStartScroll = null;
let pendingFillPointerId = null;
let pendingFillPoint = null;
let activePalette = "base";
let hasPaintedCurrentAsset = false;
let drawingOpenedAt = performance.now();
let switchingAsset = false;
let restoreRequestId = 0;
let drawingRevision = 0;
let restoringDrawing = false;
let exportInProgress = false;
let exportRequestId = 0;
let exportPreviewSnapshot = null;
let exportPreviewFilename = "";
let resetUndoSnapshot = null;
let restoreButtonRequestId = 0;
let unreadableSavedDrawing = null;
let imageLoadAbort = null;
const autosave = PM.createAutosaveController("bucket", (saved, slug, revision) => {
  if (currentAsset?.slug !== slug || revision !== drawingRevision || fillInProgress) return;
  trackProductEvent(saved ? "local_save_success" : "local_save_failure", getTrackingPayload({result: saved ? "success" : "failure", reason: "storage"}));
  if (saved) setUnsavedChanges(false);
  setSaveState(saved ? "saved" : "error");
  if (!saved) setStatus("No pudimos guardar. Descarga el PNG antes de salir.");
  updateRestoreButton();
}, (slug, revision) => {
  if (currentAsset?.slug === slug && revision === drawingRevision && !fillInProgress) setSaveState("saving");
});
let galleryInitialized = false;
const activePointers = new Map();
let fillWorker = createFillWorker();

function isValidAssetRecord(asset) {
  return Boolean(
    asset &&
      typeof asset.label === "string" &&
      typeof asset.slug === "string" &&
      typeof asset.category === "string" &&
      typeof asset.src === "string" &&
      (asset.thumbnailSrc === undefined || typeof asset.thumbnailSrc === "string") &&
      SAFE_QUERY_VALUE.test(asset.slug) &&
      SAFE_QUERY_VALUE.test(asset.category) &&
      asset.src.startsWith("assets/") &&
      /\.(png|svg)$/i.test(asset.src) &&
      (asset.thumbnailSrc === undefined || (
        asset.thumbnailSrc.startsWith("assets/") && /\.png$/i.test(asset.thumbnailSrc)
      ))
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

function trackProductEvent(name, params = {}) {
  if (typeof PM.trackEvent === "function") {
    PM.trackEvent(name, params);
  } else if (typeof window.gtag === "function") {
    window.gtag("event", name, params);
  }
}

function getTrackingPayload(extra = {}) {
  return {
    asset_slug: currentAsset?.slug || "",
    category: currentAsset?.category || activeCategory || "",
    mode: "bucket",
    ...extra,
  };
}

function getGalleryAssets() {
  const query = assetSearch?.value || "";
  if (typeof PM.filterAssets === "function") {
    return PM.filterAssets(visibleAssets, "", query);
  }
  const normalized = query.trim().toLowerCase();
  return visibleAssets.filter((asset) => {
    if (!normalized) return true;
    return `${asset.label} ${asset.slug} ${asset.category}`.toLowerCase().includes(normalized);
  });
}

function syncAssetSurface() {
  if (assetSelect && currentAsset) {
    assetSelect.value = currentAsset.slug || currentAsset.src;
  }
  document.querySelectorAll(".asset-card").forEach((card) => {
    card.classList.toggle("active", card.dataset.slug === currentAsset?.slug);
    card.setAttribute("aria-pressed", String(card.dataset.slug === currentAsset?.slug));
  });
  updateRestoreButton();
}

function buildCategoryFilters() {
  window.PaintMeEditorUI.buildCategoryFilters({categoryFiltersEl, VALID_CATEGORIES, activeCategory, getCategoryLabel, changeCategory});
}

function buildGallery() {
  window.PaintMeEditorUI.buildGallery({assetGallery, getGalleryAssets, currentAsset, selectAssetBySlug});
}

function ensureGalleryBuilt() {
  if (galleryInitialized) return;
  galleryInitialized = true;
  buildCategoryFilters();
  buildGallery();
}

function refreshGalleryIfBuilt() {
  if (!galleryInitialized) return;
  buildCategoryFilters();
  buildGallery();
}

function buildPaletteOptions() {
  window.PaintMeEditorUI.buildPaletteOptions({paletteSelect, PALETTES, activePalette});
}

function getActiveColors() {
  return PALETTES[activePalette]?.colors || COLORS;
}

function editorIsBusy() {
  return switchingAsset || restoringDrawing || exportInProgress || fillInProgress;
}

function setSaveState(state, message = "") {
  const labels = {
    idle: "Sin cambios por guardar",
    pending: "Cambios pendientes de guardar",
    saving: "Guardando en este dispositivo…",
    saved: "Guardado en este dispositivo",
    available: "Hay un dibujo guardado en este dispositivo. Puedes continuar.",
    restored: "Dibujo recuperado de este dispositivo",
    error: "No pudimos guardar. Reintenta o descarga el PNG.",
  };
  if (localSaveStatus) {
    localSaveStatus.dataset.state = state;
    localSaveStatus.textContent = message || labels[state] || "";
  }
  if (retrySaveBtn) retrySaveBtn.hidden = state !== "error";
}

async function updateRestoreButton() {
  if (!restoreBtn || !currentAsset) return;
  const slug = currentAsset.slug;
  const request = ++restoreButtonRequestId;
  const saved = await PM.loadLocalDrawing("bucket", slug);
  if (currentAsset?.slug !== slug || request !== restoreButtonRequestId) return;
  const readable = saved && !(unreadableSavedDrawing?.slug === slug && unreadableSavedDrawing.dataUrl === saved.dataUrl);
  restoreBtn.hidden = !readable;
  if (readable && !hasUnsavedChanges && localSaveStatus?.dataset.state === "idle") setSaveState("available");
  if (galleryBrowser?.open) refreshSavedGallery();
}

async function retryLocalSave() {
  if (!isImageLoaded || editorIsBusy()) return;
  setUnsavedChanges(true);
  if (scheduleAutosave()) await autosave.flush();
}

function markFirstPaint() {
  if (hasPaintedCurrentAsset) return;
  hasPaintedCurrentAsset = true;
  trackProductEvent("first_paint", getTrackingPayload({time_band: window.PaintMeEvents.timeBand(performance.now() - drawingOpenedAt)}));
}

function scheduleAutosave() {
  if (!currentAsset || !isImageLoaded) return false;
  drawingRevision += 1;
  try {
    const scheduled = autosave.schedule(currentAsset.slug, canvas.toDataURL("image/png"), drawingRevision);
    if (!scheduled) throw new Error("Invalid drawing snapshot");
    setSaveState("pending");
    return true;
  } catch {
    setUnsavedChanges(true);
    setSaveState("error");
    setStatus("No pudimos preparar el guardado. Descarga el PNG antes de salir.");
    return false;
  }
}

function updateNavigationState() {
  const blocked = editorIsBusy();
  [assetSelect, nextBtn, surpriseBtn, allBtn].forEach((control) => {
    if (control) control.disabled = blocked || (control === allBtn && !activeCategory);
  });
  document.querySelectorAll(".asset-card, .category-chip").forEach((control) => { control.disabled = blocked || control.dataset.unreadable === "true"; });
  [paletteSelect, customColorInput, document.getElementById("brushSize"), document.getElementById("eraserBtn")].forEach((control) => {
    if (control) control.disabled = blocked || !isImageLoaded;
  });
  document.querySelectorAll(".color-swatch").forEach((control) => { control.disabled = blocked || !isImageLoaded; });
  updateUndoButton();
}

function flushOnLeave() {
  const captured = !hasUnsavedChanges || scheduleAutosave();
  const backedUp = captured && autosave.backup();
  autosave.flush();
  return backedUp;
}

window.addEventListener("pagehide", flushOnLeave);
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") flushOnLeave();
});
window.addEventListener("beforeunload", (event) => {
  const backedUp = flushOnLeave();
  if ((hasUnsavedChanges && !backedUp) || fillInProgress) {
    event.preventDefault();
    event.returnValue = "";
  }
});

PM.bindEditorNavigation({
  mode: "bucket", getAsset: () => currentAsset, getCategory: () => activeCategory,
  isBusy: editorIsBusy,
  setBusy: (value) => { switchingAsset = value; updateNavigationState(); },
  setStatus,
  save: async () => {
    const captured = !hasUnsavedChanges || scheduleAutosave();
    const saved = await autosave.flush();
    return captured && (saved || !hasUnsavedChanges);
  },
});

async function restoreSavedDrawing() {
  if (!currentAsset || !isImageLoaded || editorIsBusy()) return;
  const slug = currentAsset.slug;
  const request = ++restoreRequestId;
  const revision = drawingRevision;
  const loadId = imageLoadRequestId;
  const current = () => currentAsset?.slug === slug && request === restoreRequestId && revision === drawingRevision && loadId === imageLoadRequestId;
  restoringDrawing = true;
  updateNavigationState();
  setStatus("Recuperando dibujo…");
  let saved;
  try {
    await autosave.flush();
    saved = await PM.loadLocalDrawing("bucket", slug);
    if (!current()) return;
    if (!saved?.dataUrl) {
      setStatus("No hay una copia guardada para este dibujo.");
      restoreBtn.hidden = true;
      return;
    }
    const image = await PM.decodeSavedPng(saved.dataUrl);
    if (!current()) return;
    if (image.width !== canvas.width || image.height !== canvas.height) throw new Error("saved_dimensions");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0);
    drawingRevision += 1;
    history.clear();
    resetUndoSnapshot = null;
    unreadableSavedDrawing = null;
    setUnsavedChanges(false);
    setSaveState("restored");
    setStatus("Dibujo restaurado");
    trackProductEvent("restore_success", getTrackingPayload({result: "success"}));
  } catch {
    if (!current()) return;
    unreadableSavedDrawing = saved ? { slug, dataUrl: saved.dataUrl } : null;
    setSaveState("error", "No se pudo recuperar la copia guardada. Puedes seguir pintando o descargar este dibujo.");
    setStatus("No se pudo recuperar el dibujo guardado.");
    trackProductEvent("restore_failure", getTrackingPayload({result: "failure", reason: "restore"}));
    restoreBtn.hidden = true;
  } finally {
    if (request === restoreRequestId) {
      restoringDrawing = false;
      updateNavigationState();
    }
  }
}

function goToRelativeAsset(method) {
  const candidates = getGalleryAssets();
  const fromAsset = currentAsset?.slug || "";
  const nextAsset =
    method === "surprise"
      ? PM.getRandomAsset?.(candidates, currentAsset)
      : PM.getNextAsset?.(candidates, currentAsset);
  if (!nextAsset) return;
  trackProductEvent("next_drawing", {
    from_asset: fromAsset,
    to_asset: nextAsset.slug,
    category: activeCategory || nextAsset.category,
    mode: "bucket",
    method,
  });
  selectAssetBySlug(nextAsset.slug, method);
}

function ensureExitGuard() {
  if (exitGuardActive) return;
  window.history.pushState({ paintExitGuard: true }, "", window.location.href);
  exitGuardActive = true;
}

function setUnsavedChanges(value) {
  hasUnsavedChanges = Boolean(value);
  if (hasUnsavedChanges) {
    setSaveState("pending");
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
  window.PaintMeEditorUI.buildPalette({paletteEl, colors: getActiveColors(), activeColor, getColorName: PM.getColorName, onColor(color) { activeColor = color; setStatus(`Color activo: ${color}`); }});
}

function buildAssetSelect() {
  window.PaintMeEditorUI.buildAssetSelect({assetSelect, visibleAssets, currentAsset, setStatus, emptyText: "No hay dibujos disponibles."});
}

function createFillWorker() {
  if (typeof Worker !== "function") return null;

  try {
    const worker = new Worker("paint-worker.js?v=20261007-2");
    worker.addEventListener("error", (event) => {
      event.preventDefault();
      if (fillWorker === worker) fillWorker = null;
      worker.terminate();
    });
    return worker;
  } catch {
    return null;
  }
}

function getCategoryLabel(category) {
  return PM.getCategoryLabel?.(category) || CATEGORY_LABELS[category] || "Dibujos";
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
  const disabled = !isImageLoaded || editorIsBusy();
  undoBtn.disabled = disabled || undoStack.length === 0;
  undoBtn.textContent = undoStack.length && undoStack[undoStack.length - 1] === resetUndoSnapshot ? "Recuperar reinicio" : "Deshacer";
  redoBtn.disabled = disabled || history.future.length === 0;
  resetBtn.disabled = disabled;
  document.getElementById("printDrawingBtn").disabled = disabled;
  saveBtn.disabled = disabled;
  if (restoreBtn) restoreBtn.disabled = disabled;
  if (retrySaveBtn) retrySaveBtn.disabled = disabled;
  if (pngPreviewBtn) pngPreviewBtn.disabled = disabled;
}

function updateZoomUi() {
  if (zoomResetBtn) {
    zoomResetBtn.disabled = zoomLevel <= 1;
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
  const maxDisplayHeight = Math.min(window.innerHeight * (window.innerWidth <= 900 ? (window.innerHeight < 500 ? 0.4 : 0.3) : 0.65), 720);
  const baseScale = Math.min(
    innerWidth / canvas.width,
    maxDisplayWidth / canvas.width,
    Math.max(96, maxDisplayHeight - paddingY) / canvas.height
  );
  const scale = Math.max(0.1, baseScale) * zoomLevel;
  const displayWidth = Math.round(canvas.width * scale);
  const displayHeight = Math.round(canvas.height * scale);
  canvas.style.width = `${displayWidth}px`;
  canvas.style.height = `${displayHeight}px`;
  updateZoomUi();
}

function setZoom(nextZoom, focalPoint = null) {
  const previousRect = focalPoint ? canvas.getBoundingClientRect() : null;
  const focusRatio = previousRect
    ? {
        x: (focalPoint.x - previousRect.left) / previousRect.width,
        y: (focalPoint.y - previousRect.top) / previousRect.height,
      }
    : null;

  zoomLevel = Math.min(3, Math.max(1, nextZoom));
  fitCanvasToContainer();

  if (!canvasWrap || !focusRatio) return;

  const nextRect = canvas.getBoundingClientRect();
  const targetX = nextRect.left + nextRect.width * focusRatio.x;
  const targetY = nextRect.top + nextRect.height * focusRatio.y;
  canvasWrap.scrollLeft += targetX - focalPoint.x;
  canvasWrap.scrollTop += targetY - focalPoint.y;
}

function resetZoom() {
  setZoom(1);
  if (!canvasWrap) return;
  canvasWrap.scrollLeft = 0;
  canvasWrap.scrollTop = 0;
}

function getPinchPoints() {
  return Array.from(activePointers.values()).slice(0, 2);
}

function getDistance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function getCenter(a, b) {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
  };
}

function beginPinch() {
  if (activePointers.size < 2) return;
  pendingFillPointerId = null;
  pendingFillPoint = null;
  const [first, second] = getPinchPoints();
  pinchStartDistance = getDistance(first, second);
  pinchStartZoom = zoomLevel;
  pinchStartCenter = getCenter(first, second);
  pinchStartScroll = canvasWrap
    ? { left: canvasWrap.scrollLeft, top: canvasWrap.scrollTop }
    : null;
  isPinching = pinchStartDistance > 0;
}

function updatePinch() {
  if (!isPinching || activePointers.size < 2 || pinchStartDistance <= 0) return;
  const [first, second] = getPinchPoints();
  const center = getCenter(first, second);
  const nextZoom = pinchStartZoom * (getDistance(first, second) / pinchStartDistance);
  setZoom(nextZoom, center);
}

function trackPointer(event) {
  activePointers.set(event.pointerId, {
    x: event.clientX,
    y: event.clientY,
  });
}

function releasePointer(event) {
  activePointers.delete(event.pointerId);
  if (activePointers.size < 2) {
    isPinching = false;
    pinchStartDistance = 0;
    pinchStartCenter = null;
    pinchStartScroll = null;
  }
}

function fillAtPoint(point) {
  if (!point || editorIsBusy() || !isImageLoaded) return;
  const fillColor = hexToRgba(activeColor);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  if (!canStartFill(imageData, point.x, point.y, fillColor, TOLERANCE)) return;
  drawingRevision += 1;
  pushUndo();
  if (floodFillAsync(point.x, point.y, fillColor, TOLERANCE, imageData)) {
    markFirstPaint();
    setUnsavedChanges(true);
  }
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
  history.push(snapshot);
  updateUndoButton();
}

function undo() {
  if (undoStack.length === 0 || !isImageLoaded || editorIsBusy()) return;
  const prev = history.undo(ctx.getImageData(0, 0, canvas.width, canvas.height));
  ctx.putImageData(prev, 0, 0);
  setUnsavedChanges(!isCanvasPristine());
  scheduleAutosave();
  updateUndoButton();
}

function redo() {
  if (!history.future.length || !isImageLoaded || editorIsBusy()) return;
  const next = history.redo(ctx.getImageData(0, 0, canvas.width, canvas.height));
  ctx.putImageData(next, 0, 0);
  setUnsavedChanges(!isCanvasPristine());
  scheduleAutosave();
  updateUndoButton();
}

async function reset() {
  if (!isImageLoaded || editorIsBusy()) return;
  switchingAsset = true;
  const slug = currentAsset.slug;
  const revision = drawingRevision;
  updateNavigationState();
  try {
    const confirmed = await PM.confirmReset(resetDialog);
    if (!confirmed || currentAsset?.slug !== slug || revision !== drawingRevision) return;
    restoreRequestId += 1;
    drawingRevision += 1;
    await autosave.cancel();
    pushUndo();
    resetUndoSnapshot = undoStack[undoStack.length - 1];
    ctx.putImageData(originalImageData, 0, 0);
    const cleared = await PM.clearLocalDrawing("bucket", slug);
    setUnsavedChanges(!cleared);
    setSaveState(cleared ? "idle" : "error", cleared ? "Dibujo reiniciado. Recupera la obra anterior con Deshacer." : "No pudimos borrar la copia guardada. Puedes recuperar el dibujo anterior con Deshacer.");
    setStatus(cleared ? "Dibujo reiniciado. Puedes recuperarlo con Deshacer." : "No pudimos borrar la copia guardada.");
    await updateRestoreButton();
  } finally {
    switchingAsset = false;
    updateNavigationState();
    resetBtn.focus({ preventScroll: true });
  }
}

async function save() {
  if (!isImageLoaded || editorIsBusy()) return;
  const request = ++exportRequestId;
  const slug = currentAsset.slug;
  const revision = drawingRevision;
  const loadId = imageLoadRequestId;
  const payload = getTrackingPayload();
  const filename = slug + '.png';
  const current = () => request === exportRequestId && currentAsset?.slug === slug && revision === drawingRevision && loadId === imageLoadRequestId;
  exportInProgress = true;
  exportPreviewSnapshot = null;
  pngPreviewBtn.hidden = true;
  exportStatus.dataset.state = "preparing";
  exportStatus.textContent = "Preparando PNG…";
  updateNavigationState();
  try {
    const snapshot = PM.createCanvasSnapshot(canvas);
    exportPreviewSnapshot = snapshot;
    exportPreviewFilename = filename;
    const blob = await PM.canvasToPngBlob(snapshot);
    if (!current()) return;
    PM.downloadPngBlob(blob, filename);
    pngPreviewBtn.hidden = false;
    exportStatus.dataset.state = "ready";
    exportStatus.textContent = "PNG preparado para descargar. Revisa las descargas de tu navegador.";
    trackProductEvent("save_png", { ...payload, export_result: "download_requested" });
  } catch {
    if (!current()) return;
    let previewAvailable = false;
    trackProductEvent("export_failure", {...getTrackingPayload(), result: "failure", reason: "encoding", export_result: "encoding_failed"});
    try { previewAvailable = Boolean(exportPreviewSnapshot?.toDataURL("image/png")); } catch {}
    pngPreviewBtn.hidden = !previewAvailable;
    exportStatus.dataset.state = "error";
    exportStatus.textContent = previewAvailable
      ? "No pudimos preparar la descarga. Usa Ver PNG para guardar o vuelve a intentarlo."
      : "No pudimos preparar el PNG. Intenta de nuevo; tu dibujo sigue en el editor.";
  } finally {
    if (request === exportRequestId) {
      if (!current()) {
        exportPreviewSnapshot = null;
        pngPreviewBtn.hidden = true;
        exportStatus.dataset.state = "cancelled";
        exportStatus.textContent = "El dibujo cambió. Descarga su versión actual.";
      }
      exportInProgress = false;
      updateNavigationState();
    }
  }
}

function openPngPreview() {
  if (!exportPreviewSnapshot || editorIsBusy()) return;
  try {
    const dataUrl = exportPreviewSnapshot.toDataURL("image/png");
    const dialog = document.getElementById("pngPreviewDialog");
    const image = document.getElementById("pngPreviewImage");
    const link = document.getElementById("pngFallbackDownload");
    image.src = link.href = dataUrl;
    link.download = exportPreviewFilename;
    dialog.showModal();
  } catch {
    exportStatus.dataset.state = "error";
    exportStatus.textContent = "No se pudo abrir la vista previa. Intenta descargar de nuevo.";
  }
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
  if (fillInProgress || switchingAsset || restoringDrawing || exportInProgress) return false;
  const workingImageData = imageData || ctx.getImageData(0, 0, canvas.width, canvas.height);
  const task = PaintMeFill.createTask({
    width: workingImageData.width, height: workingImageData.height,
    startX, startY, fillColor, tolerance, lineMask, buffer: workingImageData.data.buffer,
  });
  if (!task || task.done) return false;
  const request = ++fillRequestId;
  const slug = currentAsset?.slug;
  const revision = drawingRevision;
  const loadId = imageLoadRequestId;
  const current = () => request === fillRequestId && currentAsset?.slug === slug && revision === drawingRevision && loadId === imageLoadRequestId && isImageLoaded;
  fillInProgress = true;
  setStatus("Pintando…");
  updateNavigationState();
  const step = () => {
    if (!current()) {
      if (request === fillRequestId) { fillInProgress = false; updateNavigationState(); }
      return;
    }
    try {
      const done = task.step(30000);
      ctx.putImageData(workingImageData, 0, 0);
      if (!done) requestAnimationFrame(step);
      else {
        fillInProgress = false;
        scheduleAutosave();
        updateNavigationState();
      }
    } catch {
      fillInProgress = false;
      setStatus("No se pudo completar el relleno. Puedes deshacer e intentarlo de nuevo.");
      updateNavigationState();
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
  history.clear();
  resetUndoSnapshot = null;
  isImageLoaded = true;
  drawingOpenedAt = performance.now();
  trackProductEvent("drawing_open", getTrackingPayload({result: "success"}));
  hasPaintedCurrentAsset = false;
  setUnsavedChanges(false);
  setSaveState("idle");
  zoomLevel = 1;
  resetZoom();
  updateUndoButton();
  setStatus(`Color activo: ${activeColor}`);
  scheduleFit();
  updateContext();
  syncUrl();
  syncAssetSurface();
}

async function loadImage(src) {
  const requestId = ++imageLoadRequestId;
  imageLoadAbort?.abort();
  const controller = new AbortController();
  imageLoadAbort = controller;
  const loadTimeout = setTimeout(() => controller.abort(), 10000);
  const waitForDecode = (promise) => new Promise((resolve, reject) => {
    const abort = () => reject(new Error("image_load_timeout"));
    controller.signal.addEventListener("abort", abort, { once: true });
    if (controller.signal.aborted) abort();
    Promise.resolve(promise).then((value) => {
      if (controller.signal.aborted) {
        value?.close?.();
        reject(new Error("image_load_timeout"));
      } else resolve(value);
    }, reject).finally(() => controller.signal.removeEventListener("abort", abort));
  });
  let bitmap;
  isImageLoaded = false;
  setStatus("Cargando imagen...");

  try {
    if (typeof createImageBitmap === "function") {
      const response = await fetch(src, { cache: "force-cache", signal: controller.signal });
      if (!response.ok) {
        throw new Error(`No se pudo descargar ${src}`);
      }
      const blob = await response.blob();
      bitmap = await waitForDecode(createImageBitmap(blob));

      if (requestId !== imageLoadRequestId) return;

      drawLoadedSource(bitmap.width, bitmap.height, (drawWidth, drawHeight) => {
        ctx.drawImage(bitmap, 0, 0, drawWidth, drawHeight);
      });
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.decoding = "async";
    img.fetchPriority = "high";
    img.src = src;
    await waitForDecode(img.decode());

    if (requestId !== imageLoadRequestId) return;

    drawLoadedSource(img.width, img.height, (drawWidth, drawHeight) => {
      ctx.drawImage(img, 0, 0, drawWidth, drawHeight);
    });
  } catch {
    if (requestId !== imageLoadRequestId) return;
    isImageLoaded = false;
    trackProductEvent("drawing_load_failure", getTrackingPayload({result: "failure", reason: "load"}));
    setStatus(
      "No se pudo cargar la imagen. Verifica el archivo seleccionado en /assets/"
    );
  } finally {
    clearTimeout(loadTimeout);
    bitmap?.close?.();
    if (imageLoadAbort === controller) imageLoadAbort = null;
  }
}

function floodFillAsync(startX, startY, fillColor, tolerance, imageData) {
  if (!fillWorker) return floodFillFallback(startX, startY, fillColor, tolerance, imageData);
  if (editorIsBusy() || !isImageLoaded) return false;
  const worker = fillWorker;
  const workingImageData = imageData || ctx.getImageData(0, 0, canvas.width, canvas.height);
  if (!canStartFill(workingImageData, startX, startY, fillColor, tolerance)) return false;
  const requestId = ++fillRequestId;
  const slug = currentAsset?.slug;
  const revision = drawingRevision;
  const loadId = imageLoadRequestId;
  const width = canvas.width, height = canvas.height;
  const current = () => requestId === fillRequestId && currentAsset?.slug === slug && revision === drawingRevision && loadId === imageLoadRequestId && isImageLoaded;
  fillInProgress = true;
  setStatus("Pintando…");
  updateNavigationState();
  let timer;
  const cleanup = () => {
    clearTimeout(timer);
    worker.removeEventListener("message", handleMessage);
    worker.removeEventListener("error", handleError);
    worker.removeEventListener("messageerror", handleError);
  };
  const handleError = (event) => {
    event?.preventDefault?.();
    cleanup();
    worker.terminate();
    if (fillWorker === worker) fillWorker = null;
    if (!current()) {
      if (requestId === fillRequestId) { fillInProgress = false; updateNavigationState(); }
      return false;
    }
    fillInProgress = false;
    // The transferred buffer may be detached; read the unchanged canvas afresh.
    const started = floodFillFallback(startX, startY, fillColor, tolerance);
    if (!started) { setStatus("No se pudo completar el relleno. Intenta de nuevo."); updateNavigationState(); }
    return started;
  };
  const handleMessage = (event) => {
    const { id, buffer, error } = event.data || {};
    if (id !== requestId) return;
    if (!current()) {
      cleanup();
      if (requestId === fillRequestId) { fillInProgress = false; updateNavigationState(); }
      return;
    }
    if (error || !(buffer instanceof ArrayBuffer) || buffer.byteLength !== width * height * 4) { handleError(); return; }
    cleanup();
    try {
      ctx.putImageData(new ImageData(new Uint8ClampedArray(buffer), width, height), 0, 0);
      fillInProgress = false;
      scheduleAutosave();
      updateNavigationState();
    } catch { handleError(); }
  };
  timer = setTimeout(handleError, 8000);
  worker.addEventListener("message", handleMessage);
  worker.addEventListener("error", handleError);
  worker.addEventListener("messageerror", handleError);
  try {
    worker.postMessage({
      id: requestId, width, height, startX, startY, fillColor, tolerance, lineMask,
      buffer: workingImageData.data.buffer,
    }, [workingImageData.data.buffer]);
  } catch { return handleError(); }
  return true;
}

async function selectAssetBySlug(slug, source = "select") {
  const selected = visibleAssets.find((asset) => asset.slug === slug);
  if (!selected || editorIsBusy()) {
    syncAssetSurface();
    return false;
  }
  if (isImageLoaded && currentAsset?.slug === slug) {
    syncAssetSurface();
    return true;
  }
  switchingAsset = true;
  restoreRequestId += 1;
  updateNavigationState();
  const captured = !hasUnsavedChanges || scheduleAutosave();
  const saved = await autosave.flush();
  if (!captured || (!saved && hasUnsavedChanges)) {
    switchingAsset = false;
    updateNavigationState();
    syncAssetSurface();
    setStatus("No pudimos guardar. Descarga el PNG antes de cambiar de dibujo.");
    return false;
  }
  currentAsset = selected;
  drawingRevision += 1;
  assetSelect.value = selected.slug || selected.src;
  syncAssetSurface();
  trackProductEvent("asset_selected", getTrackingPayload({ source }));
  await loadImage(selected.src);
  switchingAsset = false;
  updateNavigationState();
  updateRestoreButton();
  return true;
}

async function changeCategory(category) {
  if (editorIsBusy()) return;
  const previousCategory = activeCategory;
  const previousAssets = visibleAssets;
  activeCategory = category;
  visibleAssets = getVisibleAssets();
  const selected = visibleAssets.find((asset) => asset.slug === currentAsset?.slug)
    || visibleAssets.find((asset) => asset.featured) || visibleAssets[0];
  if (selected && !(await selectAssetBySlug(selected.slug, "gallery"))) {
    activeCategory = previousCategory;
    visibleAssets = previousAssets;
  }
  buildAssetSelect();
  refreshGalleryIfBuilt();
  updateContext();
  syncUrl();
  updateNavigationState();
}

function clearCategoryFilter() { return changeCategory(""); }

canvas.addEventListener("pointerdown", (event) => {
  if (editorIsBusy()) return;
  event.preventDefault();
  canvas.setPointerCapture?.(event.pointerId);
  trackPointer(event);

  if (activePointers.size >= 2) {
    beginPinch();
    return;
  }

  if (isPinching) return;

  if (!isImageLoaded) {
    setStatus("La imagen aún está cargando...");
    return;
  }
  const point = getCanvasPoint(event);
  if (!point) return;
  pendingFillPointerId = event.pointerId;
  pendingFillPoint = point;
});

canvas.addEventListener("pointermove", (event) => {
  if (!activePointers.has(event.pointerId)) return;
  event.preventDefault();
  trackPointer(event);

  if (
    pendingFillPointerId === event.pointerId &&
    !isPinching &&
    activePointers.size === 1
  ) {
    pendingFillPoint = getCanvasPoint(event);
  }

  updatePinch();
});

canvas.addEventListener("pointerup", (event) => {
  const shouldFill =
    pendingFillPointerId === event.pointerId &&
    pendingFillPoint &&
    !isPinching &&
    activePointers.size === 1;

  canvas.releasePointerCapture?.(event.pointerId);
  releasePointer(event);

  if (shouldFill) {
    fillAtPoint(pendingFillPoint);
  }

  if (pendingFillPointerId === event.pointerId) {
    pendingFillPointerId = null;
    pendingFillPoint = null;
  }
});

canvas.addEventListener("pointercancel", (event) => {
  canvas.releasePointerCapture?.(event.pointerId);
  releasePointer(event);
  if (pendingFillPointerId === event.pointerId) {
    pendingFillPointerId = null;
    pendingFillPoint = null;
  }
});

canvas.addEventListener("pointerleave", (event) => {
  releasePointer(event);
  if (pendingFillPointerId === event.pointerId) {
    pendingFillPointerId = null;
    pendingFillPoint = null;
  }
});

assetSelect.addEventListener("change", () => {
  selectAssetBySlug(assetSelect.value, "select");
});

assetSearch?.addEventListener("input", () => {
  ensureGalleryBuilt();
  buildGallery();
});

galleryBrowser?.addEventListener("toggle", () => {
  if (galleryBrowser.open) { ensureGalleryBuilt(); refreshSavedGallery(); }
});

paletteSelect?.addEventListener("change", () => {
  activePalette = paletteSelect.value;
  activeColor = getActiveColors()[0] || activeColor;
  buildPalette();
  trackProductEvent("palette_selected", getTrackingPayload({ palette_name: activePalette }));
  setStatus(`Color activo: ${activeColor}`);
});

customColorInput?.addEventListener("input", () => {
  activeColor = customColorInput.value;
  document
    .querySelectorAll(".color-swatch")
    .forEach((el) => { el.classList.remove("active"); el.setAttribute("aria-pressed", "false"); });
  trackProductEvent("custom_color_used", getTrackingPayload());
  setStatus(`Color activo: ${activeColor}`);
});

undoBtn.addEventListener("click", undo);
redoBtn.addEventListener("click", redo);
resetBtn.addEventListener("click", reset);
saveBtn.addEventListener("click", save);
nextBtn?.addEventListener("click", () => goToRelativeAsset("next"));
surpriseBtn?.addEventListener("click", () => goToRelativeAsset("surprise"));
restoreBtn?.addEventListener("click", restoreSavedDrawing);
retrySaveBtn?.addEventListener("click", retryLocalSave);
pngPreviewBtn?.addEventListener("click", openPngPreview);

if (allBtn) {
  allBtn.addEventListener("click", clearCategoryFilter);
}

zoomResetBtn?.addEventListener("click", () => {
  resetZoom();
});

buildPaletteOptions();
buildPalette();
buildAssetSelect();
updateContext();
normalizeInitialUrlState();
if (currentAsset) {
  selectAssetBySlug(currentAsset.slug, PM.getSource?.() || "direct");
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

  flushOnLeave();
  const exitMessage = "Tienes cambios sin guardar. Si sales ahora, perderás tu dibujo. ¿Quieres salir?";
  const shouldLeave = window.confirm(window.PaintMeI18n?.t(exitMessage) || exitMessage);

  if (shouldLeave) {
    allowExitAfterConfirm = true;
    exitGuardActive = false;
    window.history.back();
    return;
  }

  window.history.pushState({ paintExitGuard: true }, "", window.location.href);
});

let savedGalleryRequest = 0;
async function refreshSavedGallery() {
  const request = ++savedGalleryRequest;
  const gallery = document.getElementById("savedGallery");
  const message = document.getElementById("savedGalleryStatus");
  gallery.replaceChildren();
  message.textContent = "Buscando copias en este dispositivo…";
  const result = await PM.listLocalDrawings("bucket", ASSETS_LIST);
  if (request !== savedGalleryRequest) return;
  message.textContent = result.items.length ? `${result.items.length} copias locales disponibles.` : result.readable ? "Todavía no hay dibujos guardados en este modo." : "No pudimos consultar el almacenamiento. Puedes seguir pintando.";
  for (const { asset, record } of result.items) {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "asset-card saved-card";
    card.dataset.slug = asset.slug;
    const preview = document.createElement("img");
    preview.src = record.dataUrl;
    preview.alt = "";
    preview.loading = "lazy";
    const label = document.createElement("span");
    label.textContent = `Continuar ${asset.label}`;
    preview.addEventListener("error", () => { preview.hidden = true; card.disabled = true; card.dataset.unreadable = "true"; label.textContent = `Copia no legible: ${asset.label}`; });
    card.append(preview, label);
    card.addEventListener("click", async () => {
      if (editorIsBusy()) return;
      if (!visibleAssets.some((candidate) => candidate.slug === asset.slug)) await changeCategory(asset.category);
      if (await selectAssetBySlug(asset.slug, "continue")) await restoreSavedDrawing();
    });
    gallery.appendChild(card);
  }
  updateNavigationState();
}

async function printDrawing() {
  if (!isImageLoaded || editorIsBusy()) return;
  exportInProgress = true;
  updateNavigationState();
  try {
    const snapshot = PM.createCanvasSnapshot(canvas);
    const dataUrl = snapshot.toDataURL("image/png");
    await PM.decodeSavedPng(dataUrl);
    const preview = document.getElementById("printPreviewImage");
    preview.src = dataUrl;
    await preview.decode();
    window.print();
  } catch {
    exportStatus.dataset.state = "error";
    exportStatus.textContent = "No pudimos preparar la impresión. Puedes descargar el PNG.";
  } finally {
    exportInProgress = false;
    updateNavigationState();
  }
}
document.getElementById("printDrawingBtn").addEventListener("click", printDrawing);
