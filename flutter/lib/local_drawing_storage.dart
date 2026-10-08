import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';

import 'models.dart';

/// Serializes reads and writes; reads never repair or rewrite the index.
class LocalDrawingStorage {
  LocalDrawingStorage({
    required Future<Directory> Function() directoryProvider,
    Future<void> Function(String stage, String path)? operationHook,
  }) : _directoryProvider = directoryProvider,
       _operationHook = operationHook;

  final Future<Directory> Function() _directoryProvider;
  final Future<void> Function(String, String)? _operationHook;
  static Future<void> _queue = Future<void>.value();
  static final _slugPattern = RegExp(r'^[a-z0-9-]{1,64}$');

  Future<T> _serial<T>(Future<T> Function() operation) {
    final next = _queue.then((_) => operation());
    _queue = next.then<void>((_) {}, onError: (Object _, StackTrace _) {});
    return next;
  }

  void _checkSlug(String slug) {
    if (!_slugPattern.hasMatch(slug)) throw ArgumentError.value(slug, 'slug');
  }

  Future<Directory> _directory() async =>
      Directory('${(await _directoryProvider()).path}/paintme-sessions');

  Future<void> _atomic(File target, List<int> bytes) async {
    await target.parent.create(recursive: true);
    final temporary = File('${target.path}.tmp');
    await temporary.writeAsBytes(bytes, flush: true);
    await _operationHook?.call('afterTempWrite', target.path);
    if (await target.exists()) {
      final backupTemporary = File('${target.path}.bak.tmp');
      await target.copy(backupTemporary.path);
      await backupTemporary.rename('${target.path}.bak');
    }
    await _operationHook?.call('beforeReplace', target.path);
    await temporary.rename(target.path);
  }

  Future<Map<String, _Metadata>> _readIndex(Directory directory) async {
    final metadata = <String, _Metadata>{};
    for (final suffix in ['', '.bak']) {
      final file = File('${directory.path}/index.json$suffix');
      if (!await file.exists()) continue;
      try {
        final raw =
            jsonDecode(await file.readAsString()) as Map<String, dynamic>;
        final items = raw['sessions'] as Map<String, dynamic>;
        for (final entry in items.entries) {
          if (!_slugPattern.hasMatch(entry.key)) continue;
          try {
            metadata[entry.key] = _Metadata.fromJson(
              entry.value as Map<String, dynamic>,
            );
          } on FormatException {
            /* recover this entry from its PNG */
          } on TypeError {
            /* ignore malformed metadata */
          }
        }
        break;
      } on FormatException {
        continue;
      } on TypeError {
        continue;
      }
    }
    if (await directory.exists()) {
      await for (final entity in directory.list(followLinks: false)) {
        if (entity is! File) continue;
        final name = entity.uri.pathSegments.last;
        final slug = name.endsWith('.png.bak')
            ? name.substring(0, name.length - 8)
            : name.endsWith('.png')
            ? name.substring(0, name.length - 4)
            : '';
        if (!_slugPattern.hasMatch(slug) ||
            await File('${directory.path}/$slug.deleted').exists()) {
          continue;
        }
        metadata.putIfAbsent(
          slug,
          () => _Metadata(updatedAt: entity.lastModifiedSync()),
        );
      }
      for (final slug in metadata.keys.toList()) {
        if (await File('${directory.path}/$slug.deleted').exists()) {
          metadata.remove(slug);
        }
      }
    }
    return metadata;
  }

  Future<void> _writeIndex(
    Directory directory,
    Map<String, _Metadata> metadata,
  ) => _atomic(
    File('${directory.path}/index.json'),
    utf8.encode(
      jsonEncode({
        'version': 2,
        'sessions': metadata.map((key, value) => MapEntry(key, value.toJson())),
      }),
    ),
  );

  Future<List<DrawingSession>> list() => _serial(() async {
    final directory = await _directory();
    final metadata = await _readIndex(directory);
    final sessions = <DrawingSession>[];
    for (final entry in metadata.entries) {
      final hasDrawing =
          await File('${directory.path}/${entry.key}.png').exists() ||
          await File('${directory.path}/${entry.key}.png.bak').exists();
      sessions.add(
        DrawingSession(
          slug: entry.key,
          updatedAt: entry.value.updatedAt,
          status: entry.value.status,
          isFavorite: entry.value.favorite,
          hasDrawing: hasDrawing,
          colorPng: Uint8List(0),
        ),
      );
    }
    return sessions..sort((a, b) => b.updatedAt.compareTo(a.updatedAt));
  });

  Future<DrawingSession?> load(String slug) {
    _checkSlug(slug);
    return _serial(() async {
      final directory = await _directory();
      if (await File('${directory.path}/$slug.deleted').exists()) return null;
      final metadata = await _readIndex(directory);
      for (final suffix in ['', '.bak']) {
        final file = File('${directory.path}/$slug.png$suffix');
        if (!await file.exists()) continue;
        final bytes = await file.readAsBytes();
        if (bytes.isEmpty) continue;
        final item =
            metadata[slug] ?? _Metadata(updatedAt: await file.lastModified());
        return DrawingSession(
          slug: slug,
          updatedAt: item.updatedAt,
          status: item.status,
          isFavorite: item.favorite,
          colorPng: bytes,
        );
      }
      return null;
    });
  }

  Future<void> save(String slug, Uint8List colorPng) {
    _checkSlug(slug);
    if (colorPng.isEmpty) throw ArgumentError('Empty drawing');
    final snapshot = Uint8List.fromList(colorPng);
    return _serial(() async {
      final directory = await _directory();
      final metadata = await _readIndex(directory), previous = metadata[slug];
      await _atomic(File('${directory.path}/$slug.png'), snapshot);
      metadata[slug] = _Metadata(
        updatedAt: DateTime.now(),
        status: previous?.status ?? DrawingStatus.inProgress,
        favorite: previous?.favorite ?? false,
      );
      await _writeIndex(directory, metadata);
      final tombstone = File('${directory.path}/$slug.deleted');
      if (await tombstone.exists()) await tombstone.delete();
    });
  }

  Future<void> toggleFavorite(String slug) =>
      _changeMetadata(slug, favorite: true);
  Future<void> complete(String slug) => _changeMetadata(slug, completed: true);
  Future<void> _changeMetadata(
    String slug, {
    bool favorite = false,
    bool completed = false,
  }) {
    _checkSlug(slug);
    return _serial(() async {
      final directory = await _directory(),
          metadata = await _readIndex(await _directory());
      final previous = metadata[slug];
      metadata[slug] = _Metadata(
        updatedAt: DateTime.now(),
        status: completed
            ? DrawingStatus.completed
            : previous?.status ?? DrawingStatus.inProgress,
        favorite: favorite
            ? !(previous?.favorite ?? false)
            : previous?.favorite ?? false,
      );
      await _writeIndex(directory, metadata);
    });
  }

  Future<void> clear(String slug) {
    _checkSlug(slug);
    return _serial(() async {
      final directory = await _directory();
      // A persistent marker prevents index/backup recovery resurrecting a cleared drawing.
      await _atomic(
        File('${directory.path}/$slug.deleted'),
        utf8.encode('deleted'),
      );
      final metadata = (await _readIndex(directory))..remove(slug);
      await _writeIndex(directory, metadata);
      for (final suffix in ['', '.bak', '.tmp', '.bak.tmp']) {
        final file = File('${directory.path}/$slug.png$suffix');
        if (await file.exists()) await file.delete();
      }
    });
  }
}

class _Metadata {
  const _Metadata({
    required this.updatedAt,
    this.status = DrawingStatus.inProgress,
    this.favorite = false,
  });
  final DateTime updatedAt;
  final DrawingStatus status;
  final bool favorite;
  factory _Metadata.fromJson(Map<String, dynamic> json) => _Metadata(
    updatedAt: DateTime.parse(json['updatedAt'] as String),
    status: json['status'] == 'completed'
        ? DrawingStatus.completed
        : DrawingStatus.inProgress,
    favorite: json['isFavorite'] as bool? ?? false,
  );
  Map<String, Object> toJson() => {
    'updatedAt': updatedAt.toIso8601String(),
    'status': status == DrawingStatus.completed ? 'completed' : 'in-progress',
    'isFavorite': favorite,
  };
}
