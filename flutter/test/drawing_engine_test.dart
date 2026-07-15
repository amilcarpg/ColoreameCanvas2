import 'package:flutter_test/flutter_test.dart';
import 'package:image/image.dart' as img;
import 'package:paintme_app/catalog_repository.dart';
import 'package:paintme_app/drawing_engine.dart';
import 'package:paintme_app/models.dart';

void main() {
  test('el catálogo filtra por categoría y búsqueda', () {
    final drawings = decodeDrawings(
      '[{"label":"Gato","slug":"gato","category":"animales","pack":"animales","asset":"gato.png","keywords":["felino"],"featured":true}]',
    );
    final repository = CatalogRepository();
    expect(
      repository.filter(drawings, category: 'animales', query: 'felino'),
      hasLength(1),
    );
    expect(repository.filter(drawings, category: 'vehiculos'), isEmpty);
  });

  test(
    'el balde respeta una línea y el borrador no elimina el contorno',
    () async {
      final source = img.Image(width: 5, height: 5, numChannels: 4);
      img.fill(source, color: img.ColorRgba8(255, 255, 255, 255));
      for (var y = 0; y < 5; y++) {
        source.setPixelRgba(2, y, 0, 0, 0, 255);
      }
      final engine = DrawingEngine.fromSource(source);
      await engine.fill(0, 2, 0xffff0000);
      engine.applyStroke(
        points: const [Offset(0, 0), Offset(1, 0)],
        color: 0xff00ff00,
        size: 2,
        erase: false,
      );
      engine.applyStroke(
        points: const [Offset(0, 0), Offset(1, 0)],
        color: 0,
        size: 2,
        erase: true,
      );
      final output = img.decodePng(engine.exportPng())!;
      expect(output.getPixel(1, 2).r, 255);
      expect(output.getPixel(3, 2).r, 255);
      expect(output.getPixel(2, 2).r, 0);
    },
  );
}
