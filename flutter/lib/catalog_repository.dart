import 'package:flutter/services.dart';

import 'models.dart';
import 'catalog_categories.dart';

class CatalogRepository {
  static const categories = catalogCategories;

  Future<List<Drawing>> load() async =>
      decodeDrawings(await rootBundle.loadString('assets/catalog.json'));

  List<Drawing> filter(
    List<Drawing> drawings, {
    String category = '',
    String query = '',
  }) {
    final term = query.trim().toLowerCase();
    return drawings
        .where((drawing) {
          final categoryMatches =
              category.isEmpty || drawing.category == category;
          final text =
              '${drawing.label} ${drawing.slug} ${drawing.category} ${drawing.keywords.join(' ')}'
                  .toLowerCase();
          return categoryMatches && (term.isEmpty || text.contains(term));
        })
        .toList(growable: false);
  }
}
