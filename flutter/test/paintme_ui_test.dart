import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:paintme_app/paintme_theme.dart';
import 'package:paintme_app/paintme_ui.dart';

void main() {
  testWidgets('la marca y superficie usan la identidad PaintMe', (
    tester,
  ) async {
    await tester.pumpWidget(
      MaterialApp(
        theme: paintMeTheme(),
        home: const Scaffold(body: PaintMeSurface(child: PaintMeBrand())),
      ),
    );

    expect(find.byType(PaintMeBrand), findsOneWidget);
    final container = tester.widget<Container>(find.byType(Container).first);
    expect((container.decoration! as BoxDecoration).color, Colors.white);
  });

  testWidgets('los botones de icono conservan una zona táctil de 48 px', (
    tester,
  ) async {
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: PaintMeIconButton(
            icon: Icons.casino,
            tooltip: 'Sorpresa',
            onPressed: () {},
          ),
        ),
      ),
    );
    final button = tester.widget<IconButton>(find.byType(IconButton));
    expect(button.constraints?.minWidth, 48);
    expect(button.constraints?.minHeight, 48);
  });
}
