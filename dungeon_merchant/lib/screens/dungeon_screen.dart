import 'package:flutter/material.dart';
import '../controllers/game_controller.dart';
import '../models/dungeon.dart';
import '../models/item.dart';

class DungeonScreen extends StatefulWidget {
  const DungeonScreen({Key? key}) : super(key: key);

  @override
  State<DungeonScreen> createState() => _DungeonScreenState();
}

class _DungeonScreenState extends State<DungeonScreen>
    with SingleTickerProviderStateMixin {
  final GameController _gameController = GameController();
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  List<Item> currentLoot = [];

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );
    _fadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    ));
    _animationController.forward();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<GameState>(
      stream: _gameController.gameStateStream,
      builder: (context, snapshot) {
        if (!snapshot.hasData || snapshot.data!.currentDungeon == null) {
          return const Center(
            child: Text(
              'No dungeon available',
              style: TextStyle(color: Colors.white),
            ),
          );
        }

        final dungeon = snapshot.data!.currentDungeon!;
        final currentRoom = dungeon.currentRoom;

        return FadeTransition(
          opacity: _fadeAnimation,
          child: Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Colors.indigo.shade900,
                  Colors.black87,
                ],
              ),
            ),
            child: Column(
              children: [
                // Dungeon info header
                _buildDungeonHeader(dungeon),
                
                // Main dungeon area
                Expanded(
                  child: Row(
                    children: [
                      // Map/Progress area
                      Expanded(
                        flex: 1,
                        child: _buildMapArea(dungeon),
                      ),
                      
                      // Current room area
                      Expanded(
                        flex: 2,
                        child: _buildRoomArea(currentRoom, dungeon),
                      ),
                      
                      // Loot area
                      Expanded(
                        flex: 1,
                        child: _buildLootArea(),
                      ),
                    ],
                  ),
                ),
                
                // Action buttons
                _buildActionButtons(dungeon),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildDungeonHeader(Dungeon dungeon) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.black.withOpacity(0.6),
        border: Border(
          bottom: BorderSide(
            color: Colors.purple.shade700,
            width: 2,
          ),
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                dungeon.name,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
              Text(
                'Difficulty: ${dungeon.difficulty.displayName}',
                style: TextStyle(
                  color: _getDifficultyColor(dungeon.difficulty),
                  fontSize: 14,
                ),
              ),
            ],
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                'Floor ${dungeon.currentFloor + 1}/${dungeon.floors}',
                style: const TextStyle(
                  color: Colors.amber,
                  fontSize: 16,
                ),
              ),
              Text(
                'Room ${dungeon.currentRoomIndex + 1}/${dungeon.rooms[dungeon.currentFloor].length}',
                style: const TextStyle(
                  color: Colors.white70,
                  fontSize: 14,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildMapArea(Dungeon dungeon) {
    return Container(
      margin: const EdgeInsets.all(8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.black.withOpacity(0.5),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.purple.shade700, width: 2),
      ),
      child: Column(
        children: [
          const Text(
            'Dungeon Map',
            style: TextStyle(
              color: Colors.purple,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),
          Expanded(
            child: ListView.builder(
              itemCount: dungeon.floors,
              itemBuilder: (context, floorIndex) {
                return Container(
                  margin: const EdgeInsets.symmetric(vertical: 4),
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: floorIndex == dungeon.currentFloor
                        ? Colors.purple.withOpacity(0.3)
                        : Colors.transparent,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Column(
                    children: [
                      Text(
                        'Floor ${floorIndex + 1}',
                        style: TextStyle(
                          color: floorIndex == dungeon.currentFloor
                              ? Colors.amber
                              : Colors.white54,
                          fontSize: 12,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: List.generate(
                          dungeon.rooms[floorIndex].length,
                          (roomIndex) {
                            final room = dungeon.rooms[floorIndex][roomIndex];
                            final isCurrent = floorIndex == dungeon.currentFloor &&
                                roomIndex == dungeon.currentRoomIndex;
                            
                            return Container(
                              width: 16,
                              height: 16,
                              margin: const EdgeInsets.all(2),
                              decoration: BoxDecoration(
                                color: isCurrent
                                    ? Colors.amber
                                    : room.isExplored
                                        ? Colors.green
                                        : Colors.grey,
                                shape: BoxShape.circle,
                                border: room.hasTreasure
                                    ? Border.all(color: Colors.yellow, width: 2)
                                    : null,
                              ),
                            );
                          },
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 8),
          LinearProgressIndicator(
            value: dungeon.explorationProgress,
            backgroundColor: Colors.grey.shade800,
            valueColor: AlwaysStoppedAnimation<Color>(Colors.purple.shade400),
          ),
          const SizedBox(height: 4),
          Text(
            '${(dungeon.explorationProgress * 100).toInt()}% Explored',
            style: const TextStyle(
              color: Colors.white54,
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRoomArea(DungeonRoom room, Dungeon dungeon) {
    return Container(
      margin: const EdgeInsets.all(8),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        image: const DecorationImage(
          image: AssetImage('assets/images/dungeon_bg.png'),
          fit: BoxFit.cover,
          opacity: 0.3,
        ),
        color: Colors.black,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: room.isExplored ? Colors.green : Colors.purple.shade600,
          width: 3,
        ),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            room.isExplored
                ? Icons.check_circle
                : room.hasEnemy
                    ? Icons.warning
                    : Icons.help_outline,
            size: 64,
            color: room.isExplored
                ? Colors.green
                : room.hasEnemy
                    ? Colors.red
                    : Colors.white54,
          ),
          const SizedBox(height: 16),
          Text(
            room.description,
            textAlign: TextAlign.center,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 16,
            ),
          ),
          const SizedBox(height: 24),
          
          if (!room.isExplored) ...[
            if (room.hasEnemy)
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: const [
                  Icon(Icons.dangerous, color: Colors.red, size: 20),
                  SizedBox(width: 8),
                  Text(
                    'Enemy Detected!',
                    style: TextStyle(color: Colors.red, fontSize: 14),
                  ),
                ],
              ),
            
            if (room.hasTreasure)
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: const [
                  Icon(Icons.inventory_2, color: Colors.amber, size: 20),
                  SizedBox(width: 8),
                  Text(
                    'Treasure Nearby!',
                    style: TextStyle(color: Colors.amber, fontSize: 14),
                  ),
                ],
              ),
          ] else ...[
            const Text(
              'Room Explored',
              style: TextStyle(
                color: Colors.green,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            if (room.loot.isNotEmpty)
              Text(
                '${room.loot.length} items found',
                style: const TextStyle(
                  color: Colors.amber,
                  fontSize: 14,
                ),
              ),
          ],
        ],
      ),
    );
  }

  Widget _buildLootArea() {
    return Container(
      margin: const EdgeInsets.all(8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.black.withOpacity(0.5),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.amber.shade700, width: 2),
      ),
      child: Column(
        children: [
          const Text(
            'Found Loot',
            style: TextStyle(
              color: Colors.amber,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),
          Expanded(
            child: currentLoot.isEmpty
                ? const Center(
                    child: Text(
                      'No loot yet',
                      style: TextStyle(
                        color: Colors.white54,
                        fontSize: 14,
                      ),
                    ),
                  )
                : ListView.builder(
                    itemCount: currentLoot.length,
                    itemBuilder: (context, index) {
                      final item = currentLoot[index];
                      return Container(
                        margin: const EdgeInsets.symmetric(vertical: 4),
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: _getRarityColor(item.rarity).withOpacity(0.2),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                            color: _getRarityColor(item.rarity),
                            width: 1,
                          ),
                        ),
                        child: Row(
                          children: [
                            Icon(
                              _getItemIcon(item.type),
                              color: _getRarityColor(item.rarity),
                              size: 20,
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    item.name,
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 12,
                                    ),
                                  ),
                                  Text(
                                    '${item.sellPrice} Gold',
                                    style: const TextStyle(
                                      color: Colors.amber,
                                      fontSize: 10,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
          ),
          const SizedBox(height: 8),
          Text(
            'Total Value: ${currentLoot.fold(0, (sum, item) => sum + item.sellPrice)} Gold',
            style: const TextStyle(
              color: Colors.amber,
              fontSize: 14,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionButtons(Dungeon dungeon) {
    final currentRoom = dungeon.currentRoom;
    
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.black.withOpacity(0.6),
        border: Border(
          top: BorderSide(
            color: Colors.purple.shade700,
            width: 2,
          ),
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.purple.shade700,
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            ),
            icon: const Icon(Icons.search),
            label: const Text('Explore Room'),
            onPressed: !currentRoom.isExplored
                ? () {
                    final loot = _gameController.exploreCurrentRoom();
                    setState(() {
                      currentLoot.addAll(loot);
                    });
                    
                    if (loot.isNotEmpty) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text('Found ${loot.length} items!'),
                          backgroundColor: Colors.green,
                        ),
                      );
                    }
                  }
                : null,
          ),
          
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.blue.shade700,
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            ),
            icon: const Icon(Icons.arrow_forward),
            label: const Text('Next Room'),
            onPressed: currentRoom.isExplored
                ? () {
                    final moved = _gameController.moveToNextRoom();
                    if (!moved) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Dungeon Completed!'),
                          backgroundColor: Colors.green,
                        ),
                      );
                    }
                    _animationController.forward(from: 0);
                  }
                : null,
          ),
          
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red.shade700,
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            ),
            icon: const Icon(Icons.exit_to_app),
            label: const Text('Exit Dungeon'),
            onPressed: () {
              showDialog(
                context: context,
                builder: (context) => AlertDialog(
                  title: const Text('Exit Dungeon?'),
                  content: const Text('Are you sure you want to leave the dungeon?'),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.pop(context),
                      child: const Text('Cancel'),
                    ),
                    TextButton(
                      onPressed: () {
                        Navigator.pop(context);
                        _gameController.exitDungeon();
                      },
                      child: const Text('Exit'),
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  Color _getDifficultyColor(DungeonDifficulty difficulty) {
    switch (difficulty) {
      case DungeonDifficulty.easy:
        return Colors.green;
      case DungeonDifficulty.normal:
        return Colors.blue;
      case DungeonDifficulty.hard:
        return Colors.orange;
      case DungeonDifficulty.nightmare:
        return Colors.red;
    }
  }

  Color _getRarityColor(ItemRarity rarity) {
    switch (rarity) {
      case ItemRarity.common:
        return Colors.grey;
      case ItemRarity.uncommon:
        return Colors.green;
      case ItemRarity.rare:
        return Colors.blue;
      case ItemRarity.epic:
        return Colors.purple;
      case ItemRarity.legendary:
        return Colors.orange;
    }
  }

  IconData _getItemIcon(ItemType type) {
    switch (type) {
      case ItemType.weapon:
        return Icons.flash_on;
      case ItemType.armor:
        return Icons.shield;
      case ItemType.potion:
        return Icons.local_drink;
      case ItemType.material:
        return Icons.category;
      case ItemType.accessory:
        return Icons.star;
    }
  }
}