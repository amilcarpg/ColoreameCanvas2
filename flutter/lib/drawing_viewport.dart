import 'dart:math' as math;
import 'package:flutter/material.dart';

/// Keeps source pixels and pointer coordinates in the same transform.
class DrawingViewport extends StatefulWidget {
  const DrawingViewport({
    super.key,
    required this.sourceSize,
    required this.sourceIdentity,
    required this.controller,
    required this.multitouch,
    required this.child,
    this.onPointerDown,
    this.onPointerMove,
    this.onPointerUp,
    this.onPointerCancel,
    this.onTapUp,
  });

  final Size sourceSize;
  final Object sourceIdentity;
  final TransformationController controller;
  final bool multitouch;
  final Widget child;
  final PointerDownEventListener? onPointerDown;
  final PointerMoveEventListener? onPointerMove;
  final PointerUpEventListener? onPointerUp;
  final PointerCancelEventListener? onPointerCancel;
  final GestureTapUpCallback? onTapUp;

  @override
  State<DrawingViewport> createState() => DrawingViewportState();
}

class DrawingViewportState extends State<DrawingViewport> {
  Size? _viewport;

  double _scale(Size size) => math.min(
    size.width / widget.sourceSize.width,
    size.height / widget.sourceSize.height,
  );

  void fit() {
    final viewport = _viewport;
    if (viewport == null) return;
    final scale = _scale(viewport);
    widget.controller.value = Matrix4.diagonal3Values(scale, scale, 1)
      ..setTranslationRaw(
        (viewport.width - widget.sourceSize.width * scale) / 2,
        (viewport.height - widget.sourceSize.height * scale) / 2,
        0,
      );
  }

  @override
  void didUpdateWidget(covariant DrawingViewport oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.sourceSize != widget.sourceSize ||
        !identical(oldWidget.sourceIdentity, widget.sourceIdentity) ||
        oldWidget.controller != widget.controller) {
      _viewport = null;
    }
  }

  @override
  Widget build(BuildContext context) => LayoutBuilder(
    builder: (context, constraints) {
      final size = constraints.biggest;
      if (!size.isFinite || size.isEmpty || widget.sourceSize.isEmpty) {
        return const SizedBox.shrink();
      }
      if (_viewport != size) {
        _viewport = size;
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (mounted && _viewport == size) fit();
        });
      }
      final scale = _scale(size);
      return SizedBox.expand(
        child: Listener(
          onPointerDown: widget.onPointerDown,
          onPointerMove: widget.onPointerMove,
          onPointerUp: widget.onPointerUp,
          onPointerCancel: widget.onPointerCancel,
          child: GestureDetector(
            behavior: HitTestBehavior.opaque,
            onTapUp: widget.onTapUp,
            child: InteractiveViewer(
              transformationController: widget.controller,
              alignment: Alignment.topLeft,
              constrained: false,
              panEnabled: widget.multitouch,
              scaleEnabled: widget.multitouch,
              minScale: scale * .5,
              maxScale: scale * 3,
              boundaryMargin: const EdgeInsets.all(200),
              child: SizedBox.fromSize(
                size: widget.sourceSize,
                child: widget.child,
              ),
            ),
          ),
        ),
      );
    },
  );
}
