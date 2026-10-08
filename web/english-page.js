// The English resource uses the same preference state as the Spanish pages.
const privacyTexts = {
  'Preferencias de privacidad para adultos':'Privacy preferences for adults',
  'Analítica opcional (desactivada)':'Optional analytics (disabled)',
  'Analítica opcional':'Optional analytics',
  'Rechazar':'Reject', 'Guardar preferencias':'Save preferences',
  'Revocar permisos opcionales':'Revoke optional permissions',
  'Privacidad web y aplicación':'Website and app privacy'
};
function translateEnglishPreferences() {
  const controls = document.querySelector('.privacy-controls');
  if (!controls) return;
  const walker = document.createTreeWalker(controls, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode, key = node.nodeValue.trim();
    if (privacyTexts[key]) node.nodeValue = node.nodeValue.replace(key, privacyTexts[key]);
  }
  const status = document.getElementById('privacyStatus');
  if (status) status.textContent = window.PaintMePrivacy?.snapshot().services.analytics
    ? 'Optional analytics requires your permission. Advertising stays disabled.'
    : 'External analytics and advertising are disabled. You can use the activity without deciding.';
  const link = controls.querySelector('a'); if (link) link.href = 'privacy.html';
}
window.PaintMePrivacy?.subscribe(() => queueMicrotask(translateEnglishPreferences));
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', translateEnglishPreferences, {once:true});
else translateEnglishPreferences();
