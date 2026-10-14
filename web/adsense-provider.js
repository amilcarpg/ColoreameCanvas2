// Provider adapter. No SDK or ad request is made until createRequest is invoked
// with current permission; site configuration and placement are checked by ad-slot.js.
window.PaintMeAdSense = (() => {
  let sdkPromise = null, sdkScript = null;
  function pause() {
    if (window.adsbygoogle) window.adsbygoogle.pauseAdRequests = 1;
    sdkScript?.remove();
  }
  function loadSDK(client, signal) {
    if (signal.aborted) return Promise.reject(new Error('revoked'));
    if (sdkPromise) return sdkPromise;
    // AdSense supports strict nonce-based CSP. Static/reused nonces and broad
    // domain wildcards are not a substitute for an appropriate hosting setup.
    const nonce = document.querySelector('script[nonce]')?.nonce;
    const policy = document.querySelector('meta[http-equiv="Content-Security-Policy"]')?.content || '';
    if (!nonce || !policy.includes("'strict-dynamic'") || !policy.includes(`'nonce-${nonce}'`)) {
      return Promise.reject(new Error('csp_not_ready'));
    }
    sdkPromise = new Promise((resolve,reject) => {
      const script = sdkScript = document.createElement('script');
      let settled = false;
      const finish = error => {
        if (settled) return; settled = true; signal.removeEventListener('abort', cancel);
        script.onload = script.onerror = null;
        if (error) {script.remove();sdkPromise = null;sdkScript = null;reject(error);} else resolve();
      };
      const cancel = () => finish(new Error('revoked'));
      signal.addEventListener('abort', cancel, {once:true});
      script.async = true; script.crossOrigin = 'anonymous'; script.nonce = nonce;
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + client;
      script.onload = () => finish(); script.onerror = () => finish(new Error('sdk_failed'));
      document.head.appendChild(script);
    });
    return sdkPromise;
  }
  function createRequest({client, slot, allowed, load = loadSDK}) {
    if (!/^ca-pub-\d{16}$/.test(client || '') || !/^\d{10}$/.test(slot || '') || typeof allowed !== 'function') {
      throw new Error('invalid_ad_config');
    }
    return async ({signal, mount}) => {
      if (!allowed() || signal.aborted) throw new Error('revoked');
      await load(client, signal);
      if (!allowed() || signal.aborted) throw new Error('revoked');
      const node = document.createElement('ins');
      node.className = 'adsbygoogle'; node.style.display = 'block';
      node.dataset.adClient = client; node.dataset.adSlot = slot;
      // Horizontal responsive sizing, confined to the reserved banner width.
      node.dataset.adFormat = 'horizontal'; node.dataset.fullWidthResponsive = 'false';
      return new Promise((resolve,reject) => {
        let finished = false;
        const observer = new MutationObserver(check);
        function dispose() {observer.disconnect();signal.removeEventListener('abort', cancel);node.remove();}
        function complete(error) {
          if (finished) return; finished = true; observer.disconnect();
          if (error) {dispose();reject(error);} else resolve({node,dispose});
        }
        function cancel() {pause();complete(new Error('revoked'));dispose();}
        function check() {
          if (!allowed() || signal.aborted) {cancel();return;}
          if (node.dataset.adStatus === 'filled') complete();
          else if (node.dataset.adStatus === 'unfilled') complete(new Error('unfilled'));
        }
        signal.addEventListener('abort', cancel, {once:true});
        try {
          mount(node);observer.observe(node,{attributes:true,attributeFilter:['data-ad-status']});
          const queue = window.adsbygoogle = window.adsbygoogle || [];
          queue.pauseAdRequests = 0; queue.push({}); check();
        } catch(error) {complete(error);}
      });
    };
  }
  return Object.freeze({createRequest,pause});
})();
