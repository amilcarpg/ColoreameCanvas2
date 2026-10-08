import 'dart:async';
import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';

import 'ad_service.dart';
import 'banner_controller.dart';
import 'entitlement_repository.dart';

class CatalogAdBanner extends StatefulWidget {
  const CatalogAdBanner({
    super.key,
    required this.service,
    this.entitlements = const EntitlementRepository(),
  });
  final AdService service;
  final EntitlementRepository entitlements;
  @override
  State<CatalogAdBanner> createState() => _CatalogAdBannerState();
}

class _CatalogAdBannerState extends State<CatalogAdBanner> {
  late final BannerController<_GoogleBanner> _controller;
  @override
  void initState() {
    super.initState();
    _controller = BannerController(
      allowed: () async {
        final adFree = await widget.entitlements.hasAdFreeEntitlement();
        // Permission and mount state can change while entitlement is pending.
        return mounted && widget.service.ready && !adFree;
      },
      create: () => _GoogleBanner(
        widget.service.config.unitId(release: !kDebugMode, ios: Platform.isIOS),
      ),
      onChanged: () {
        if (mounted) setState(() {});
      },
    );
    widget.service.addListener(_refresh);
    _refresh();
  }

  void _refresh() => unawaited(_controller.refresh());
  @override
  void didUpdateWidget(CatalogAdBanner oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.service != widget.service) {
      oldWidget.service.removeListener(_refresh);
      widget.service.addListener(_refresh);
    }
    _refresh();
  }

  @override
  void dispose() {
    widget.service.removeListener(_refresh);
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final resource = _controller.resource;
    if (resource == null) return const SizedBox.shrink();
    return SafeArea(
      top: false,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Text('Publicidad'),
          SizedBox(
            width: resource.ad.size.width.toDouble(),
            height: resource.ad.size.height.toDouble(),
            child: AdWidget(ad: resource.ad),
          ),
        ],
      ),
    );
  }
}

class _GoogleBanner implements BannerResource {
  _GoogleBanner(String id) {
    ad = BannerAd(
      size: AdSize.banner,
      adUnitId: id,
      request: const AdRequest(nonPersonalizedAds: true),
      listener: BannerAdListener(
        onAdLoaded: (_) {
          if (!_loaded.isCompleted) _loaded.complete();
        },
        onAdFailedToLoad: (_, error) {
          if (!_loaded.isCompleted) {
            _loaded.completeError(StateError('banner_load_failed'));
          }
        },
      ),
    );
  }
  late final BannerAd ad;
  final _loaded = Completer<void>();
  bool _disposed = false;
  @override
  Future<void> load() async {
    // Attach the error handler before the platform can emit a load failure.
    final result = _loaded.future;
    unawaited(
      ad.load().catchError((Object _) {
        if (!_loaded.isCompleted) {
          _loaded.completeError(StateError('banner_load_failed'));
        }
      }),
    );
    await result;
  }

  @override
  void dispose() {
    if (_disposed) return;
    _disposed = true;
    unawaited(ad.dispose().catchError((Object _) {}));
  }
}
