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
const assetSearch = document.getElementById("assetSearch");
const categoryFiltersEl = document.getElementById("categoryFilters");
const assetGallery = document.getElementById("assetGallery");
const paletteSelect = document.getElementById("paletteSelect");
const customColorInput = document.getElementById("customColor");
const restoreBtn = document.getElementById("restoreBtn");
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
const ASSETS_LIST = RAW_ASSETS_LIST.filter(isValidAssetRecord);
const PM = window.PaintMe || {};
const PALETTES = PM.PALETTES || { base: { label: "Base", colors: COLORS } };
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
let isPinching = false;
let pinchStartDistance = 0;
let pinchStartZoom = 1;
let pinchStartCenter = null;
let pinchStartScroll = null;
let pendingFillPointerId = null;
let pendingFillPoint = null;
let activePalette = "base";
let hasPaintedCurrentAsset = false;
let autosaveTimer = null;
const activePointers = new Map();
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
    button.setAttribute("aria-label", `Colorear ${asset.label}`);
    button.innerHTML = `<img src="${asset.src}" alt="" loading="lazy" /><span>${asset.label}</span>`;
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

function updateRestoreButton() {
  if (!restoreBtn || !currentAsset) return;
  const saved = PM.loadLocalDrawing?.("bucket", currentAsset.slug);
  restoreBtn.hidden = !saved;
}

function markFirstPaint() {
  if (hasPaintedCurrentAsset) return;
  hasPaintedCurrentAsset = true;
  trackProductEvent("first_paint", getTrackingPayload());
}

function scheduleAutosave() {
  if (!currentAsset || !isImageLoaded) return;
  window.clearTimeout(autosaveTimer);
  autosaveTimer = window.setTimeout(() => {
    const saved = PM.saveLocalDrawing?.("bucket", currentAsset.slug, canvas.toDataURL("image/png"));
    if (saved) {
      setStatus("Guardado localmente");
      updateRestoreButton();
    }
  }, 450);
}

function restoreSavedDrawing() {
  if (!currentAsset) return;
  const saved = PM.loadLocalDrawing?.("bucket", currentAsset.slug);
  if (!saved?.dataUrl) return;
  const image = new Image();
  image.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    undoStack = [];
    setUnsavedChanges(false);
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
  getActiveColors().forEach((color, index) => {
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
  undoBtn.disabled = undoStack.length === 0 || fillInProgress;
  resetBtn.disabled = !originalImageData || fillInProgress;
  saveBtn.disabled = !originalImageData || fillInProgress;
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
  if (!point || fillInProgress || !isImageLoaded) return;
  const fillColor = hexToRgba(activeColor);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  if (!canStartFill(imageData, point.x, point.y, fillColor, TOLERANCE)) return;
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
  scheduleAutosave();
  updateUndoButton();
}

function reset() {
  if (!originalImageData || fillInProgress) return;
  ctx.putImageData(originalImageData, 0, 0);
  undoStack = [];
  setUnsavedChanges(false);
  PM.clearLocalDrawing?.("bucket", currentAsset?.slug);
  updateRestoreButton();
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
    trackProductEvent("save_png", getTrackingPayload());
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
      scheduleAutosave();
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
  hasPaintedCurrentAsset = false;
  setUnsavedChanges(false);
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
    scheduleAutosave();
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

canvas.addEventListener("pointerdown", (event) => {
  if (fillInProgress) return;
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

assetSearch?.addEventListener("input", buildGallery);

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
    .forEach((el) => el.classList.remove("active"));
  trackProductEvent("custom_color_used", getTrackingPayload());
  setStatus(`Color activo: ${activeColor}`);
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
