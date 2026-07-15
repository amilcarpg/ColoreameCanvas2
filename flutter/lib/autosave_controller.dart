import 'dart:async';

import 'drawing_engine.dart';
import 'drawing_storage.dart';

class AutosaveController {
  AutosaveController(this._storage, this._slug, this._engine);
  final DrawingStorage _storage;
  final String _slug;
  final DrawingEngine _engine;
  Timer? _timer;
  Future<void>? _pendingSave;

  void schedule() {
    _timer?.cancel();
    _timer = Timer(const Duration(milliseconds: 900), flush);
  }

  Future<void> flush() async {
    _timer?.cancel();
    _pendingSave = _storage.save(_slug, _engine.colorPng());
    await _pendingSave;
  }

  Future<void> dispose() async {
    await flush();
    _timer?.cancel();
  }
}
