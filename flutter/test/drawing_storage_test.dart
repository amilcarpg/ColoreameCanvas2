import 'dart:io';
import 'dart:typed_data';

import 'package:flutter_test/flutter_test.dart';
import 'package:paintme_app/drawing_storage.dart';
import 'package:paintme_app/models.dart';

void main() {
  late Directory directory;
  late DrawingStorage storage;

  setUp(() async {
    directory = await Directory.systemTemp.createTemp('paintme-storage-test');
    storage = DrawingStorage(directoryProvider: () async => directory);
  });

  tearDown(() async => directory.delete(recursive: true));

  test('migrates legacy PNG sessions as in-progress', () async {
    final sessions = Directory('${directory.path}/paintme-sessions');
    await sessions.create(recursive: true);
    await File('${sessions.path}/gato.png').writeAsBytes(<int>[1, 2, 3]);

    final result = await storage.list();

    expect(result, hasLength(1));
    expect(result.single.slug, 'gato');
    expect(result.single.status, DrawingStatus.inProgress);
    expect(result.single.isFavorite, isFalse);
    expect(File('${sessions.path}/index.json').existsSync(), isTrue);
  });

  test(
    'stores favorites, completion state, and newest session first',
    () async {
      await storage.save('gato', Uint8List.fromList(<int>[1]));
      await storage.toggleFavorite('gato');
      await storage.complete('gato');
      await storage.save('perro', Uint8List.fromList(<int>[2]));

      final result = await storage.list();
      final gato = result.firstWhere((item) => item.slug == 'gato');

      expect(result.first.slug, 'perro');
      expect(gato.status, DrawingStatus.completed);
      expect(gato.isFavorite, isTrue);
    },
  );

  test('can favorite a catalog drawing before its first save', () async {
    await storage.toggleFavorite('unicornio');

    final result = await storage.list();

    expect(result.single.slug, 'unicornio');
    expect(result.single.isFavorite, isTrue);
  });
}
