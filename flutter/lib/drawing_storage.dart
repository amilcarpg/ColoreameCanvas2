import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';

import 'package:path_provider/path_provider.dart';

import 'models.dart';

class DrawingStorage {
  DrawingStorage({Future<Directory> Function()? directoryProvider})
    : _directoryProvider =
          directoryProvider ?? getApplicationDocumentsDirectory;

  static const _indexFile = 'index.json';
  final Future<Directory> Function() _directoryProvider;

  Future<Directory> _sessionsDirectory() async {
    final directory = await _directoryProvider();
    final sessions = Directory('${directory.path}/paintme-sessions');
    if (!await sessions.exists()) await sessions.create(recursive: true);
    return sessions;
  }

  Future<File> _file(String slug) async =>
      File('${(await _sessionsDirectory()).path}/$slug.png');

  Future<File> _index() async =>
      File('${(await _sessionsDirectory()).path}/$_indexFile');

  Future<Map<String, _SessionMetadata>> _readIndex() async {
    final index = await _index();
    final sessions = await _sessionsDirectory();
    final metadata = <String, _SessionMetadata>{};
    if (await index.exists()) {
      try {
        final source =
            jsonDecode(await index.readAsString()) as Map<String, dynamic>;
        final items = source['sessions'] as Map<String, dynamic>? ?? {};
        for (final entry in items.entries) {
          metadata[entry.key] = _SessionMetadata.fromJson(
            entry.key,
            entry.value as Map<String, dynamic>,
          );
        }
      } on FormatException {
        // A corrupt index must not hide a child's saved artwork.
      }
    }
    // Migration for v1 PNG-only sessions.
    for (final entity in sessions.listSync().whereType<File>()) {
      if (!entity.path.endsWith('.png')) continue;
      final slug = entity.uri.pathSegments.last.replaceFirst('.png', '');
      metadata.putIfAbsent(
        slug,
        () => _SessionMetadata(
          updatedAt: entity.lastModifiedSync(),
          status: DrawingStatus.inProgress,
          isFavorite: false,
        ),
      );
    }
    await _writeIndex(metadata);
    return metadata;
  }

  Future<void> _writeIndex(Map<String, _SessionMetadata> metadata) async {
    final index = await _index();
    await index.writeAsString(
      jsonEncode({
        'version': 1,
        'sessions': metadata.map((key, value) => MapEntry(key, value.toJson())),
      }),
      flush: true,
    );
  }

  Future<List<DrawingSession>> list() async {
    final metadata = await _readIndex();
    final output = <DrawingSession>[];
    for (final entry in metadata.entries) {
      output.add(
        DrawingSession(
          slug: entry.key,
          updatedAt: entry.value.updatedAt,
          status: entry.value.status,
          isFavorite: entry.value.isFavorite,
          colorPng: Uint8List(0),
        ),
      );
    }
    output.sort((a, b) => b.updatedAt.compareTo(a.updatedAt));
    return output;
  }

  Future<DrawingSession?> load(String slug) async {
    final file = await _file(slug);
    if (!await file.exists()) return null;
    final metadata = await _readIndex();
    final item =
        metadata[slug] ??
        _SessionMetadata(
          updatedAt: await file.lastModified(),
          status: DrawingStatus.inProgress,
          isFavorite: false,
        );
    return DrawingSession(
      slug: slug,
      updatedAt: item.updatedAt,
      status: item.status,
      isFavorite: item.isFavorite,
      colorPng: await file.readAsBytes(),
    );
  }

  Future<void> save(String slug, Uint8List colorPng) async {
    final file = await _file(slug);
    await file.writeAsBytes(colorPng, flush: true);
    final metadata = await _readIndex();
    final previous = metadata[slug];
    metadata[slug] = _SessionMetadata(
      updatedAt: DateTime.now(),
      status: previous?.status ?? DrawingStatus.inProgress,
      isFavorite: previous?.isFavorite ?? false,
    );
    await _writeIndex(metadata);
  }

  Future<void> complete(String slug) async =>
      _update(slug, status: DrawingStatus.completed);

  Future<void> toggleFavorite(String slug) async {
    final current = await load(slug);
    if (current == null) {
      final metadata = await _readIndex();
      metadata[slug] = _SessionMetadata(
        updatedAt: DateTime.now(),
        status: DrawingStatus.inProgress,
        isFavorite: !(metadata[slug]?.isFavorite ?? false),
      );
      await _writeIndex(metadata);
      return;
    }
    await _update(slug, isFavorite: !current.isFavorite);
  }

  Future<void> _update(
    String slug, {
    DrawingStatus? status,
    bool? isFavorite,
  }) async {
    final metadata = await _readIndex();
    final current = metadata[slug];
    if (current == null) return;
    metadata[slug] = _SessionMetadata(
      updatedAt: DateTime.now(),
      status: status ?? current.status,
      isFavorite: isFavorite ?? current.isFavorite,
    );
    await _writeIndex(metadata);
  }

  Future<void> clear(String slug) async {
    final file = await _file(slug);
    if (await file.exists()) await file.delete();
    final metadata = await _readIndex();
    metadata.remove(slug);
    await _writeIndex(metadata);
  }
}

class _SessionMetadata {
  const _SessionMetadata({
    required this.updatedAt,
    required this.status,
    required this.isFavorite,
  });
  final DateTime updatedAt;
  final DrawingStatus status;
  final bool isFavorite;

  factory _SessionMetadata.fromJson(String slug, Map<String, dynamic> json) =>
      _SessionMetadata(
        updatedAt:
            DateTime.tryParse(json['updatedAt'] as String? ?? '') ??
            DateTime.now(),
        status: json['status'] == 'completed'
            ? DrawingStatus.completed
            : DrawingStatus.inProgress,
        isFavorite: json['isFavorite'] as bool? ?? false,
      );

  Map<String, Object> toJson() => {
    'updatedAt': updatedAt.toIso8601String(),
    'status': status == DrawingStatus.completed ? 'completed' : 'inProgress',
    'isFavorite': isFavorite,
  };
}
