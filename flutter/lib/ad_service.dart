import 'package:flutter/foundation.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';

class AdService extends ChangeNotifier {
  bool _ready = false;
  bool get ready => _ready;

  Future<void> initialize() async {
    ConsentInformation.instance.requestConsentInfoUpdate(
      ConsentRequestParameters(tagForUnderAgeOfConsent: true),
      () async {
        await ConsentForm.loadAndShowConsentFormIfRequired((_) {});
        if (await ConsentInformation.instance.canRequestAds()) _enable();
      },
      (_) {},
    );
  }

  Future<void> _enable() async {
    if (_ready) return;
    await MobileAds.instance.updateRequestConfiguration(
      RequestConfiguration(
        tagForChildDirectedTreatment: TagForChildDirectedTreatment.yes,
        tagForUnderAgeOfConsent: TagForUnderAgeOfConsent.yes,
        maxAdContentRating: MaxAdContentRating.g,
      ),
    );
    await MobileAds.instance.initialize();
    _ready = true;
    notifyListeners();
  }
}
