import 'dart:async';
import 'dart:ui' as ui;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:image/image.dart' as img;
import 'package:url_launcher/url_launcher.dart';

import 'catalog_widgets.dart';
import 'adult_controls.dart';
import 'drawing_thumbnail.dart';
import 'ad_service.dart';
import 'autosave_controller.dart';
import 'catalog_repository.dart';
import 'drawing_engine.dart';
import 'drawing_storage.dart';
import 'export_service.dart';
import 'feedback_settings.dart';
import 'layered_canvas.dart';
import 'models.dart';
import 'paintme_theme.dart';
import 'paintme_ui.dart';
import 'preferences_repository.dart';
import 'product_analytics.dart';
import 'firebase_product_analytics.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final feedback = FeedbackSettings();
  final ads = AdService();
  runApp(
    PaintMeApp(
      feedback: feedback,
      ads: ads,
      analytics: FirebaseProductAnalytics.fromEnvironment(),
    ),
  );
  WidgetsBinding.instance.addPostFrameCallback((_) async {
    await feedback.load();
    await ads.initialize();
  });
}

class PaintMeApp extends StatelessWidget {
  const PaintMeApp({
    super.key,
    required this.feedback,
    required this.ads,
    this.analytics = const DisabledProductAnalytics(),
  });
  final FeedbackSettings feedback;
  final AdService ads;
  final ProductAnalytics analytics;
  @override
  Widget build(BuildContext context) => MaterialApp(
    title: 'PaintMe',
    debugShowCheckedModeBanner: false,
    theme: paintMeTheme(),
    home: CatalogPage(feedback: feedback, ads: ads, analytics: analytics),
  );
}

class CatalogPage extends StatefulWidget {
  const CatalogPage({
    super.key,
    required this.feedback,
    required this.ads,
    this.analytics = const DisabledProductAnalytics(),
  });
  final FeedbackSettings feedback;
  final AdService ads;
  final ProductAnalytics analytics;
  @override
  State<CatalogPage> createState() => _CatalogPageState();
}

class _CatalogPageState extends State<CatalogPage> {
  final _repository = CatalogRepository();
  final _search = TextEditingController();
  final _storage = DrawingStorage();
  ProductAnalytics get _analytics => SanitizedProductAnalytics(
    widget.analytics,
    knownSlugs: (_drawings ?? []).map((drawing) => drawing.slug).toSet(),
  );
  List<Drawing>? _drawings;
  List<DrawingSession> _sessions = const [];
  String _category = '';

  @override
  void initState() {
    super.initState();
    _repository.load().then((value) {
      if (widget.analytics case final FirebaseProductAnalytics collector) {
        collector.knownSlugs = value.map((drawing) => drawing.slug).toSet();
      }
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
      'drawing_open_requested',
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
                builder: (_) => PrivacyPage(
                  feedback: widget.feedback,
                  ads: widget.ads,
                  analytics: widget.analytics,
                ),
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
                    CatalogSuggestions(
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
                  CatalogCategoryChip(
                    label: 'Todos',
                    selected: _category.isEmpty,
                    color: PaintMeColors.coral,
                    onTap: () => setState(() => _category = ''),
                  ),
                  ...CatalogRepository.categories.map(
                    (item) => Padding(
                      padding: const EdgeInsets.only(left: 8),
                      child: CatalogCategoryChip(
                        label: item.label,
                        selected: _category == item.slug,
                        color: catalogCategoryColor(item.slug),
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
                      itemBuilder: (_, index) => CatalogDrawingCard(
                        drawing: visible[index],
                        onTap: () => _open(visible[index]),
                        favorite: _favorite(visible[index].slug),
                        onFavorite: () => _toggleFavorite(visible[index].slug),
                      ),
                    ),
            ),
            CatalogAdArea(service: widget.ads),
          ],
        ),
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
  late final ThumbnailRepository _thumbnails;

  @override
  void initState() {
    super.initState();
    _thumbnails = ThumbnailRepository(widget.storage);
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
        child: CustomScrollView(
          slivers: [
            SliverPadding(
              padding: const EdgeInsets.all(20),
              sliver: SliverMainAxisGroup(
                slivers: [
                  _SessionSection(
                    title: 'Seguir coloreando',
                    sessions: progress,
                    thumbnails: _thumbnails,
                    drawings: drawings,
                    empty: 'Todavía no tienes dibujos en progreso.',
                    onOpen: widget.onOpen,
                    onFavorite: (slug) async {
                      await widget.storage.toggleFavorite(slug);
                      await _reload();
                    },
                  ),
                  const SliverToBoxAdapter(child: SizedBox(height: 24)),
                  _SessionSection(
                    title: 'Terminados',
                    sessions: completed,
                    thumbnails: _thumbnails,
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
    required this.thumbnails,
    required this.drawings,
    required this.empty,
    required this.onOpen,
    required this.onFavorite,
  });
  final String title;
  final List<DrawingSession> sessions;
  final Map<String, Drawing> drawings;
  final String empty;
  final ThumbnailRepository thumbnails;
  final ValueChanged<Drawing> onOpen;
  final ValueChanged<String> onFavorite;

  @override
  Widget build(BuildContext context) => SliverMainAxisGroup(
    slivers: [
      SliverToBoxAdapter(
        child: Padding(
          padding: const EdgeInsets.only(bottom: 8),
          child: Text(title, style: Theme.of(context).textTheme.headlineMedium),
        ),
      ),
      if (sessions.isEmpty)
        SliverToBoxAdapter(
          child: PaintMeSurface(
            padding: const EdgeInsets.all(16),
            child: Text(empty),
          ),
        )
      else
        SliverList(
          delegate: SliverChildBuilderDelegate((context, index) {
            final session = sessions[index];
            final drawing = drawings[session.slug];
            if (drawing == null) return const SizedBox.shrink();
            return Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: PaintMeSurface(
                child: ListTile(
                  leading: DrawingThumbnail(
                    drawing: drawing,
                    session: session,
                    repository: thumbnails,
                  ),
                  title: Text(drawing.label),
                  subtitle: Text(
                    session.status == DrawingStatus.completed
                        ? '¡Terminado!'
                        : (!session.hasDrawing && session.isFavorite
                              ? 'Favorito; toca para abrir'
                              : 'Toca para continuar'),
                  ),
                  onTap: () => onOpen(drawing),
                  trailing: IconButton(
                    tooltip: session.isFavorite
                        ? 'Quitar de favoritos'
                        : 'Añadir a favoritos',
                    icon: Icon(
                      session.isFavorite
                          ? Icons.favorite
                          : Icons.favorite_border,
                    ),
                    color: PaintMeColors.coral,
                    onPressed: () => onFavorite(session.slug),
                  ),
                ),
              ),
            );
          }, childCount: sessions.length),
        ),
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
    this.storage,
    this.exporter,
    this.loadSource,
  });
  final Drawing drawing;
  final List<Drawing> allDrawings;
  final FeedbackSettings feedback;
  final ProductAnalytics analytics;
  final DrawingStorage? storage;
  final ExportService? exporter;
  final Future<Uint8List> Function(Drawing)? loadSource;
  @override
  State<EditorPage> createState() => _EditorPageState();
}

class _EditorPageState extends State<EditorPage> with WidgetsBindingObserver {
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
  late final _storage = widget.storage ?? DrawingStorage();
  late final _export = widget.exporter ?? ExportService();
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
  int _layerRevision = 0;
  final _shareKey = GlobalKey();
  bool _showGestureHint = true;
  bool _firstColorTracked = false;
  String? _loadError;
  AutosaveState _saveState = AutosaveState.idle;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _load();
  }

  final _openedTime = Stopwatch();
  ProductAnalytics get _analytics => SanitizedProductAnalytics(
    widget.analytics,
    knownSlugs: widget.allDrawings.map((drawing) => drawing.slug).toSet(),
  );

  Future<void> _load() async {
    if (mounted) setState(() => _loadError = null);
    try {
      final loadSource = widget.loadSource;
      final Uint8List bytes;
      if (loadSource != null) {
        bytes = await loadSource(widget.drawing);
      } else {
        final data = await rootBundle.load(widget.drawing.asset);
        bytes = data.buffer.asUint8List(data.offsetInBytes, data.lengthInBytes);
      }
      if (!mounted) return;
      final source = img.decodePng(bytes);
      final saved = await _storage.load(widget.drawing.slug);
      if (source == null) throw StateError('El dibujo no es un PNG válido.');
      final engine = DrawingEngine.fromSource(
        source,
        savedColor: saved == null ? null : Uint8List.fromList(saved.colorPng),
      );
      _engine = engine;
      _autosave = AutosaveController(
        _storage,
        widget.drawing.slug,
        engine.colorPng,
        onState: (state) {
          if (mounted) setState(() => _saveState = state);
          if (state == AutosaveState.saved || state == AutosaveState.failed) {
            unawaited(
              _analytics.track(
                state == AutosaveState.saved
                    ? 'local_save_success'
                    : 'local_save_failure',
                properties: {
                  'slug': widget.drawing.slug,
                  'result': state == AutosaveState.saved
                      ? 'success'
                      : 'failure',
                },
              ),
            );
          }
        },
      );
      await _refreshLayers();
      if (mounted) {
        _openedTime.reset();
        _openedTime.start();
        if (saved != null) {
          final restored = img.decodePng(saved.colorPng);
          final valid =
              restored != null &&
              restored.width == engine.width &&
              restored.height == engine.height;
          await _analytics.track(
            valid ? 'restore_success' : 'restore_failure',
            properties: {
              'slug': widget.drawing.slug,
              'result': valid ? 'success' : 'failure',
            },
          );
        }
        await _analytics.track(
          'drawing_opened',
          properties: {'slug': widget.drawing.slug, 'result': 'success'},
        );
      }
      if (!await _preferences.isOnboardingComplete() && mounted) {
        WidgetsBinding.instance.addPostFrameCallback((_) => _showOnboarding());
      }
    } catch (_) {
      await _analytics.track(
        'drawing_load_failure',
        properties: {
          'slug': widget.drawing.slug,
          'reason': 'load',
          'result': 'failure',
        },
      );
      if (mounted) {
        setState(() {
          _loadError = 'No pudimos abrir este dibujo. Intenta nuevamente.';
        });
      }
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
              await _analytics.track(
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
              await _analytics.track('onboarding_completed');
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
    final revision = ++_layerRevision;
    final color = await imageFromRgba(
      engine.colorBytes,
      engine.width,
      engine.height,
    );
    final line =
        _lineLayer ??
        await imageFromRgba(engine.lineBytes, engine.width, engine.height);
    if (!mounted || revision != _layerRevision || engine != _engine) {
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
  bool get _drawingEnabled =>
      !_busy && _pointers.length == 1 && _tool != ToolMode.bucket;
  bool get _actionsBlocked => _busy || _pointers.isNotEmpty;

  Future<void> _edit(
    Future<void> Function() operation, {
    bool allowTap = false,
  }) async {
    if (_busy ||
        !mounted ||
        (allowTap ? _pointers.length > 1 : _pointers.isNotEmpty)) {
      return;
    }
    setState(() => _busy = true);
    try {
      await operation();
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('No pudimos completar la acción. Puedes reintentar.'),
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _fill(Offset local) => _edit(() async {
    final engine = _engine;
    if (engine == null || _tool != ToolMode.bucket) return;
    final point = _point(local);
    if (await engine.fill(point.dx.round(), point.dy.round(), _color) &&
        mounted) {
      widget.feedback.success();
      _trackFirstColor();
      _autosave?.schedule();
      await _refreshLayers();
    }
  }, allowTap: true);

  void _trackFirstColor() {
    if (_firstColorTracked) return;
    _firstColorTracked = true;
    _analytics.track(
      'first_color_applied',
      properties: {
        'slug': widget.drawing.slug,
        'time_band': productTimeBand(_openedTime.elapsedMilliseconds),
      },
    );
  }

  void _pointerDown(PointerDownEvent event) {
    if (_busy) return;
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
    _busy = true;
    try {
      if (_tool != ToolMode.eraser) _trackFirstColor();
      _autosave?.schedule();
      await _refreshLayers();
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _tap(TapUpDetails event) async {
    if (_tool == ToolMode.bucket) await _fill(event.localPosition);
  }

  Future<bool> _confirmExit() async {
    final engine = _engine;
    if (engine == null) return true;
    if (_actionsBlocked) return false;
    if (!engine.hasChanges && _saveState == AutosaveState.idle) return true;
    setState(() => _busy = true);
    try {
      final saved = await _autosave?.flush() ?? false;
      if (!mounted) return false;
      return await showDialog<bool>(
            context: context,
            builder: (context) => AlertDialog(
              title: const Text('¿Salir del dibujo?'),
              content: Text(
                saved
                    ? 'Tu dibujo se guardó en este dispositivo.'
                    : 'No pudimos guardar. Seguir coloreando permite reintentar antes de salir.',
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context, false),
                  child: const Text('Seguir coloreando'),
                ),
                FilledButton(
                  onPressed: () => Navigator.pop(context, true),
                  child: Text(saved ? 'Salir' : 'Salir sin guardar'),
                ),
              ],
            ),
          ) ??
          false;
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _undo() => _edit(() async {
    _engine?.undo();
    _autosave?.schedule();
    await _refreshLayers();
  });
  Future<void> _redo() => _edit(() async {
    _engine?.redo();
    _autosave?.schedule();
    await _refreshLayers();
  });
  Future<void> _reset() => _edit(() async {
    if (_engine?.hasChanges != true) return;
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('¿Reiniciar este dibujo?'),
        content: const Text(
          'Puedes cancelar o recuperar el dibujo con Deshacer antes de seguir pintando.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancelar'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Reiniciar'),
          ),
        ],
      ),
    );
    if (confirmed != true || !mounted) return;
    _engine?.reset();
    _autosave?.schedule();
    await _refreshLayers();
  });
  Future<void> _share() => _edit(() async {
    if (!await requestAdultAccess(context) || !mounted) return;
    final box = _shareKey.currentContext?.findRenderObject();
    if (box is! RenderBox || !box.hasSize) return;
    final result = await _export.saveAndShare(
      slug: widget.drawing.slug,
      png: _engine!.exportPng(),
      origin: box.localToGlobal(Offset.zero) & box.size,
    );
    if (!mounted) return;
    if (result == ExportOutcome.shared) {
      await _analytics.track(
        'drawing_shared',
        properties: {'slug': widget.drawing.slug, 'result': 'success'},
      );
    } else if (result == ExportOutcome.failed) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'No pudimos abrir Compartir. Puedes reintentar sin perder tu dibujo.',
          ),
        ),
      );
    }
  });

  Future<void> _completeDrawing() async {
    if (_actionsBlocked || !mounted) return;
    var next = false;
    setState(() => _busy = true);
    try {
      final saved = await _autosave?.flush() ?? false;
      if (!saved || !mounted) return;
      await _storage.complete(widget.drawing.slug);
      await _analytics.track(
        'drawing_completed',
        properties: {'slug': widget.drawing.slug},
      );
      if (!mounted) return;
      next =
          await showDialog<bool>(
            context: context,
            builder: (context) => AlertDialog(
              icon: const Icon(
                Icons.celebration,
                size: 48,
                color: PaintMeColors.sun,
              ),
              title: const Text('¡Dibujo terminado!'),
              content: const Text('Lo guardamos en tus dibujos terminados.'),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context, false),
                  child: const Text('Seguir mirando'),
                ),
                FilledButton.icon(
                  onPressed: () => Navigator.pop(context, true),
                  icon: const Icon(Icons.skip_next),
                  label: const Text('Otro dibujo'),
                ),
              ],
            ),
          ) ??
          false;
    } catch (_) {
      if (mounted) setState(() => _saveState = AutosaveState.failed);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
    if (next && mounted) await _nextDrawing();
  }

  Future<void> _nextDrawing() async {
    if (!await _confirmExit() || !mounted) return;
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
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.inactive ||
        state == AppLifecycleState.paused ||
        state == AppLifecycleState.hidden) {
      final autosave = _autosave;
      if (autosave != null) unawaited(autosave.flush());
    }
  }

  @override
  void dispose() {
    _layerRevision++;
    _engine?.dispose();
    WidgetsBinding.instance.removeObserver(this);
    final autosave = _autosave;
    if (autosave != null) unawaited(autosave.dispose());
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
    if (_loadError != null) {
      return Scaffold(
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.error_outline, size: 48),
                const SizedBox(height: 12),
                Text(_loadError!, textAlign: TextAlign.center),
                const SizedBox(height: 16),
                FilledButton.icon(
                  onPressed: _load,
                  icon: const Icon(Icons.refresh),
                  label: const Text('Reintentar'),
                ),
              ],
            ),
          ),
        ),
      );
    }
    if (engine == null || colorLayer == null || lineLayer == null) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }
    final saveLabel = switch (_saveState) {
      AutosaveState.idle => 'Sin cambios por guardar',
      AutosaveState.pending => 'Cambios pendientes de guardar',
      AutosaveState.saving => 'Guardando en este dispositivo…',
      AutosaveState.saved => 'Guardado en este dispositivo',
      AutosaveState.failed => 'No pudimos guardar. Reintenta antes de salir.',
    };
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) async {
        if (!didPop && await _confirmExit() && mounted) {
          Navigator.of(this.context).pop();
        }
      },
      child: Scaffold(
        bottomNavigationBar: SafeArea(
          child: Row(
            children: [
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.all(8),
                  child: Semantics(liveRegion: true, child: Text(saveLabel)),
                ),
              ),
              if (_saveState == AutosaveState.failed)
                TextButton(
                  onPressed: () => _autosave?.flush(),
                  child: const Text('Reintentar'),
                ),
            ],
          ),
        ),
        backgroundColor: Colors.transparent,
        appBar: PaintMeTopBar(
          title: Text(
            widget.drawing.label,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
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
              onPressed: !_actionsBlocked && engine.canUndo ? _undo : null,
            ),
            PaintMeIconButton(
              icon: Icons.redo,
              tooltip: 'Rehacer',
              onPressed: !_actionsBlocked && engine.canRedo ? _redo : null,
            ),
            PaintMeIconButton(
              icon: Icons.refresh,
              tooltip: 'Reiniciar',
              onPressed: _actionsBlocked ? null : _reset,
            ),
            PaintMeIconButton(
              icon: Icons.ios_share,
              tooltip: 'Guardar o compartir',
              key: _shareKey,
              onPressed: _actionsBlocked ? null : _share,
            ),
          ],
        ),
        body: PaintMeBackground(
          child: Column(
            children: [
              _ToolBar(
                tool: _tool,
                onTool: (value) {
                  if (_actionsBlocked) return;
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
                        onPointerCancel: (event) {
                          setState(() {
                            _pointers.remove(event.pointer);
                            _stroke = [];
                          });
                        },
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
                        onPressed: _actionsBlocked ? null : _completeDrawing,
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
  const PrivacyPage({
    super.key,
    required this.feedback,
    required this.ads,
    this.analytics = const DisabledProductAnalytics(),
  });
  final FeedbackSettings feedback;
  final AdService ads;
  final ProductAnalytics analytics;
  @override
  State<PrivacyPage> createState() => _PrivacyPageState();
}

class _PrivacyPageState extends State<PrivacyPage> {
  Future<void> _openAdultSettings() async {
    if (!await requestAdultAccess(context) || !mounted) return;
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
              if (widget.analytics
                  case final FirebaseProductAnalytics analytics)
                AnalyticsPreference(analytics: analytics),
              if (widget.ads.privacyOptionsRequired)
                ListTile(
                  leading: const Icon(Icons.privacy_tip_outlined),
                  title: const Text('Opciones de privacidad'),
                  onTap: () async {
                    final success = await widget.ads.showPrivacyOptions();
                    if (!success && context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text(
                            'No pudimos abrir las opciones. Intenta nuevamente.',
                          ),
                        ),
                      );
                    }
                  },
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
                  try {
                    final opened = await launchUrl(
                      url,
                      mode: LaunchMode.externalApplication,
                    );
                    if (!opened) throw StateError('external_link_unavailable');
                  } catch (_) {
                    if (context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text(
                            'No pudimos abrir el enlace. Intenta nuevamente.',
                          ),
                        ),
                      );
                    }
                  }
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
