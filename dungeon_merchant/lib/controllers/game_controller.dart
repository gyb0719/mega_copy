import 'dart:async';
import 'dart:math';
import '../models/item.dart';
import '../models/shop.dart';
import '../models/dungeon.dart';

enum GamePhase {
  shop,
  dungeon,
  transition,
}

class GameController {
  static final GameController _instance = GameController._internal();
  factory GameController() => _instance;
  GameController._internal();

  // Game State
  GamePhase currentPhase = GamePhase.shop;
  Shop shop = Shop();
  Dungeon? currentDungeon;
  Customer? currentCustomer;
  
  // Timers
  Timer? customerSpawnTimer;
  Timer? dayNightCycleTimer;
  
  // Game Statistics
  int currentDay = 1;
  int totalEarnings = 0;
  int totalCustomersServed = 0;
  int dungeonsCompleted = 0;
  
  // Streams
  final _gameStateController = StreamController<GameState>.broadcast();
  final _customerController = StreamController<Customer?>.broadcast();
  final _phaseController = StreamController<GamePhase>.broadcast();
  
  Stream<GameState> get gameStateStream => _gameStateController.stream;
  Stream<Customer?> get customerStream => _customerController.stream;
  Stream<GamePhase> get phaseStream => _phaseController.stream;

  void initializeGame() {
    shop = Shop(
      name: 'The Merchant\'s Haven',
      gold: 500,
      reputation: 50,
      level: 1,
    );
    
    // Add starting items
    for (int i = 0; i < 5; i++) {
      shop.addItem(Item.generateRandom());
    }
    
    // Start game loops
    startShopPhase();
    _updateGameState();
  }

  void startShopPhase() {
    currentPhase = GamePhase.shop;
    _phaseController.add(currentPhase);
    
    // Start spawning customers
    customerSpawnTimer?.cancel();
    customerSpawnTimer = Timer.periodic(
      Duration(seconds: (5 / shop.customerAttractRate).round()),
      (_) => spawnCustomer(),
    );
    
    // Day/Night cycle timer (3 minutes per day)
    dayNightCycleTimer?.cancel();
    dayNightCycleTimer = Timer(const Duration(minutes: 3), () {
      transitionToDungeonPhase();
    });
  }

  void spawnCustomer() {
    if (currentPhase != GamePhase.shop || currentCustomer != null) return;
    
    currentCustomer = Customer.generateRandom();
    _customerController.add(currentCustomer);
  }

  bool attemptSale(Item item, int price) {
    if (currentCustomer == null) return false;
    
    final success = shop.sellItem(item, currentCustomer!, price);
    
    if (success) {
      totalEarnings += price;
      totalCustomersServed++;
      currentCustomer = null;
      _customerController.add(null);
      _updateGameState();
    }
    
    return success;
  }

  void dismissCustomer() {
    currentCustomer = null;
    _customerController.add(null);
  }

  void transitionToDungeonPhase() {
    currentPhase = GamePhase.transition;
    _phaseController.add(currentPhase);
    
    customerSpawnTimer?.cancel();
    dayNightCycleTimer?.cancel();
    
    Timer(const Duration(seconds: 2), () {
      startDungeonPhase();
    });
  }

  void startDungeonPhase() {
    currentPhase = GamePhase.dungeon;
    _phaseController.add(currentPhase);
    
    // Generate a random dungeon
    final difficulties = DungeonDifficulty.values;
    final maxDifficulty = (shop.level - 1).clamp(0, difficulties.length - 1);
    final difficulty = difficulties[Random().nextInt(maxDifficulty + 1)];
    
    currentDungeon = Dungeon.generateRandom(difficulty);
    _updateGameState();
  }

  List<Item> exploreCurrentRoom() {
    if (currentDungeon == null || currentPhase != GamePhase.dungeon) {
      return [];
    }
    
    final loot = currentDungeon!.exploreCurrentRoom();
    
    for (final item in loot) {
      shop.addItem(item);
    }
    
    _updateGameState();
    return loot;
  }

  bool moveToNextRoom() {
    if (currentDungeon == null) return false;
    
    final moved = currentDungeon!.moveToNextRoom();
    
    if (currentDungeon!.isCompleted) {
      completeDungeon();
    }
    
    _updateGameState();
    return moved;
  }

  void completeDungeon() {
    if (currentDungeon == null) return;
    
    dungeonsCompleted++;
    currentDay++;
    
    // Give bonus rewards
    final bonusGold = 100 * currentDungeon!.difficulty.level;
    shop.gold += bonusGold;
    totalEarnings += bonusGold;
    
    currentDungeon = null;
    
    Timer(const Duration(seconds: 2), () {
      startShopPhase();
    });
  }

  void exitDungeon() {
    currentDay++;
    currentDungeon = null;
    startShopPhase();
  }

  void setItemPrice(Item item, int price) {
    final index = shop.displayItems.indexWhere((i) => i.id == item.id);
    if (index != -1) {
      // Store custom price logic here if needed
      _updateGameState();
    }
  }

  void addItemToDisplay(Item item) {
    if (shop.displayItems.length < shop.maxDisplaySlots) {
      shop.displayItemForSale(item);
      _updateGameState();
    }
  }

  void removeItemFromDisplay(String itemId) {
    shop.removeFromDisplay(itemId);
    _updateGameState();
  }

  void _updateGameState() {
    _gameStateController.add(GameState(
      shop: shop,
      currentDungeon: currentDungeon,
      currentDay: currentDay,
      totalEarnings: totalEarnings,
      totalCustomersServed: totalCustomersServed,
      dungeonsCompleted: dungeonsCompleted,
    ));
  }

  void dispose() {
    customerSpawnTimer?.cancel();
    dayNightCycleTimer?.cancel();
    _gameStateController.close();
    _customerController.close();
    _phaseController.close();
  }
}

class GameState {
  final Shop shop;
  final Dungeon? currentDungeon;
  final int currentDay;
  final int totalEarnings;
  final int totalCustomersServed;
  final int dungeonsCompleted;

  GameState({
    required this.shop,
    this.currentDungeon,
    required this.currentDay,
    required this.totalEarnings,
    required this.totalCustomersServed,
    required this.dungeonsCompleted,
  });
}