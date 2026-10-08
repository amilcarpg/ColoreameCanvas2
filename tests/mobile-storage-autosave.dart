// Runs the actual dependency-free persistence/autosave implementation, without Flutter bindings.
import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';
import '../flutter/lib/local_drawing_storage.dart';
import '../flutter/lib/autosave_controller.dart';
import '../flutter/lib/models.dart';
import '../flutter/lib/product_analytics.dart';

void check(bool value, String message) { if (!value) throw StateError(message); }
Future<void> main() async {
  var passed = 0;
  Future<void> run(String name, Future<void> Function(Directory) body) async {
    final directory = await Directory.systemTemp.createTemp('paintme-core-');
    try { await body(directory); passed++; stdout.writeln('PASS $name'); }
    finally {
      final root = await Directory.systemTemp.resolveSymbolicLinks();
      final target = await directory.resolveSymbolicLinks();
      check(target.startsWith('$root${Platform.pathSeparator}'), 'Unsafe temporary cleanup');
      await Directory(target).delete(recursive: true);
    }
  }
  await run('legacy/corrupt index recovery is read-only', (directory) async {
    final sessions = Directory('${directory.path}/paintme-sessions'); await sessions.create();
    await File('${sessions.path}/gato.png').writeAsBytes([1,2,3]);
    final storage = LocalDrawingStorage(directoryProvider: () async => directory);
    check((await storage.list()).single.slug == 'gato', 'Missing legacy PNG');
    check(!await File('${sessions.path}/index.json').exists(), 'Read wrote index');
    await File('${sessions.path}/index.json').writeAsString('{broken');
    await storage.list(); await storage.load('gato');
    check(await File('${sessions.path}/index.json').readAsString() == '{broken', 'Read repaired index');
  });
  await run('atomic PNG interruption preserves previous data and queue recovers', (directory) async {
    var fail = false;
    final storage = LocalDrawingStorage(directoryProvider: () async => directory, operationHook: (stage,path) async {
      if (fail && stage == 'beforeReplace' && path.endsWith('.png')) throw StateError('injected');
    });
    await storage.save('gato', Uint8List.fromList([1]));
    fail = true;
    try { await storage.save('gato', Uint8List.fromList([2])); throw StateError('Expected failure'); }
    catch (error) { check(error.toString().contains('injected'), 'Wrong failure'); }
    check((await storage.load('gato'))!.colorPng[0] == 1, 'Original destroyed');
    fail = false; await storage.save('gato', Uint8List.fromList([3]));
    check((await storage.load('gato'))!.colorPng[0] == 3, 'Queue stuck');
  });
  await run('atomic index failure remains readable and next save succeeds', (directory) async {
    var fail = false;
    final storage = LocalDrawingStorage(directoryProvider: () async => directory, operationHook: (stage,path) async {
      if (fail && stage == 'beforeReplace' && path.endsWith('index.json')) throw StateError('index failure');
    });
    await storage.save('gato', Uint8List.fromList([1])); await storage.toggleFavorite('gato');
    fail = true;
    try { await storage.save('perro', Uint8List.fromList([2])); } catch (_) {}
    final source = await File('${directory.path}/paintme-sessions/index.json').readAsString();
    check(jsonDecode(source)['sessions']['gato']['isFavorite'] == true, 'Index truncated');
    check((await storage.list()).any((item)=>item.slug=='perro'), 'Recovery hides new PNG');
    fail = false; await storage.save('perro', Uint8List.fromList([3]));
    check((await storage.load('perro'))!.colorPng[0] == 3, 'No recovery');
  });
  await run('reads, writes and metadata changes serialize across instances', (directory) async {
    final first = LocalDrawingStorage(directoryProvider: () async => directory);
    final second = LocalDrawingStorage(directoryProvider: () async => directory);
    await Future.wait([first.save('gato', Uint8List.fromList([1])), second.save('perro', Uint8List.fromList([2])), first.toggleFavorite('gato'), second.complete('gato'), first.list()]);
    final items = await second.list(), cat = items.firstWhere((item)=>item.slug=='gato');
    check(items.length==2 && cat.isFavorite && cat.status==DrawingStatus.completed, 'Lost concurrent metadata');
  });
  await run('clear cannot resurrect artwork from backup/corrupt index', (directory) async {
    final storage = LocalDrawingStorage(directoryProvider: () async => directory);
    await storage.save('gato', Uint8List.fromList([1])); await storage.save('gato', Uint8List.fromList([2]));
    await storage.clear('gato');
    await File('${directory.path}/paintme-sessions/index.json').writeAsString('{broken');
    check(await storage.load('gato')==null && (await storage.list()).isEmpty, 'Cleared drawing resurrected');
    await storage.save('gato', Uint8List.fromList([3]));
    check((await storage.load('gato'))!.colorPng[0]==3, 'Cannot save after clear');
  });
  await run('missing primary PNG and malformed primary index use backups', (directory) async {
    final storage = LocalDrawingStorage(directoryProvider: () async => directory);
    await storage.save('gato', Uint8List.fromList([1])); await storage.toggleFavorite('gato'); await storage.complete('gato');
    await storage.save('gato', Uint8List.fromList([2]));
    await File('${directory.path}/paintme-sessions/gato.png').delete();
    await File('${directory.path}/paintme-sessions/index.json').writeAsString('{broken');
    final cat = await storage.load('gato');
    check(cat!.colorPng[0]==1 && cat.isFavorite, 'Backup recovery failed');
  });
  await run('path traversal is rejected and caller bytes are snapshotted', (directory) async {
    final storage = LocalDrawingStorage(directoryProvider: () async => directory);
    for (final slug in ['../escape','a/b','', 'UPPER']) {
      try { await storage.save(slug, Uint8List.fromList([1])); throw StateError('Accepted invalid slug'); }
      on ArgumentError { /* expected */ }
    }
    final bytes = Uint8List.fromList([5]), pending = storage.save('gato', bytes); bytes[0]=99; await pending;
    check((await storage.load('gato'))!.colorPng[0]==5, 'Mutable caller changed saved snapshot');
  });
  await run('autosave failure then retry emits success only after write', (directory) async {
    var fail = true; final states = <AutosaveState>[];
    final storage = LocalDrawingStorage(directoryProvider: () async => directory, operationHook: (_,__) async {if(fail) throw StateError('injected');});
    final controller = AutosaveController(storage,'gato',()=>Uint8List.fromList([1]),onState:states.add);
    check(!await controller.flush() && states.last==AutosaveState.failed, 'False success');
    fail = false;
    check(await controller.flush() && states.last==AutosaveState.saved, 'Queue remains rejected');
    check((await storage.load('gato'))!.colorPng[0]==1, 'Success before persistence');
    await controller.dispose();
  });
  await run('timer failure is handled and dispose saves latest snapshot once', (directory) async {
    var fail = true, writes=0, value=1;
    final storage = LocalDrawingStorage(directoryProvider: () async => directory,operationHook:(stage,_) async {if(stage=='afterTempWrite') {writes++; if(fail) throw StateError('injected');}});
    final controller = AutosaveController(storage,'gato',()=>Uint8List.fromList([value]),delay:Duration.zero);
    controller.schedule(); await Future<void>.delayed(const Duration(milliseconds:50));
    check(controller.state==AutosaveState.failed, 'Timer failure not captured');
    fail=false; value=7; controller.schedule();
    final first = controller.dispose(), second=controller.dispose();
    check(identical(first,second), 'Dispose repeated'); check(await first, 'Dispose failed');
    check((await storage.load('gato'))!.colorPng[0]==7 && writes==3, 'Final snapshot/timer duplicated');
  });
  await run('stale save completion does not claim a newer pending edit is saved', (directory) async {
    final release = Completer<void>(), entered = Completer<void>(); var blocked=true, value=1;
    final storage=LocalDrawingStorage(directoryProvider:()=>Future.value(directory),operationHook:(stage,path) async {if(blocked&&stage=='beforeReplace'&&path.endsWith('.png')) {entered.complete();await release.future;}});
    final controller=AutosaveController(storage,'gato',()=>Uint8List.fromList([value]),delay:const Duration(hours:1));
    final old=controller.flush(); await entered.future; value=2; controller.schedule(); release.complete(); await old;
    check(controller.state==AutosaveState.pending,'Old save erased pending edit');
    blocked=false; await controller.dispose(); check((await storage.load('gato'))!.colorPng[0]==2,'Latest lost');
  });
  await run('snapshot/callback errors are contained and flush recovers', (directory) async {
    var fail=true;
    final storage=LocalDrawingStorage(directoryProvider:()=>Future.value(directory));
    final controller=AutosaveController(storage,'gato',(){if(fail) throw StateError('capture');return Uint8List.fromList([1]);},onState:(_){throw StateError('UI');});
    check(!await controller.flush(),'Capture error ignored'); fail=false; check(await controller.flush(),'Cannot retry capture'); await controller.dispose();
  });
  await run('mobile event schema drops free text, URLs and unknown catalog slugs', (_) async {
    final clean=sanitizeProductEvent('first_color_applied',{'slug':'unknown','source':'https://example.test/name','email':'child@example.test','traces':[1,2],'drawing':'png','platform':'android','result':'success'},knownSlugs:{'gato'});
    check(clean!.length==4 && clean['source']=='direct' && !clean.containsKey('slug'),'Payload leaked unapproved fields');
    check(sanitizeProductEvent('unknown',{})==null,'Unknown event accepted');
    check(sanitizeProductEvent('drawing_opened',{'slug':'gato'},knownSlugs:{'gato'})!['slug']=='gato','Known slug dropped');
    await const DisabledProductAnalytics().track('first_color_applied',properties:{'drawing':'must not send'});
  });
  stdout.writeln('$passed mobile core cases passed; Flutter widgets/lifecycle devices not exercised.');
}
