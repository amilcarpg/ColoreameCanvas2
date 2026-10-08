import 'dart:io';
import 'package:path_provider/path_provider.dart';
import 'local_drawing_storage.dart';

/// Platform directory adapter; persistence logic is testable without Flutter.
class DrawingStorage extends LocalDrawingStorage {
  DrawingStorage({
    Future<Directory> Function()? directoryProvider,
    super.operationHook,
  }) : super(
         directoryProvider:
             directoryProvider ?? getApplicationDocumentsDirectory,
       );
}
