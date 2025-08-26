import 'package:flutter/material.dart';
import '../controllers/game_controller.dart';
import 'shop_screen.dart';
import 'dungeon_screen.dart';

class MainGameScreen extends StatefulWidget {
  const MainGameScreen({super.key});

  @override
  State<MainGameScreen> createState() => _MainGameScreenState();
}

class _MainGameScreenState extends State<MainGameScreen> {
  final GameController _gameController = GameController();

  @override
  void initState() {
    super.initState();
    _gameController.initializeGame();
  }

  @override
  void dispose() {
    _gameController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF2C1810),
      body: StreamBuilder<GamePhase>(
        stream: _gameController.phaseStream,
        initialData: GamePhase.shop,
        builder: (context, phaseSnapshot) {
          final phase = phaseSnapshot.data!;

          return Stack(
            children: [
              // Background gradient
              Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: phase == GamePhase.shop
                        ? [const Color(0xFF3E2723), const Color(0xFF1A0E0A)]
                        : [const Color(0xFF1A237E), const Color(0xFF0D47A1)],
                  ),
                ),
              ),
              
              // Game UI
              Column(
                children: [
                  // Header with stats
                  _buildHeader(),
                  
                  // Main game area
                  Expanded(
                    child: _buildGameArea(phase),
                  ),
                ],
              ),
              
              // Phase transition overlay
              if (phase == GamePhase.transition)
                Container(
                  color: Colors.black54,
                  child: const Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        CircularProgressIndicator(
                          valueColor: AlwaysStoppedAnimation<Color>(Colors.amber),
                        ),
                        SizedBox(height: 20),
                        Text(
                          'Night is falling...\nTime to explore the dungeons!',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildHeader() {
    return StreamBuilder<GameState>(
      stream: _gameController.gameStateStream,
      builder: (context, snapshot) {
        if (!snapshot.hasData) {
          return const SizedBox(height: 100);
        }

        final state = snapshot.data!;
        
        return Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.black.withOpacity(0.7),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.5),
                blurRadius: 10,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: SafeArea(
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildStatCard(
                  Icons.calendar_today,
                  'Day ${state.currentDay}',
                  Colors.blue,
                ),
                _buildStatCard(
                  Icons.monetization_on,
                  '${state.shop.gold} Gold',
                  Colors.amber,
                ),
                _buildStatCard(
                  Icons.star,
                  'Lvl ${state.shop.level}',
                  Colors.purple,
                ),
                _buildStatCard(
                  Icons.favorite,
                  '${state.shop.reputation}/100',
                  Colors.red,
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildStatCard(IconData icon, String text, Color color) {
    return Row(
      children: [
        Icon(icon, color: color, size: 20),
        const SizedBox(width: 4),
        Text(
          text,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 14,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }

  Widget _buildGameArea(GamePhase phase) {
    switch (phase) {
      case GamePhase.shop:
        return const ShopScreen();
      case GamePhase.dungeon:
        return const DungeonScreen();
      case GamePhase.transition:
        return const SizedBox();
    }
  }
}