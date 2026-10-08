import 'dart:async';
import 'package:flutter/services.dart';
import 'package:paintme_app/ad_banner.dart';
import 'package:paintme_app/ad_service.dart';
import 'package:paintme_app/ad_config.dart';
import 'package:paintme_app/entitlement_repository.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:image/image.dart' as img;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:paintme_app/adult_controls.dart';
import 'package:paintme_app/drawing_storage.dart';
import 'package:paintme_app/drawing_thumbnail.dart';
import 'package:paintme_app/feedback_settings.dart';
import 'package:paintme_app/layered_canvas.dart';
import 'package:paintme_app/main.dart';
import 'package:paintme_app/models.dart';
import 'package:paintme_app/product_analytics.dart';

const drawing = Drawing(
  label: 'Prueba',
  slug: 'prueba',
  category: 'animales',
  pack: 'animales',
  asset: 'fixture.png',
  keywords: [],
  featured: false,
);
Uint8List sourcePng() {
  final source = img.Image(width: 24, height: 24, numChannels: 4);
  img.fill(source, color: img.ColorRgba8(255, 255, 255, 255));
  return Uint8List.fromList(img.encodePng(source));
}

Future<void> settleIO(WidgetTester tester) async {
  for (var i = 0; i < 12; i++) {
    await tester.runAsync(
      () => Future<void>.delayed(const Duration(milliseconds: 25)),
    );
    await tester.pump(const Duration(milliseconds: 100));
  }
}

class MemoryDrawingStorage extends DrawingStorage {
  DrawingSession? saved;
  bool fail = false;
  @override
  Future<void> save(String slug, Uint8List colorPng) async {
    if (fail) throw StateError('quota');
    saved = DrawingSession(
      slug: slug,
      updatedAt: DateTime.now(),
      colorPng: Uint8List.fromList(colorPng),
    );
  }

  @override
  Future<DrawingSession?> load(String slug) async => saved;
}

class DelayedEntitlement extends EntitlementRepository {
  final answer = Completer<bool>();
  @override
  Future<bool> hasAdFreeEntitlement() => answer.future;
}

class RecordingAnalytics implements ProductAnalytics {
  final events = <String>[];
  bool throws = false;
  @override
  Future<void> track(
    String event, {
    Map<String, Object?> properties = const {},
  }) async {
    if (throws) throw StateError('collector offline');
    events.add(event);
  }
}

class ReadyConsent implements ConsentGateway {
  bool permitted = true;
  @override
  Future<void> update() async {}
  @override
  Future<void> showIfRequired() async {}
  @override
  Future<bool> canRequest() async => permitted;
  @override
  Future<bool> optionsRequired() async => true;
  @override
  Future<void> showOptions() async {}
}

void main() {
  late MemoryDrawingStorage storage;
  setUp(() {
    SharedPreferences.setMockInitialValues({'onboarding_complete_v1': true});
    storage = MemoryDrawingStorage();
  });
  testWidgets('failed drawing load emits failure without activation', (
    tester,
  ) async {
    final analytics = RecordingAnalytics();
    await tester.pumpWidget(
      MaterialApp(
        home: EditorPage(
          drawing: drawing,
          allDrawings: const [drawing],
          feedback: FeedbackSettings(),
          analytics: analytics,
          storage: storage,
          loadSource: (_) async => Uint8List.fromList([1, 2, 3]),
        ),
      ),
    );
    await settleIO(tester);
    expect(analytics.events, ['drawing_load_failure']);
    expect(
      find.text('No pudimos abrir este dibujo. Intenta nuevamente.'),
      findsOneWidget,
    );
    expect(tester.takeException(), null);
  });
  testWidgets(
    'restore is reported after real PNG load and collector errors do not block painting',
    (tester) async {
      final analytics = RecordingAnalytics();
      storage.saved = DrawingSession(
        slug: 'prueba',
        updatedAt: DateTime.now(),
        colorPng: sourcePng(),
      );
      await tester.pumpWidget(
        MaterialApp(
          home: EditorPage(
            drawing: drawing,
            allDrawings: const [drawing],
            feedback: FeedbackSettings(),
            analytics: analytics,
            storage: storage,
            loadSource: (_) async => sourcePng(),
          ),
        ),
      );
      await settleIO(tester);
      expect(
        analytics.events,
        containsAllInOrder(['restore_success', 'drawing_opened']),
      );
      analytics.throws = true;
      await tester.tap(find.byType(LayeredCanvas));
      await settleIO(tester);
      expect(
        find.text('No pudimos abrir este dibujo. Intenta nuevamente.'),
        findsNothing,
      );
      expect(tester.takeException(), null);
      await tester.pumpWidget(const SizedBox());
      await settleIO(tester);
    },
  );
  testWidgets(
    'revocation during entitlement lookup prevents any native banner request',
    (tester) async {
      final consent = ReadyConsent();
      final entitlement = DelayedEntitlement();
      final service = AdService(
        config: const AdConfig(environment: 'test'),
        consent: consent,
        enable: () async {},
      );
      await service.initialize();
      var nativeCalls = 0;
      final messenger =
          TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger;
      messenger.setMockMessageHandler('plugins.flutter.io/google_mobile_ads', (
        _,
      ) async {
        nativeCalls++;
        return const StandardMethodCodec().encodeSuccessEnvelope(null);
      });
      addTearDown(
        () => messenger.setMockMessageHandler(
          'plugins.flutter.io/google_mobile_ads',
          null,
        ),
      );
      await tester.pumpWidget(
        MaterialApp(
          home: CatalogAdBanner(service: service, entitlements: entitlement),
        ),
      );
      consent.permitted = false;
      await service.showPrivacyOptions();
      entitlement.answer.complete(false);
      await tester.pump();
      await tester.pump();
      expect(nativeCalls, 0);
      await tester.pumpWidget(const SizedBox());
      service.dispose();
    },
  );
  testWidgets(
    'adult gate rejects a wrong answer, supports cancel and a varying challenge',
    (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Builder(
            builder: (context) => Scaffold(
              body: TextButton(
                onPressed: () => requestAdultAccess(context),
                child: const Text('Adultos'),
              ),
            ),
          ),
        ),
      );
      await tester.tap(find.text('Adultos'));
      await tester.pumpAndSettle();
      await tester.enterText(find.byType(TextField), '7');
      await tester.tap(find.text('Continuar'));
      await tester.pumpAndSettle();
      expect(find.text('Revisa la respuesta.'), findsOneWidget);
      await tester.tap(find.text('Cancelar'));
      await tester.pumpAndSettle();
      expect(find.byType(AdultGateDialog), findsNothing);
      await tester.tap(find.text('Adultos'));
      await tester.pumpAndSettle();
      final text = tester
          .widget<Text>(find.textContaining('Para continuar, resuelve:'))
          .data!;
      final numbers = RegExp(
        r'\d+',
      ).allMatches(text).map((m) => int.parse(m[0]!)).toList();
      await tester.enterText(
        find.byType(TextField),
        '${numbers[0] * numbers[1]}',
      );
      await tester.tap(find.text('Continuar'));
      await tester.pumpAndSettle();
      expect(find.byType(AdultGateDialog), findsNothing);
    },
  );
  test(
    'thumbnail composes the actual saved color and returns fallback for corrupt PNG',
    () {
      final color = img.Image(width: 24, height: 24, numChannels: 4);
      img.fill(color, color: img.ColorRgba8(0, 255, 0, 255));
      final output = composeDrawingThumbnail((
        sourcePng(),
        Uint8List.fromList(img.encodePng(color)),
      ));
      final decoded = img.decodePng(output!)!;
      expect(decoded.width, 96);
      expect(decoded.getPixel(10, 10).g, 255);
      expect(decoded.getPixel(10, 10).r, 0);
      expect(
        composeDrawingThumbnail((sourcePng(), Uint8List.fromList([1, 2, 3]))),
        null,
      );
    },
  );
  testWidgets(
    'failed save shows retry and never claims persistence before storage succeeds',
    (tester) async {
      storage.fail = true;
      await tester.pumpWidget(
        MaterialApp(
          home: EditorPage(
            drawing: drawing,
            allDrawings: const [drawing],
            feedback: FeedbackSettings(),
            analytics: const DisabledProductAnalytics(),
            storage: storage,
            loadSource: (_) async => sourcePng(),
          ),
        ),
      );
      await settleIO(tester);
      await tester.tap(find.byType(LayeredCanvas));
      await settleIO(tester);
      expect(storage.saved, null);
      expect(find.text('Guardado en este dispositivo'), findsNothing);
      expect(find.text('Reintentar'), findsOneWidget);
      storage.fail = false;
      await tester.tap(find.text('Reintentar'));
      await settleIO(tester);
      expect(storage.saved, isNotNull);
      expect(find.text('Guardado en este dispositivo'), findsOneWidget);
      await tester.pumpWidget(const SizedBox());
      await settleIO(tester);
    },
  );
  testWidgets(
    'editor reset can be cancelled/recovered, redo works and lifecycle persists actual PNG',
    (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: EditorPage(
            drawing: drawing,
            allDrawings: const [drawing],
            feedback: FeedbackSettings(),
            analytics: const DisabledProductAnalytics(),
            storage: storage,
            loadSource: (_) async => sourcePng(),
          ),
        ),
      );
      await settleIO(tester);
      expect(find.byType(LayeredCanvas), findsOneWidget);
      await tester.tap(find.byType(LayeredCanvas));
      await settleIO(tester);
      final before = (await storage.load('prueba'))!.colorPng;
      expect(img.decodePng(before)!.getPixel(12, 12).a, greaterThan(0));
      await tester.tap(find.byTooltip('Reiniciar'));
      await settleIO(tester);
      await tester.tap(find.text('Cancelar'));
      await settleIO(tester);
      await tester.tap(find.byTooltip('Reiniciar'));
      await settleIO(tester);
      await tester.tap(find.text('Reiniciar'));
      await settleIO(tester);
      await tester.tap(find.byTooltip('Deshacer'));
      await settleIO(tester);
      final recovered = (await storage.load('prueba'))!.colorPng;
      expect(recovered, before);
      await tester.tap(find.byTooltip('Rehacer'));
      await settleIO(tester);
      await tester.tap(find.byTooltip('Deshacer'));
      await settleIO(tester);
      tester.binding.handleAppLifecycleStateChanged(AppLifecycleState.paused);
      await tester.runAsync(
        () => Future<void>.delayed(const Duration(milliseconds: 80)),
      );
      tester.binding.handleAppLifecycleStateChanged(AppLifecycleState.resumed);
      await settleIO(tester);
      final suspended = (await storage.load('prueba'))!.colorPng;
      expect(suspended, before);
      expect(tester.takeException(), null);
      tester.binding.handleAppLifecycleStateChanged(AppLifecycleState.resumed);
      await tester.pumpWidget(const SizedBox());
      await settleIO(tester);
    },
  );
}
