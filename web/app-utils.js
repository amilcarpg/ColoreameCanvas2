const PaintMe = window.PaintMe = (() => {
  const CATEGORY_LABELS = window.PaintMeCatalog?.categories || {
    animales: "Animales",
    vehiculos: "Vehículos",
    navidad: "Navidad",
    fantasia: "Fantasía",
    dinosaurios: "Dinosaurios",
    princesas: "Princesas",
    gabby: "Gabby",
    casas: "Casas",
    paisajes: "Paisajes",
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
    gabby: {
      slug: "gabby",
      label: "Gabby para colorear",
      description: "Dibujos de Gabby y sus amigos para pintar online.",
      category: "gabby",
      featuredAssets: ["gabby-gato-volador", "gabby-pintando", "gabby-gato-espacial", "gabby-amigos", "gabby-cumpleanos", "gabby-casa-magica"],
    },
  };

  function trackEvent(name, params = {}) {
    return window.PaintMeAnalytics?.track(name, params) || false;
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

  const COLOR_NAMES = [
    "Rojo", "Rosa", "Morado", "Índigo", "Azul", "Turquesa", "Verde", "Amarillo claro", "Amarillo", "Naranja", "Marrón", "Gris azulado",
    "Rosa pastel", "Melocotón", "Amarillo pastel", "Menta", "Azul pastel", "Lavanda", "Rosa suave", "Índigo pastel", "Verde pastel", "Amarillo suave", "Naranja pastel", "Gris claro",
    "Verde oscuro", "Verde", "Verde claro", "Marrón", "Marrón claro", "Naranja suave", "Amarillo claro", "Azul cielo", "Azul profundo", "Violeta", "Rojo", "Gris azulado",
    "Rojo vivo", "Rosa vivo", "Morado vivo", "Violeta oscuro", "Azul vivo", "Azul celeste", "Verde vivo", "Verde lima", "Amarillo vivo", "Naranja vivo", "Naranja rojizo", "Turquesa vivo",
  ];
  function getColorName(color) {
    const colors = Object.values(PALETTES).flatMap((palette) => palette.colors);
    const index = colors.indexOf(String(color).toLowerCase());
    return index < 0 ? `Color personalizado ${color}` : COLOR_NAMES[index];
  }

  function createHistory(maxSteps, maxBytes) {
    const past = [], future = [];
    const bytes = () => [...past, ...future].reduce((total, image) => total + image.data.byteLength, 0);
    const trim = () => {
      while (past.length + future.length > maxSteps || bytes() > maxBytes) {
        if (past.length) past.shift(); else future.shift();
      }
    };
    return {
      past, future, bytes,
      push(image) { future.length = 0; past.push(image); trim(); },
      undo(current) { if (!past.length) return null; const previous = past.pop(); future.push(current); trim(); return previous; },
      redo(current) { if (!future.length) return null; const next = future.pop(); past.push(current); trim(); return next; },
      cancelEdit() { return past.pop(); },
      clear() { past.length = future.length = 0; },
    };
  }

  async function listLocalDrawings(mode, assets) {
    const prefix = `paintme_autosave_v1:${mode}:`;
    const records = new Map();
    const stored = await runAutosaveTransaction("readonly", (store, resolve) => {
      const entries = [];
      const cursor = store.openCursor();
      cursor.onsuccess = () => {
        const item = cursor.result;
        if (!item) { resolve(entries); return; }
        if (String(item.key).startsWith(prefix)) entries.push([item.key, item.value]);
        item.continue();
      };
    });
    if (stored) for (const [key, value] of stored) records.set(key, normalizeRecord(value));
    let backupReadable = false;
    try {
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key?.startsWith(prefix)) records.set(key, newest(records.get(key), readBackup(key)));
      }
      backupReadable = true;
    } catch {}
    const items = assets.map((asset) => ({ asset, record: records.get(prefix + asset.slug) }))
      .filter(({ record }) => record && !record.deleted && record.dataUrl?.startsWith("data:image/png;base64,"))
      .sort((a, b) => b.record.updatedAt - a.record.updatedAt).slice(0, 12);
    return { items, readable: Boolean(stored) || backupReadable };
  }

  function getSource() {
    const params = new URL(window.location.href).searchParams;
    return window.PaintMeEvents?.source(params.get("source") || params.get("from")) || "direct";
  }

  function getAutosaveKey(mode, assetSlug) {
    return `paintme_autosave_v1:${mode}:${assetSlug}`;
  }

  const AUTOSAVE_DATABASE = "paintme-autosaves";
  const AUTOSAVE_STORE = "drawings";
  const storageQueues = new Map();
  let lastTimestamp = 0;

  function validKey(mode, slug) {
    return ["bucket", "brush"].includes(mode) && typeof slug === "string" && /^[a-z0-9-]{1,64}$/.test(slug);
  }

  function normalizeRecord(record) {
    if (!record || (record.deleted !== true && (typeof record.dataUrl !== "string" || !record.dataUrl))) return null;
    return { ...record, updatedAt: Number.isSafeInteger(record.updatedAt) && record.updatedAt >= 0 ? record.updatedAt : 0 };
  }

  function newest(first, second) {
    if (!first) return second;
    if (!second) return first;
    return second.updatedAt >= first.updatedAt ? second : first;
  }

  function readBackup(key) {
    try { return normalizeRecord(JSON.parse(window.localStorage.getItem(key))); }
    catch { return null; }
  }

  function makeRecord(key, dataUrl, deleted = false) {
    lastTimestamp = Math.max(Date.now(), lastTimestamp + 1, (readBackup(key)?.updatedAt || 0) + 1);
    return deleted ? { deleted: true, updatedAt: lastTimestamp } : { dataUrl, updatedAt: lastTimestamp };
  }

  function writeBackup(key, record) {
    try {
      const backup = readBackup(key);
      if (!backup || backup.updatedAt <= record.updatedAt) window.localStorage.setItem(key, JSON.stringify(record));
      return true;
    } catch { return false; }
  }

  function openAutosaveDatabase() {
    if (!("indexedDB" in window)) return Promise.resolve(null);
    return new Promise((resolve) => {
      let settled = false;
      const finish = (database) => {
        if (settled) { try { database?.close(); } catch {} return; }
        settled = true;
        clearTimeout(timer);
        resolve(database);
      };
      const timer = setTimeout(() => finish(null), 1500);
      try {
        const request = window.indexedDB.open(AUTOSAVE_DATABASE, 1);
        request.onupgradeneeded = () => {
          try {
            if (!request.result.objectStoreNames.contains(AUTOSAVE_STORE)) request.result.createObjectStore(AUTOSAVE_STORE);
          } catch { try { request.transaction?.abort(); } catch {} finish(null); }
        };
        request.onsuccess = () => {
          request.result.onversionchange = () => request.result.close();
          finish(request.result);
        };
        request.onerror = request.onblocked = () => finish(null);
      } catch { finish(null); }
    });
  }

  async function runAutosaveTransaction(mode, operation) {
    const database = await openAutosaveDatabase();
    if (!database) return null;
    return new Promise((resolve) => {
      let result = null;
      let settled = false;
      let transaction;
      const finish = (value) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        try { database.close(); } catch {}
        resolve(value);
      };
      const timer = setTimeout(() => {
        try { transaction?.abort(); } catch {}
        finish(null);
      }, 2500);
      try {
        transaction = database.transaction(AUTOSAVE_STORE, mode);
        transaction.oncomplete = () => finish(result);
        transaction.onerror = transaction.onabort = () => finish(null);
        operation(transaction.objectStore(AUTOSAVE_STORE), (value) => { result = value; }, () => {
          try { transaction.abort(); } catch {}
          finish(null);
        });
      } catch {
        try { transaction?.abort(); } catch {}
        finish(null);
      }
    });
  }

  function enqueueStorage(key, operation) {
    const previous = storageQueues.get(key) || Promise.resolve();
    const next = previous.catch(() => {}).then(operation).catch(() => false);
    storageQueues.set(key, next);
    next.then(() => { if (storageQueues.get(key) === next) storageQueues.delete(key); });
    return next;
  }

  function persistRecord(key, record) {
    return enqueueStorage(key, async () => {
      // A synchronous close backup may have been written while this save waited.
      const candidate = newest(record, readBackup(key));
      const saved = await runAutosaveTransaction("readwrite", (store, resolve, fail) => {
        const request = store.get(key);
        request.onsuccess = () => {
          try {
            const existing = normalizeRecord(request.result);
            if (!existing || existing.updatedAt <= candidate.updatedAt) store.put(candidate, key);
            resolve(true);
          } catch { fail(); }
        };
      });
      if (saved === true) {
        const backup = readBackup(key);
        if (backup && backup.updatedAt <= candidate.updatedAt) {
          try { window.localStorage.removeItem(key); } catch {}
        }
        return true;
      }
      return writeBackup(key, candidate);
    });
  }

  function backupLocalDrawing(mode, slug, dataUrl) {
    if (!validKey(mode, slug) || typeof dataUrl !== "string" || !dataUrl) return false;
    const key = getAutosaveKey(mode, slug);
    return writeBackup(key, makeRecord(key, dataUrl));
  }

  function saveLocalDrawing(mode, slug, dataUrl) {
    if (!validKey(mode, slug) || typeof dataUrl !== "string" || !dataUrl) return Promise.resolve(false);
    const key = getAutosaveKey(mode, slug);
    return persistRecord(key, makeRecord(key, dataUrl));
  }

  async function loadLocalDrawing(mode, slug) {
    if (!validKey(mode, slug)) return null;
    const key = getAutosaveKey(mode, slug);
    const saved = await runAutosaveTransaction("readonly", (store, resolve) => {
      const request = store.get(key);
      request.onsuccess = () => resolve(normalizeRecord(request.result));
    });
    const record = newest(saved, readBackup(key));
    lastTimestamp = Math.max(lastTimestamp, record?.updatedAt || 0);
    // Keep legacy/fallback data until a later confirmed IDB write, never during a read.
    return record?.deleted ? null : record;
  }

  function clearLocalDrawing(mode, slug) {
    if (!validKey(mode, slug)) return Promise.resolve(false);
    const key = getAutosaveKey(mode, slug);
    const record = makeRecord(key, null, true);
    // A tombstone prevents an older IDB copy from resurfacing if deletion fails.
    writeBackup(key, record);
    return persistRecord(key, record);
  }

  function createAutosaveController(mode, onSaved, onSaving) {
    let timer = null;
    let pending = null;
    let latest = null;
    let writes = Promise.resolve(true);
    const flush = () => {
      clearTimeout(timer);
      timer = null;
      const snapshot = pending;
      pending = null;
      if (!snapshot) return writes;
      writes = writes.then(async () => {
        try { onSaving?.(snapshot.slug, snapshot.revision); } catch {}
        const saved = await persistRecord(getAutosaveKey(mode, snapshot.slug), snapshot.record);
        if (saved && latest === snapshot) latest = null;
        try { onSaved?.(saved, snapshot.slug, snapshot.revision); } catch {}
        return saved;
      }).catch(() => {
        try { onSaved?.(false, snapshot.slug, snapshot.revision); } catch {}
        return false;
      });
      return writes;
    };
    return {
      schedule(slug, dataUrl, revision) {
        if (!validKey(mode, slug) || typeof dataUrl !== "string" || !dataUrl) return false;
        if (pending && pending.slug !== slug) flush();
        latest = pending = { slug, revision, record: makeRecord(getAutosaveKey(mode, slug), dataUrl) };
        clearTimeout(timer);
        timer = setTimeout(flush, 450);
        return true;
      },
      flush,
      backup() {
        if (!latest) return true;
        return writeBackup(getAutosaveKey(mode, latest.slug), latest.record);
      },
      cancel() {
        clearTimeout(timer);
        timer = null;
        pending = latest = null;
        return writes;
      },
    };
  }


  function createCanvasSnapshot(source) {
    const snapshot = document.createElement("canvas");
    snapshot.width = source.width;
    snapshot.height = source.height;
    const context = snapshot.getContext("2d");
    if (!context || !source.width || !source.height) throw new Error("invalid_canvas");
    context.drawImage(source, 0, 0);
    return snapshot;
  }

  function canvasToPngBlob(snapshot) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("png_timeout")), 8000);
      const fail = () => { clearTimeout(timer); reject(new Error("png_failed")); };
      try {
        snapshot.toBlob((blob) => {
          clearTimeout(timer);
          if (!blob || blob.size === 0 || blob.type !== "image/png") { fail(); return; }
          resolve(blob);
        }, "image/png");
      } catch { fail(); }
    });
  }

  function downloadPngBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    try {
      link.click();
    } catch (error) {
      URL.revokeObjectURL(url);
      throw error;
    } finally { link.remove(); }
    // Give Safari and other browsers time to consume the download URL.
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }

  function decodeSavedPng(dataUrl) {
    if (typeof dataUrl !== "string" || !dataUrl.startsWith("data:image/png;base64,")) return Promise.reject(new Error("invalid_png"));
    return new Promise((resolve, reject) => {
      const image = new Image();
      let settled = false;
      const finish = (error) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        image.onload = image.onerror = null;
        if (error) reject(error);
        else resolve(image);
      };
      const timer = setTimeout(() => finish(new Error("restore_timeout")), 8000);
      image.onload = () => finish(null);
      image.onerror = () => finish(new Error("invalid_png"));
      image.src = dataUrl;
    });
  }

  function confirmReset(dialog) {
    if (!dialog || typeof dialog.showModal !== "function") return Promise.resolve(window.confirm(window.PaintMeI18n?.t("¿Reiniciar este dibujo? Podrás recuperarlo con Deshacer antes de seguir pintando.") || "¿Reiniciar este dibujo? Podrás recuperarlo con Deshacer antes de seguir pintando."));
    return new Promise((resolve) => {
      const finish = () => resolve(dialog.returnValue === "reset");
      dialog.returnValue = "cancel";
      dialog.addEventListener("close", finish, { once: true });
      try { dialog.showModal(); }
      catch {
        dialog.removeEventListener("close", finish);
        resolve(false);
      }
    });
  }

  function modeDestination(url, asset, category, mode) {
    const destination = new URL(url, window.location.href);
    const current = new URL(window.location.href);
    const target = mode === "bucket" ? "brush.html" : "paint.html";
    if (destination.origin !== current.origin || destination.pathname !== current.pathname.replace(/[^/]+$/, target)) return null;
    if (!validKey(mode, asset?.slug)) return null;
    destination.search = "";
    destination.searchParams.set("asset", asset.slug);
    if (typeof category === "string" && /^[a-z0-9-]{1,64}$/.test(category)) destination.searchParams.set("category", category);
    destination.searchParams.set("source", "mode");
    if (new URL(window.location.href).searchParams.get("lang") === "en") destination.searchParams.set("lang", "en");
    return destination;
  }

  // Both engines keep their own format. Save before leaving and make that distinction explicit.
  function bindEditorNavigation({ mode, getAsset, getCategory, isBusy, setBusy, setStatus, save }) {
    const listener = async (event) => {
      const link = event.target.closest?.("a[href]");
      if (!link || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey ||
          link.hasAttribute("download") || (link.target && link.target !== "_self")) return;
      const destination = new URL(link.href, window.location.href);
      if (!["http:", "https:"].includes(destination.protocol)) return;
      if (destination.href === window.location.href) return;
      event.preventDefault();
      if (isBusy()) { setStatus("Espera a que termine la operación antes de salir."); return; }
      setBusy(true);
      try {
        if (!await save()) { setStatus("No pudimos guardar. Descarga el PNG antes de salir."); return; }
        const nextMode = modeDestination(destination, getAsset(), getCategory(), mode);
        if (nextMode && !window.confirm(window.PaintMeI18n?.t("Tu dibujo está guardado en este dispositivo. Balde y Pincel mantienen trabajos separados para este dibujo; al volver podrás continuar el de esta herramienta. Si quieres un archivo, descarga el PNG antes de cambiar. ¿Cambiar de herramienta?") || "Tu dibujo está guardado en este dispositivo. Balde y Pincel mantienen trabajos separados para este dibujo; al volver podrás continuar el de esta herramienta. Si quieres un archivo, descarga el PNG antes de cambiar. ¿Cambiar de herramienta?")) return;
        window.location.assign((nextMode || destination).href);
      } catch { setStatus("No pudimos preparar la salida. Puedes seguir coloreando y reintentar."); }
      finally { setBusy(false); }
    };
    document.addEventListener("click", listener);
    return () => document.removeEventListener("click", listener);
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
    backupLocalDrawing,
    createAutosaveController,
    createCanvasSnapshot,
    canvasToPngBlob,
    downloadPngBlob,
    decodeSavedPng,
    confirmReset,
    modeDestination,
    bindEditorNavigation,
    getColorName,
    createHistory,
    listLocalDrawings,
  };
})();
