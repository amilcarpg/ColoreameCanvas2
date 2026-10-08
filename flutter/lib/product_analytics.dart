/// Privacy-first product analytics. This build intentionally sends no data.
abstract interface class ProductAnalytics {
  Future<void> track(
    String event, {
    Map<String, Object?> properties = const {},
  });
}

/// Explicit schema for any future collector; this does not enable transmission.
Map<String, Object>? sanitizeProductEvent(
  String event,
  Map<String, Object?> properties, {
  Set<String> knownSlugs = const {},
}) {
  const names = {
    'catalog_opened',
    'drawing_open_requested',
    'drawing_opened',
    'drawing_load_failure',
    'onboarding_completed',
    'first_color_applied',
    'drawing_completed',
    'drawing_shared',
    'local_save_success',
    'local_save_failure',
    'restore_success',
    'restore_failure',
  };
  if (!names.contains(event)) return null;
  final output = <String, Object>{'schema_version': 1};
  const enums = {
    'source': {'direct', 'home', 'gallery', 'next', 'continue'},
    'mode': {'bucket', 'brush'},
    'platform': {'android', 'ios'},
    'result': {'success', 'failure'},
    'reason': {'storage', 'load'},
    'time_band': {'lt_5s', '5_15s', '15_30s', '30_60s', 'gte_60s'},
  };
  for (final entry in enums.entries) {
    final value = properties[entry.key];
    if (value is String && entry.value.contains(value)) {
      output[entry.key] = value;
    }
  }
  if (properties.containsKey('source') && !output.containsKey('source')) {
    output['source'] = 'direct';
  }
  final slug = properties['slug'];
  if (slug is String && knownSlugs.contains(slug)) output['slug'] = slug;
  if (properties['skipped'] is bool) {
    output['skipped'] = properties['skipped'] as bool;
  }
  return output;
}

class SanitizedProductAnalytics implements ProductAnalytics {
  const SanitizedProductAnalytics(this.delegate, {this.knownSlugs = const {}});
  final ProductAnalytics delegate;
  final Set<String> knownSlugs;
  @override
  Future<void> track(
    String event, {
    Map<String, Object?> properties = const {},
  }) async {
    final clean = sanitizeProductEvent(
      event,
      properties,
      knownSlugs: knownSlugs,
    );
    if (clean != null) {
      try {
        await delegate.track(event, properties: clean);
      } catch (_) {}
    }
  }
}

class DisabledProductAnalytics implements ProductAnalytics {
  const DisabledProductAnalytics();

  @override
  Future<void> track(
    String event, {
    Map<String, Object?> properties = const {},
  }) async {}
}

String productTimeBand(int ms) => ms < 5000
    ? 'lt_5s'
    : ms < 15000
    ? '5_15s'
    : ms < 30000
    ? '15_30s'
    : ms < 60000
    ? '30_60s'
    : 'gte_60s';
