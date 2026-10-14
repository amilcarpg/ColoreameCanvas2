// Keep existing bookmarks and contact anchors on the renamed information page.
(() => {
  const destination = new URL('familias.html', window.location.href);
  destination.search = window.location.search;
  destination.hash = window.location.hash;
  window.location.replace(destination.href);
})();
