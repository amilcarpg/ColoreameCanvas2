import 'dart:async';
import 'dart:typed_data';
import 'local_drawing_storage.dart';

enum AutosaveState { idle, pending, saving, saved, failed }

class AutosaveController {
  AutosaveController(
    this._storage,
    this._slug,
    this._capture, {
    this.onState,
    this.delay = const Duration(milliseconds: 900),
  });
  final LocalDrawingStorage _storage;
  final String _slug;
  final Uint8List Function() _capture;
  final void Function(AutosaveState)? onState;
  final Duration delay;
  Timer? _timer;
  Future<void> _pendingSave = Future<void>.value();
  Future<bool>? _disposal;
  bool _disposed = false;
  int _revision = 0;
  AutosaveState state = AutosaveState.idle;
  Object? lastError;

  void _notify(AutosaveState value, int revision) {
    if (revision != _revision) return;
    state = value;
    try {
      onState?.call(value);
    } catch (_) {
      /* UI failure must not break persistence. */
    }
  }

  void schedule() {
    if (_disposed || _disposal != null) return;
    _revision++;
    _notify(AutosaveState.pending, _revision);
    _timer?.cancel();
    _timer = Timer(delay, () {
      unawaited(flush());
    });
  }

  Future<bool> flush() {
    _timer?.cancel();
    if (_disposed || _disposal != null) {
      return _disposal ?? Future<bool>.value(false);
    }
    return _save();
  }

  Future<bool> _save() {
    final revision = ++_revision;
    late Uint8List snapshot;
    try {
      snapshot = Uint8List.fromList(_capture());
    } catch (error) {
      lastError = error;
      _notify(AutosaveState.failed, revision);
      return Future<bool>.value(false);
    }
    final next = _pendingSave.then((_) async {
      _notify(AutosaveState.saving, revision);
      try {
        await _storage.save(_slug, snapshot);
        lastError = null;
        _notify(AutosaveState.saved, revision);
        return true;
      } catch (error) {
        lastError = error;
        _notify(AutosaveState.failed, revision);
        return false;
      }
    });
    _pendingSave = next.then<void>((_) {});
    return next;
  }

  Future<bool> dispose() {
    if (_disposal != null) return _disposal!;
    _timer?.cancel();
    _disposal = _save().whenComplete(() {
      _disposed = true;
    });
    return _disposal!;
  }
}
