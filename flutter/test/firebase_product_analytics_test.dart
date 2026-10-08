import 'dart:async';
import 'package:flutter_test/flutter_test.dart';
import 'package:paintme_app/firebase_product_analytics.dart';
import 'package:paintme_app/product_analytics.dart';

class FakeGateway implements AnalyticsGateway {
  final calls = <String>[];
  final events = <Map<String, Object>>[];
  Completer<void>? initializing;
  bool throwLog = false, throwEnable = false;
  @override
  Future<void> initialize() async {
    calls.add('initialize');
    await initializing?.future;
  }

  @override
  Future<void> setCollection(bool enabled) async {
    calls.add('collection:$enabled');
    if (enabled && throwEnable) throw StateError('offline');
  }

  @override
  Future<void> setConsent(bool analytics) async {
    calls.add('consent:$analytics:ads_denied');
  }

  @override
  Future<void> reset() async {
    calls.add('reset');
  }

  @override
  Future<void> log(String name, Map<String, Object> parameters) async {
    if (throwLog) throw StateError('offline');
    calls.add('event:$name');
    events.add(parameters);
  }
}

void main() {
  test(
    'the shipped environment cannot activate the real Firebase SDK',
    () async {
      final collector = FirebaseProductAnalytics.fromEnvironment();
      expect(collector.available, isFalse);
      await collector.setPermission(true);
      await collector.track('catalog_opened');
      expect(collector.enabled, isFalse);
      expect(collector.failed, isFalse);
    },
  );
  test(
    'missing configuration and rejection do not initialize Firebase or replay events',
    () async {
      final gateway = FakeGateway(),
          service = FirebaseProductAnalytics(
            gateway: FakeGateway(),
            available: false,
          );
      await service.setPermission(true);
      expect(service.enabled, isFalse);
      final enabled = FirebaseProductAnalytics(
        gateway: gateway,
        available: true,
      );
      await enabled.track('catalog_opened');
      await enabled.setPermission(false);
      expect(gateway.calls, isEmpty);
      await enabled.setPermission(true);
      expect(gateway.calls, [
        'initialize',
        'consent:true:ads_denied',
        'collection:true',
      ]);
      expect(gateway.events, isEmpty);
    },
  );
  test(
    'Firebase receives only the schema and converts booleans to supported parameter values',
    () async {
      final gateway = FakeGateway(),
          service = FirebaseProductAnalytics(
            gateway: FakeGateway(),
            available: true,
          );
      final collector = FirebaseProductAnalytics(
        gateway: gateway,
        available: true,
      )..knownSlugs = {'gato'};
      await collector.setPermission(true);
      await collector.track('unknown', properties: {'email': 'child'});
      await collector.track(
        'first_color_applied',
        properties: {
          'slug': 'gato',
          'email': 'child',
          'search': 'child',
          'drawing': 'png',
          'time_band': '5_15s',
          'skipped': false,
        },
      );
      expect(gateway.events, hasLength(1));
      expect(gateway.events.single, {
        'schema_version': 1,
        'slug': 'gato',
        'time_band': '5_15s',
        'skipped': 0,
        'platform': 'android',
        'ui_language': 'es',
      });
      service.dispose();
      collector.dispose();
    },
  );
  test(
    'revocation during initialization never enables collection and clears SDK data',
    () async {
      final gateway = FakeGateway()..initializing = Completer<void>();
      final collector = FirebaseProductAnalytics(
        gateway: gateway,
        available: true,
      );
      final enabling = collector.setPermission(true);
      await Future<void>.delayed(Duration.zero);
      final revoking = collector.setPermission(false);
      await collector.track('catalog_opened');
      gateway.initializing!.complete();
      await enabling;
      await revoking;
      expect(collector.enabled, isFalse);
      expect(gateway.calls, isNot(contains('collection:true')));
      expect(
        gateway.calls,
        containsAllInOrder([
          'collection:false',
          'reset',
          'consent:false:ads_denied',
        ]),
      );
      expect(gateway.events, isEmpty);
    },
  );
  test(
    'SDK failures cannot break activity and a later permission retry recovers',
    () async {
      final gateway = FakeGateway()..throwEnable = true;
      final collector = FirebaseProductAnalytics(
        gateway: gateway,
        available: true,
      );
      await collector.setPermission(true);
      expect(collector.failed, isTrue);
      expect(collector.enabled, isFalse);
      gateway.throwEnable = false;
      await collector.setPermission(true);
      expect(collector.enabled, isTrue);
      gateway.throwLog = true;
      await collector.track('catalog_opened');
      expect(collector.failed, isTrue);
      gateway.throwLog = false;
      await collector.track('catalog_opened');
      expect(gateway.events, hasLength(1));
      await collector.setPermission(false);
      await collector.track('catalog_opened');
      expect(gateway.events, hasLength(1));
    },
  );
  test(
    'time bands are bounded and arbitrary delegates cannot throw through the product boundary',
    () async {
      expect([0, 5000, 15000, 30000, 60000].map(productTimeBand), [
        'lt_5s',
        '5_15s',
        '15_30s',
        '30_60s',
        'gte_60s',
      ]);
      await SanitizedProductAnalytics(
        ThrowingCollector(),
      ).track('catalog_opened');
    },
  );
}

class ThrowingCollector implements ProductAnalytics {
  @override
  Future<void> track(
    String event, {
    Map<String, Object?> properties = const {},
  }) async => throw StateError('offline');
}
