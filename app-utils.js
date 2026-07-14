const PaintMe = (() => {
  const CATEGORY_LABELS = {
    animales: "Animales",
    vehiculos: "Vehículos",
    navidad: "Navidad",
    fantasia: "Fantasía",
    dinosaurios: "Dinosaurios",
    princesas: "Princesas",
  };

  const PALETTES = {
    base: {
      label: "Base",
      colors: [
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
      ],
    },
    pastel: {
      label: "Pastel",
      colors: [
        "#ffb3ba",
        "#ffdfba",
        "#ffffba",
        "#baffc9",
        "#bae1ff",
        "#d8b4fe",
        "#f9a8d4",
        "#c7d2fe",
        "#bbf7d0",
        "#fde68a",
        "#fed7aa",
        "#e5e7eb",
      ],
    },
    naturaleza: {
      label: "Naturaleza",
      colors: [
        "#2e7d32",
        "#66bb6a",
        "#a5d6a7",
        "#8d6e63",
        "#bcaaa4",
        "#ffb74d",
        "#fff176",
        "#4fc3f7",
        "#0288d1",
        "#7e57c2",
        "#ef5350",
        "#78909c",
      ],
    },
    brillante: {
      label: "Brillante",
      colors: [
        "#ff1744",
        "#f50057",
        "#d500f9",
        "#651fff",
        "#2979ff",
        "#00b0ff",
        "#00e676",
        "#76ff03",
        "#ffea00",
        "#ff9100",
        "#ff3d00",
        "#00e5ff",
      ],
    },
  };

  const PACKS = {
    animales: {
      slug: "animales",
      label: "Animales para colorear",
      description: "Dibujos de animales tiernos para pintar online gratis.",
      category: "animales",
      featuredAssets: ["gato", "perro", "elefante", "conejo", "pez", "buho"],
    },
    vehiculos: {
      slug: "vehiculos",
      label: "Vehículos para colorear",
      description: "Autos, aviones, barcos, trenes y cohetes listos para pintar.",
      category: "vehiculos",
      featuredAssets: ["auto", "cohete", "camion", "avion", "barco", "tren"],
    },
    navidad: {
      slug: "navidad",
      label: "Navidad para colorear",
      description: "Dibujos navideños para pintar en familia.",
      category: "navidad",
      featuredAssets: ["arbol-navidad", "muneco-nieve", "regalo-navidad", "campana-navidad"],
    },
    fantasia: {
      slug: "fantasia",
      label: "Fantasía para colorear",
      description: "Unicornios, castillos, hadas, dragones y sirenas para colorear.",
      category: "fantasia",
      featuredAssets: ["unicornio", "castillo", "dragon", "hada", "sirena"],
    },
    dinosaurios: {
      slug: "dinosaurios",
      label: "Dinosaurios para colorear",
      description: "Dinosaurios amigables para pintar con balde o pincel.",
      category: "dinosaurios",
      featuredAssets: ["dinosaurio", "triceratops", "brontosaurio", "pterodactilo"],
    },
    princesas: {
      slug: "princesas",
      label: "Princesas para colorear",
      description: "Princesas, coronas, vestidos y carruajes para colorear.",
      category: "princesas",
      featuredAssets: ["princesa", "corona-real", "carruaje-real", "vestido-princesa"],
    },
  };

  function trackEvent(name, params = {}) {
    if (typeof window.gtag !== "function") return;
    window.gtag("event", name, params);
  }

  function getCategoryLabel(category) {
    return CATEGORY_LABELS[category] || "Dibujos";
  }

  function getAssetText(asset) {
    return [
      asset.label,
      asset.slug,
      asset.category,
      asset.description,
      ...(Array.isArray(asset.keywords) ? asset.keywords : []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
  }

  function filterAssets(assets, category, query) {
    const normalizedQuery = String(query || "").trim().toLowerCase();
    return assets.filter((asset) => {
      const matchesCategory = !category || asset.category === category;
      const matchesQuery = !normalizedQuery || getAssetText(asset).includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }

  function getNextAsset(assets, currentAsset) {
    if (!assets.length) return null;
    const currentIndex = assets.findIndex((asset) => asset.slug === currentAsset?.slug);
    return assets[(currentIndex + 1 + assets.length) % assets.length];
  }

  function getRandomAsset(assets, currentAsset) {
    if (!assets.length) return null;
    if (assets.length === 1) return assets[0];
    const candidates = assets.filter((asset) => asset.slug !== currentAsset?.slug);
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  function getSource() {
    const params = new URL(window.location.href).searchParams;
    return params.get("source") || params.get("from") || "direct";
  }

  function getAutosaveKey(mode, assetSlug) {
    return `paintme_autosave_v1:${mode}:${assetSlug}`;
  }

  function saveLocalDrawing(mode, assetSlug, dataUrl) {
    if (!mode || !assetSlug || !dataUrl) return false;
    try {
      localStorage.setItem(
        getAutosaveKey(mode, assetSlug),
        JSON.stringify({ dataUrl, updatedAt: Date.now() })
      );
      return true;
    } catch {
      return false;
    }
  }

  function loadLocalDrawing(mode, assetSlug) {
    if (!mode || !assetSlug) return null;
    try {
      const raw = localStorage.getItem(getAutosaveKey(mode, assetSlug));
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return typeof parsed?.dataUrl === "string" ? parsed : null;
    } catch {
      return null;
    }
  }

  function clearLocalDrawing(mode, assetSlug) {
    if (!mode || !assetSlug) return;
    try {
      localStorage.removeItem(getAutosaveKey(mode, assetSlug));
    } catch {}
  }

  window.PACKS = PACKS;

  return {
    CATEGORY_LABELS,
    PALETTES,
    PACKS,
    trackEvent,
    getCategoryLabel,
    filterAssets,
    getNextAsset,
    getRandomAsset,
    getSource,
    saveLocalDrawing,
    loadLocalDrawing,
    clearLocalDrawing,
  };
})();
