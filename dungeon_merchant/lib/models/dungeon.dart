import 'dart:math';
import 'item.dart';

enum DungeonDifficulty {
  easy(1, 'Easy', 0.7),
  normal(2, 'Normal', 1.0),
  hard(3, 'Hard', 1.5),
  nightmare(4, 'Nightmare', 2.0);

  final int level;
  final String displayName;
  final double rewardMultiplier;
  
  const DungeonDifficulty(this.level, this.displayName, this.rewardMultiplier);
}

class DungeonRoom {
  final String id;
  final String description;
  final bool hasEnemy;
  final bool hasTreasure;
  final bool isExplored;
  final List<Item> loot;

  DungeonRoom({
    required this.id,
    required this.description,
    this.hasEnemy = false,
    this.hasTreasure = false,
    this.isExplored = false,
    List<Item>? loot,
  }) : loot = loot ?? [];

  DungeonRoom copyWith({
    bool? isExplored,
    List<Item>? loot,
  }) {
    return DungeonRoom(
      id: id,
      description: description,
      hasEnemy: hasEnemy,
      hasTreasure: hasTreasure,
      isExplored: isExplored ?? this.isExplored,
      loot: loot ?? this.loot,
    );
  }
}

class Dungeon {
  final String id;
  final String name;
  final DungeonDifficulty difficulty;
  final int floors;
  final List<List<DungeonRoom>> rooms;
  int currentFloor;
  int currentRoomIndex;
  bool isCompleted;

  Dungeon({
    required this.id,
    required this.name,
    required this.difficulty,
    required this.floors,
    required this.rooms,
    this.currentFloor = 0,
    this.currentRoomIndex = 0,
    this.isCompleted = false,
  });

  DungeonRoom get currentRoom => rooms[currentFloor][currentRoomIndex];

  bool moveToNextRoom() {
    if (currentRoomIndex < rooms[currentFloor].length - 1) {
      currentRoomIndex++;
      return true;
    } else if (currentFloor < floors - 1) {
      currentFloor++;
      currentRoomIndex = 0;
      return true;
    } else {
      isCompleted = true;
      return false;
    }
  }

  List<Item> exploreCurrentRoom() {
    final room = rooms[currentFloor][currentRoomIndex];
    if (room.isExplored) return [];

    final loot = <Item>[];
    final random = Random();

    if (room.hasTreasure) {
      final numItems = 1 + random.nextInt(3);
      for (int i = 0; i < numItems; i++) {
        final item = Item.generateRandom();
        loot.add(item);
      }
    }

    rooms[currentFloor][currentRoomIndex] = room.copyWith(
      isExplored: true,
      loot: loot,
    );

    return loot;
  }

  static Dungeon generateRandom(DungeonDifficulty difficulty) {
    final random = Random();
    final dungeonNames = [
      'Crystal Caverns',
      'Shadow Depths',
      'Ancient Ruins',
      'Mystic Forest',
      'Dragon\'s Lair',
      'Forgotten Temple',
    ];

    final name = dungeonNames[random.nextInt(dungeonNames.length)];
    final floors = 3 + difficulty.level;
    final roomsList = <List<DungeonRoom>>[];

    for (int floor = 0; floor < floors; floor++) {
      final roomsPerFloor = 4 + random.nextInt(4);
      final floorRooms = <DungeonRoom>[];

      for (int room = 0; room < roomsPerFloor; room++) {
        floorRooms.add(DungeonRoom(
          id: '${floor}_$room',
          description: _generateRoomDescription(floor, room),
          hasEnemy: random.nextDouble() < (0.4 + difficulty.level * 0.1),
          hasTreasure: random.nextDouble() < (0.3 + difficulty.level * 0.05),
        ));
      }

      roomsList.add(floorRooms);
    }

    return Dungeon(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      name: name,
      difficulty: difficulty,
      floors: floors,
      rooms: roomsList,
    );
  }

  static String _generateRoomDescription(int floor, int room) {
    final descriptions = [
      'A dimly lit chamber with ancient symbols on the walls.',
      'A narrow corridor filled with mysterious echoes.',
      'A spacious hall with crumbling pillars.',
      'A room covered in glowing mushrooms.',
      'An abandoned treasury vault.',
      'A ritual chamber with a mystical aura.',
      'A natural cave with stalactites.',
      'An old armory with rusty weapons.',
    ];

    return descriptions[Random().nextInt(descriptions.length)];
  }

  double get explorationProgress {
    int totalRooms = 0;
    int exploredRooms = 0;

    for (final floor in rooms) {
      totalRooms += floor.length;
      exploredRooms += floor.where((room) => room.isExplored).length;
    }

    return totalRooms > 0 ? exploredRooms / totalRooms : 0;
  }

  int get totalLootFound {
    int total = 0;
    for (final floor in rooms) {
      for (final room in floor) {
        total += room.loot.length;
      }
    }
    return total;
  }
}