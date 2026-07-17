import 'dart:async';

import 'drawing_engine.dart';
import 'drawing_storage.dart';

class AutosaveController {
  AutosaveController(this._storage, this._slug, this._engine);
  final DrawingStorage _storage;
  final String _slug;
  final DrawingEngine _engine;
  Timer? _timer;
  Future<void> _pendingSave = Future.value();
  bool _disposed = false;

  void schedule() {
    if (_disposed) return;
    _timer?.cancel();
    _timer = Timer(const Duration(milliseconds: 900), flush);
  }

  Future<void> flush() async {
    _timer?.cancel();
    if (_disposed) return;
    final png = _engine.colorPng();
    _pendingSave = _pendingSave.then((_) => _storage.save(_slug, png));
    await _pendingSave;
  }

  Future<void> dispose() async {
    if (_disposed) return;
    _disposed = true;
    _timer?.cancel();
    final png = _engine.colorPng();
    _pendingSave = _pendingSave.then((_) => _storage.save(_slug, png));
    await _pendingSave;
  }
}
