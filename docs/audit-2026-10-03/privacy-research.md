# PaintMe: publicidad y privacidad infantil

Consulta de fuentes primarias: **3 de octubre de 2026**. Diagnóstico y planificación; no se ha modificado el producto ni solicitado aprobación publicitaria. País del responsable, países de distribución y edades no confirmados. El creador declara tráfico actual cero y monetización configurada pero todavía no publicada: esto no demuestra aprobación de cuentas, sitios o aplicaciones. El objetivo económico comunicado no cambia los requisitos.

## Resultado

El código contiene medidas prudentes en Flutter, pero **todavía no acredita preparación para monetizar un producto infantil**. La web necesita resolver su tratamiento publicitario infantil, su modelo de consentimiento y una política coherente con sus scripts. iOS añade un riesgo importante para un modelo basado en anuncios: cumplir Google Play Families no demuestra cumplir Apple Kids.

No basta con llamarlo «para familias», presentar un botón Aceptar, seleccionar anuncios no personalizados o resolver una suma. La clasificación depende de audiencia, contenido, funcionamiento, datos y mercados efectivos. Tampoco sería correcto marcarlo solo para adultos para eludir requisitos mientras la experiencia se dirige a niños.

## Evidencia del repositorio y producción

El agente principal contrastó 18 recursos públicos críticos con los archivos locales, normalizando saltos de línea: coinciden, incluidos scripts de analítica, editores, privacidad y ads.txt. Probó **Rechazar** en navegador; **Aceptar** se auditó mediante código y no se pulsó. **No capturó tráfico de red de terceros**: este análisis identifica llamadas programadas y comportamiento documentado, no afirma haber medido paquetes, cookies, identificadores efectivos ni entregas de anuncios.

| Evidencia | Qué permite concluir | Qué queda pendiente |
|---|---|---|
| `web/analytics-init.js:55–81`: consentimientos iniciales denegados; gtag se carga cuando la página visible queda libre o tras un temporizador | La carga del script no espera Aceptar. Google documenta pings sin cookies en consent mode avanzado [S8] | HAR limpio antes de decidir, después de rechazar y después de aceptar; contenido enviado y opciones reales de la propiedad |
| `web/paint.js:1170–1189`, `web/brush.js:1093–1110`: Aceptar concede `analytics_storage`, `ad_storage`, `ad_user_data` y `ad_personalization`; después carga AdSense | El consentimiento actual autoriza personalización; no hay en esos bloques señal infantil ni petición explícita NPA | Configuración infantil/NPA en cuenta o sitio podría existir fuera del repositorio; inspeccionarla antes de afirmar anuncios personalizados efectivos |
| `web/privacy.html:11–17`: dibujos locales, anuncios NPA solo catálogo; `web/index.html:451` enlaza un aviso diferente dentro de paint.html | Hay dos superficies de información; la política del móvil no describe adecuadamente los scripts web. AdSense puede cargarse desde ambos editores | Inventario efectivo de datos, identificadores, destinatarios, conservación, contacto del responsable, derechos y controles aplicables |
| `web/app-utils.js`: IndexedDB y respaldo localStorage para dibujos; `PaintMe` es un `const` global pero editores acceden a `window.PaintMe` | Hay intención de persistencia local; el agente principal demostró que los helpers no están disponibles para esos editores | No presentar «guardado local funcional» como evidencia de un recorrido verificado; conservar separados privacidad y bug de recuperación |
| `flutter/lib/ad_service.dart:9–29`: UMP con menor de consentimiento; TFCD/TFUA yes y rating G antes de inicializar MobileAds | Hay señal infantil explícita y espera a `canRequestAds()` | El SDK de consentimiento no acredita consentimiento parental legal. TFUA true hace que UMP no pida consentimiento al usuario [S7] |
| `flutter/lib/ad_banner.dart:35–54`: NPA true; IDs de prueba si falta `ADMOB_BANNER_ID` | No se demuestra una unidad comercial activa. Solo aparece banner en catálogo | Configuración release, ID y estado de la app; eventos y ciclo de vida en dispositivo |
| `flutter/lib/product_analytics.dart`, implementación usada en main | Analítica propia móvil deshabilitada: `track()` no envía datos | No extender esta conclusión al SDK publicitario ni a la web |
| `flutter/lib/main.dart:1290–1366`: ajustes tras suma fija 4+3; privacidad UMP y enlace externo | Hay separación de adultos, pero la suma no verifica identidad parental ni cumple por sí misma COPPA | Ajustar dificultad al segmento y revisar todas las salidas/compartición, no solo Ajustes |
| Manifest Android e Info.plist iOS: App ID por variable; `flutter/pubspec.lock:139` bloquea plugin 7.0.0 | Configuración pendiente del proceso release y versión Flutter identificada | Dependencias nativas resueltas, manifest fusionado, permisos AD_ID, privacidad de SDK y declaraciones de tiendas |
| `web/ads.txt` contiene vendedor Google y publisher ID; búsqueda no encontró app-ads.txt | Existe archivo web de autorización de vendedor | No prueba titularidad, aprobación, ingresos o que el publisher web deba usarse en móvil |

## Requisitos aplicables y condiciones

**Publicidad Google, cuando se utiliza.** Declarar tratamiento infantil si el servicio/segmento queda cubierto por COPPA y no usar publicidad basada en intereses para menores de 13 o actividad en sitios dirigidos a ellos. Google ofrece señales y marcado del sitio; estos no sustituyen obligaciones legales [S1]. En web la ayuda actual presenta TFAT child y depreca TFCD/TFUA [S2]. No insertar una API GPT en AdSense sin comprobar el producto y mecanismo que realmente se utiliza.

**Google Play, si se distribuye allí e incluye niños.** Aplican Families y declaración exacta de público, Data safety y clasificación. Anuncios para niños o edad desconocida: versiones autocertificadas, contenido apropiado y ausencia de intereses/remarketing; no interferir con juego ni inducir clics [S3]. Para público mixto se requieren medidas como pantalla neutral de edad. Para público exclusivamente infantil, no recopilar ubicación precisa ni transmitir identificadores prohibidos; en API 33+ no solicitar AD_ID. Auditar manifest fusionado, no solo fuente. La lista oficial consultada admite Google AdMob Android `play-services-ads` desde 19.0.0 [S4]: la versión Flutter 7.0.0 no sustituye verificar el artefacto nativo y todos los adaptadores de mediación. Autocertificación SDK no equivale a aprobación de la app.

**Apple, si se distribuye en App Store.** Las reglas 1.3 y 5.1.4 restringen publicidad/analítica de terceros en apps principalmente infantiles, incluso sin elegir Kids. Excepciones limitadas para publicidad contextual requieren políticas públicas que incluyan revisión humana de creatividades; rating G y NPA no demuestran ese requisito. Kids exige puerta parental para salidas y compras. Apple distingue esa puerta del consentimiento parental legal. Las apps con anuncios también deben permitir reportar publicidad inapropiada, y todas necesitan política accesible [S5]. Este binario no tiene evidencia suficiente para afirmar elegibilidad. Postergar iOS publicitario hasta justificar formalmente la excepción; evaluar versión sin anuncios si no se puede.

**AdMob, si se monetiza la app.** Nuevas apps configuradas desde enero de 2025 necesitan verificación con `app-ads.txt`; posteriormente revisión de preparación para servir anuncios plenamente. Excepción declarada para apps únicamente en tiendas de terceros [S6]. Publicar el archivo en la raíz del dominio de desarrollador enlazado desde la ficha, copiando el vendedor de la cuenta correcta; verificar estado en AdMob. `ads.txt` web no lo reemplaza.

**Consentimiento europeo Google, según región y anuncios.** La ayuda vigente exige CMP certificado con TCF para anuncios **personalizados** a usuarios EEE/UK desde 16/01/2024 y Suiza desde 31/07/2024. Dice que tráfico de CMP no certificado puede ser elegible para NPA o anuncios limitados donde se soporten [S9]. Por ello no afirmar certificación universal para cualquier NPA. La política de consentimiento Google sigue exigiendo consentimiento para cookies/almacenamiento cuando legalmente necesario e información y revocación adecuadas [S10]. Google explica que NPA puede usar cookies/identificadores para frecuencia e informes: NPA no significa «sin datos» ni «sin consentimiento» [S11]. La ruta infantil de UMP merece evaluación específica; no pedir a un niño aceptar personalización.

**COPPA, si concurren ámbito y datos cubiertos.** Aplica a servicios comerciales dirigidos a menores de 13 o con conocimiento efectivo de su uso, según el ámbito legal. SDKs y persistentes identificadores pueden activar obligaciones aunque no haya cuentas. La FTC conserva una excepción limitada para identificadores usados solo en operaciones internas, sin otros datos ni perfiles o usos incompatibles; no presumirla para toda analítica [S12]. La reforma publicada 22/04/2025 entró en vigor 23/06/2025 y el plazo general 22/04/2026 ya venció; excepciones temporales correspondían a programas Safe Harbor. Exige consentimiento parental verificable separado para divulgaciones no integrales, incluida publicidad dirigida, y refuerza seguridad, avisos y retención limitada [S13]. Aceptar cookies o 4+3 no son evidencia de ese consentimiento. La página FAQ advierte que fue modificada la regla: prevalece el texto vigente.

**GDPR/ePrivacy, si aplican por establecimiento/oferta/seguimiento.** No decidir ámbito por la ubicación presumida del creador. GDPR art. 8 se refiere a consentimiento como base para servicios ofrecidos directamente al niño: umbral 16 reducible nacionalmente hasta 13, con autorización parental debajo; no es un umbral universal de uso. Art. 7 exige revocación y art. 13 información; la base jurídica y obligaciones dependen del tratamiento [S14]. ePrivacy art. 5(3), en su versión consolidada e implementación nacional, trata acceso/almacenamiento en terminal con excepciones estrechas para comunicación o servicio estrictamente necesario [S15]. La audiencia mundial también podría activar normas locales adicionales: pendiente inventario por mercados elegidos, no dictamen global.

## Requisitos de publicación adicionales

Estas exigencias dependen de la tienda/cuenta utilizada, no de conseguir tráfico o ingresos.

- **Google Play Android móvil:** desde 31/08/2026, nuevas apps y actualizaciones requieren target Android 16/API 36 o superior; existe posibilidad de solicitar extensión hasta 01/11/2026, que no debe presumirse concedida [S18]. `flutter/android/app/build.gradle.kts` delega target a `flutter.targetSdkVersion`: obtener su valor real y revisar el AAB release. No presentar el antiguo umbral API 35 como suficiente para nueva presentación en octubre de 2026.
- **Cuenta Play personal creada después de 13/11/2023:** mínimo 12 testers inscritos continuamente 14 días en prueba cerrada; después se solicita acceso a producción y Google revisa respuestas/actividad. Cumplir el número no promete aprobación. Tipo/fecha de cuenta pendientes [S19].
- **App Store Connect:** desde 28/04/2026 exige Xcode 26 o posterior y SDK iOS/iPadOS 26 o posterior; desde 09/09/2026, el mínimo soportado declarado debe ser iOS 13 o posterior. SDK de compilación y versión mínima de ejecución son conceptos distintos [S20]. No se ha ejecutado archive iOS en este entorno.
- **Privacidad iOS:** `rg --files flutter -g '*PrivacyInfo*'` no encontró manifiesto de privacidad propio versionado. Esto no demuestra que el binario final carezca de los que incluyen sus dependencias. Verificar `PrivacyInfo.xcprivacy`, categorías de datos y motivos aprobados de APIs en cada bundle y reporte agregado de Xcode [S21]. La lista Apple incluye Flutter, path_provider, share_plus y url_launcher: revisar sus manifiestos y firmas cuando sean dependencias binarias, además de los SDK publicitarios [S22]. No inventar declaraciones vacías ni asumir que instalar un plugin las resuelve.

El agente principal detectó AGP 8.11.1 frente al requisito declarado 8.12.1 de share_plus 12.0.2; no ejecutó build Android. Es una incompatibilidad de requisitos a resolver y verificar, no un fallo de build reproducido aquí. La construcción y firma release siguen siendo pruebas obligadas para la decisión de publicación.

## Decisiones propuestas para la siguiente fase

1. Validar demanda primero en español con adultos responsables y niños acompañados; el segmento inicial de 4–7 años recomendado en el informe consolidado es una hipótesis de producto, no una edad legal «segura». No cambiar el público declarado a mayores para conservar personalización.
2. Priorizar web y después Android. Elegir uno o dos mercados por señales de demanda y capacidad de atender requisitos, no únicamente por eCPM. España añade ruta GDPR/ePrivacy; audiencia hispana estadounidense activa la evaluación COPPA. Latinoamérica no exime automáticamente de esas normas ni de leyes nacionales. La jurisdicción del responsable sigue pendiente.
3. Como configuración de producto propuesta: anuncios contextuales en catálogo, máximo un banner visible separado de controles; cero anuncios en lienzo, pantalla de exportación o entre deshacer/guardar; sin interstitial, rewarded ni objetivos de clic infantiles. Falta de anuncio => seguir coloreando, sin espacios que intercepten toques. Frecuencia sin temporizadores de refresh propios durante actividad; revisar términos del proveedor antes de cualquier refresco. Son decisiones de diseño, no reglas universales de límite numérico.
4. Cerrar primero la contradicción web: tratamiento infantil aplicable, personalización desactivada y bloqueo de medición externa hasta definir ruta válida. Eliminar la carga previa sería una medida conservadora futura, no una modificación efectuada aquí. Separar información web/móvil y fijar contacto real del responsable. No declarar «no recogemos datos» mientras SDKs puedan transmitirlos.
5. Para Flutter, mantener compatibilidad con 7.0.0. La documentación actual migra RequestConfiguration a `ageRestrictedTreatment`, conservando equivalencias de TFCD/TFUA yes => child [S16]. Revisar versión que soporta nueva API y plan de upgrade con build/pruebas; **no copiarla directamente al plugin bloqueado**. UMP conserva su propia señal TFUA, que no se propaga automáticamente a MobileAds [S7]. Validar opciones de privacidad según `getPrivacyOptionsRequirementStatus()` y errores UMP [S17].

## Revisiones delimitadas y prueba de cierre

| Responsable | Punto exacto | Evidencia requerida antes de monetizar |
|---|---|---|
| Creador | País de operación, identidad/contacto, edades y primeros mercados; titularidad cuentas y dominio | Registro de decisiones; IDs no secretos; estados visibles de aprobación; fichas reales |
| Asesor privacidad | Ámbito COPPA/GDPR/normas nacionales para esos mercados; si los flujos de proveedor cumplen excepción operativa o requieren consentimiento parental; base y avisos | Inventario de flujo/SDK, datos realmente observados, contratos/proveedores y decisiones documentadas |
| Desarrollador | Configuración en web/cuentas, consentimientos, tag infantil, SDKs/permisos release y restricciones | HAR web antes/rechazo/aceptación, inspección móvil controlada, dependencias nativas y manifest fusionado, pruebas de fallos/red y salida adulta |
| Google | Vendedor autorizado, sitio/app vinculada, mensajes, verificación y estado de preparación | Evidencia en consola; aprobación de plataforma cuando corresponda, sin promesa anticipada |
| Apple/proveedor publicitario | Elegibilidad de excepción de publicidad contextual infantil y revisión humana; puerta parental y reporte de anuncio | Política pública específica y documentación para App Review; no inferir aprobación a partir de Android |

Mantener los dos problemas separados: errores técnicos verificables pueden corregirse; la evaluación de ámbito y excepción legal necesita información específica. No se propone consultar profesionalmente cada detalle de UI ni retrasar la validación de demanda sin anuncios por una aprobación publicitaria pendiente.

## Fuentes oficiales

Todas consultadas el **03/10/2026**. Son páginas vivas: verificar otra vez al implementar/publicar. No se utilizan estimaciones de terceros como evidencia de aprobación.

- **S1.** [Google Publisher Policies, COPPA](https://support.google.com/adsense/answer/10502938?hl=en).
- **S2.** [AdSense: señales de tratamiento por edad TFAT](https://support.google.com/adsense/answer/9007197?hl=en).
- **S3.** [Google Play Families Policies](https://support.google.com/googleplay/android-developer/answer/9893335?hl=en).
- **S4.** [Versiones Families Self-Certified Ads SDK](https://support.google.com/googleplay/android-developer/answer/12955712?hl=en).
- **S5.** [Apple App Review Guidelines: 1.3, 2.5.18, 5.1.1 y 5.1.4](https://developer.apple.com/app-store/review/guidelines/).
- **S6.** [AdMob: Verify your app with app-ads.txt](https://support.google.com/admob/answer/14538460?hl=en).
- **S7.** [AdMob Flutter: EEE, TFUA y consentimiento](https://developers.google.com/admob/flutter/privacy/gdpr).
- **S8.** [Google Analytics: consentimiento básico y avanzado, pings](https://support.google.com/analytics/answer/10000067?hl=en).
- **S9.** [Google: requisitos CMP para EEE, UK y Suiza](https://support.google.com/adsense/answer/13554116?hl=en).
- **S10.** [Google EU User Consent Policy](https://www.google.com/about/company/user-consent-policy/).
- **S11.** [Google: ayuda sobre cookies/identificadores incluso en NPA](https://www.google.com/about/company/user-consent-policy-help/).
- **S12.** [FTC: Complying with COPPA FAQ y advertencia de reforma](https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions).
- **S13.** [Texto oficial: COPPA Rule, Federal Register 22/04/2025, pp. 16918–16983](https://www.govinfo.gov/content/pkg/FR-2025-04-22/pdf/2025-05904.pdf); [ficha FTC de la norma](https://www.ftc.gov/legal-library/browse/federal-register-notices/16-cfr-part-312-coppa-final-rule-amendments).
- **S14.** [EUR-Lex: Reglamento GDPR 2016/679, arts. 3, 7, 8 y 13](https://eur-lex.europa.eu/eli/reg/2016/679/oj).
- **S15.** [EUR-Lex: Directiva ePrivacy 2002/58, versión consolidada](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A02002L0058-20091219).
- **S16.** [Google AdMob Flutter: tratamiento de edad y migración de TFCD/TFUA](https://developers.google.com/admob/flutter/targeting).
- **S17.** [Google AdMob Flutter: integración UMP y opciones de privacidad](https://developers.google.com/admob/flutter/privacy).
- **S18.** [Google Play: target API por fecha y tipo de aplicación](https://support.google.com/googleplay/android-developer/answer/11926878?hl=en-EN).
- **S19.** [Google Play: pruebas para cuentas personales nuevas](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en-mt).
- **S20.** [Apple: requisitos actuales por fecha, Xcode/SDK/minimum OS](https://developer.apple.com/news/upcoming-requirements/); [anuncio 03/02/2026 para SDK mínimos](https://developer.apple.com/news/?id=ueeok6yw).
- **S21.** [Apple: Privacy manifest files](https://developer.apple.com/documentation/BundleResources/privacy-manifest-files).
- **S22.** [Apple: Third-party SDK requirements y lista](https://developer.apple.com/support/third-party-SDK-requirements/).
