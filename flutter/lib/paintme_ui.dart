import 'package:flutter/material.dart';

import 'paintme_theme.dart';

class PaintMeBackground extends StatelessWidget {
  const PaintMeBackground({super.key, required this.child});
  final Widget child;

  @override
  Widget build(BuildContext context) => DecoratedBox(
    decoration: const BoxDecoration(
      gradient: LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [Color(0xfffff8ed), Color(0xfffff6ea)],
      ),
    ),
    child: Stack(
      children: [
        const Positioned(
          top: -90,
          right: -70,
          child: _Glow(color: Color(0x66ffcb47), size: 220),
        ),
        const Positioned(
          bottom: 70,
          left: -70,
          child: _Glow(color: Color(0x4459b8ff), size: 180),
        ),
        child,
      ],
    ),
  );
}

class _Glow extends StatelessWidget {
  const _Glow({required this.color, required this.size});
  final Color color;
  final double size;
  @override
  Widget build(BuildContext context) => IgnorePointer(
    child: Container(
      width: size,
      height: size,
      decoration: BoxDecoration(shape: BoxShape.circle, color: color),
    ),
  );
}

class PaintMeBrand extends StatelessWidget {
  const PaintMeBrand({super.key, this.compact = false});
  final bool compact;
  @override
  Widget build(BuildContext context) {
    final size = compact ? 25.0 : 31.0;
    return Semantics(
      label: 'PaintMe',
      child: RichText(
        text: TextSpan(
          style: TextStyle(
            fontFamily: 'Baloo2',
            fontSize: size,
            fontWeight: FontWeight.w800,
            letterSpacing: -.8,
          ),
          children: const [
            TextSpan(
              text: 'Paint',
              style: TextStyle(color: PaintMeColors.coral),
            ),
            TextSpan(
              text: 'Me',
              style: TextStyle(color: PaintMeColors.sky),
            ),
          ],
        ),
      ),
    );
  }
}

class PaintMeTopBar extends StatelessWidget implements PreferredSizeWidget {
  const PaintMeTopBar({
    super.key,
    this.title,
    this.leading,
    this.actions = const [],
  });
  final Widget? title;
  final Widget? leading;
  final List<Widget> actions;
  @override
  Size get preferredSize => const Size.fromHeight(72);
  @override
  Widget build(BuildContext context) => SafeArea(
    bottom: false,
    child: Padding(
      padding: const EdgeInsets.fromLTRB(16, 10, 16, 6),
      child: Row(
        children: [
          leading ?? const SizedBox.shrink(),
          if (leading != null) const SizedBox(width: 10),
          Expanded(child: title ?? const PaintMeBrand()),
          ...actions,
        ],
      ),
    ),
  );
}

class PaintMeIconButton extends StatelessWidget {
  const PaintMeIconButton({
    super.key,
    required this.icon,
    required this.tooltip,
    required this.onPressed,
    this.tint = PaintMeColors.ink,
  });
  final IconData icon;
  final String tooltip;
  final VoidCallback? onPressed;
  final Color tint;
  @override
  Widget build(BuildContext context) => Semantics(
    button: true,
    label: tooltip,
    child: Material(
      color: Colors.white,
      shape: const CircleBorder(),
      child: IconButton(
        tooltip: tooltip,
        onPressed: onPressed,
        icon: Icon(icon, color: tint),
        constraints: const BoxConstraints.tightFor(width: 48, height: 48),
      ),
    ),
  );
}

class PaintMeSurface extends StatelessWidget {
  const PaintMeSurface({
    super.key,
    required this.child,
    this.padding,
    this.color = Colors.white,
    this.radius = PaintMeShape.large,
  });
  final Widget child;
  final EdgeInsets? padding;
  final Color color;
  final BorderRadius radius;
  @override
  Widget build(BuildContext context) => Container(
    padding: padding,
    decoration: BoxDecoration(
      color: color,
      borderRadius: radius,
      boxShadow: const [PaintMeShape.softShadow],
    ),
    child: child,
  );
}
