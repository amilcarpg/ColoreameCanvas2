import 'dart:async';
import 'dart:io';
import 'dart:ui';
import 'package:flutter_test/flutter_test.dart';
import 'package:image/image.dart' as img;
import 'package:share_plus/share_plus.dart';
import 'package:paintme_app/ad_config.dart';
import 'package:paintme_app/ad_service.dart';
import 'package:paintme_app/banner_controller.dart';
import 'package:paintme_app/drawing_engine.dart';
import 'package:paintme_app/export_service.dart';

class FakeConsent implements ConsentGateway {
  int updates = 0;
  bool permitted = true, options = true, fail = false;
  Completer<void>? wait, optionsWait;
  int forms = 0;
  @override
  Future<void> update() async {
    updates++;
    if (fail) throw StateError('offline');
    await wait?.future;
  }

  @override
  Future<void> showIfRequired() async {}
  @override
  Future<bool> canRequest() async => permitted;
  @override
  Future<bool> optionsRequired() async => options;
  @override
  Future<void> showOptions() async {
    forms++;
    if (fail) throw StateError('offline');
    await optionsWait?.future;
  }
}

class FakeBanner implements BannerResource {
  final loaded = Completer<void>();
  int disposed = 0;
  @override
  Future<void> load() => loaded.future;
  @override
  void dispose() {
    disposed++;
  }
}

img.Image source() {
  final image = img.Image(width: 8, height: 8, numChannels: 4);
  img.fill(image, color: img.ColorRgba8(255, 255, 255, 255));
  for (var y = 0; y < 8; y++) {
    image.setPixelRgba(4, y, 0, 0, 0, 255);
  }
  return image;
}

List<num> rgba(img.Pixel pixel) => [pixel.r, pixel.g, pixel.b, pixel.a];
void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  test(
    'release rejects test/missing/unapproved IDs and disabled never supplies a unit',
    () {
      expect(const AdConfig().unitId(release: true, ios: false), '');
      expect(
        () => const AdConfig(environment: 'test').validate(release: true),
        throwsStateError,
      );
      expect(
        () => const AdConfig(environment: 'production').validate(release: true),
        throwsStateError,
      );
      expect(
        () => const AdConfig(
          environment: 'production',
          approved: true,
          bannerId: 'ca-app-pub-3940256099942544/6300978111',
        ).validate(release: true),
        throwsStateError,
      );
      expect(
        const AdConfig(environment: 'test').unitId(release: false, ios: true),
        'ca-app-pub-3940256099942544/2934735716',
      );
      expect(
        const AdConfig(
          environment: 'production',
          approved: true,
          bannerId: 'ca-app-pub-1234567890123456/1234567890',
        ).validate(release: true),
        AdEnvironment.production,
      );
    },
  );
  test('disabled service never calls consent or SDK', () async {
    final consent = FakeConsent();
    var enabled = 0;
    final service = AdService(
      config: const AdConfig(),
      consent: consent,
      enable: () async {
        enabled++;
      },
    );
    await service.initialize();
    expect(consent.updates, 0);
    expect(enabled, 0);
    expect(service.ready, false);
    service.dispose();
  });
  test(
    'UMP failure/rejection prevent initialization, retry works and privacy change removes readiness',
    () async {
      final consent = FakeConsent()..fail = true;
      var enabled = 0;
      final service = AdService(
        config: const AdConfig(environment: 'test'),
        consent: consent,
        enable: () async {
          enabled++;
        },
      );
      await service.initialize();
      expect(service.state, AdServiceState.failed);
      expect(enabled, 0);
      consent.fail = false;
      consent.permitted = false;
      await service.initialize();
      expect(service.state, AdServiceState.blocked);
      expect(enabled, 0);
      consent.permitted = true;
      await service.initialize();
      expect(service.ready, true);
      expect(enabled, 1);
      consent.permitted = false;
      expect(await service.showPrivacyOptions(), true);
      expect(service.ready, false);
      service.dispose();
    },
  );
  test(
    'privacy form blocks duplicate forms and initialization until its result',
    () async {
      final consent = FakeConsent();
      var enabled = 0;
      final service = AdService(
        config: const AdConfig(environment: 'test'),
        consent: consent,
        enable: () async {
          enabled++;
        },
      );
      await service.initialize();
      consent.optionsWait = Completer<void>();
      final changing = service.showPrivacyOptions();
      expect(service.ready, false);
      expect(await service.showPrivacyOptions(), false);
      await service.initialize();
      expect(consent.updates, 1);
      expect(consent.forms, 1);
      expect(enabled, 1);
      consent.permitted = false;
      consent.optionsWait!.complete();
      expect(await changing, true);
      expect(service.ready, false);
      service.dispose();
    },
  );
  test(
    'duplicate initialization and disposal during consent never enable the SDK',
    () async {
      final consent = FakeConsent()..wait = Completer<void>();
      var enabled = 0;
      final service = AdService(
        config: const AdConfig(environment: 'test'),
        consent: consent,
        enable: () async {
          enabled++;
        },
      );
      final first = service.initialize(), second = service.initialize();
      expect(identical(first, second), true);
      service.dispose();
      consent.wait!.complete();
      await first;
      expect(enabled, 0);
    },
  );
  test(
    'banner is hidden until loaded, bounded retry clears failed resource and revoke disposes once',
    () async {
      var permitted = true;
      final resources = <FakeBanner>[];
      final controller = BannerController<FakeBanner>(
        allowed: () async => permitted,
        create: () {
          final resource = FakeBanner();
          resources.add(resource);
          return resource;
        },
        onChanged: () {},
        maxAttempts: 2,
        retryDelay: const Duration(milliseconds: 5),
      );
      final load = controller.refresh();
      await Future<void>.delayed(Duration.zero);
      expect(controller.resource, null);
      resources.first.loaded.completeError(StateError('load'));
      await load;
      expect(resources.first.disposed, 1);
      expect(controller.state, BannerState.failed);
      await Future<void>.delayed(const Duration(milliseconds: 15));
      expect(resources.length, 2);
      resources.last.loaded.complete();
      await Future<void>.delayed(Duration.zero);
      expect(controller.resource, resources.last);
      permitted = false;
      await controller.refresh();
      expect(controller.resource, null);
      expect(resources.last.disposed, 1);
      controller.dispose();
      expect(resources.last.disposed, 1);
    },
  );
  test(
    'banner disposed during entitlement await never creates a resource',
    () async {
      final allowed = Completer<bool>();
      var created = 0;
      final controller = BannerController<FakeBanner>(
        allowed: () => allowed.future,
        create: () {
          created++;
          return FakeBanner();
        },
        onChanged: () {},
      );
      final pending = controller.refresh();
      controller.dispose();
      allowed.complete(true);
      await pending;
      expect(created, 0);
    },
  );
  test(
    'banner timeout and repeated refresh do not create unlimited requests',
    () async {
      final resources = <FakeBanner>[];
      final controller = BannerController<FakeBanner>(
        allowed: () async => true,
        create: () {
          final resource = FakeBanner();
          resources.add(resource);
          return resource;
        },
        onChanged: () {},
        maxAttempts: 1,
        timeout: const Duration(milliseconds: 5),
      );
      await controller.refresh();
      await controller.refresh();
      expect(resources.length, 1);
      expect(resources.single.disposed, 1);
      resources.single.loaded.complete();
      controller.dispose();
      expect(controller.state, BannerState.disposed);
    },
  );
  test(
    'fill preserves all RGBA channels of isolated region and lines; undo/redo/reset are coherent',
    () async {
      final engine = DrawingEngine.fromSource(source());
      await engine.fill(1, 2, 0xffff0000);
      final colored = engine.exportPng();
      final output = img.decodePng(colored)!;
      expect(rgba(output.getPixel(1, 2)), [255, 0, 0, 255]);
      expect(rgba(output.getPixel(6, 2)), [255, 255, 255, 255]);
      expect(rgba(output.getPixel(4, 2)), [0, 0, 0, 255]);
      engine.undo();
      expect(engine.hasChanges, false);
      engine.redo();
      expect(engine.exportPng(), colored);
      engine.reset();
      expect(engine.hasChanges, false);
      engine.undo();
      expect(engine.exportPng(), colored);
      engine.undo();
      engine.applyStroke(
        points: const [Offset(1, 1)],
        color: 0xff00ff00,
        size: 2,
        erase: false,
      );
      expect(engine.canRedo, false);
      expect(
        engine.historyBytes,
        lessThanOrEqualTo(DrawingEngine.historyByteLimit),
      );
      engine.dispose();
    },
  );
  test(
    'fill excludes concurrent edits and disposal discards a late isolate result',
    () async {
      final engine = DrawingEngine.fromSource(source());
      final pending = engine.fill(1, 2, 0xffff0000);
      expect(engine.busy, true);
      engine.reset();
      engine.undo();
      expect(await engine.fill(6, 2, 0xff00ff00), false);
      engine.dispose();
      expect(await pending, false);
      expect(engine.hasChanges, false);
    },
  );
  test(
    'twenty edits keep combined undo/redo within the history budget and preserve latest state',
    () {
      final engine = DrawingEngine.fromSource(source());
      for (var i = 0; i < 20; i++) {
        engine.applyStroke(
          points: [Offset((i % 3).toDouble(), (i % 7).toDouble())],
          color: 0xff000000 + i * 1234,
          size: 2,
          erase: false,
        );
      }
      final current = engine.colorPng();
      var count = 0;
      while (engine.canUndo) {
        engine.undo();
        count++;
      }
      expect(count, lessThanOrEqualTo(DrawingEngine.undoLimit));
      while (engine.canRedo) {
        engine.redo();
      }
      expect(engine.colorPng(), current);
      engine.dispose();
    },
  );
  test(
    'share passes the iPad button rect and actual file, distinguishes dismissal and plugin failure',
    () async {
      final directory = await Directory.systemTemp.createTemp(
        'paintme-share-test-',
      );
      addTearDown(() async {
        final resolved = await directory.resolveSymbolicLinks(),
            root = await Directory.systemTemp.resolveSymbolicLinks();
        if (!resolved.startsWith(
          '$root${Platform.pathSeparator}paintme-share-test-',
        )) {
          throw StateError('Unsafe cleanup');
        }
        await directory.delete(recursive: true);
      });
      final png = DrawingEngine.fromSource(source()).exportPng();
      const origin = Rect.fromLTWH(20, 30, 48, 48);
      final exporter = ExportService(
        directoryProvider: () async => directory,
        share: (params) async {
          expect(params.sharePositionOrigin, origin);
          expect(await File(params.files!.single.path).readAsBytes(), png);
          return const ShareResult('', ShareResultStatus.dismissed);
        },
      );
      expect(
        await exporter.saveAndShare(slug: 'gato', png: png, origin: origin),
        ExportOutcome.dismissed,
      );
      final failing = ExportService(
        directoryProvider: () async => directory,
        share: (_) async => throw StateError('plugin'),
      );
      expect(
        await failing.saveAndShare(slug: 'gato', png: png, origin: origin),
        ExportOutcome.failed,
      );
      expect(
        await failing.saveAndShare(slug: '../gato', png: png, origin: origin),
        ExportOutcome.failed,
      );
    },
  );
}
