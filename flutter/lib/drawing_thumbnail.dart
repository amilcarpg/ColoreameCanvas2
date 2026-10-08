import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:image/image.dart' as img;
import 'drawing_storage.dart';
import 'models.dart';

Uint8List? composeDrawingThumbnail((Uint8List, Uint8List) input) {
  try {
    final source = img.decodePng(input.$1), color = img.decodePng(input.$2);
    if (source == null ||
        color == null ||
        source.width != color.width ||
        source.height != color.height) {
      return null;
    }
    // Reconstruct the same line mask as the editor, then resize the completed artwork.
    final output = img.Image(
      width: source.width,
      height: source.height,
      numChannels: 4,
    );
    img.fill(output, color: img.ColorRgba8(255, 255, 255, 255));
    img.compositeImage(output, color);
    for (final pixel in source) {
      if (pixel.a > 16 && pixel.r < 245 && pixel.g < 245 && pixel.b < 245) {
        output.setPixelRgba(
          pixel.x,
          pixel.y,
          pixel.r,
          pixel.g,
          pixel.b,
          pixel.a,
        );
      }
    }
    final thumb = img.copyResize(
      output,
      width: 96,
      height: (96 * source.height / source.width).round().clamp(1, 192),
    );
    return Uint8List.fromList(img.encodePng(thumb, level: 3));
  } catch (_) {
    return null;
  }
}

class ThumbnailRepository {
  ThumbnailRepository(this.storage);
  final DrawingStorage storage;
  final _cache = <String, Future<Uint8List?>>{};
  Future<void> _queue = Future.value();
  Future<Uint8List?> load(Drawing drawing, DrawingSession session) {
    if (!session.hasDrawing) return Future.value(null);
    final key = '${drawing.slug}:${session.updatedAt.microsecondsSinceEpoch}';
    final cached = _cache.remove(key);
    if (cached != null) {
      _cache[key] = cached;
      return cached;
    }
    final result = _queue.then<Uint8List?>((_) async {
      try {
        final saved = await storage.load(drawing.slug);
        if (saved == null) return null;
        final source = await rootBundle.load(drawing.asset);
        return await compute(composeDrawingThumbnail, (
          source.buffer.asUint8List(source.offsetInBytes, source.lengthInBytes),
          saved.colorPng,
        ));
      } catch (_) {
        return null;
      }
    });
    _queue = result.then<void>((_) {}, onError: (Object _, StackTrace _) {});
    _cache[key] = result;
    while (_cache.length > 24) {
      _cache.remove(_cache.keys.first);
    }
    return result;
  }
}

class DrawingThumbnail extends StatelessWidget {
  const DrawingThumbnail({
    super.key,
    required this.drawing,
    required this.session,
    required this.repository,
  });
  final Drawing drawing;
  final DrawingSession session;
  final ThumbnailRepository repository;
  @override
  Widget build(BuildContext context) => SizedBox(
    width: 48,
    height: 48,
    child: FutureBuilder<Uint8List?>(
      future: repository.load(drawing, session),
      builder: (_, snapshot) {
        final bytes = snapshot.data;
        if (bytes == null) {
          return Image.asset(
            drawing.asset,
            cacheWidth: 96,
            errorBuilder: (_, _, _) => const Icon(Icons.image_outlined),
          );
        }
        return Image.memory(
          bytes,
          gaplessPlayback: true,
          semanticLabel: 'Obra guardada: ${drawing.label}',
          errorBuilder: (_, _, _) => Image.asset(drawing.asset, cacheWidth: 96),
        );
      },
    ),
  );
}
