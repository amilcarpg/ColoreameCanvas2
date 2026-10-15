import 'dart:convert';
import 'dart:io';
import 'package:integration_test/integration_test_driver_extended.dart';

Future<void> main() async {
  final output = Directory('../docs/qa-evidence/2026-10-14/android-emulator');
  await output.create(recursive: true);
  await integrationDriver(
    writeResponseOnFailure: true,
    onScreenshot: (name, bytes, [arguments]) async {
      if (!RegExp(r'^android-(paint|restore)-(before|after)$').hasMatch(name)) {
        return false;
      }
      await File('${output.path}/$name.png').writeAsBytes(bytes, flush: true);
      return true;
    },
    responseDataCallback: (data) async {
      final metadata = {...?data}..remove('screenshots');
      await File(
        '${output.path}/integration-${data?['phase'] ?? 'failure'}.json',
      ).writeAsString(const JsonEncoder.withIndent('  ').convert(metadata));
    },
  );
}
