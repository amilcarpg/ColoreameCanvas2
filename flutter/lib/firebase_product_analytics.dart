import 'package:firebase_analytics/firebase_analytics.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'product_analytics.dart';

abstract interface class AnalyticsGateway {
  Future<void> initialize();
  Future<void> setCollection(bool enabled);
  Future<void> setConsent(bool analytics);
  Future<void> reset();
  Future<void> log(String name, Map<String, Object> parameters);
}

class FirebaseAnalyticsGateway implements AnalyticsGateway {
  FirebaseAnalyticsGateway(this.options);
  final FirebaseOptions options;
  FirebaseAnalytics? _analytics;
  @override
  Future<void> initialize() async {
    final app = Firebase.apps.isEmpty
        ? await Firebase.initializeApp(options: options)
        : Firebase.app();
    _analytics = FirebaseAnalytics.instanceFor(app: app);
    await _analytics!.setAnalyticsCollectionEnabled(false);
  }

  @override
  Future<void> setCollection(bool enabled) =>
      _analytics!.setAnalyticsCollectionEnabled(enabled);
  @override
  Future<void> setConsent(bool analytics) => _analytics!.setConsent(
    analyticsStorageConsentGranted: analytics,
    adStorageConsentGranted: false,
    adUserDataConsentGranted: false,
    adPersonalizationSignalsConsentGranted: false,
  );
  @override
  Future<void> reset() => _analytics!.resetAnalyticsData();
  @override
  Future<void> log(String name, Map<String, Object> parameters) =>
      _analytics!.logEvent(name: name, parameters: parameters);
}

/// Session permission is never inferred from the child UI or an old SDK grant.
class FirebaseProductAnalytics extends ChangeNotifier
    implements ProductAnalytics {
  FirebaseProductAnalytics({required this.gateway, required this.available});
  factory FirebaseProductAnalytics.fromEnvironment() {
    const enabled = bool.fromEnvironment('PAINTME_ANALYTICS');
    const reviewed = bool.fromEnvironment('PAINTME_ANALYTICS_REVIEWED');
    const apiKey = String.fromEnvironment('FIREBASE_API_KEY');
    const appId = String.fromEnvironment('FIREBASE_APP_ID');
    const projectId = String.fromEnvironment('FIREBASE_PROJECT_ID');
    const sender = String.fromEnvironment('FIREBASE_MESSAGING_SENDER_ID');
    final platform = defaultTargetPlatform;
    final mobile =
        !kIsWeb &&
        (platform == TargetPlatform.android || platform == TargetPlatform.iOS);
    final kind = platform == TargetPlatform.iOS ? 'ios' : 'android';
    final valid =
        RegExp(r'^AIza[A-Za-z0-9_-]{35}$').hasMatch(apiKey) &&
        RegExp('^1:[0-9]+:$kind:[a-f0-9]+\$').hasMatch(appId) &&
        RegExp(r'^[a-z][a-z0-9-]{4,28}[a-z0-9]$').hasMatch(projectId) &&
        RegExp(r'^[0-9]+$').hasMatch(sender);
    return FirebaseProductAnalytics(
      // iOS remains natively deactivated until its Mac/release checks are completed.
      available:
          enabled &&
          reviewed &&
          mobile &&
          platform == TargetPlatform.android &&
          valid,
      gateway: FirebaseAnalyticsGateway(
        const FirebaseOptions(
          apiKey: apiKey,
          appId: appId,
          projectId: projectId,
          messagingSenderId: sender,
        ),
      ),
    );
  }
  final AnalyticsGateway gateway;
  final bool available;
  Set<String> knownSlugs = {};
  bool _allowed = false, _ready = false, _initialized = false, failed = false;
  int _epoch = 0;
  Future<void> _pending = Future.value();
  bool get enabled => _allowed && _ready;
  Future<void> setPermission(bool granted) {
    final epoch = ++_epoch;
    _allowed = granted && available;
    _ready = false;
    notifyListeners();
    _pending = _pending.then((_) async {
      if (epoch != _epoch) return;
      try {
        if (_allowed) {
          if (!_initialized) {
            await gateway.initialize();
            _initialized = true;
          }
          if (epoch != _epoch || !_allowed) {
            await gateway.setCollection(false);
            return;
          }
          await gateway.setConsent(true);
          if (epoch != _epoch || !_allowed) {
            await gateway.setCollection(false);
            return;
          }
          await gateway.setCollection(true);
          if (epoch != _epoch || !_allowed) {
            await gateway.setCollection(false);
            return;
          }
          _ready = true;
        } else if (_initialized) {
          await gateway.setCollection(false);
          await gateway.reset();
          await gateway.setConsent(false);
        }
        failed = false;
      } catch (_) {
        _ready = false;
        _allowed = false;
        failed = true;
        if (_initialized) {
          try {
            await gateway.setCollection(false);
          } catch (_) {}
        }
      }
      notifyListeners();
    });
    return _pending;
  }

  @override
  Future<void> track(
    String event, {
    Map<String, Object?> properties = const {},
  }) async {
    if (!enabled) return;
    final clean = sanitizeProductEvent(
      event,
      properties,
      knownSlugs: knownSlugs,
    );
    if (clean == null) return;
    final epoch = _epoch;
    _pending = _pending.then((_) async {
      if (!enabled || epoch != _epoch) return;
      try {
        await gateway.log(event, {
          ...clean.map(
            (key, value) =>
                MapEntry(key, value is bool ? (value ? 1 : 0) : value),
          ),
          'platform': defaultTargetPlatform == TargetPlatform.iOS
              ? 'ios'
              : 'android',
          'ui_language': 'es',
        });
      } catch (_) {
        failed = true;
        notifyListeners();
      }
    });
    await _pending;
  }
}

class AnalyticsPreference extends StatelessWidget {
  const AnalyticsPreference({super.key, required this.analytics});
  final FirebaseProductAnalytics analytics;
  @override
  Widget build(BuildContext context) => AnimatedBuilder(
    animation: analytics,
    builder: (context, _) => SwitchListTile.adaptive(
      title: const Text('Firebase Analytics opcional'),
      subtitle: Text(
        !analytics.available
            ? 'Desactivado: falta configuración o revisión del tratamiento.'
            : analytics.failed
            ? 'Falló la analítica. Puedes seguir coloreando.'
            : 'Permiso para esta sesión. No habilita publicidad ni personalización.',
      ),
      value: analytics.enabled,
      onChanged: analytics.available
          ? (value) => analytics.setPermission(value)
          : null,
    ),
  );
}
