import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:paintme_app/drawing_viewport.dart';

void main() {
  testWidgets('large source fits viewport and taps map to source coordinates', (
    tester,
  ) async {
    final controller = TransformationController();
    addTearDown(controller.dispose);
    final identity = Object();
    Offset? sourcePoint;
    await tester.pumpWidget(
      MaterialApp(
        home: Center(
          child: SizedBox(
            width: 300,
            height: 400,
            child: DrawingViewport(
              sourceSize: const Size(1200, 1200),
              sourceIdentity: identity,
              controller: controller,
              multitouch: false,
              onTapUp: (event) =>
                  sourcePoint = controller.toScene(event.localPosition),
              child: const ColoredBox(color: Colors.white),
            ),
          ),
        ),
      ),
    );
    await tester.pumpAndSettle();
    final view = find.byType(InteractiveViewer);
    final topLeft = MatrixUtils.transformPoint(controller.value, Offset.zero);
    final bottomRight = MatrixUtils.transformPoint(
      controller.value,
      const Offset(1200, 1200),
    );
    expect(topLeft, const Offset(0, 50));
    expect(bottomRight, const Offset(300, 350));
    await tester.tapAt(tester.getTopLeft(view) + const Offset(150, 200));
    expect(sourcePoint, const Offset(600, 600));
  });

  testWidgets('explicit fit and orientation changes retain the full source', (
    tester,
  ) async {
    final controller = TransformationController();
    addTearDown(controller.dispose);
    final identity = Object(), key = GlobalKey<DrawingViewportState>();
    Widget view(Size size) => MaterialApp(
      home: Center(
        child: SizedBox.fromSize(
          size: size,
          child: DrawingViewport(
            key: key,
            sourceSize: const Size(1200, 600),
            sourceIdentity: identity,
            controller: controller,
            multitouch: true,
            child: const ColoredBox(color: Colors.white),
          ),
        ),
      ),
    );
    await tester.pumpWidget(view(const Size(300, 400)));
    await tester.pumpAndSettle();
    final fitted = controller.value.clone();
    controller.value = Matrix4.identity();
    key.currentState!.fit();
    expect(controller.value, fitted);
    await tester.pumpWidget(view(const Size(400, 300)));
    await tester.pumpAndSettle();
    expect(
      MatrixUtils.transformPoint(controller.value, const Offset(1200, 600)),
      const Offset(400, 250),
    );
  });
}
