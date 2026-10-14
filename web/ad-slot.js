// Manual placements. Production authorization stays off in site-config.json.
window.PaintMeAds = (() => {
  const configURL = new URL('site-config.json', document.currentScript.src);
  let state = 'disabled';
  function createController(container, {allowed = () => false, request = null, subscribe = () => () => {}, timeout = 10000} = {}) {
    let epoch = 0, disposed = false, timer, creative, pending;
    const content = container.querySelector('[data-ad-content]') || container;
    const released = new WeakSet();
    function release(value) { if (value && typeof value === 'object' && !released.has(value)) {released.add(value); value.dispose?.();} }
    const editor = /\/(paint|brush)\.html$/.test(location.pathname);
    const approvedPlacement = !editor || (container.id === 'editorAdSlot' &&
      container.dataset.placement === 'bottom' && !container.closest('#actividad'));
    function clear(state = 'off') {
      epoch++; clearTimeout(timer); pending?.abort(); pending = null; release(creative); creative = null;
      content.replaceChildren(); container.hidden = true; container.dataset.adState = state;
      delete container.dataset.adError;
    }
    async function show() {
      clear(); const current = epoch;
      if (disposed || !approvedPlacement || !allowed() || typeof request !== 'function') return;
      const abort = pending = new AbortController();
      container.dataset.adState = 'loading';
      try {
        const result = await Promise.race([Promise.resolve().then(() => {
          if (current !== epoch || disposed || !allowed()) throw new Error('revoked');
          return Promise.resolve(request({signal:abort.signal,mount(node) {
            if (current !== epoch || disposed || !allowed() || abort.signal.aborted) throw new Error('revoked');
            content.replaceChildren(node); container.hidden = false;
          }})).then(result => {
            if (disposed || current !== epoch || !allowed()) release(result);
            return result;
          });
        }), new Promise((_,reject) => {timer = setTimeout(() => reject(new Error('timeout')), timeout);})]);
        clearTimeout(timer);
        if (disposed || current !== epoch || !allowed()) { release(result); return; }
        if (!result?.node || result.node.nodeType !== 1) {clear('empty');return;}
        creative = result;
        if (content === container) {
          const label = document.createElement('p'); label.textContent = window.PaintMeI18n?.t('Publicidad') || 'Publicidad';
          content.replaceChildren(label,result.node);
        } else if (result.node.parentNode !== content) content.replaceChildren(result.node);
        container.hidden = false; container.dataset.adState = 'ready';
      } catch(error) {
        if (!disposed && current === epoch) {
          clear(error.message === 'unfilled' ? 'empty' : 'failed');
          container.dataset.adError = error.message;
        }
      }
    }
    const unsubscribe = subscribe(() => {if (!allowed()) clear();});
    clear();
    return {show, dispose() {disposed = true; unsubscribe(); clear();}};
  }
  async function mount() {
    const editor = /\/(paint|brush)\.html$/.test(location.pathname);
    const home = location.pathname === '/' || location.pathname === '/index.html';
    const families = location.pathname === '/familias.html';
    if (!editor && !home && !families) return false;
    const placement = editor ? 'editorBottom' : home ? 'homeBottom' : 'familiesBottom';
    const container = document.getElementById(editor ? 'editorAdSlot' : home ? 'homeAdSlot' : 'adultAdSlot');
    if (!container) return false;
    try {
      const response = await fetch(configURL.href,{credentials:'same-origin'});
      if (!response.ok) return false;
      const config = (await response.json()).ads;
      const slot = config?.slots?.[placement];
      if (config?.enabled !== true || config.siteApproved !== true || config.treatmentReviewed !== true ||
          !/^ca-pub-\d{16}$/.test(config.client || '') || !/^\d{10}$/.test(slot || '')) return false;
      const allowed = () => window.PaintMePrivacy?.allowed('ads') === true;
      const controller = createController(container,{allowed,
        request:window.PaintMeAdSense.createRequest({client:config.client,slot,allowed}),
        subscribe:callback => window.PaintMePrivacy?.subscribe(callback) || (()=>{})});
      let previous = false;
      const onPermission = () => {
        const next = allowed();
        if (next && !previous) {
          state = 'requested';
          void controller.show().then(()=>{state = allowed() ? container.dataset.adState : 'waiting_permission';});
        }
        if (!next) {state = 'waiting_permission';window.PaintMeAdSense.pause();}
        previous = next;
      };
      const unsubscribe = window.PaintMePrivacy?.subscribe(onPermission);
      window.addEventListener('pagehide',()=>{unsubscribe?.();controller.dispose();window.PaintMeAdSense.pause();},{once:true});
      onPermission(); return true;
    } catch {state = 'error';return false;}
  }
  const ready = document.readyState === 'loading'
    ? new Promise(resolve=>document.addEventListener('DOMContentLoaded',()=>{mount().then(resolve);},{once:true})) : mount();
  return Object.freeze({createController,ready,status:()=>state});
})();
