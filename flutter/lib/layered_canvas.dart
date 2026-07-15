import 'dart:async';
import 'dart:typed_data';
import 'dart:ui' as ui;

import 'package:flutter/material.dart';

Future<ui.Image> imageFromRgba(Uint8List bytes, int width, int height) {
  final completer = Completer<ui.Image>();
  ui.decodeImageFromPixels(
    bytes,
    width,
    height,
    ui.PixelFormat.rgba8888,
    completer.complete,
  );
  return completer.future;
}

class LayeredCanvas extends StatelessWidget {
  const LayeredCanvas({
    super.key,
    required this.width,
    required this.height,
    required this.colorLayer,
    required this.lineLayer,
    required this.stroke,
    required this.strokeColor,
    required this.strokeSize,
    required this.erase,
  });

  final int width;
  final int height;
  final ui.Image colorLayer;
  final ui.Image lineLayer;
  final List<Offset> stroke;
  final Color strokeColor;
  final double strokeSize;
  final bool erase;

  @override
  Widget build(BuildContext context) => RepaintBoundary(
    child: CustomPaint(
      size: Size(width.toDouble(), height.toDouble()),
      painter: _LayeredCanvasPainter(
        colorLayer,
        lineLayer,
        stroke,
        strokeColor,
        strokeSize,
        erase,
      ),
    ),
  );
}

class _LayeredCanvasPainter extends CustomPainter {
  const _LayeredCanvasPainter(
    this.colorLayer,
    this.lineLayer,
    this.stroke,
    this.strokeColor,
    this.strokeSize,
    this.erase,
  );
  final ui.Image colorLayer;
  final ui.Image lineLayer;
  final List<Offset> stroke;
  final Color strokeColor;
  final double strokeSize;
  final bool erase;

  @override
  void paint(Canvas canvas, Size size) {
    canvas.drawColor(Colors.white, BlendMode.src);
    canvas.drawImage(colorLayer, Offset.zero, Paint());
    if (stroke.isNotEmpty) {
      final paint = Paint()
        ..color = erase ? Colors.white : strokeColor
        ..strokeWidth = strokeSize
        ..strokeCap = StrokeCap.round
        ..strokeJoin = StrokeJoin.round
        ..style = PaintingStyle.stroke;
      if (stroke.length == 1) {
        canvas.drawCircle(
          stroke.first,
          strokeSize / 2,
          paint..style = PaintingStyle.fill,
        );
      } else {
        final path = Path()..moveTo(stroke.first.dx, stroke.first.dy);
        for (final point in stroke.skip(1)) {
          path.lineTo(point.dx, point.dy);
        }
        canvas.drawPath(path, paint);
      }
    }
    canvas.drawImage(lineLayer, Offset.zero, Paint());
  }

  @override
  bool shouldRepaint(covariant _LayeredCanvasPainter old) =>
      old.colorLayer != colorLayer ||
      old.lineLayer != lineLayer ||
      old.stroke != stroke ||
      old.strokeColor != strokeColor ||
      old.strokeSize != strokeSize ||
      old.erase != erase;
}
