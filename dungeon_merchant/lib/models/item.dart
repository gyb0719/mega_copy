import 'dart:math';

enum ItemRarity {
  common(1.0, 'Common'),
  uncommon(1.5, 'Uncommon'),
  rare(2.0, 'Rare'),
  epic(3.0, 'Epic'),
  legendary(5.0, 'Legendary');

  final double priceMultiplier;
  final String displayName;
  
  const ItemRarity(this.priceMultiplier, this.displayName);
}

enum ItemType {
  weapon('Weapon'),
  armor('Armor'),
  potion('Potion'),
  material('Material'),
  accessory('Accessory');

  final String displayName;
  const ItemType(this.displayName);
}

class Item {
  final String id;
  final String name;
  final String description;
  final ItemType type;
  final ItemRarity rarity;
  final int basePrice;
  final String iconPath;
  final Map<String, dynamic> stats;
  int quantity;

  Item({
    required this.id,
    required this.name,
    required this.description,
    required this.type,
    required this.rarity,
    required this.basePrice,
    this.iconPath = 'assets/images/items/default.png',
    this.stats = const {},
    this.quantity = 1,
  });

  int get sellPrice => (basePrice * rarity.priceMultiplier).round();
  int get buyPrice => (sellPrice * 0.6).round();

  Item copyWith({
    String? id,
    String? name,
    String? description,
    ItemType? type,
    ItemRarity? rarity,
    int? basePrice,
    String? iconPath,
    Map<String, dynamic>? stats,
    int? quantity,
  }) {
    return Item(
      id: id ?? this.id,
      name: name ?? this.name,
      description: description ?? this.description,
      type: type ?? this.type,
      rarity: rarity ?? this.rarity,
      basePrice: basePrice ?? this.basePrice,
      iconPath: iconPath ?? this.iconPath,
      stats: stats ?? this.stats,
      quantity: quantity ?? this.quantity,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'type': type.name,
      'rarity': rarity.name,
      'basePrice': basePrice,
      'iconPath': iconPath,
      'stats': stats,
      'quantity': quantity,
    };
  }

  factory Item.fromJson(Map<String, dynamic> json) {
    return Item(
      id: json['id'],
      name: json['name'],
      description: json['description'],
      type: ItemType.values.firstWhere((e) => e.name == json['type']),
      rarity: ItemRarity.values.firstWhere((e) => e.name == json['rarity']),
      basePrice: json['basePrice'],
      iconPath: json['iconPath'] ?? 'assets/images/items/default.png',
      stats: json['stats'] ?? {},
      quantity: json['quantity'] ?? 1,
    );
  }

  static Item generateRandom() {
    final random = Random();
    final type = ItemType.values[random.nextInt(ItemType.values.length)];
    final rarity = _getRandomRarity(random);
    
    return Item(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      name: _generateItemName(type, rarity),
      description: _generateDescription(type, rarity),
      type: type,
      rarity: rarity,
      basePrice: _calculateBasePrice(type, rarity, random),
      stats: _generateStats(type, rarity, random),
    );
  }

  static ItemRarity _getRandomRarity(Random random) {
    final roll = random.nextDouble();
    if (roll < 0.5) return ItemRarity.common;
    if (roll < 0.75) return ItemRarity.uncommon;
    if (roll < 0.9) return ItemRarity.rare;
    if (roll < 0.98) return ItemRarity.epic;
    return ItemRarity.legendary;
  }

  static String _generateItemName(ItemType type, ItemRarity rarity) {
    final prefixes = {
      ItemRarity.common: ['Basic', 'Simple', 'Old'],
      ItemRarity.uncommon: ['Sturdy', 'Fine', 'Quality'],
      ItemRarity.rare: ['Superior', 'Excellent', 'Master'],
      ItemRarity.epic: ['Ancient', 'Mystic', 'Heroic'],
      ItemRarity.legendary: ['Divine', 'Mythical', 'Eternal'],
    };

    final typeNames = {
      ItemType.weapon: ['Sword', 'Axe', 'Bow', 'Staff', 'Dagger'],
      ItemType.armor: ['Helm', 'Chest', 'Boots', 'Gloves', 'Shield'],
      ItemType.potion: ['Health Potion', 'Mana Potion', 'Elixir', 'Tonic'],
      ItemType.material: ['Ore', 'Crystal', 'Essence', 'Shard', 'Dust'],
      ItemType.accessory: ['Ring', 'Amulet', 'Bracelet', 'Charm', 'Rune'],
    };

    final prefix = prefixes[rarity]![Random().nextInt(prefixes[rarity]!.length)];
    final typeName = typeNames[type]![Random().nextInt(typeNames[type]!.length)];
    
    return '$prefix $typeName';
  }

  static String _generateDescription(ItemType type, ItemRarity rarity) {
    return 'A ${rarity.displayName.toLowerCase()} ${type.displayName.toLowerCase()} with mysterious properties.';
  }

  static int _calculateBasePrice(ItemType type, ItemRarity rarity, Random random) {
    final baseRange = {
      ItemType.weapon: [50, 200],
      ItemType.armor: [40, 180],
      ItemType.potion: [10, 50],
      ItemType.material: [5, 30],
      ItemType.accessory: [30, 150],
    };

    final range = baseRange[type]!;
    return range[0] + random.nextInt(range[1] - range[0]);
  }

  static Map<String, dynamic> _generateStats(ItemType type, ItemRarity rarity, Random random) {
    final stats = <String, dynamic>{};
    
    if (type == ItemType.weapon) {
      stats['damage'] = 10 + random.nextInt(20 * (rarity.index + 1));
      stats['critChance'] = 5 + random.nextInt(5 * (rarity.index + 1));
    } else if (type == ItemType.armor) {
      stats['defense'] = 5 + random.nextInt(15 * (rarity.index + 1));
      stats['health'] = 20 + random.nextInt(50 * (rarity.index + 1));
    } else if (type == ItemType.potion) {
      stats['healing'] = 20 + random.nextInt(30 * (rarity.index + 1));
      stats['duration'] = 5 + random.nextInt(10);
    } else if (type == ItemType.accessory) {
      stats['bonus'] = 2 + random.nextInt(5 * (rarity.index + 1));
    }
    
    return stats;
  }
}