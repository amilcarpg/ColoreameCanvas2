import 'dart:io';
import 'dart:typed_data';

import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';

class ExportService {
  Future<void> saveAndShare({
    required String slug,
    required Uint8List png,
  }) async {
    final directory = await getApplicationDocumentsDirectory();
    final file = File('${directory.path}/paintme-$slug.png');
    await file.writeAsBytes(png, flush: true);
    await SharePlus.instance.share(
      ShareParams(
        files: [XFile(file.path, mimeType: 'image/png')],
        text: 'Mi dibujo de PaintMe',
        subject: 'PaintMe: $slug',
      ),
    );
  }
}
