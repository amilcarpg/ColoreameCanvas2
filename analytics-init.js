window.dataLayer = window.dataLayer || [];

function gtag() {
  window.dataLayer.push(arguments);
}

window.gtag = gtag;

const THIRD_PARTY_SCRIPTS = new Map();

function loadThirdPartyScript(key, src, options = {}) {
  if (!src) return Promise.resolve(null);
  if (THIRD_PARTY_SCRIPTS.has(key)) {
    return THIRD_PARTY_SCRIPTS.get(key);
  }

  const promise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;

    if (options.crossOrigin) {
      script.crossOrigin = options.crossOrigin;
    }

    if (options.attrs) {
      Object.entries(options.attrs).forEach(([name, value]) => {
        script.setAttribute(name, value);
      });
    }

    script.addEventListener("load", () => resolve(script), { once: true });
    script.addEventListener("error", () => reject(new Error(`No se pudo cargar ${src}`)), {
      once: true,
    });
    document.head.appendChild(script);
  });

  THIRD_PARTY_SCRIPTS.set(key, promise);
  return promise;
}

function runWhenIdle(task) {
  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(task, { timeout: 2000 });
    return;
  }

  window.setTimeout(task, 1200);
}

window.loadThirdPartyScript = loadThirdPartyScript;

gtag("js", new Date());
gtag("consent", "default", {
  analytics_storage: "denied",
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
});

gtag("config", "G-RTJTM1J5LK", { anonymize_ip: true });

window.ensureAnalyticsLoaded = function ensureAnalyticsLoaded() {
  return loadThirdPartyScript(
    "gtag",
    "https://www.googletagmanager.com/gtag/js?id=G-RTJTM1J5LK"
  );
};

if (document.visibilityState === "visible") {
  runWhenIdle(() => {
    window.ensureAnalyticsLoaded().catch(() => {});
  });
} else {
  window.addEventListener(
    "visibilitychange",
    () => {
      if (document.visibilityState !== "visible") return;
      runWhenIdle(() => {
        window.ensureAnalyticsLoaded().catch(() => {});
      });
    },
    { once: true }
  );
}
