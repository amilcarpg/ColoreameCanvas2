import 'dart:isolate';
import 'dart:typed_data';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart' show Offset;
import 'package:image/image.dart' as img;

class FillRequest {
  const FillRequest({
    required this.width,
    required this.height,
    required this.lineMask,
    required this.colorLayer,
    required this.x,
    required this.y,
    required this.color,
  });

  final int width;
  final int height;
  final TransferableTypedData lineMask;
  final TransferableTypedData colorLayer;
  final int x;
  final int y;
  final int color;
}

/// Every pixel enters the typed queue at most once; it avoids allocating a Dart
/// object for every visited point in large drawings.
TransferableTypedData fillRegion(FillRequest request) {
  final mask = request.lineMask.materialize().asUint8List();
  final pixels = request.colorLayer.materialize().asUint8List();
  final total = request.width * request.height;
  final start = request.y * request.width + request.x;
  if (mask[start] == 1) return TransferableTypedData.fromList([pixels]);

  final visited = Uint8List(total);
  final queue = Uint32List(total);
  var head = 0;
  var tail = 0;
  queue[tail++] = start;
  visited[start] = 1;
  final a = (request.color >> 24) & 0xff;
  final r = (request.color >> 16) & 0xff;
  final g = (request.color >> 8) & 0xff;
  final b = request.color & 0xff;

  void enqueue(int index) {
    if (visited[index] == 0 && mask[index] == 0) {
      visited[index] = 1;
      queue[tail++] = index;
    }
  }

  while (head < tail) {
    final index = queue[head++];
    final offset = index * 4;
    pixels[offset] = r;
    pixels[offset + 1] = g;
    pixels[offset + 2] = b;
    pixels[offset + 3] = a;
    final x = index % request.width;
    if (x > 0) enqueue(index - 1);
    if (x < request.width - 1) enqueue(index + 1);
    if (index >= request.width) enqueue(index - request.width);
    if (index < total - request.width) enqueue(index + request.width);
  }
  return TransferableTypedData.fromList([pixels]);
}

class DrawingEngine {
  DrawingEngine._(
    this.width,
    this.height,
    this._lineMask,
    this._lineLayer,
    this._colorLayer,
  );

  static const undoLimit = 8;
  final int width;
  final int height;
  final Uint8List _lineMask;
  final img.Image _lineLayer;
  img.Image _colorLayer;
  final List<Uint8List> _undo = [];

  factory DrawingEngine.fromSource(img.Image source, {Uint8List? savedColor}) {
    final line = img.Image(
      width: source.width,
      height: source.height,
      numChannels: 4,
    );
    final mask = Uint8List(source.width * source.height);
    for (var y = 0; y < source.height; y++) {
      for (var x = 0; x < source.width; x++) {
        final pixel = source.getPixel(x, y);
        final isLine =
            pixel.a > 16 && pixel.r < 245 && pixel.g < 245 && pixel.b < 245;
        if (isLine) {
          mask[y * source.width + x] = 1;
          line.setPixelRgba(
            x,
            y,
            pixel.r.toInt(),
            pixel.g.toInt(),
            pixel.b.toInt(),
            pixel.a.toInt(),
          );
        }
      }
    }
    final colors = img.Image(
      width: source.width,
      height: source.height,
      numChannels: 4,
    );
    final restored = savedColor == null ? null : img.decodePng(savedColor);
    if (restored != null &&
        restored.width == source.width &&
        restored.height == source.height) {
      img.compositeImage(colors, restored);
    }
    return DrawingEngine._(source.width, source.height, mask, line, colors);
  }

  bool get canUndo => _undo.isNotEmpty;
  bool get hasChanges => colorBytes.any((value) => value != 0);
  Uint8List get colorBytes =>
      Uint8List.fromList(_colorLayer.getBytes(order: img.ChannelOrder.rgba));
  Uint8List get lineBytes =>
      Uint8List.fromList(_lineLayer.getBytes(order: img.ChannelOrder.rgba));

  void _snapshot() {
    _undo.add(Uint8List.fromList(img.encodePng(_colorLayer, level: 3)));
    if (_undo.length > undoLimit) {
      _undo.removeAt(0);
    }
  }

  void applyStroke({
    required List<Offset> points,
    required int color,
    required int size,
    required bool erase,
  }) {
    if (points.isEmpty) {
      return;
    }
    _snapshot();
    final paint = erase
        ? img.ColorRgba8(0, 0, 0, 0)
        : img.ColorRgba8(
            (color >> 16) & 0xff,
            (color >> 8) & 0xff,
            color & 0xff,
            (color >> 24) & 0xff,
          );
    final first = points.first;
    for (var index = 1; index < points.length; index++) {
      final from = points[index - 1];
      final to = points[index];
      img.drawLine(
        _colorLayer,
        x1: from.dx.round(),
        y1: from.dy.round(),
        x2: to.dx.round(),
        y2: to.dy.round(),
        color: paint,
        thickness: size,
      );
    }
    img.drawCircle(
      _colorLayer,
      x: first.dx.round(),
      y: first.dy.round(),
      radius: size ~/ 2,
      color: paint,
    );
    if (erase) {
      _erasePoints(points, size);
    }
  }

  void _erasePoints(List<Offset> points, int size) {
    final radius = size ~/ 2;
    for (final point in points) {
      final centerX = point.dx.round();
      final centerY = point.dy.round();
      for (var y = centerY - radius; y <= centerY + radius; y++) {
        for (var x = centerX - radius; x <= centerX + radius; x++) {
          if (x >= 0 && y >= 0 && x < width && y < height) {
            _colorLayer.setPixelRgba(x, y, 0, 0, 0, 0);
          }
        }
      }
    }
  }

  Future<bool> fill(int x, int y, int color) async {
    if (x < 0 ||
        y < 0 ||
        x >= width ||
        y >= height ||
        _lineMask[y * width + x] == 1) {
      return false;
    }
    _snapshot();
    final result = await compute(
      fillRegion,
      FillRequest(
        width: width,
        height: height,
        lineMask: TransferableTypedData.fromList([_lineMask]),
        colorLayer: TransferableTypedData.fromList([colorBytes]),
        x: x,
        y: y,
        color: color,
      ),
    );
    final bytes = result.materialize().asUint8List();
    _colorLayer = img.Image.fromBytes(
      width: width,
      height: height,
      bytes: bytes.buffer,
      numChannels: 4,
      order: img.ChannelOrder.rgba,
    );
    return true;
  }

  void undo() {
    if (_undo.isEmpty) return;
    final restored = img.decodePng(_undo.removeLast());
    if (restored != null) _colorLayer = restored;
  }

  void reset() {
    _snapshot();
    _colorLayer = img.Image(width: width, height: height, numChannels: 4);
  }

  Uint8List colorPng() =>
      Uint8List.fromList(img.encodePng(_colorLayer, level: 3));

  Uint8List exportPng() {
    final result = img.Image(width: width, height: height, numChannels: 4);
    img.fill(result, color: img.ColorRgba8(255, 255, 255, 255));
    img.compositeImage(result, _colorLayer);
    img.compositeImage(result, _lineLayer);
    return Uint8List.fromList(img.encodePng(result));
  }
}
