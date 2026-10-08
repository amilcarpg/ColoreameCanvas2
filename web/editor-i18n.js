// Small English dinosaur pilot. The drawing engines and storage keys are shared.
window.PaintMeI18n = (() => {
  const english = new URL(window.location.href).searchParams.get('lang') === 'en';
  const words = {
    'Para adultos':'For adults', 'Dibujo listo':'Drawing ready',
    'Área de coloreo':'Coloring area', 'Dibujo para pintar con pincel':'Drawing to paint with a brush',
    'Dibujo para pintar con balde':'Drawing to paint with a bucket', 'Colores y estado':'Colors and status',
    'Elige un color':'Choose a color', 'Acciones de coloreado':'Coloring actions',
    'Descarga con ayuda de un adulto':'Download with an adult', 'Copias guardadas':'Saved copies',
    'Temas':'Themes', 'Buscar por nombre':'Search by name', 'Enlaces para adultos':'Links for adults',
    'Preferencias para adultos':'Preferences for adults',
    'Colorea con balde':'Color with the bucket', 'Colorea con pincel':'Color with the brush',
    'Elige colores y pinta a tu manera.':'Choose colors and paint your way.',
    'Ajustar':'Fit', 'Toca una zona para pintarla. Dos dedos para ampliar.':'Tap an area to fill it. Use two fingers to zoom.',
    'Toca o arrastra para pintar. Dos dedos para ampliar.':'Tap or drag to paint. Use two fingers to zoom.',
    'Cargando dibujo…':'Loading drawing…', 'Continuar dibujo guardado':'Continue saved drawing',
    'Sin cambios por guardar':'No unsaved changes', 'Reintentar guardado':'Retry saving',
    'Guardando en este dispositivo…':'Saving on this device…', 'Preparando PNG…':'Preparing PNG…',
    'Buscando copias en este dispositivo…':'Looking for copies on this device…',
    'Pintando…':'Painting…', 'Pintando con pincel...':'Painting with the brush...',
    'Cargando PNG...':'Loading PNG...', 'Cargando imagen...':'Loading image...',
    'Más colores y herramientas':'More colors and tools', 'Paleta':'Palette',
    'Color personalizado':'Custom color', 'Grosor':'Size', 'Borrador':'Eraser',
    'Deshacer':'Undo', 'Rehacer':'Redo', 'Descargar PNG':'Download PNG', 'Siguiente':'Next',
    'Ver PNG para guardar':'View PNG to save', 'Más acciones':'More actions',
    'Reiniciar':'Reset', 'Dibujo sorpresa':'Surprise drawing', 'Elegir otro dibujo':'Choose another drawing',
    'Continuar en este dispositivo':'Continue on this device', 'Buscar por nombre · adultos':'Search by name · adults',
    'Buscar dibujo':'Search drawings', 'Lista de dibujos':'Drawing list', 'Ver todos':'View all',
    'Zona para adultos':'Adult area', 'Imprimir dibujo':'Print drawing', 'Preferencias de privacidad':'Privacy preferences',
    'Usar pincel':'Use brush', 'Usar balde de pintura':'Use bucket',
    'Información para familias y docentes':'Information for families and teachers',
    'Privacidad web y aplicación':'Website and app privacy', 'Volver al inicio':'Back to the activity',
    'Descarga, impresión y preferencias. Pintar no requiere aceptar analítica.':'Downloads, printing and preferences. Painting does not require analytics permission.',
    'Los dibujos quedan en este dispositivo y en este modo. Cambiar de modo no transfiere las capas.':'Drawings stay on this device in this mode. Switching modes does not transfer layers.',
    'Analítica opcional (desactivada)':'Optional analytics (disabled)', 'Analítica opcional':'Optional analytics',
    'Rechazar':'Reject', 'Guardar preferencias':'Save preferences', 'Revocar permisos opcionales':'Revoke optional permissions',
    'Información de privacidad web':'Website privacy information', 'Preferencias de privacidad para adultos':'Privacy preferences for adults',
    'PaintMe · una actividad para compartir en familia.':'PaintMe · an activity to enjoy together.',
    '¿Reiniciar este dibujo?':'Reset this drawing?',
    'Después podrás recuperar tu dibujo con Deshacer antes de seguir pintando.':'You can recover your drawing with Undo before painting again.',
    'Conservar dibujo':'Keep drawing', 'Reiniciar dibujo':'Reset drawing', 'Tu dibujo en PNG':'Your drawing as a PNG',
    'Si la descarga no empieza, puedes guardar la imagen desde las opciones de tu navegador.':'If the download does not start, save the image using your browser options.',
    'Descargar por enlace alternativo':'Download using the alternative link', 'Cerrar':'Close',
    'Todos':'All', 'Dinosaurios':'Dinosaurs', 'Dibujos':'Drawings', 'Base':'Basic',
    'Pastel':'Pastel', 'Naturaleza':'Nature', 'Brillante':'Bright',
    'Pocos detalles':'Few details', 'Detalle medio':'Medium detail', 'Muchos detalles':'Many details',
    'Nivel por revisar':'Detail level pending review', 'Vista previa no disponible':'Preview unavailable',
    'Cambios pendientes de guardar':'Unsaved changes', 'Guardando…':'Saving…',
    'Guardado en este dispositivo':'Saved on this device', 'Hay un dibujo guardado en este dispositivo. Puedes continuar.':'A drawing is saved on this device. You can continue.',
    'Dibujo recuperado de este dispositivo':'Drawing restored from this device', 'Dibujo restaurado':'Drawing restored',
    'Recuperando dibujo…':'Restoring drawing…', 'Recuperar reinicio':'Undo reset',
    'Dibujo reiniciado. Puedes recuperarlo con Deshacer.':'Drawing reset. You can recover it with Undo.',
    'Dibujo reiniciado. Recupera la obra anterior con Deshacer.':'Drawing reset. Recover the previous work with Undo.',
    'El dibujo cambió. Descarga su versión actual.':'The drawing changed. Download its current version.',
    'La imagen aún está cargando...':'The image is still loading...', 'Las líneas del dibujo están protegidas.':'The drawing outlines are protected.',
    'No hay dibujos disponibles.':'No drawings available.', 'No hay dibujos PNG disponibles.':'No PNG drawings available.',
    'No hay una copia guardada para este dibujo.':'There is no saved copy of this drawing.',
    'No encontramos dibujos con esa búsqueda.':'No drawings match this search.',
    'Todavía no hay dibujos guardados en este modo.':'No drawings are saved in this mode yet.',
    'No pudimos consultar el almacenamiento. Puedes seguir pintando.':'Storage could not be read. You can keep painting.',
    'No pudimos guardar. Descarga el PNG antes de cambiar de dibujo.':'Saving failed. Download the PNG before changing drawings.',
    'No pudimos guardar. Descarga el PNG antes de salir.':'Saving failed. Download the PNG before leaving.',
    'No pudimos guardar. Reintenta o descarga el PNG.':'Saving failed. Retry or download the PNG.',
    'No pudimos preparar el guardado. Descarga el PNG antes de salir.':'Saving could not be prepared. Download the PNG before leaving.',
    'No pudimos preparar el PNG. Intenta de nuevo; tu dibujo sigue en el editor.':'The PNG could not be prepared. Retry; your drawing is still in the editor.',
    'No pudimos preparar la descarga. Usa Ver PNG para guardar o vuelve a intentarlo.':'The download could not be prepared. Use View PNG to save or retry.',
    'No pudimos preparar la impresión. Puedes descargar el PNG.':'Printing could not be prepared. You can download the PNG.',
    'No se pudo abrir la vista previa. Intenta descargar de nuevo.':'The preview could not be opened. Try downloading again.',
    'No se pudo recuperar el dibujo guardado.':'The saved drawing could not be restored.',
    'No se pudo recuperar la copia guardada. Puedes seguir pintando o descargar este dibujo.':'The saved copy could not be restored. You can keep painting or download this drawing.',
    'No pudimos borrar la copia guardada. Puedes recuperar el dibujo anterior con Deshacer.':'The saved copy could not be deleted. You can recover the previous drawing with Undo.',
    'No pudimos borrar la copia guardada.':'The saved copy could not be deleted.',
    'No se pudo cargar la imagen. Verifica el archivo seleccionado en /assets/':'The image could not be loaded. Check the selected file in /assets/',
    'No se pudo cargar. Usa un PNG en blanco y negro desde /assets/.':'The image could not be loaded. Use a black and white PNG from /assets/.',
    'No se pudo completar el relleno. Intenta de nuevo.':'The fill failed. Please retry.',
    'No se pudo completar el relleno. Puedes deshacer e intentarlo de nuevo.':'The fill failed. You can undo and retry.',
    'No se pudo iniciar el editor. Recarga la página para cargar sus herramientas.':'The editor could not start. Reload the page to load its tools.',
    'PNG preparado para descargar. Revisa las descargas de tu navegador.':'PNG ready to download. Check your browser downloads.',
    'Borrador activo':'Eraser active', 'Borrando...':'Erasing...', 'Pintando...':'Painting...',
    'Tienes cambios sin guardar. Si sales ahora, perderás tu dibujo. ¿Quieres salir?':'You have unsaved changes. Leaving now will lose your drawing. Leave anyway?',
    'Espera a que termine la operación antes de salir.':'Wait for the operation to finish before leaving.',
    'No pudimos preparar la salida. Puedes seguir coloreando y reintentar.':'Leaving could not be prepared. You can keep coloring and retry.',
    '¿Reiniciar este dibujo? Podrás recuperarlo con Deshacer antes de seguir pintando.':'Reset this drawing? You can recover it with Undo before painting again.',
    'Tu dibujo está guardado en este dispositivo. Balde y Pincel mantienen trabajos separados para este dibujo; al volver podrás continuar el de esta herramienta. Si quieres un archivo, descarga el PNG antes de cambiar. ¿Cambiar de herramienta?':'Your drawing is saved on this device. Bucket and Brush keep separate work for this drawing; you can continue this tool’s work when you return. Download the PNG before switching if you want a file. Switch tools?',
    'Rojo':'Red', 'Naranja':'Orange', 'Amarillo':'Yellow', 'Verde':'Green', 'Azul':'Blue',
    'Morado':'Purple', 'Rosa':'Pink', 'Marrón':'Brown', 'Negro':'Black', 'Blanco':'White',
    'Gris':'Gray', 'Turquesa':'Turquoise', 'Coral':'Coral', 'Lavanda':'Lavender', 'Melocotón':'Peach',
    'Índigo':'Indigo', 'Amarillo claro':'Light yellow', 'Gris azulado':'Blue gray', 'Rosa pastel':'Pastel pink',
    'Amarillo pastel':'Pastel yellow', 'Azul pastel':'Pastel blue', 'Rosa suave':'Soft pink', 'Índigo pastel':'Pastel indigo',
    'Verde pastel':'Pastel green', 'Amarillo suave':'Soft yellow', 'Naranja pastel':'Pastel orange', 'Gris claro':'Light gray',
    'Verde oscuro':'Dark green', 'Verde claro':'Light green', 'Naranja suave':'Soft orange', 'Azul cielo':'Sky blue',
    'Azul profundo':'Deep blue', 'Violeta':'Violet', 'Rojo vivo':'Bright red', 'Rosa vivo':'Bright pink',
    'Morado vivo':'Bright purple', 'Violeta oscuro':'Dark violet', 'Azul vivo':'Bright blue', 'Azul celeste':'Light blue',
    'Verde vivo':'Bright green', 'Verde lima':'Lime green', 'Amarillo vivo':'Bright yellow', 'Naranja vivo':'Bright orange',
    'Naranja rojizo':'Red orange', 'Turquesa vivo':'Bright turquoise',
    'Menta':'Mint', 'Celeste':'Sky blue', 'Lila':'Lilac', 'Crema':'Cream', 'Marrón claro':'Light brown'
  };
  function t(value) {
    if (!english || typeof value !== 'string') return value;
    const text = value.trim();
    if (words[text]) return value.replace(text, words[text]);
    const patterns = [
      [/^(Color activo|Pincel activo): (.+)$/, (_, tool, color) => `${tool === 'Color activo' ? 'Active color' : 'Active brush'}: ${color}`],
      [/^Color personalizado (.+)$/, (_, color) => `Custom color ${color}`],
      [/^Colorear (.+)$/, (_, label) => `Color ${label}`],
      [/^Copia no legible: (.+)$/, (_, label) => `Unreadable copy: ${label}`],
      [/^Continuar (.+)$/, (_, label) => `Continue ${label}`],
      [/^(\d+) copias locales disponibles\.$/, (_, count) => `${count} local copies available.`],
      [/^(\d+) (dibujo|dibujos|PNG|PNGs)( disponibles)?$/, (_, count, kind, available) => `${count} ${kind.startsWith('PNG') ? kind : Number(count) === 1 ? 'drawing' : 'drawings'}${available ? ' available' : ''}`],
      [/^Dinosaurios · (.+)$/, (_, rest) => `Dinosaurs · ${t(rest)}`],
      [/^(.+) (para colorear|con pincel) \| PaintMe.club$/, (_, label, mode) => `${label} ${mode === 'con pincel' ? 'with brush' : 'coloring'} | PaintMe.club`],
      [/^Colorea con (.+) \| (.+)$/, () => `Dinosaur coloring | PaintMe.club`],
      [/^Explora (la categoría )?dinosaurios .+$/, () => 'Choose a dinosaur and color with a tap or brush stroke.'],
      [/^Estás viendo .+$/, () => 'Choose another dinosaur from the gallery or drawing list.'],
      [/^La analítica y la publicidad externas están desactivadas en esta versión\.(.*)$/, (_, rest) => `External analytics and advertising are disabled in this version.${rest.includes('No se pudo') ? ' The preference could not be saved; the activity still works.' : rest.includes('guardada') ? ' Preference saved on this device.' : ' You can paint without deciding.'}`]
    ];
    for (const [pattern, translate] of patterns) if (pattern.test(text)) return translate(...text.match(pattern));
    return value;
  }
  if (english) {
    const labels = {dinosaurio:'Happy dinosaur', triceratops:'Triceratops', brontosaurio:'Brontosaurus', pterodactilo:'Pterodactyl'};
    window.ASSETS = (window.ASSETS || []).filter(asset => labels[asset.slug]).map(asset => ({...asset, label: labels[asset.slug]}));
    document.documentElement.lang = 'en';
    function translateNode(node) {
      if (node.nodeType === 3) {
        if (!['SCRIPT','STYLE'].includes(node.parentElement?.tagName)) {
          const translated = t(node.nodeValue); if (translated !== node.nodeValue) node.nodeValue = translated;
        }
      } else if (node.nodeType === 1) {
        if (['SCRIPT','STYLE'].includes(node.tagName)) return;
        for (const name of ['aria-label','title','placeholder','alt']) if (node.hasAttribute(name)) {
          const value = node.getAttribute(name), translated = t(value);
          if (value !== translated) node.setAttribute(name, translated);
        }
        for (const child of node.childNodes) translateNode(child);
      }
    }
    translateNode(document.documentElement);
    const observer = new MutationObserver(records => {
      for (const record of records) {
        if (record.type === 'childList') for (const node of record.addedNodes) translateNode(node);
        else translateNode(record.target);
      }
    });
    observer.observe(document.documentElement, {subtree:true, childList:true, characterData:true, attributes:true, attributeFilter:['aria-label','title','placeholder','alt']});
    for (const link of document.querySelectorAll('a[href]')) {
      const url = new URL(link.href);
      if (url.origin !== window.location.origin) continue;
      if (['/','/index.html','/adults.html'].includes(url.pathname)) link.href = 'en/dinosaur-coloring.html';
      else if (url.pathname === '/privacy.html') link.href = 'en/privacy.html';
    }
  }
  return Object.freeze({language:english ? 'en' : 'es', t});
})();
