// Only this schema may reach a collector. No free text, drawing content or URLs.
window.PaintMeEvents = (() => {
  const sources = new Set(['direct', 'home', 'seo_page', 'gallery', 'select', 'continue', 'next', 'surprise', 'mode']);
  const categories = new Set(['animales','vehiculos','navidad','fantasia','dinosaurios','princesas','gabby','casas','paisajes']);
  const names = new Set(['resource_open','select_content','faq_open','asset_selected','drawing_open','drawing_load_failure','first_paint','return_to_saved','restore_success','restore_failure','local_save_success','local_save_failure','save_png','export_failure','next_drawing','palette_selected','custom_color_used']);
  const enums = {
    category: categories, mode: new Set(['bucket','brush']), platform: new Set(['web','android','ios']), source: sources,
    palette_name: new Set(['base','pastel','naturaleza','brillante']),
    export_result: new Set(['download_requested','encoding_failed']),
    result: new Set(['success','failure']), reason: new Set(['storage','encoding','load','restore']),
    time_band: new Set(['lt_5s','5_15s','15_30s','30_60s','gte_60s']),
    content_type: new Set(['home_interaction'])
  };
  function source(value) { return sources.has(value) ? value : 'direct'; }
  function timeBand(ms) { return ms < 5000 ? 'lt_5s' : ms < 15000 ? '5_15s' : ms < 30000 ? '15_30s' : ms < 60000 ? '30_60s' : 'gte_60s'; }
  function sanitize(name, params = {}) {
    if (!names.has(name) || !params || typeof params !== 'object' || Array.isArray(params)) return null;
    const output = {schema_version: 1};
    for (const [key, allowed] of Object.entries(enums)) if (allowed.has(params[key])) output[key] = params[key];
    output.platform = output.platform || 'web';
    if ('source' in params) output.source = source(params.source);
    if (typeof params.asset_slug === 'string' && (window.ASSETS || []).some(item => item.slug === params.asset_slug)) output.asset_slug = params.asset_slug;
    if (typeof params.item_id === 'string' && /^(cta_hero_(principal|pincel|todos)|categoria_(animales|vehiculos|navidad|fantasia|dinosaurios|princesas)|dibujo_(gato|perro|auto|navidad|dinosaurio|castillo|mariposa|cohete)|faq_[1-9])$/.test(params.item_id)) output.item_id = params.item_id;
    return {name, params: output};
  }
  return Object.freeze({sanitize, source, timeBand});
})();
