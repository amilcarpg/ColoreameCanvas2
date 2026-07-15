import 'dart:ui' as ui;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';
import 'package:image/image.dart' as img;
import 'package:url_launcher/url_launcher.dart';

import 'ad_banner.dart';
import 'ad_service.dart';
import 'autosave_controller.dart';
import 'catalog_repository.dart';
import 'drawing_engine.dart';
import 'drawing_storage.dart';
import 'entitlement_repository.dart';
import 'export_service.dart';
import 'feedback_settings.dart';
import 'layered_canvas.dart';
import 'models.dart';
import 'paintme_theme.dart';
import 'paintme_ui.dart';
import 'preferences_repository.dart';
import 'product_analytics.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final feedback = FeedbackSettings();
  final ads = AdService();
  runApp(PaintMeApp(feedback: feedback, ads: ads));
  WidgetsBinding.instance.addPostFrameCallback((_) async {
    await feedback.load();
    await ads.initialize();
  });
}

class PaintMeApp extends StatelessWidget {
  const PaintMeApp({super.key, required this.feedback, required this.ads});
  final FeedbackSettings feedback;
  final AdService ads;
  @override
  Widget build(BuildContext context) => MaterialApp(
    title: 'PaintMe',
    debugShowCheckedModeBanner: false,
    theme: paintMeTheme(),
    home: CatalogPage(feedback: feedback, ads: ads),
  );
}

class CatalogPage extends StatefulWidget {
  const CatalogPage({super.key, required this.feedback, required this.ads});
  final FeedbackSettings feedback;
  final AdService ads;
  @override
  State<CatalogPage> createState() => _CatalogPageState();
}

class _CatalogPageState extends State<CatalogPage> {
  final _repository = CatalogRepository();
  final _search = TextEditingController();
  final _storage = DrawingStorage();
  final _analytics = const DisabledProductAnalytics();
  List<Drawing>? _drawings;
  List<DrawingSession> _sessions = const [];
  String _category = '';

  @override
  void initState() {
    super.initState();
    _repository.load().then((value) {
      if (mounted) setState(() => _drawings = value);
    });
    _refreshSessions();
    _analytics.track('catalog_opened');
    _search.addListener(() => setState(() {}));
  }

  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  Future<void> _refreshSessions() async {
    final sessions = await _storage.list();
    if (mounted) setState(() => _sessions = sessions);
  }

  Future<void> _open(Drawing drawing) async {
    await _analytics.track(
      'drawing_opened',
      properties: {'slug': drawing.slug},
    );
    if (!mounted) return;
    await Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => EditorPage(
          drawing: drawing,
          allDrawings: _drawings!,
          feedback: widget.feedback,
          analytics: _analytics,
        ),
      ),
    );
    await _refreshSessions();
  }

  bool _favorite(String slug) =>
      _sessions.any((session) => session.slug == slug && session.isFavorite);

  Future<void> _toggleFavorite(String slug) async {
    await _storage.toggleFavorite(slug);
    await _refreshSessions();
  }

  @override
  Widget build(BuildContext context) {
    final drawings = _drawings;
    if (drawings == null) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }
    final visible = _repository.filter(
      drawings,
      category: _category,
      query: _search.text,
    );
    return Scaffold(
      backgroundColor: Colors.transparent,
      appBar: PaintMeTopBar(
        actions: [
          PaintMeIconButton(
            icon: Icons.collections_bookmark_outlined,
            tooltip: 'Mis dibujos',
            onPressed: () async {
              await Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (_) => MyDrawingsPage(
                    drawings: drawings,
                    storage: _storage,
                    onOpen: _open,
                  ),
                ),
              );
              await _refreshSessions();
            },
          ),
          PaintMeIconButton(
            icon: Icons.privacy_tip_outlined,
            tooltip: 'Privacidad y ajustes',
            onPressed: () => Navigator.of(context).push(
              MaterialPageRoute(
                builder: (_) => PrivacyPage(feedback: widget.feedback),
              ),
            ),
          ),
          PaintMeIconButton(
            icon: Icons.casino_outlined,
            tooltip: 'Dibujo sorpresa',
            onPressed: visible.isEmpty
                ? null
                : () {
                    visible.shuffle();
                    _open(visible.first);
                  },
          ),
        ],
      ),
      body: PaintMeBackground(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 8, 20, 8),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Elige un dibujo',
                    style: Theme.of(context).textTheme.headlineMedium,
                  ),
                  const Text('Toca, pinta y crea algo genial.'),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _search,
                    decoration: InputDecoration(
                      prefixIcon: const Icon(
                        Icons.search,
                        color: PaintMeColors.sky,
                      ),
                      hintText: 'Busca un dibujo',
                      suffixIcon: _search.text.isEmpty
                          ? null
                          : IconButton(
                              tooltip: 'Limpiar búsqueda',
                              icon: const Icon(Icons.close),
                              onPressed: _search.clear,
                            ),
                    ),
                  ),
                  if (_sessions.isNotEmpty) ...[
                    const SizedBox(height: 12),
                    _ForYouRow(
                      drawings: drawings,
                      sessions: _sessions,
                      onOpen: _open,
                    ),
                  ],
                ],
              ),
            ),
            SizedBox(
              height: 52,
              child: ListView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 20),
                children: [
                  _CategoryChip(
                    label: 'Todos',
                    selected: _category.isEmpty,
                    color: PaintMeColors.coral,
                    onTap: () => setState(() => _category = ''),
                  ),
                  ...CatalogRepository.categories.map(
                    (item) => Padding(
                      padding: const EdgeInsets.only(left: 8),
                      child: _CategoryChip(
                        label: item.label,
                        selected: _category == item.slug,
                        color: _categoryColor(item.slug),
                        onTap: () => setState(() => _category = item.slug),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: visible.isEmpty
                  ? const Center(
                      child: PaintMeSurface(
                        padding: EdgeInsets.all(24),
                        child: Text('No encontramos dibujos.'),
                      ),
                    )
                  : GridView.builder(
                      padding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
                      gridDelegate:
                          const SliverGridDelegateWithMaxCrossAxisExtent(
                            maxCrossAxisExtent: 190,
                            mainAxisSpacing: 16,
                            crossAxisSpacing: 16,
                            childAspectRatio: .76,
                          ),
                      itemCount: visible.length,
                      itemBuilder: (_, index) => _DrawingCard(
                        drawing: visible[index],
                        onTap: () => _open(visible[index]),
                        favorite: _favorite(visible[index].slug),
                        onFavorite: () => _toggleFavorite(visible[index].slug),
                      ),
                    ),
            ),
            _CatalogAdArea(service: widget.ads),
          ],
        ),
      ),
    );
  }
}

Color _categoryColor(String category) => switch (category) {
  'animales' => PaintMeColors.mint,
  'vehiculos' => PaintMeColors.sky,
  'navidad' => PaintMeColors.coral,
  'fantasia' => PaintMeColors.lilac,
  'dinosaurios' => const Color(0xffa9dc67),
  'princesas' => PaintMeColors.pink,
  _ => PaintMeColors.coral,
};

class _CategoryChip extends StatelessWidget {
  const _CategoryChip({
    required this.label,
    required this.selected,
    required this.color,
    required this.onTap,
  });
  final String label;
  final bool selected;
  final Color color;
  final VoidCallback onTap;
  @override
  Widget build(BuildContext context) => Semantics(
    button: true,
    selected: selected,
    label: label,
    child: Material(
      color: selected ? color : Colors.white,
      borderRadius: PaintMeShape.extraLarge,
      child: InkWell(
        onTap: onTap,
        borderRadius: PaintMeShape.extraLarge,
        child: Container(
          constraints: const BoxConstraints(minHeight: 48),
          alignment: Alignment.center,
          padding: const EdgeInsets.symmetric(horizontal: 18),
          child: Text(
            label,
            style: TextStyle(
              fontWeight: FontWeight.w800,
              color: selected ? PaintMeColors.ink : PaintMeColors.inkSoft,
            ),
          ),
        ),
      ),
    ),
  );
}

class _DrawingCard extends StatelessWidget {
  const _DrawingCard({
    required this.drawing,
    required this.onTap,
    this.favorite = false,
    this.onFavorite,
  });
  final Drawing drawing;
  final VoidCallback onTap;
  final bool favorite;
  final VoidCallback? onFavorite;
  @override
  Widget build(BuildContext context) {
    final color = _categoryColor(drawing.category);
    return Semantics(
      button: true,
      label: 'Colorear ${drawing.label}',
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: PaintMeShape.large,
          child: Ink(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: PaintMeShape.large,
              boxShadow: const [PaintMeShape.softShadow],
            ),
            child: LayoutBuilder(
              builder: (context, constraints) => Column(
                children: [
                  Expanded(
                    child: Stack(
                      children: [
                        Container(
                          margin: const EdgeInsets.fromLTRB(10, 10, 10, 4),
                          decoration: BoxDecoration(
                            color: color.withValues(alpha: .18),
                            borderRadius: PaintMeShape.medium,
                          ),
                          child: Padding(
                            padding: const EdgeInsets.all(10),
                            child: Image.asset(
                              drawing.asset,
                              fit: BoxFit.contain,
                              cacheWidth:
                                  (constraints.maxWidth *
                                          MediaQuery.devicePixelRatioOf(
                                            context,
                                          ))
                                      .round(),
                            ),
                          ),
                        ),
                        if (onFavorite != null)
                          Positioned(
                            top: 6,
                            right: 6,
                            child: IconButton(
                              tooltip: favorite
                                  ? 'Quitar de favoritos'
                                  : 'Añadir a favoritos',
                              onPressed: onFavorite,
                              icon: Icon(
                                favorite
                                    ? Icons.favorite
                                    : Icons.favorite_border,
                              ),
                              color: PaintMeColors.coral,
                            ),
                          ),
                      ],
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.fromLTRB(10, 3, 10, 4),
                    child: Text(
                      drawing.label,
                      maxLines: 2,
                      textAlign: TextAlign.center,
                      overflow: TextOverflow.ellipsis,
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.only(bottom: 10),
                    child: Text(
                      'Colorear',
                      style: TextStyle(
                        fontWeight: FontWeight.w800,
                        color: color,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _CatalogAdArea extends StatelessWidget {
  const _CatalogAdArea({required this.service});
  final AdService service;
  @override
  Widget build(BuildContext context) => Container(
    color: Colors.white.withValues(alpha: .78),
    padding: const EdgeInsets.only(top: 8),
    child: SafeArea(
      top: false,
      child: AnimatedBuilder(
        animation: service,
        builder: (_, _) => service.ready
            ? CatalogAdBanner(service: service)
            : const SizedBox(height: 50),
      ),
    ),
  );
}

class _ForYouRow extends StatelessWidget {
  const _ForYouRow({
    required this.drawings,
    required this.sessions,
    required this.onOpen,
  });
  final List<Drawing> drawings;
  final List<DrawingSession> sessions;
  final ValueChanged<Drawing> onOpen;

  @override
  Widget build(BuildContext context) {
    final bySlug = {for (final drawing in drawings) drawing.slug: drawing};
    final recent = sessions
        .where((item) => item.status == DrawingStatus.inProgress)
        .firstOrNull;
    final favorite = sessions.where((item) => item.isFavorite).firstOrNull;
    final suggestions = <Drawing>{
      if (recent != null && bySlug[recent.slug] != null) bySlug[recent.slug]!,
      if (favorite != null && bySlug[favorite.slug] != null)
        bySlug[favorite.slug]!,
      drawings.firstWhere(
        (item) =>
            recent == null || item.category != bySlug[recent.slug]?.category,
        orElse: () => drawings.first,
      ),
    }.toList();
    return SizedBox(
      height: 72,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: suggestions.length,
        separatorBuilder: (_, _) => const SizedBox(width: 8),
        itemBuilder: (_, index) {
          final drawing = suggestions[index];
          final isRecent = recent?.slug == drawing.slug;
          return ActionChip(
            avatar: Icon(isRecent ? Icons.play_arrow : Icons.auto_awesome),
            label: Text(
              isRecent ? 'Continúa: ${drawing.label}' : drawing.label,
            ),
            onPressed: () => onOpen(drawing),
          );
        },
      ),
    );
  }
}

class MyDrawingsPage extends StatefulWidget {
  const MyDrawingsPage({
    super.key,
    required this.drawings,
    required this.storage,
    required this.onOpen,
  });
  final List<Drawing> drawings;
  final DrawingStorage storage;
  final ValueChanged<Drawing> onOpen;

  @override
  State<MyDrawingsPage> createState() => _MyDrawingsPageState();
}

class _MyDrawingsPageState extends State<MyDrawingsPage> {
  List<DrawingSession>? _sessions;

  @override
  void initState() {
    super.initState();
    _reload();
  }

  Future<void> _reload() async {
    final sessions = await widget.storage.list();
    if (mounted) setState(() => _sessions = sessions);
  }

  @override
  Widget build(BuildContext context) {
    final sessions = _sessions;
    if (sessions == null) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }
    final drawings = {
      for (final drawing in widget.drawings) drawing.slug: drawing,
    };
    final progress = sessions
        .where((item) => item.status == DrawingStatus.inProgress)
        .toList();
    final completed = sessions
        .where((item) => item.status == DrawingStatus.completed)
        .toList();
    return Scaffold(
      appBar: PaintMeTopBar(
        title: const Text('Mis dibujos'),
        leading: PaintMeIconButton(
          icon: Icons.arrow_back,
          tooltip: 'Volver',
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: PaintMeBackground(
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            _SessionSection(
              title: 'Seguir coloreando',
              sessions: progress,
              drawings: drawings,
              empty: 'Todavía no tienes dibujos en progreso.',
              onOpen: widget.onOpen,
              onFavorite: (slug) async {
                await widget.storage.toggleFavorite(slug);
                await _reload();
              },
            ),
            const SizedBox(height: 24),
            _SessionSection(
              title: 'Terminados',
              sessions: completed,
              drawings: drawings,
              empty: 'Cuando termines un dibujo, aparecerá aquí.',
              onOpen: widget.onOpen,
              onFavorite: (slug) async {
                await widget.storage.toggleFavorite(slug);
                await _reload();
              },
            ),
          ],
        ),
      ),
    );
  }
}

class _SessionSection extends StatelessWidget {
  const _SessionSection({
    required this.title,
    required this.sessions,
    required this.drawings,
    required this.empty,
    required this.onOpen,
    required this.onFavorite,
  });
  final String title;
  final List<DrawingSession> sessions;
  final Map<String, Drawing> drawings;
  final String empty;
  final ValueChanged<Drawing> onOpen;
  final ValueChanged<String> onFavorite;

  @override
  Widget build(BuildContext context) => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Text(title, style: Theme.of(context).textTheme.headlineMedium),
      const SizedBox(height: 8),
      if (sessions.isEmpty)
        PaintMeSurface(padding: const EdgeInsets.all(16), child: Text(empty))
      else
        ...sessions.map((session) {
          final drawing = drawings[session.slug];
          if (drawing == null) return const SizedBox.shrink();
          return Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: PaintMeSurface(
              child: ListTile(
                leading: Image.asset(drawing.asset, width: 48, height: 48),
                title: Text(drawing.label),
                subtitle: Text(
                  session.status == DrawingStatus.completed
                      ? '¡Terminado!'
                      : 'Toca para continuar',
                ),
                onTap: () => onOpen(drawing),
                trailing: IconButton(
                  tooltip: session.isFavorite
                      ? 'Quitar de favoritos'
                      : 'Añadir a favoritos',
                  icon: Icon(
                    session.isFavorite ? Icons.favorite : Icons.favorite_border,
                  ),
                  color: PaintMeColors.coral,
                  onPressed: () => onFavorite(session.slug),
                ),
              ),
            ),
          );
        }),
    ],
  );
}

class EditorPage extends StatefulWidget {
  const EditorPage({
    super.key,
    required this.drawing,
    required this.allDrawings,
    required this.feedback,
    required this.analytics,
  });
  final Drawing drawing;
  final List<Drawing> allDrawings;
  final FeedbackSettings feedback;
  final ProductAnalytics analytics;
  @override
  State<EditorPage> createState() => _EditorPageState();
}

class _EditorPageState extends State<EditorPage> {
  static const colors = <int>[
    0xffef5350,
    0xffec407a,
    0xffab47bc,
    0xff5c6bc0,
    0xff42a5f5,
    0xff26a69a,
    0xff66bb6a,
    0xffffee58,
    0xffffca28,
    0xffff7043,
    0xff8d6e63,
    0xff78909c,
  ];
  final _storage = DrawingStorage();
  final _export = ExportService();
  final _preferences = PreferencesRepository();
  final _transform = TransformationController();
  final Set<int> _pointers = {};
  DrawingEngine? _engine;
  AutosaveController? _autosave;
  ui.Image? _colorLayer;
  ui.Image? _lineLayer;
  List<Offset> _stroke = [];
  ToolMode _tool = ToolMode.bucket;
  int _color = colors.first;
  int _brushSize = 18;
  bool _busy = false;
  bool _showGestureHint = true;
  bool _firstColorTracked = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final bytes = await rootBundle.load(widget.drawing.asset);
    final source = img.decodePng(bytes.buffer.asUint8List());
    final saved = await _storage.load(widget.drawing.slug);
    if (source == null) return;
    final engine = DrawingEngine.fromSource(
      source,
      savedColor: saved == null ? null : Uint8List.fromList(saved.colorPng),
    );
    _engine = engine;
    _autosave = AutosaveController(_storage, widget.drawing.slug, engine);
    await _refreshLayers();
    if (!await _preferences.isOnboardingComplete() && mounted) {
      WidgetsBinding.instance.addPostFrameCallback((_) => _showOnboarding());
    }
  }

  Future<void> _showOnboarding() async {
    if (!mounted) return;
    await showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        icon: const Icon(
          Icons.auto_awesome,
          size: 42,
          color: PaintMeColors.coral,
        ),
        title: const Text('¡Vamos a colorear!'),
        content: const Text(
          '1. Elige un color.\n2. Toca con el balde para rellenar.\n3. Usa dos dedos para acercar o mover.\n\nTu dibujo se guarda solito.',
        ),
        actions: [
          TextButton(
            onPressed: () async {
              await _preferences.completeOnboarding();
              await widget.analytics.track(
                'onboarding_completed',
                properties: {'skipped': true},
              );
              if (context.mounted) Navigator.pop(context);
            },
            child: const Text('Omitir'),
          ),
          FilledButton(
            onPressed: () async {
              await _preferences.completeOnboarding();
              await widget.analytics.track('onboarding_completed');
              if (context.mounted) Navigator.pop(context);
            },
            child: const Text('¡Entendido!'),
          ),
        ],
      ),
    );
  }

  Future<void> _refreshLayers() async {
    final engine = _engine;
    if (engine == null) return;
    final color = await imageFromRgba(
      engine.colorBytes,
      engine.width,
      engine.height,
    );
    final line =
        _lineLayer ??
        await imageFromRgba(engine.lineBytes, engine.width, engine.height);
    if (!mounted) {
      color.dispose();
      if (_lineLayer == null) line.dispose();
      return;
    }
    final old = _colorLayer;
    setState(() {
      _colorLayer = color;
      _lineLayer = line;
    });
    old?.dispose();
  }

  Offset _point(Offset local) => _transform.toScene(local);
  bool get _drawingEnabled => _pointers.length == 1 && _tool != ToolMode.bucket;

  Future<void> _fill(Offset local) async {
    final engine = _engine;
    if (engine == null || _tool != ToolMode.bucket || _busy) return;
    final point = _point(local);
    setState(() => _busy = true);
    final filled = await engine.fill(
      point.dx.round(),
      point.dy.round(),
      _color,
    );
    if (filled) {
      widget.feedback.success();
      _trackFirstColor();
      await _refreshLayers();
      _autosave?.schedule();
    }
    if (mounted) setState(() => _busy = false);
  }

  void _trackFirstColor() {
    if (_firstColorTracked) return;
    _firstColorTracked = true;
    widget.analytics.track(
      'first_color_applied',
      properties: {'slug': widget.drawing.slug},
    );
  }

  void _pointerDown(PointerDownEvent event) {
    setState(() {
      _pointers.add(event.pointer);
      _stroke = _drawingEnabled ? [_point(event.localPosition)] : [];
    });
  }

  void _pointerMove(PointerMoveEvent event) {
    if (!_drawingEnabled || _stroke.isEmpty) return;
    setState(() => _stroke = [..._stroke, _point(event.localPosition)]);
  }

  Future<void> _pointerUp(PointerEvent event) async {
    final wasDrawing = _drawingEnabled && _stroke.isNotEmpty;
    setState(() => _pointers.remove(event.pointer));
    if (!wasDrawing) return;
    final engine = _engine;
    if (engine == null) return;
    final points = _stroke;
    setState(() => _stroke = []);
    engine.applyStroke(
      points: points,
      color: _color,
      size: _brushSize,
      erase: _tool == ToolMode.eraser,
    );
    _trackFirstColor();
    await _refreshLayers();
    _autosave?.schedule();
  }

  Future<void> _tap(TapUpDetails event) async {
    if (_tool == ToolMode.bucket) await _fill(event.localPosition);
  }

  Future<bool> _confirmExit() async {
    final engine = _engine;
    if (engine == null || !engine.hasChanges) return true;
    return await showDialog<bool>(
          context: context,
          builder: (context) => AlertDialog(
            title: const Text('¿Salir del dibujo?'),
            content: const Text('Tu dibujo se guardó automáticamente.'),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context, false),
                child: const Text('Seguir coloreando'),
              ),
              FilledButton(
                onPressed: () => Navigator.pop(context, true),
                child: const Text('Salir'),
              ),
            ],
          ),
        ) ??
        false;
  }

  Future<void> _undo() async {
    _engine?.undo();
    await _refreshLayers();
    _autosave?.schedule();
  }

  Future<void> _reset() async {
    _engine?.reset();
    await _refreshLayers();
    _autosave?.schedule();
  }

  Future<void> _completeDrawing() async {
    await _autosave?.flush();
    await _storage.complete(widget.drawing.slug);
    await widget.analytics.track(
      'drawing_completed',
      properties: {'slug': widget.drawing.slug},
    );
    if (!mounted) return;
    await showDialog<void>(
      context: context,
      builder: (context) => AlertDialog(
        icon: const Icon(Icons.celebration, size: 48, color: PaintMeColors.sun),
        title: const Text('¡Qué dibujo tan genial!'),
        content: const Text('Lo guardamos en tus dibujos terminados.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Seguir mirando'),
          ),
          FilledButton.icon(
            onPressed: () {
              Navigator.pop(context);
              _nextDrawing();
            },
            icon: const Icon(Icons.skip_next),
            label: const Text('Otro dibujo'),
          ),
        ],
      ),
    );
  }

  void _nextDrawing() {
    final index = widget.allDrawings.indexWhere(
      (item) => item.slug == widget.drawing.slug,
    );
    final next = widget.allDrawings[(index + 1) % widget.allDrawings.length];
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(
        builder: (_) => EditorPage(
          drawing: next,
          allDrawings: widget.allDrawings,
          feedback: widget.feedback,
          analytics: widget.analytics,
        ),
      ),
    );
  }

  @override
  void dispose() {
    _autosave?.dispose();
    _colorLayer?.dispose();
    _lineLayer?.dispose();
    _transform.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final engine = _engine;
    final colorLayer = _colorLayer;
    final lineLayer = _lineLayer;
    if (engine == null || colorLayer == null || lineLayer == null) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) async {
        if (!didPop && await _confirmExit() && mounted) {
          Navigator.of(this.context).pop();
        }
      },
      child: Scaffold(
        backgroundColor: Colors.transparent,
        appBar: PaintMeTopBar(
          title: Text(widget.drawing.label),
          leading: PaintMeIconButton(
            icon: Icons.arrow_back,
            tooltip: 'Volver',
            onPressed: () async {
              if (await _confirmExit() && mounted) {
                Navigator.of(this.context).pop();
              }
            },
          ),
          actions: [
            PaintMeIconButton(
              icon: Icons.undo,
              tooltip: 'Deshacer',
              onPressed: engine.canUndo ? _undo : null,
            ),
            PaintMeIconButton(
              icon: Icons.refresh,
              tooltip: 'Reiniciar',
              onPressed: _reset,
            ),
            PaintMeIconButton(
              icon: Icons.ios_share,
              tooltip: 'Guardar o compartir',
              onPressed: () async {
                await _export.saveAndShare(
                  slug: widget.drawing.slug,
                  png: engine.exportPng(),
                );
                await widget.analytics.track(
                  'drawing_shared',
                  properties: {'slug': widget.drawing.slug},
                );
              },
            ),
          ],
        ),
        body: PaintMeBackground(
          child: Column(
            children: [
              _ToolBar(
                tool: _tool,
                onTool: (value) {
                  widget.feedback.selection();
                  setState(() => _tool = value);
                },
              ),
              if (_tool != ToolMode.bucket)
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Row(
                    children: [
                      const Icon(Icons.line_weight),
                      Expanded(
                        child: Slider(
                          value: _brushSize.toDouble(),
                          min: 6,
                          max: 48,
                          divisions: 7,
                          label: '$_brushSize',
                          onChanged: (value) =>
                              setState(() => _brushSize = value.round()),
                        ),
                      ),
                    ],
                  ),
                ),
              SizedBox(
                height: 58,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  children: colors.map((value) {
                    return Semantics(
                      button: true,
                      label: 'Color ${_colorName(value)}',
                      selected: _color == value,
                      child: Padding(
                        padding: const EdgeInsets.all(6),
                        child: InkWell(
                          onTap: () {
                            widget.feedback.selection();
                            setState(() => _color = value);
                          },
                          borderRadius: BorderRadius.circular(30),
                          child: Container(
                            width: 42,
                            height: 42,
                            decoration: BoxDecoration(
                              color: Color(value),
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: _color == value
                                    ? PaintMeColors.ink
                                    : Colors.white,
                                width: _color == value ? 3 : 1,
                              ),
                            ),
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ),
              if (_showGestureHint)
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: PaintMeSurface(
                    color: const Color(0xfffff3cb),
                    radius: PaintMeShape.medium,
                    padding: const EdgeInsets.fromLTRB(14, 8, 6, 8),
                    child: Row(
                      children: [
                        const Icon(Icons.pinch, color: PaintMeColors.ink),
                        const SizedBox(width: 8),
                        const Expanded(
                          child: Text('Usa dos dedos para mover y acercar.'),
                        ),
                        IconButton(
                          tooltip: 'Cerrar ayuda',
                          onPressed: () =>
                              setState(() => _showGestureHint = false),
                          icon: const Icon(Icons.close),
                        ),
                      ],
                    ),
                  ),
                ),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16, 6, 16, 0),
                  child: PaintMeSurface(
                    padding: const EdgeInsets.all(8),
                    child: Center(
                      child: Listener(
                        onPointerDown: _pointerDown,
                        onPointerMove: _pointerMove,
                        onPointerUp: _pointerUp,
                        onPointerCancel: _pointerUp,
                        child: InteractiveViewer(
                          transformationController: _transform,
                          panEnabled: _pointers.length >= 2,
                          scaleEnabled: _pointers.length >= 2,
                          minScale: .5,
                          maxScale: 3,
                          boundaryMargin: const EdgeInsets.all(200),
                          child: GestureDetector(
                            onTapUp: _tap,
                            child: LayeredCanvas(
                              width: engine.width,
                              height: engine.height,
                              colorLayer: colorLayer,
                              lineLayer: lineLayer,
                              stroke: _stroke,
                              strokeColor: Color(_color),
                              strokeSize: _brushSize.toDouble(),
                              erase: _tool == ToolMode.eraser,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 10, 16, 12),
                child: Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: () => _transform.value = Matrix4.identity(),
                        icon: const Icon(Icons.fit_screen),
                        label: const Text('Ajustar'),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: FilledButton.icon(
                        style: FilledButton.styleFrom(
                          backgroundColor: PaintMeColors.coral,
                          minimumSize: const Size.fromHeight(48),
                        ),
                        onPressed: _completeDrawing,
                        icon: const Icon(Icons.celebration),
                        label: const Text('Terminé'),
                      ),
                    ),
                  ],
                ),
              ),
              if (_busy) const LinearProgressIndicator(),
            ],
          ),
        ),
      ),
    );
  }
}

String _colorName(int value) => switch (value) {
  0xffef5350 => 'rojo',
  0xffec407a => 'rosa',
  0xffab47bc => 'morado',
  0xff5c6bc0 => 'índigo',
  0xff42a5f5 => 'azul',
  0xff26a69a => 'turquesa',
  0xff66bb6a => 'verde',
  0xffffee58 => 'amarillo claro',
  0xffffca28 => 'amarillo',
  0xffff7043 => 'naranja',
  0xff8d6e63 => 'marrón',
  _ => 'gris',
};

class _ToolBar extends StatelessWidget {
  const _ToolBar({required this.tool, required this.onTool});
  final ToolMode tool;
  final ValueChanged<ToolMode> onTool;
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.fromLTRB(16, 2, 16, 4),
    child: PaintMeSurface(
      padding: const EdgeInsets.all(5),
      child: Row(
        children: [
          _ToolChoice(
            value: ToolMode.bucket,
            label: 'Balde',
            icon: Icons.format_color_fill,
            selected: tool == ToolMode.bucket,
            onTap: onTool,
          ),
          _ToolChoice(
            value: ToolMode.brush,
            label: 'Pincel',
            icon: Icons.brush,
            selected: tool == ToolMode.brush,
            onTap: onTool,
          ),
          _ToolChoice(
            value: ToolMode.eraser,
            label: 'Borrador',
            icon: Icons.auto_fix_off,
            selected: tool == ToolMode.eraser,
            onTap: onTool,
          ),
        ],
      ),
    ),
  );
}

class _ToolChoice extends StatelessWidget {
  const _ToolChoice({
    required this.value,
    required this.label,
    required this.icon,
    required this.selected,
    required this.onTap,
  });
  final ToolMode value;
  final String label;
  final IconData icon;
  final bool selected;
  final ValueChanged<ToolMode> onTap;
  @override
  Widget build(BuildContext context) => Expanded(
    child: Semantics(
      button: true,
      selected: selected,
      label: label,
      child: Material(
        color: selected ? PaintMeColors.sun : Colors.transparent,
        borderRadius: PaintMeShape.small,
        child: InkWell(
          onTap: () => onTap(value),
          borderRadius: PaintMeShape.small,
          child: SizedBox(
            height: 48,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(icon, size: 20, color: PaintMeColors.ink),
                Text(
                  label,
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    ),
  );
}

class PrivacyPage extends StatefulWidget {
  const PrivacyPage({super.key, required this.feedback});
  final FeedbackSettings feedback;
  @override
  State<PrivacyPage> createState() => _PrivacyPageState();
}

class _PrivacyPageState extends State<PrivacyPage> {
  final _entitlements = const EntitlementRepository();

  Future<void> _openAdultSettings() async {
    final answer = TextEditingController();
    final allowed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Solo para adultos'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('Para continuar, responde: ¿cuánto es 4 + 3?'),
            TextField(
              controller: answer,
              keyboardType: TextInputType.number,
              autofocus: true,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancelar'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, answer.text.trim() == '7'),
            child: const Text('Continuar'),
          ),
        ],
      ),
    );
    answer.dispose();
    if (allowed != true || !mounted) return;
    final adFree = await _entitlements.hasAdFreeEntitlement();
    if (!mounted) return;
    await showModalBottomSheet<void>(
      context: context,
      showDragHandle: true,
      builder: (context) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Ajustes para adultos',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 12),
              ListTile(
                leading: const Icon(Icons.privacy_tip_outlined),
                title: const Text('Opciones de privacidad'),
                onTap: () => ConsentForm.showPrivacyOptionsForm((_) {}),
              ),
              ListTile(
                leading: const Icon(Icons.block_outlined),
                title: Text(
                  adFree ? 'Anuncios eliminados' : 'Eliminar anuncios',
                ),
                subtitle: Text(
                  adFree ? 'Gracias por apoyar PaintMe.' : 'Próximamente',
                ),
                onTap: null,
              ),
              ListTile(
                leading: const Icon(Icons.open_in_new),
                title: const Text('Política de privacidad'),
                onTap: () async {
                  final url = Uri.parse(
                    const String.fromEnvironment(
                    'PRIVACY_POLICY_URL',
                    defaultValue: 'https://www.paintme.club/privacy.html',
                    ),
                  );
                  await launchUrl(url, mode: LaunchMode.externalApplication);
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    backgroundColor: Colors.transparent,
    appBar: PaintMeTopBar(
      leading: PaintMeIconButton(
        icon: Icons.arrow_back,
        tooltip: 'Volver',
        onPressed: () => Navigator.pop(context),
      ),
      title: const Text('Privacidad y ajustes'),
    ),
    body: PaintMeBackground(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: PaintMeSurface(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Para familias',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 12),
              const Text(
                'PaintMe funciona sin cuenta y guarda los dibujos solo en este dispositivo. Los anuncios solo aparecen en el catálogo.',
              ),
              const SizedBox(height: 18),
              SwitchListTile.adaptive(
                contentPadding: EdgeInsets.zero,
                title: const Text('Vibración'),
                subtitle: const Text(
                  'Respuesta táctil al pintar y elegir herramientas',
                ),
                value: widget.feedback.enabled,
                onChanged: (value) async {
                  await widget.feedback.setEnabled(value);
                  if (mounted) setState(() {});
                },
              ),
              const SizedBox(height: 12),
              OutlinedButton.icon(
                icon: const Icon(Icons.lock_outline),
                label: const Text('Ajustes para adultos'),
                onPressed: _openAdultSettings,
              ),
            ],
          ),
        ),
      ),
    ),
  );
}
