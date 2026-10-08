// No publisher SDK, IDs or network requests. Production authorization stays off.
window.PaintMeAds = (() => {
  function createController(container, {allowed = () => false, request = null, subscribe = () => () => {}, timeout = 10000} = {}) {
    let epoch = 0, disposed = false, timer, creative;
    const released = new WeakSet();
    function release(value) { if (value && typeof value === 'object' && !released.has(value)) {released.add(value); value.dispose?.();} }
    const editor = /\/(paint|brush)\.html$/.test(location.pathname);
    function clear(state = 'off') {
      epoch++; clearTimeout(timer); release(creative); creative = null;
      container.replaceChildren(); container.hidden = true; container.dataset.adState = state;
    }
    async function show() {
      clear(); const current = epoch;
      if (disposed || editor || !allowed() || typeof request !== 'function') return;
      container.dataset.adState = 'loading';
      try {
        const result = await Promise.race([Promise.resolve().then(() => {
          if (current !== epoch || disposed || !allowed()) throw new Error('revoked');
          return Promise.resolve(request()).then(result => {
            if (disposed || current !== epoch || !allowed()) release(result);
            return result;
          });
        }), new Promise((_,reject) => {timer = setTimeout(() => reject(new Error('timeout')), timeout);})]);
        clearTimeout(timer);
        if (disposed || current !== epoch || !allowed()) { release(result); return; }
        if (!result?.node || result.node.nodeType !== 1) {clear('empty');return;}
        creative = result;
        const label = document.createElement('p'); label.textContent = 'Publicidad';
        container.append(label, result.node); container.hidden = false; container.dataset.adState = 'ready';
      } catch { if (!disposed && current === epoch) clear('failed'); }
    }
    const unsubscribe = subscribe(() => {if (!allowed()) clear();});
    clear();
    return {show, dispose() {disposed = true; unsubscribe(); clear();}};
  }
  function mount() {
    const container = document.getElementById('adultAdSlot');
    if (container) createController(container, {allowed: () => window.PaintMePrivacy?.allowed('ads') === true, subscribe: callback => window.PaintMePrivacy.subscribe(callback)});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, {once:true}); else mount();
  return Object.freeze({createController});
})();
