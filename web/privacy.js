// Optional services intentionally disabled until operator/markets/provider are confirmed.
window.PaintMePrivacy = (() => {
  const VERSION = 2, KEY = 'paintme_preferences_v2';
  const policyURL = new URL('privacy.html', document.currentScript.src).href;
  const services = {analytics: false, ads: false};
  const subscribers = new Set();
  let generation = 0, choice = {version: VERSION, decided: false, analytics: false, ads: false}, persisted = true;
  function read() {
    try {
      const value = JSON.parse(localStorage.getItem(KEY));
      persisted = true;
      if (value?.version === VERSION && typeof value.decided === 'boolean') choice = {version: VERSION, decided: value.decided, analytics: value.analytics === true && services.analytics, ads: false};
    } catch { persisted = false; }
  }
  function snapshot() { return {...choice, generation, persisted, services: {...services}}; }
  function allowed(service) { return services[service] === true && choice[service] === true && choice.decided; }
  function notify() {
    for (const subscriber of subscribers) { try { subscriber(snapshot()); } catch {} }
    render();
  }
  function decide(value = {}) {
    generation++;
    choice = {version: VERSION, decided: true, analytics: value.analytics === true && services.analytics, ads: false};
    try { localStorage.setItem(KEY, JSON.stringify(choice)); localStorage.removeItem('coloreame_consent_v1'); persisted = true; }
    catch { persisted = false; }
    notify();
    return snapshot();
  }
  function subscribe(callback) { subscribers.add(callback); return () => subscribers.delete(callback); }
  function setAnalyticsAvailable(available) {
    services.analytics = available === true;
    if (!services.analytics) choice.analytics = false;
    generation++; notify();
  }
  function render() {
    const banner = document.getElementById('consentBanner');
    if (banner) banner.style.display = 'block';
    const status = document.getElementById('privacyStatus');
    if (status) status.textContent = (services.analytics ? 'Google Analytics es opcional y requiere permiso. La publicidad sigue desactivada.' : 'La analítica y la publicidad externas están desactivadas en esta versión.') + (!persisted ? ' No se pudo recordar la preferencia; la actividad sigue funcionando.' : choice.decided ? ' Preferencia guardada en este dispositivo.' : ' Puedes pintar sin decidir.');
    const toggle = document.getElementById('analyticsChoice');
    if (toggle) {
      toggle.checked = choice.analytics; toggle.disabled = !services.analytics;
      const label = toggle.closest('label')?.lastChild;
      if (label?.nodeType === 3) label.nodeValue = services.analytics ? ' Analítica opcional' : ' Analítica opcional (desactivada)';
    }
  }
  function open() {
    const adult = document.getElementById('adultArea'); if (adult) adult.open = true;
    const banner = document.getElementById('consentBanner'); if (banner) banner.hidden = false;
    document.getElementById('consentReject')?.focus(); render();
  }
  function bind() {
    if (!document.getElementById('consentBanner')) {
      const details = document.createElement('details'); details.className = 'privacy-controls';
      details.innerHTML = '<summary>Preferencias de privacidad para adultos</summary><div id="consentBanner" data-privacy><p id="privacyStatus" role="status" aria-live="polite"></p><label><input id="analyticsChoice" type="checkbox" disabled /> Analítica opcional (desactivada)</label><div><button id="consentReject" type="button">Rechazar</button><button id="consentAccept" type="button">Guardar preferencias</button><button id="consentRevoke" type="button">Revocar permisos opcionales</button></div></div>';
      const link = document.createElement('a'); link.href = policyURL; link.textContent = 'Privacidad web y aplicación'; details.lastElementChild.appendChild(link);
      document.body.appendChild(details);
    }
    render();
    document.getElementById('privacySettingsBtn')?.addEventListener('click', open);
    document.getElementById('consentReject')?.addEventListener('click', () => decide({}));
    document.getElementById('consentAccept')?.addEventListener('click', () => decide({analytics: document.getElementById('analyticsChoice')?.checked === true}));
    document.getElementById('consentRevoke')?.addEventListener('click', () => decide({}));
  }
  read();
  window.addEventListener('storage', event => { if (event.key === KEY || event.key === null) {choice = {version: VERSION, decided: false, analytics: false, ads: false}; read(); generation++; notify();} });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind, {once:true}); else bind();
  return Object.freeze({VERSION, KEY, snapshot, allowed, decide, subscribe, open, setAnalyticsAvailable});
})();
