import 'dart:io';
import 'dart:typed_data';
import 'dart:ui';

import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';

enum ExportOutcome { shared, dismissed, unavailable, failed }

class ExportService {
  ExportService({
    Future<Directory> Function()? directoryProvider,
    Future<ShareResult> Function(ShareParams)? share,
  }) : _directory = directoryProvider ?? getTemporaryDirectory,
       _share = share ?? SharePlus.instance.share;
  final Future<Directory> Function() _directory;
  final Future<ShareResult> Function(ShareParams) _share;
  static int _sequence = 0;
  Future<ExportOutcome> saveAndShare({
    required String slug,
    required Uint8List png,
    required Rect origin,
  }) async {
    if (!RegExp(r'^[a-z0-9-]{1,64}$').hasMatch(slug) ||
        png.isEmpty ||
        origin.isEmpty ||
        !origin.left.isFinite ||
        !origin.top.isFinite ||
        !origin.width.isFinite ||
        !origin.height.isFinite) {
      return ExportOutcome.failed;
    }
    final snapshot = Uint8List.fromList(png);
    try {
      final directory = Directory('${(await _directory()).path}/paintme-share');
      await directory.create(recursive: true);
      // Delete only old regular files owned by this exporter, never arbitrary directories/symlinks.
      await for (final entity in directory.list(followLinks: false)) {
        if (entity is File &&
            RegExp(
              r'^paintme-[a-z0-9-]+-\d+-\d+\.png$',
            ).hasMatch(entity.uri.pathSegments.last) &&
            DateTime.now().difference(await entity.lastModified()) >
                const Duration(days: 2)) {
          await entity.delete();
        }
      }
      final file = File(
        '${directory.path}/paintme-$slug-${DateTime.now().microsecondsSinceEpoch}-${_sequence++}.png',
      );
      await file.writeAsBytes(snapshot, flush: true);
      final result = await _share(
        ShareParams(
          files: [XFile(file.path, mimeType: 'image/png')],
          subject: 'PaintMe: $slug',
          sharePositionOrigin: origin,
        ),
      );
      return switch (result.status) {
        ShareResultStatus.success => ExportOutcome.shared,
        ShareResultStatus.dismissed => ExportOutcome.dismissed,
        ShareResultStatus.unavailable => ExportOutcome.unavailable,
      };
    } catch (_) {
      return ExportOutcome.failed;
    }
  }
}
