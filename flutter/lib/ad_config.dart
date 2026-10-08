enum AdEnvironment { disabled, test, production }

/// Defaults to no ads. Production configuration is never inferred from a missing ID.
class AdConfig {
  const AdConfig({
    this.environment = 'disabled',
    this.bannerId = '',
    this.approved = false,
  });
  const AdConfig.fromEnvironment()
    : environment = const String.fromEnvironment(
        'PAINTME_ADS',
        defaultValue: 'disabled',
      ),
      bannerId = const String.fromEnvironment('ADMOB_BANNER_ID'),
      approved = const bool.fromEnvironment('PAINTME_ADS_APPROVED');

  final String environment;
  final String bannerId;
  final bool approved;
  static const testPublisher = 'ca-app-pub-3940256099942544';

  AdEnvironment validate({required bool release}) {
    if (environment == 'disabled') return AdEnvironment.disabled;
    if (environment == 'test' && !release) return AdEnvironment.test;
    if (environment == 'production' &&
        approved &&
        RegExp(r'^ca-app-pub-\d{16}/\d{10}$').hasMatch(bannerId) &&
        !bannerId.startsWith(testPublisher)) {
      return AdEnvironment.production;
    }
    throw StateError(
      'Invalid advertising configuration; use disabled, debug test, or approved production IDs.',
    );
  }

  String unitId({required bool release, required bool ios}) =>
      switch (validate(release: release)) {
        AdEnvironment.disabled => '',
        AdEnvironment.test =>
          ios ? '$testPublisher/2934735716' : '$testPublisher/6300978111',
        AdEnvironment.production => bannerId,
      };
}
