/// Privacy-first product analytics. This build intentionally sends no data.
abstract interface class ProductAnalytics {
  Future<void> track(
    String event, {
    Map<String, Object?> properties = const {},
  });
}

class DisabledProductAnalytics implements ProductAnalytics {
  const DisabledProductAnalytics();

  @override
  Future<void> track(
    String event, {
    Map<String, Object?> properties = const {},
  }) async {}
}
