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
const assetSearch = document.getElementById("assetSearch");
const categoryFiltersEl = document.getElementById("categoryFilters");
const assetGallery = document.getElementById("assetGallery");
const paletteSelect = document.getElementById("paletteSelect");
const customColorInput = document.getElementById("customColor");
const restoreBtn = document.getElementById("restoreBtn");
const brushSizeInput = document.getElementById("brushSize");
const brushSizeValue = document.getElementById("brushSizeValue");
const eraserBtn = document.getElementById("eraserBtn");
const undoBtn = document.getElementById("undoBtn");
const resetBtn = document.getElementById("resetBtn");
const saveBtn = document.getElementById("saveBtn");
const nextBtn = document.getElementById("nextBtn");
const surpriseBtn = document.getElementById("surpriseBtn");
const allBtn = document.getElementById("allBtn");
const statusEl = document.getElementById("status");
const canvasWrap = document.querySelector(".canvas-wrap");
const zoomResetBtn = document.getElementById("zoomResetBtn");
const browseNoteEl = document.getElementById("browseNote");
const contextTitleEl = document.getElementById("contextTitle");
const contextMetaEl = document.getElementById("contextMeta");
const appLeadEl = document.getElementById("appLead");
const RAW_ASSETS_LIST = Array.isArray(window.ASSETS) ? window.ASSETS : [];
const ASSETS_LIST = RAW_ASSETS_LIST.filter(isValidPngAssetRecord);
const PM = window.PaintMe || {};
const PALETTES = PM.PALETTES || { base: { label: "Base", colors: COLORS } };
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
let isPinching = false;
let pinchStartDistance = 0;
let pinchStartZoom = 1;
let pinchStartCenter = null;
let pinchStartScroll = null;
let activePalette = "base";
let hasPaintedCurrentAsset = false;
let autosaveTimer = null;
const activePointers = new Map();

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
    mode: "brush",
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
  });
  updateRestoreButton();
}

function buildCategoryFilters() {
  if (!categoryFiltersEl) return;
  categoryFiltersEl.innerHTML = "";
  const categories = ["", ...Array.from(VALID_CATEGORIES)];

  categories.forEach((category) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "category-chip";
    button.textContent = category ? getCategoryLabel(category) : "Todos";
    button.classList.toggle("active", category === activeCategory);
    button.addEventListener("click", () => {
      activeCategory = category;
      visibleAssets = getVisibleAssets();
      currentAsset = visibleAssets.find((asset) => asset.slug === currentAsset?.slug)
        || visibleAssets.find((asset) => asset.featured)
        || visibleAssets[0]
        || null;
      buildAssetSelect();
      buildGallery();
      buildCategoryFilters();
      updateContext();
      if (currentAsset) selectAssetBySlug(currentAsset.slug, "gallery");
    });
    categoryFiltersEl.appendChild(button);
  });
}

function buildGallery() {
  if (!assetGallery) return;
  const assets = getGalleryAssets();
  assetGallery.innerHTML = "";

  if (assets.length === 0) {
    const empty = document.createElement("div");
    empty.className = "browse-note";
    empty.textContent = "No encontramos dibujos con esa búsqueda.";
    assetGallery.appendChild(empty);
    return;
  }

  assets.forEach((asset) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "asset-card";
    button.dataset.slug = asset.slug;
    button.classList.toggle("active", asset.slug === currentAsset?.slug);
    button.setAttribute("aria-label", `Pintar ${asset.label}`);
    const image = document.createElement("img");
    image.src = asset.src;
    image.alt = "";
    image.loading = "lazy";
    const label = document.createElement("span");
    label.textContent = asset.label;
    button.append(image, label);
    button.addEventListener("click", () => selectAssetBySlug(asset.slug, "gallery"));
    assetGallery.appendChild(button);
  });
}

function buildPaletteOptions() {
  if (!paletteSelect) return;
  paletteSelect.innerHTML = "";
  Object.entries(PALETTES).forEach(([key, palette]) => {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = palette.label;
    option.selected = key === activePalette;
    paletteSelect.appendChild(option);
  });
}

function getActiveColors() {
  return PALETTES[activePalette]?.colors || COLORS;
}

async function updateRestoreButton() {
  if (!restoreBtn || !currentAsset) return;
  const slug = currentAsset.slug;
  const saved = await PM.loadLocalDrawing?.("brush", slug);
  if (currentAsset?.slug === slug) restoreBtn.hidden = !saved;
}

function markFirstPaint() {
  if (hasPaintedCurrentAsset) return;
  hasPaintedCurrentAsset = true;
  trackProductEvent("first_paint", getTrackingPayload());
}

function scheduleAutosave() {
  if (!currentAsset || !isImageLoaded) return;
  window.clearTimeout(autosaveTimer);
  autosaveTimer = window.setTimeout(async () => {
    renderComposite();
    const saved = await PM.saveLocalDrawing?.("brush", currentAsset.slug, canvas.toDataURL("image/png"));
    if (saved) {
      setStatus("Guardado localmente");
      updateRestoreButton();
    } else setStatus("No pudimos guardar este dibujo en el dispositivo.");
  }, 450);
}

async function restoreSavedDrawing() {
  if (!currentAsset) return;
  const saved = await PM.loadLocalDrawing?.("brush", currentAsset.slug);
  if (!saved?.dataUrl) return;
  const image = new Image();
  image.onload = () => {
    paintCtx.clearRect(0, 0, paintLayer.width, paintLayer.height);
    paintCtx.drawImage(image, 0, 0, paintLayer.width, paintLayer.height);
    paintCtx.save();
    paintCtx.globalCompositeOperation = "destination-out";
    paintCtx.drawImage(lineLayer, 0, 0);
    paintCtx.restore();
    undoStack = [];
    setUnsavedChanges(false);
    renderComposite();
    updateUndoButton();
    setStatus("Dibujo restaurado");
    trackProductEvent("return_to_saved", getTrackingPayload());
  };
  image.src = saved.dataUrl;
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
    mode: "brush",
    method,
  });
  selectAssetBySlug(nextAsset.slug, method);
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
  getActiveColors().forEach((color, index) => {
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
  return PM.getCategoryLabel?.(category) || CATEGORY_LABELS[category] || "Dibujos";
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
  if (zoomResetBtn) {
    zoomResetBtn.disabled = zoomLevel <= 1;
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

function cancelStrokeForPinch(pointerId) {
  if (!isDrawing) return;

  const previous = undoStack.pop();
  if (previous) {
    paintCtx.putImageData(previous, 0, 0);
    renderComposite();
    setUnsavedChanges(!isPaintLayerBlank());
  }

  isDrawing = false;
  lastPoint = null;
  if (typeof pointerId === "number") {
    canvas.releasePointerCapture?.(pointerId);
  }
  updateUndoButton();
}

function beginPinch(event) {
  if (activePointers.size < 2) return;
  cancelStrokeForPinch(event?.pointerId);
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
  scheduleAutosave();
  updateUndoButton();
}

async function reset() {
  if (!isImageLoaded) return;
  paintCtx.clearRect(0, 0, paintLayer.width, paintLayer.height);
  undoStack = [];
  setUnsavedChanges(false);
  await PM.clearLocalDrawing?.("brush", currentAsset?.slug);
  await updateRestoreButton();
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
    trackProductEvent("save_png", getTrackingPayload());
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
  canvas.setPointerCapture?.(event.pointerId);
  trackPointer(event);

  if (activePointers.size >= 2) {
    beginPinch(event);
    return;
  }

  if (isPinching) return;

  if (!isImageLoaded) {
    setStatus("La imagen aún está cargando...");
    return;
  }

  const point = getCanvasPoint(event);
  if (!point) return;

  isDrawing = true;
  lastPoint = point;
  pushUndo();
  drawBrushSegment(point, point);
  markFirstPaint();
  setUnsavedChanges(true);
  setStatus(eraseMode ? "Borrando..." : "Pintando con pincel...");
}

function continueStroke(event) {
  if (activePointers.has(event.pointerId)) {
    trackPointer(event);
  }

  if (isPinching) {
    event.preventDefault();
    updatePinch();
    return;
  }

  if (!isDrawing) return;
  event.preventDefault();

  const point = getCanvasPoint(event);
  if (!point || !lastPoint) return;

  drawBrushSegment(lastPoint, point);
  lastPoint = point;
}

function endStroke(event) {
  canvas.releasePointerCapture?.(event.pointerId);
  releasePointer(event);

  if (isDrawing) {
    isDrawing = false;
    lastPoint = null;
    scheduleAutosave();
    setStatus(eraseMode ? "Borrador activo" : `Pincel activo: ${activeColor}`);
    updateUndoButton();
  }
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
  hasPaintedCurrentAsset = false;
  setUnsavedChanges(false);
  zoomLevel = 1;
  resetZoom();
  renderComposite();
  updateUndoButton();
  setStatus(`Pincel activo: ${activeColor}`);
  scheduleFit();
  updateContext();
  syncUrl();
  syncAssetSurface();
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

function selectAssetBySlug(slug, source = "select") {
  const selected = visibleAssets.find((asset) => asset.slug === slug);
  if (!selected) return;
  currentAsset = selected;
  assetSelect.value = selected.slug || selected.src;
  syncAssetSurface();
  trackProductEvent("asset_selected", getTrackingPayload({ source }));
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
  buildGallery();
  buildCategoryFilters();
  updateContext();
  if (currentAsset) {
    selectAssetBySlug(currentAsset.slug, "gallery");
  }
}

canvas.addEventListener("pointerdown", startStroke);
canvas.addEventListener("pointermove", continueStroke);
canvas.addEventListener("pointerup", endStroke);
canvas.addEventListener("pointercancel", endStroke);
canvas.addEventListener("pointerleave", endStroke);

assetSelect.addEventListener("change", () => {
  selectAssetBySlug(assetSelect.value, "select");
});

assetSearch?.addEventListener("input", buildGallery);

paletteSelect?.addEventListener("change", () => {
  activePalette = paletteSelect.value;
  activeColor = getActiveColors()[0] || activeColor;
  eraseMode = false;
  syncToolButtons();
  buildPalette();
  trackProductEvent("palette_selected", getTrackingPayload({ palette_name: activePalette }));
  setStatus(`Pincel activo: ${activeColor}`);
});

customColorInput?.addEventListener("input", () => {
  activeColor = customColorInput.value;
  eraseMode = false;
  syncToolButtons();
  document
    .querySelectorAll(".color-swatch")
    .forEach((el) => el.classList.remove("active"));
  trackProductEvent("custom_color_used", getTrackingPayload());
  setStatus(`Pincel activo: ${activeColor}`);
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
nextBtn?.addEventListener("click", () => goToRelativeAsset("next"));
surpriseBtn?.addEventListener("click", () => goToRelativeAsset("surprise"));
restoreBtn?.addEventListener("click", restoreSavedDrawing);

if (allBtn) {
  allBtn.addEventListener("click", clearCategoryFilter);
}

zoomResetBtn?.addEventListener("click", () => {
  resetZoom();
});

buildPaletteOptions();
buildPalette();
buildAssetSelect();
buildCategoryFilters();
buildGallery();
updateBrushSize();
syncToolButtons();
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
        "adsense",
        "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2193465688766661",
        { crossOrigin: "anonymous" }
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
