import 'dart:convert';
import 'dart:typed_data';

enum ToolMode { bucket, brush, eraser }

class Drawing {
  const Drawing({
    required this.label,
    required this.slug,
    required this.category,
    required this.pack,
    required this.asset,
    required this.keywords,
    required this.featured,
  });

  final String label;
  final String slug;
  final String category;
  final String pack;
  final String asset;
  final List<String> keywords;
  final bool featured;

  factory Drawing.fromJson(Map<String, dynamic> json) => Drawing(
    label: json['label'] as String,
    slug: json['slug'] as String,
    category: json['category'] as String,
    pack: json['pack'] as String,
    asset: json['asset'] as String,
    keywords: List<String>.from(json['keywords'] as List<dynamic>),
    featured: json['featured'] as bool? ?? false,
  );
}

class Category {
  const Category(this.slug, this.label);
  final String slug;
  final String label;
}

enum DrawingStatus { inProgress, completed }

class DrawingSession {
  const DrawingSession({
    required this.slug,
    required this.updatedAt,
    required this.colorPng,
    this.status = DrawingStatus.inProgress,
    this.isFavorite = false,
  });
  final String slug;
  final DateTime updatedAt;
  final Uint8List colorPng;
  final DrawingStatus status;
  final bool isFavorite;

  DrawingSession copyWith({
    Uint8List? colorPng,
    DateTime? updatedAt,
    DrawingStatus? status,
    bool? isFavorite,
  }) => DrawingSession(
    slug: slug,
    colorPng: colorPng ?? this.colorPng,
    updatedAt: updatedAt ?? this.updatedAt,
    status: status ?? this.status,
    isFavorite: isFavorite ?? this.isFavorite,
  );
}

List<Drawing> decodeDrawings(String source) =>
    (jsonDecode(source) as List<dynamic>)
        .cast<Map<String, dynamic>>()
        .map(Drawing.fromJson)
        .toList(growable: false);
