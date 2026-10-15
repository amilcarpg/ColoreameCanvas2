// Runs against real Android plugins/filesystem on the project-owned emulator.
import 'dart:convert';
import 'dart:io';
import 'dart:ui' as ui;

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:image/image.dart' as img;
import 'package:integration_test/integration_test.dart';
import 'package:path_provider/path_provider.dart';
import 'package:paintme_app/ad_config.dart';
import 'package:paintme_app/catalog_widgets.dart';
import 'package:paintme_app/catalog_repository.dart';
import 'package:paintme_app/drawing_engine.dart';
import 'package:paintme_app/drawing_storage.dart';
import 'package:paintme_app/firebase_product_analytics.dart';
import 'package:paintme_app/layered_canvas.dart';
import 'package:paintme_app/main.dart' as app;

Future<void> waitFor(
  WidgetTester tester,
  bool Function() ready,
  String label,
) async {
  for (var i = 0; i < 160; i++) {
    await tester.pump(const Duration(milliseconds: 250));
    if (ready()) return;
  }
  fail('Timed out: $label');
}

Future<Uint8List> pixels(WidgetTester tester) async {
  final canvas = tester.widget<LayeredCanvas>(find.byType(LayeredCanvas));
  return (await canvas.colorLayer.toByteData(
    format: ui.ImageByteFormat.rawRgba,
  ))!.buffer.asUint8List();
}

Offset screenPoint(WidgetTester tester, Offset source) {
  final viewer = tester.widget<InteractiveViewer>(
    find.byType(InteractiveViewer),
  );
  return tester.getTopLeft(find.byType(InteractiveViewer)) +
      MatrixUtils.transformPoint(
        viewer.transformationController!.value,
        source,
      );
}

void main() {
  final binding = IntegrationTestWidgetsFlutterBinding.ensureInitialized();
  const phase = String.fromEnvironment('QA_PHASE', defaultValue: 'paint');
  testWidgets('Android $phase: real art, disabled services and persistent RGBA', (
    tester,
  ) async {
    expect(
      const AdConfig.fromEnvironment().validate(release: false),
      AdEnvironment.disabled,
    );
    expect(FirebaseProductAnalytics.fromEnvironment().available, isFalse);
    final storage = DrawingStorage();
    if (phase == 'paint') await storage.clear('dinosaurio');
    await app.main();
    final card = find.byWidgetPredicate(
      (widget) =>
          widget is CatalogDrawingCard && widget.drawing.slug == 'dinosaurio',
    );
    await waitFor(tester, () => card.evaluate().isNotEmpty, 'native catalog');
    await tester.ensureVisible(card.first);
    await tester.tap(card.first);
    await waitFor(
      tester,
      () => find.byType(LayeredCanvas).evaluate().isNotEmpty,
      'native image decode',
    );
    await tester.pump(const Duration(seconds: 1));
    if (find.text('¡Entendido!').evaluate().isNotEmpty) {
      await tester.tap(find.text('¡Entendido!'));
      await tester.pumpAndSettle();
    }
    if (find.byTooltip('Cerrar ayuda').evaluate().isNotEmpty) {
      await tester.tap(find.byTooltip('Cerrar ayuda'));
      await tester.pumpAndSettle();
    }
    await binding.convertFlutterSurfaceToImage();
    await tester.pumpAndSettle();
    final documents = await getApplicationDocumentsDirectory();
    await File('${documents.path}/qa-$phase-before.png').writeAsBytes(
      await binding.takeScreenshot('android-$phase-before'),
      flush: true,
    );
    final canvas = tester.widget<LayeredCanvas>(find.byType(LayeredCanvas));
    final viewport = tester.getRect(find.byType(InteractiveViewer));
    final topLeft = screenPoint(tester, Offset.zero);
    final bottomRight = screenPoint(
      tester,
      Offset(canvas.width.toDouble(), canvas.height.toDouble()),
    );
    binding.reportData = {
      ...?binding.reportData,
      'phase': phase,
      'stage': 'loaded',
      'sourceSize': [canvas.width, canvas.height],
      'viewportSize': [viewport.width, viewport.height],
      'sourceTopLeft': [topLeft.dx, topLeft.dy],
      'sourceBottomRight': [bottomRight.dx, bottomRight.dy],
    };
    expect(
      viewport.inflate(1).contains(topLeft),
      isTrue,
      reason: 'Whole source must fit initially, including top left',
    );
    expect(
      viewport.inflate(1).contains(bottomRight),
      isTrue,
      reason: 'Whole source must fit initially, including bottom right',
    );
    final expectedFile = File('${documents.path}/qa-expected-color.png');
    if (phase == 'paint') {
      final before = await pixels(tester);
      // Seed independently reviewed in the real Dinosaurio source (head region).
      await tester.tapAt(screenPoint(tester, const Offset(552, 181)));
      await waitFor(
        tester,
        () => find.text('Guardado en este dispositivo').evaluate().isNotEmpty,
        'atomic autosave',
      );
      final painted = await pixels(tester);
      expect(listEquals(before, painted), isFalse);
      await tester.tap(find.byTooltip('Deshacer'));
      await tester.pumpAndSettle();
      expect(listEquals(before, await pixels(tester)), isTrue);
      await tester.tap(find.byTooltip('Rehacer'));
      await tester.pumpAndSettle();
      expect(listEquals(painted, await pixels(tester)), isTrue);
      await waitFor(
        tester,
        () => find.text('Guardado en este dispositivo').evaluate().isNotEmpty,
        'redo autosave',
      );
      final saved = await storage.load('dinosaurio');
      expect(saved, isNotNull);
      final decoded = img.decodePng(saved!.colorPng)!;
      expect(
        listEquals(painted, decoded.getBytes(order: img.ChannelOrder.rgba)),
        isTrue,
      );
      await expectedFile.writeAsBytes(saved.colorPng, flush: true);
      final drawing = (await CatalogRepository().load()).firstWhere(
        (drawing) => drawing.slug == 'dinosaurio',
      );
      final sourceBytes = await rootBundle.load(drawing.asset);
      final engine = DrawingEngine.fromSource(
        img.decodePng(sourceBytes.buffer.asUint8List())!,
        savedColor: saved.colorPng,
      );
      await File(
        '${documents.path}/qa-device-export.png',
      ).writeAsBytes(engine.exportPng(), flush: true);
      engine.dispose();
    } else {
      debugPrint('QA restore: checking expected PNG');
      expect(
        await expectedFile.exists(),
        isTrue,
        reason: 'Expected pixels must survive actual Android process stop',
      );
      final expected = img.decodePng(await expectedFile.readAsBytes())!;
      debugPrint('QA restore: reading displayed RGBA');
      expect(
        listEquals(
          await pixels(tester),
          expected.getBytes(order: img.ChannelOrder.rgba),
        ),
        isTrue,
      );
      debugPrint('QA restore: checking native session index');
      expect(
        (await storage.list()).any((session) => session.slug == 'dinosaurio'),
        isTrue,
      );
      debugPrint('QA restore: pixels and index verified');
    }
    await tester.pumpAndSettle();
    await File('${documents.path}/qa-$phase-after.png').writeAsBytes(
      await binding.takeScreenshot('android-$phase-after'),
      flush: true,
    );
    expect(tester.takeException(), isNull);
    final result = {
      'phase': phase,
      'platform': Platform.operatingSystem,
      'source': 'dinosaurio',
      'width': canvas.width,
      'height': canvas.height,
      'ads': 'disabled',
      'analytics': 'disabled',
      'restoredExact': phase != 'paint',
      'saveUndoRedo': phase == 'paint',
      'passed': true,
    };
    binding.reportData = result;
    await File(
      '${documents.path}/qa-$phase-results.json',
    ).writeAsString(jsonEncode(result), flush: true);
    expect(tester.takeException(), isNull);
  });
}
