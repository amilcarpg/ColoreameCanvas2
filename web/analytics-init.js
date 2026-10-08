// GA4 basic consent: no SDK, pings or event queue before permission.
window.dataLayer = [];
window.PaintMeAnalytics = (() => {
  const configURL = new URL('site-config.json', document.currentScript.src);
  let config = null, state = 'disabled', script = null, loading = null, epoch = 0, sdkLoaded = false;
  let finishLoad = null, timeout = null;
  const loadedSDK = Object.freeze({loaded:true});
  function permitted() { return config !== null && window.PaintMePrivacy?.allowed('analytics') === true; }
  function push() { window.dataLayer.push(arguments); }
  function consent(analytics) { return {analytics_storage:analytics ? 'granted':'denied', ad_storage:'denied', ad_user_data:'denied', ad_personalization:'denied'}; }
  function activate() {
    if (!permitted()) return null;
    window[`ga-disable-${config.measurementId}`] = false;
    push('consent', 'default', consent(false));
    push('consent', 'update', consent(true));
    push('js', new Date());
    push('config', config.measurementId, {
      send_page_view:false, allow_google_signals:false, allow_ad_personalization_signals:false,
      cookie_prefix:'paintme', cookie_expires:2592000, cookie_update:false,
      page_location:configURL.origin + window.location.pathname, page_referrer:'', page_title:'PaintMe activity'
    });
    state = 'ready';
    track('resource_open', {category:window.location.pathname.includes('dinosaur') ? 'dinosaurios':undefined});
    return script || loadedSDK;
  }
  function clearCookies() {
    const hostname = window.location?.hostname;
    if (!hostname) return;
    const domains = ['', hostname, '.' + hostname], parts = hostname.split('.');
    for (let i = 1; i < parts.length - 1; i++) domains.push('.' + parts.slice(i).join('.'));
    for (const entry of (document.cookie || '').split(';')) {
      const name = entry.split('=')[0].trim();
      if (!/^paintme_ga(?:_|$)/.test(name)) continue;
      for (const domain of domains) document.cookie = `${name}=; Max-Age=0; path=/;${domain ? ' domain=' + domain + ';' : ''}`;
    }
  }
  function stop() {
    epoch++;
    if (config) window[`ga-disable-${config.measurementId}`] = true;
    script?.remove(); script = null;
    if (timeout !== null) window.clearTimeout(timeout);
    timeout = null; finishLoad?.(null); finishLoad = null; loading = null;
    window.dataLayer.length = 0;
    clearCookies(); state = config ? 'waiting_permission':'disabled';
  }
  function ensureLoaded() {
    if (!permitted()) return Promise.resolve(null);
    if (state === 'ready') return Promise.resolve(script || loadedSDK);
    if (sdkLoaded) return Promise.resolve(activate());
    if (loading) return loading;
    const generation = ++epoch;
    state = 'loading';
    loading = new Promise(resolve => {
      let finished = false;
      finishLoad = resolve;
      script = document.createElement('script'); script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=' + config.measurementId;
      const complete = success => {
        if (finished || generation !== epoch || !permitted()) return;
        finished = true;
        window.clearTimeout(timeout); timeout = null;
        sdkLoaded = success;
        const result = success ? activate() : null;
        if (!success) { script?.remove(); script = null; state = 'error'; }
        finishLoad = null; loading = null; resolve(result);
      };
      script.onload = () => complete(true); script.onerror = () => complete(false);
      timeout = window.setTimeout(() => complete(false), 10000);
      document.head.appendChild(script);
    });
    return loading;
  }
  function track(name, params = {}) {
    const event = window.PaintMeEvents?.sanitize(name, params);
    if (!event || !permitted() || state !== 'ready') return false;
    push('event', event.name, {...event.params, ui_language:document.documentElement.lang === 'en' ? 'en':'es', send_to:config.measurementId,
      page_location:configURL.origin + window.location.pathname, page_referrer:'', page_title:'PaintMe activity'});
    // True means submitted to the SDK queue, never confirmed server receipt.
    return true;
  }
  window.PaintMePrivacy?.subscribe(() => {
    if (!permitted()) stop(); else if (state !== 'ready') void ensureLoaded();
  });
  const ready = (async () => {
    if (typeof window.fetch !== 'function') return false;
    try {
      const response = await window.fetch(configURL.href, {credentials:'same-origin'});
      if (!response.ok) return false;
      const value = (await response.json()).analytics;
      const csp = document.querySelector('meta[http-equiv="Content-Security-Policy"]')?.content || '';
      if (value?.enabled !== true || value.treatmentReviewed !== true || !/^G-[A-Z0-9]{6,20}$/.test(value.measurementId || '') ||
          !Array.isArray(value.paths) || !value.paths.includes(window.location.pathname) ||
          !csp.includes('https://www.googletagmanager.com') || !csp.includes('https://www.google-analytics.com')) return false;
      config = {measurementId:value.measurementId}; state = 'waiting_permission';
      window[`ga-disable-${config.measurementId}`] = true;
      window.PaintMePrivacy?.setAnalyticsAvailable(true);
      return true;
    } catch { return false; }
  })();
  return Object.freeze({track, ready, ensureLoaded, status:() => state});
})();
window.gtag = (command, name, params) => command === 'event' ? window.PaintMeAnalytics.track(name, params) : false;
window.ensureAnalyticsLoaded = () => window.PaintMeAnalytics.ensureLoaded();
window.loadThirdPartyScript = async () => null;
