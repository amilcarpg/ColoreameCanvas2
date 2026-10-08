// Shared rendering contract; drawing state remains owned by each engine.
window.PaintMeEditorUI = (() => {
function buildCategoryFilters({categoryFiltersEl, VALID_CATEGORIES, activeCategory, getCategoryLabel, changeCategory}) {
  if (!categoryFiltersEl) return;
  categoryFiltersEl.innerHTML = "";
  const categories = ["", ...Array.from(VALID_CATEGORIES)];

  categories.forEach((category) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "category-chip";
    button.textContent = category ? getCategoryLabel(category) : "Todos";
    button.classList.toggle("active", category === activeCategory);
    button.setAttribute("aria-pressed", String(category === activeCategory));
    button.addEventListener("click", () => changeCategory(category));
    categoryFiltersEl.appendChild(button);
  });
}

function buildGallery({assetGallery, getGalleryAssets, currentAsset, selectAssetBySlug}) {
  if (!assetGallery) return;
  const rank = { simple: 0, medio: 1, detallado: 2 };
  const assets = getGalleryAssets().sort((a, b) => (rank[a.difficulty] ?? 3) - (rank[b.difficulty] ?? 3));
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
    const image = document.createElement("img");
    image.src = asset.thumbnailSrc || asset.src;
    image.alt = "";
    image.loading = "lazy";
    const label = document.createElement("span");
    label.textContent = asset.label;
    const detail = document.createElement("small");
    detail.textContent = ({ simple: "Pocos detalles", medio: "Detalle medio", detallado: "Muchos detalles" })[asset.difficulty] || "Nivel por revisar";
    button.append(image, label, detail);
    image.addEventListener("error", () => { image.hidden = true; detail.textContent = "Vista previa no disponible"; });
    button.setAttribute("aria-pressed", String(asset.slug === currentAsset?.slug));
    button.addEventListener("click", () => selectAssetBySlug(asset.slug, "gallery"));
    assetGallery.appendChild(button);
  });
}

function buildPaletteOptions({paletteSelect, PALETTES, activePalette}) {
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

function buildAssetSelect({assetSelect, visibleAssets, currentAsset, setStatus, emptyText}) {
  assetSelect.innerHTML = "";
  if (visibleAssets.length === 0) {
    assetSelect.disabled = true;
    setStatus(emptyText);
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

function buildPalette({paletteEl, colors, activeColor, getColorName, onColor}) {
  paletteEl.innerHTML = "";
  colors.forEach((color) => {
    const swatch = document.createElement("button");
    swatch.type = "button";
    swatch.className = "color-swatch";
    swatch.style.background = color;
    swatch.setAttribute("aria-label", getColorName(color));
    swatch.title = getColorName(color);
    swatch.setAttribute("aria-pressed", String(color === activeColor));
    if (color === activeColor) swatch.classList.add("active");
    swatch.addEventListener("click", () => {
      document
        .querySelectorAll(".color-swatch")
        .forEach((el) => { el.classList.remove("active"); el.setAttribute("aria-pressed", "false"); });
      swatch.classList.add("active");
      swatch.setAttribute("aria-pressed", "true");
      onColor(color);
    });
    paletteEl.appendChild(swatch);
  });
}

return Object.freeze({buildCategoryFilters, buildGallery, buildPaletteOptions, buildAssetSelect, buildPalette});
})();
