import 'dart:async';

enum BannerState { empty, loading, ready, failed, disposed }

abstract interface class BannerResource {
  Future<void> load();
  void dispose();
}

/// A resource is visible only after load succeeds; retries are bounded per session.
class BannerController<T extends BannerResource> {
  BannerController({
    required this.allowed,
    required this.create,
    required this.onChanged,
    this.timeout = const Duration(seconds: 20),
    this.retryDelay = const Duration(seconds: 3),
    this.maxAttempts = 3,
  });
  final Future<bool> Function() allowed;
  final T Function() create;
  final void Function() onChanged;
  final Duration timeout, retryDelay;
  final int maxAttempts;
  BannerState state = BannerState.empty;
  T? _resource;
  int _epoch = 0, _attempts = 0;
  Timer? _retry;
  bool _checking = false;
  T? get resource => state == BannerState.ready ? _resource : null;

  void _notify() {
    if (state != BannerState.disposed) onChanged();
  }

  void _release() {
    final resource = _resource;
    _resource = null;
    resource?.dispose();
  }

  Future<void> refresh() async {
    if (state == BannerState.disposed || _checking) return;
    _checking = true;
    final epoch = _epoch;
    bool permitted;
    try {
      permitted = await allowed().timeout(timeout);
    } catch (_) {
      permitted = false;
    }
    _checking = false;
    if (state == BannerState.disposed || epoch != _epoch) return;
    if (!permitted) {
      _epoch++;
      _retry?.cancel();
      _release();
      state = BannerState.empty;
      _notify();
      return;
    }
    if (_resource != null ||
        _retry?.isActive == true ||
        _attempts >= maxAttempts) {
      return;
    }
    _attempts++;
    state = BannerState.loading;
    _notify();
    T? resource;
    try {
      resource = create();
      _resource = resource;
      await resource.load().timeout(timeout);
      // Recheck permission after asynchronous load/entitlement changes.
      final stillAllowed = await allowed().timeout(timeout);
      if (state == BannerState.disposed ||
          epoch != _epoch ||
          _resource != resource) {
        return;
      }
      if (!stillAllowed) {
        _release();
        state = BannerState.empty;
        _notify();
        return;
      }
      state = BannerState.ready;
      _notify();
    } catch (_) {
      if (state == BannerState.disposed ||
          epoch != _epoch ||
          _resource != resource) {
        return;
      }
      _release();
      state = BannerState.failed;
      _notify();
      if (_attempts < maxAttempts) {
        _retry = Timer(retryDelay, () {
          _retry = null;
          unawaited(refresh());
        });
      }
    }
  }

  void dispose() {
    if (state == BannerState.disposed) return;
    _epoch++;
    _retry?.cancel();
    _release();
    state = BannerState.disposed;
  }
}
