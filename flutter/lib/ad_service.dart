import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';

import 'ad_config.dart';

enum AdServiceState { disabled, loading, ready, blocked, failed }

abstract interface class ConsentGateway {
  Future<void> update();
  Future<void> showIfRequired();
  Future<bool> canRequest();
  Future<bool> optionsRequired();
  Future<void> showOptions();
}

class GoogleConsentGateway implements ConsentGateway {
  @override
  Future<void> update() {
    final done = Completer<void>();
    ConsentInformation.instance.requestConsentInfoUpdate(
      ConsentRequestParameters(tagForUnderAgeOfConsent: true),
      () {
        if (!done.isCompleted) done.complete();
      },
      (_) {
        if (!done.isCompleted) {
          done.completeError(StateError('consent_update_failed'));
        }
      },
    );
    return done.future;
  }

  Future<void> _form(Future<void> Function(void Function(FormError?)) present) {
    final done = Completer<void>();
    final invocation = present((error) {
      if (done.isCompleted) return;
      if (error == null) {
        done.complete();
      } else {
        done.completeError(StateError('consent_form_failed'));
      }
    });
    return Future.wait<void>([done.future, invocation]).then((_) {});
  }

  @override
  Future<void> showIfRequired() =>
      _form(ConsentForm.loadAndShowConsentFormIfRequired);
  @override
  Future<void> showOptions() => _form(ConsentForm.showPrivacyOptionsForm);
  @override
  Future<bool> canRequest() => ConsentInformation.instance.canRequestAds();
  @override
  Future<bool> optionsRequired() async =>
      await ConsentInformation.instance.getPrivacyOptionsRequirementStatus() ==
      PrivacyOptionsRequirementStatus.required;
}

class AdService extends ChangeNotifier {
  AdService({
    this.config = const AdConfig.fromEnvironment(),
    ConsentGateway? consent,
    Future<void> Function()? enable,
    this.timeout = const Duration(seconds: 30),
  }) : _consent = consent ?? GoogleConsentGateway(),
       _enable = enable ?? _enableGoogle;
  final AdConfig config;
  final ConsentGateway _consent;
  final Future<void> Function() _enable;
  final Duration timeout;
  AdServiceState state = AdServiceState.disabled;
  bool privacyOptionsRequired = false;
  bool _disposed = false;
  int _epoch = 0;
  Future<void>? _pending;
  bool _sdkEnabled = false;
  bool _changingPrivacy = false;
  bool get ready => !_disposed && state == AdServiceState.ready;

  void _state(AdServiceState value) {
    if (!_disposed) {
      state = value;
      notifyListeners();
    }
  }

  Future<void> initialize() {
    if (_disposed || _changingPrivacy) return Future.value();
    return _pending ??= _initialize().whenComplete(() => _pending = null);
  }

  Future<void> _initialize() async {
    final epoch = ++_epoch;
    try {
      if (config.validate(release: !kDebugMode) == AdEnvironment.disabled) {
        _state(AdServiceState.disabled);
        return;
      }
      _state(AdServiceState.loading);
      await _consent.update().timeout(timeout);
      if (_disposed || epoch != _epoch) return;
      privacyOptionsRequired = await _consent.optionsRequired().timeout(
        timeout,
      );
      await _consent.showIfRequired().timeout(timeout);
      if (_disposed || epoch != _epoch) return;
      if (!await _consent.canRequest().timeout(timeout)) {
        _state(AdServiceState.blocked);
        return;
      }
      if (_disposed || epoch != _epoch) return;
      if (!_sdkEnabled) {
        await _enable().timeout(timeout);
        _sdkEnabled = true;
      }
      if (!_disposed && epoch == _epoch) _state(AdServiceState.ready);
    } catch (_) {
      if (!_disposed && epoch == _epoch) _state(AdServiceState.failed);
    }
  }

  Future<bool> showPrivacyOptions() async {
    if (_disposed ||
        !privacyOptionsRequired ||
        _pending != null ||
        _changingPrivacy) {
      return false;
    }
    _changingPrivacy = true;
    final epoch = ++_epoch;
    _state(
      AdServiceState.blocked,
    ); // Stop/remove banners while preferences are changing.
    try {
      await _consent.showOptions().timeout(timeout);
      final allowed = await _consent.canRequest().timeout(timeout);
      if (_disposed || epoch != _epoch) return false;
      _state(
        allowed && _sdkEnabled ? AdServiceState.ready : AdServiceState.blocked,
      );
      return true;
    } catch (_) {
      if (!_disposed && epoch == _epoch) _state(AdServiceState.failed);
      return false;
    } finally {
      _changingPrivacy = false;
    }
  }

  static Future<void> _enableGoogle() async {
    await MobileAds.instance.updateRequestConfiguration(
      RequestConfiguration(
        tagForChildDirectedTreatment: TagForChildDirectedTreatment.yes,
        tagForUnderAgeOfConsent: TagForUnderAgeOfConsent.yes,
        maxAdContentRating: MaxAdContentRating.g,
      ),
    );
    await MobileAds.instance.initialize();
  }

  @override
  void dispose() {
    _disposed = true;
    _epoch++;
    super.dispose();
  }
}
