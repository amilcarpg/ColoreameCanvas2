import 'package:flutter/material.dart';

abstract final class PaintMeColors {
  static const cream = Color(0xfffff8ec);
  static const creamSoft = Color(0xfffffefb);
  static const ink = Color(0xff17315c);
  static const inkSoft = Color(0xff4d5c79);
  static const coral = Color(0xffff6856);
  static const coralStrong = Color(0xffff4e3c);
  static const sky = Color(0xff59b8ff);
  static const sun = Color(0xffffcb47);
  static const mint = Color(0xff8ad65e);
  static const lilac = Color(0xffb582f5);
  static const pink = Color(0xffff9cbd);
  static const line = Color(0x1a1f4484);
}

abstract final class PaintMeShape {
  static const small = BorderRadius.all(Radius.circular(14));
  static const medium = BorderRadius.all(Radius.circular(20));
  static const large = BorderRadius.all(Radius.circular(26));
  static const extraLarge = BorderRadius.all(Radius.circular(34));
  static const shadow = BoxShadow(
    color: Color(0x1f2b4c7b),
    blurRadius: 22,
    offset: Offset(0, 10),
  );
  static const softShadow = BoxShadow(
    color: Color(0x142b4c7b),
    blurRadius: 14,
    offset: Offset(0, 7),
  );
}

ThemeData paintMeTheme() {
  final scheme = ColorScheme.fromSeed(
    seedColor: PaintMeColors.coral,
    primary: PaintMeColors.coral,
    secondary: PaintMeColors.sky,
    surface: PaintMeColors.creamSoft,
    onPrimary: Colors.white,
    onSurface: PaintMeColors.ink,
  );
  return ThemeData(
    useMaterial3: true,
    colorScheme: scheme,
    scaffoldBackgroundColor: PaintMeColors.cream,
    fontFamily: 'Nunito',
    textTheme: const TextTheme(
      headlineLarge: TextStyle(
        fontFamily: 'Baloo2',
        fontWeight: FontWeight.w800,
        color: PaintMeColors.ink,
      ),
      headlineMedium: TextStyle(
        fontFamily: 'Baloo2',
        fontWeight: FontWeight.w700,
        color: PaintMeColors.ink,
      ),
      titleLarge: TextStyle(
        fontFamily: 'Baloo2',
        fontWeight: FontWeight.w700,
        color: PaintMeColors.ink,
      ),
      titleMedium: TextStyle(
        fontWeight: FontWeight.w800,
        color: PaintMeColors.ink,
      ),
      bodyLarge: TextStyle(
        fontWeight: FontWeight.w600,
        color: PaintMeColors.ink,
      ),
      bodyMedium: TextStyle(
        fontWeight: FontWeight.w600,
        color: PaintMeColors.inkSoft,
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: Colors.white,
      hintStyle: const TextStyle(color: PaintMeColors.inkSoft),
      border: OutlineInputBorder(
        borderRadius: PaintMeShape.medium,
        borderSide: const BorderSide(color: PaintMeColors.line),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: PaintMeShape.medium,
        borderSide: const BorderSide(color: PaintMeColors.line),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: PaintMeShape.medium,
        borderSide: const BorderSide(color: PaintMeColors.sky, width: 2),
      ),
    ),
    dialogTheme: DialogThemeData(
      shape: const RoundedRectangleBorder(borderRadius: PaintMeShape.large),
      backgroundColor: PaintMeColors.creamSoft,
    ),
  );
}
