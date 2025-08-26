import 'dart:math';
import 'item.dart';

enum CustomerMood {
  happy(1.2, 'Happy'),
  neutral(1.0, 'Neutral'),
  angry(0.8, 'Angry');

  final double priceModifier;
  final String displayName;
  
  const CustomerMood(this.priceModifier, this.displayName);
}

class Customer {
  final String id;
  final String name;
  final CustomerMood mood;
  final int budget;
  final List<ItemType> preferences;
  final String avatarPath;

  Customer({
    required this.id,
    required this.name,
    required this.mood,
    required this.budget,
    required this.preferences,
    this.avatarPath = 'assets/images/customers/default.png',
  });

  bool willBuy(Item item, int price) {
    if (price > budget) return false;
    if (!preferences.contains(item.type)) return false;
    
    final maxAcceptablePrice = item.sellPrice * mood.priceModifier;
    return price <= maxAcceptablePrice;
  }

  static Customer generateRandom() {
    final random = Random();
    final moods = CustomerMood.values;
    final mood = moods[random.nextInt(moods.length)];
    
    final names = ['John', 'Sarah', 'Mike', 'Emma', 'Alex', 'Lisa', 'Tom', 'Anna'];
    final name = names[random.nextInt(names.length)];
    
    final numPreferences = 1 + random.nextInt(3);
    final preferences = <ItemType>[];
    final availableTypes = List.from(ItemType.values);
    
    for (int i = 0; i < numPreferences; i++) {
      if (availableTypes.isEmpty) break;
      final index = random.nextInt(availableTypes.length);
      preferences.add(availableTypes[index]);
      availableTypes.removeAt(index);
    }
    
    return Customer(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      name: name,
      mood: mood,
      budget: 50 + random.nextInt(500),
      preferences: preferences,
    );
  }
}

class Shop {
  String name;
  int gold;
  int reputation;
  int level;
  final List<Item> inventory;
  final List<Item> displayItems;
  final List<Transaction> transactionHistory;

  Shop({
    this.name = 'Dungeon Merchant Shop',
    this.gold = 500,
    this.reputation = 50,
    this.level = 1,
    List<Item>? inventory,
    List<Item>? displayItems,
    List<Transaction>? transactionHistory,
  })  : inventory = inventory ?? [],
        displayItems = displayItems ?? [],
        transactionHistory = transactionHistory ?? [];

  void addItem(Item item) {
    final existingIndex = inventory.indexWhere((i) => i.id == item.id);
    if (existingIndex != -1) {
      inventory[existingIndex].quantity += item.quantity;
    } else {
      inventory.add(item);
    }
  }

  bool removeItem(String itemId, int quantity) {
    final index = inventory.indexWhere((i) => i.id == itemId);
    if (index == -1) return false;
    
    if (inventory[index].quantity < quantity) return false;
    
    inventory[index].quantity -= quantity;
    if (inventory[index].quantity == 0) {
      inventory.removeAt(index);
    }
    
    return true;
  }

  void displayItemForSale(Item item) {
    if (!displayItems.any((i) => i.id == item.id)) {
      displayItems.add(item);
    }
  }

  void removeFromDisplay(String itemId) {
    displayItems.removeWhere((i) => i.id == itemId);
  }

  bool sellItem(Item item, Customer customer, int price) {
    if (!customer.willBuy(item, price)) return false;
    
    gold += price;
    removeItem(item.id, 1);
    removeFromDisplay(item.id);
    
    final profit = price - item.buyPrice;
    if (profit > 0) {
      reputation += (profit / 10).round();
    } else if (profit < 0) {
      reputation -= (profit.abs() / 20).round();
    }
    
    reputation = reputation.clamp(0, 100);
    
    transactionHistory.add(Transaction(
      itemId: item.id,
      itemName: item.name,
      price: price,
      customerId: customer.id,
      customerName: customer.name,
      timestamp: DateTime.now(),
      isProfit: profit > 0,
    ));
    
    checkLevelUp();
    
    return true;
  }

  void checkLevelUp() {
    final requiredRep = level * 100;
    if (reputation >= requiredRep) {
      level++;
      reputation = 0;
    }
  }

  int get maxDisplaySlots => 4 + (level * 2);
  
  double get customerAttractRate => 0.3 + (reputation / 200);
  
  double get priceNegotiationBonus => 1.0 + (level * 0.05);
}

class Transaction {
  final String itemId;
  final String itemName;
  final int price;
  final String customerId;
  final String customerName;
  final DateTime timestamp;
  final bool isProfit;

  Transaction({
    required this.itemId,
    required this.itemName,
    required this.price,
    required this.customerId,
    required this.customerName,
    required this.timestamp,
    required this.isProfit,
  });

  Map<String, dynamic> toJson() {
    return {
      'itemId': itemId,
      'itemName': itemName,
      'price': price,
      'customerId': customerId,
      'customerName': customerName,
      'timestamp': timestamp.toIso8601String(),
      'isProfit': isProfit,
    };
  }
}