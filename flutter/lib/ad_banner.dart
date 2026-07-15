import 'dart:io';

import 'package:flutter/material.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';

import 'ad_service.dart';
import 'entitlement_repository.dart';
import 'product_analytics.dart';

/// Solo se usa en catálogo. Los IDs de producción se inyectan en release.
class CatalogAdBanner extends StatefulWidget {
  const CatalogAdBanner({
    super.key,
    required this.service,
    this.entitlements = const EntitlementRepository(),
    this.analytics = const DisabledProductAnalytics(),
  });
  final AdService service;
  final EntitlementRepository entitlements;
  final ProductAnalytics analytics;

  @override
  State<CatalogAdBanner> createState() => _CatalogAdBannerState();
}

class _CatalogAdBannerState extends State<CatalogAdBanner> {
  BannerAd? _ad;

  @override
  void initState() {
    super.initState();
    widget.service.addListener(_loadWhenReady);
    _loadWhenReady();
  }

  Future<void> _loadWhenReady() async {
    if (!widget.service.ready || _ad != null) return;
    if (await widget.entitlements.hasAdFreeEntitlement() || _ad != null) return;
    final id = const String.fromEnvironment(
      'ADMOB_BANNER_ID',
      defaultValue: '',
    );
    final testId = Platform.isIOS
        ? 'ca-app-pub-3940256099942544/2934735716'
        : 'ca-app-pub-3940256099942544/6300978111';
    _ad = BannerAd(
      size: AdSize.banner,
      adUnitId: id.isEmpty ? testId : id,
      request: const AdRequest(nonPersonalizedAds: true),
      listener: BannerAdListener(
        onAdLoaded: (_) => mounted ? setState(() {}) : null,
        onAdImpression: (_) => widget.analytics.track('ad_impression'),
        onAdFailedToLoad: (ad, _) => ad.dispose(),
      ),
    )..load();
  }

  @override
  void dispose() {
    widget.service.removeListener(_loadWhenReady);
    _ad?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final ad = _ad;
    if (ad == null) return const SizedBox.shrink();
    return SafeArea(
      top: false,
      child: SizedBox(
        width: ad.size.width.toDouble(),
        height: ad.size.height.toDouble(),
        child: AdWidget(ad: ad),
      ),
    );
  }
}
