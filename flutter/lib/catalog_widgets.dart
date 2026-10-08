import 'package:flutter/material.dart';
import 'ad_banner.dart';
import 'ad_service.dart';
import 'models.dart';
import 'paintme_theme.dart';

Color catalogCategoryColor(String category) => switch (category) {
  'animales' => PaintMeColors.mint,
  'vehiculos' => PaintMeColors.sky,
  'navidad' => PaintMeColors.coral,
  'fantasia' => PaintMeColors.lilac,
  'dinosaurios' => const Color(0xffa9dc67),
  'princesas' => PaintMeColors.pink,
  _ => PaintMeColors.coral,
};

class CatalogCategoryChip extends StatelessWidget {
  const CatalogCategoryChip({
    super.key,
    required this.label,
    required this.selected,
    required this.color,
    required this.onTap,
  });
  final String label;
  final bool selected;
  final Color color;
  final VoidCallback onTap;
  @override
  Widget build(BuildContext context) => Semantics(
    button: true,
    selected: selected,
    label: label,
    child: Material(
      color: selected ? color : Colors.white,
      borderRadius: PaintMeShape.extraLarge,
      child: InkWell(
        onTap: onTap,
        borderRadius: PaintMeShape.extraLarge,
        child: Container(
          constraints: const BoxConstraints(minHeight: 48),
          alignment: Alignment.center,
          padding: const EdgeInsets.symmetric(horizontal: 18),
          child: Text(
            label,
            style: TextStyle(
              fontWeight: FontWeight.w800,
              color: selected ? PaintMeColors.ink : PaintMeColors.inkSoft,
            ),
          ),
        ),
      ),
    ),
  );
}

class CatalogDrawingCard extends StatelessWidget {
  const CatalogDrawingCard({
    super.key,
    required this.drawing,
    required this.onTap,
    this.favorite = false,
    this.onFavorite,
  });
  final Drawing drawing;
  final VoidCallback onTap;
  final bool favorite;
  final VoidCallback? onFavorite;
  @override
  Widget build(BuildContext context) {
    final color = catalogCategoryColor(drawing.category);
    return Semantics(
      button: true,
      label: 'Colorear ${drawing.label}',
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: PaintMeShape.large,
          child: Ink(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: PaintMeShape.large,
              boxShadow: const [PaintMeShape.softShadow],
            ),
            child: LayoutBuilder(
              builder: (context, constraints) => Column(
                children: [
                  Expanded(
                    child: Stack(
                      children: [
                        Container(
                          margin: const EdgeInsets.fromLTRB(10, 10, 10, 4),
                          decoration: BoxDecoration(
                            color: color.withValues(alpha: .18),
                            borderRadius: PaintMeShape.medium,
                          ),
                          child: Padding(
                            padding: const EdgeInsets.all(10),
                            child: Image.asset(
                              drawing.asset,
                              fit: BoxFit.contain,
                              cacheWidth:
                                  (constraints.maxWidth *
                                          MediaQuery.devicePixelRatioOf(
                                            context,
                                          ))
                                      .round(),
                            ),
                          ),
                        ),
                        if (onFavorite != null)
                          Positioned(
                            top: 6,
                            right: 6,
                            child: IconButton(
                              tooltip: favorite
                                  ? 'Quitar de favoritos'
                                  : 'Añadir a favoritos',
                              onPressed: onFavorite,
                              icon: Icon(
                                favorite
                                    ? Icons.favorite
                                    : Icons.favorite_border,
                              ),
                              color: PaintMeColors.coral,
                            ),
                          ),
                      ],
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.fromLTRB(10, 3, 10, 4),
                    child: Text(
                      drawing.label,
                      maxLines: 2,
                      textAlign: TextAlign.center,
                      overflow: TextOverflow.ellipsis,
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.only(bottom: 10),
                    child: Text(
                      'Colorear',
                      style: TextStyle(
                        fontWeight: FontWeight.w800,
                        color: color,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class CatalogAdArea extends StatelessWidget {
  const CatalogAdArea({super.key, required this.service});
  final AdService service;
  @override
  Widget build(BuildContext context) => Container(
    color: Colors.white.withValues(alpha: .78),
    padding: const EdgeInsets.only(top: 8),
    child: SafeArea(
      top: false,
      child: AnimatedBuilder(
        animation: service,
        builder: (_, _) => service.ready
            ? CatalogAdBanner(service: service)
            : const SizedBox.shrink(),
      ),
    ),
  );
}

class CatalogSuggestions extends StatelessWidget {
  const CatalogSuggestions({
    super.key,
    required this.drawings,
    required this.sessions,
    required this.onOpen,
  });
  final List<Drawing> drawings;
  final List<DrawingSession> sessions;
  final ValueChanged<Drawing> onOpen;

  @override
  Widget build(BuildContext context) {
    final bySlug = {for (final drawing in drawings) drawing.slug: drawing};
    final recent = sessions
        .where((item) => item.status == DrawingStatus.inProgress)
        .firstOrNull;
    final favorite = sessions.where((item) => item.isFavorite).firstOrNull;
    final suggestions = <Drawing>{
      if (recent != null && bySlug[recent.slug] != null) bySlug[recent.slug]!,
      if (favorite != null && bySlug[favorite.slug] != null)
        bySlug[favorite.slug]!,
      drawings.firstWhere(
        (item) =>
            recent == null || item.category != bySlug[recent.slug]?.category,
        orElse: () => drawings.first,
      ),
    }.toList();
    return SizedBox(
      height: 72,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: suggestions.length,
        separatorBuilder: (_, _) => const SizedBox(width: 8),
        itemBuilder: (_, index) {
          final drawing = suggestions[index];
          final isRecent = recent?.slug == drawing.slug;
          return ActionChip(
            avatar: Icon(isRecent ? Icons.play_arrow : Icons.auto_awesome),
            label: Text(
              isRecent ? 'Continúa: ${drawing.label}' : drawing.label,
            ),
            onPressed: () => onOpen(drawing),
          );
        },
      ),
    );
  }
}
