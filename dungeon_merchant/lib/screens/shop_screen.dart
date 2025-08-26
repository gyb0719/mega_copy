import 'package:flutter/material.dart';
import '../controllers/game_controller.dart';
import '../models/shop.dart';
import '../models/item.dart';

class ShopScreen extends StatefulWidget {
  const ShopScreen({Key? key}) : super(key: key);

  @override
  State<ShopScreen> createState() => _ShopScreenState();
}

class _ShopScreenState extends State<ShopScreen> {
  final GameController _gameController = GameController();
  Item? selectedItem;
  int customPrice = 0;

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<GameState>(
      stream: _gameController.gameStateStream,
      builder: (context, snapshot) {
        if (!snapshot.hasData) {
          return const Center(child: CircularProgressIndicator());
        }

        final state = snapshot.data!;
        final shop = state.shop;

        return Row(
          children: [
            // Left side - Inventory
            Expanded(
              flex: 2,
              child: _buildInventory(shop),
            ),
            
            // Middle - Shop Display
            Expanded(
              flex: 3,
              child: _buildShopDisplay(shop),
            ),
            
            // Right side - Customer area
            Expanded(
              flex: 2,
              child: _buildCustomerArea(),
            ),
          ],
        );
      },
    );
  }

  Widget _buildInventory(Shop shop) {
    return Container(
      margin: const EdgeInsets.all(8),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.brown.shade900.withOpacity(0.8),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.amber.shade700, width: 2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Inventory',
            style: TextStyle(
              color: Colors.amber,
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          Expanded(
            child: GridView.builder(
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 3,
                childAspectRatio: 1,
                crossAxisSpacing: 8,
                mainAxisSpacing: 8,
              ),
              itemCount: shop.inventory.length,
              itemBuilder: (context, index) {
                final item = shop.inventory[index];
                return _buildItemCard(item, () {
                  setState(() {
                    selectedItem = item;
                    customPrice = item.sellPrice;
                  });
                });
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildShopDisplay(Shop shop) {
    return Container(
      margin: const EdgeInsets.all(8),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.brown.shade800.withOpacity(0.9),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.amber.shade600, width: 3),
      ),
      child: Column(
        children: [
          const Text(
            'Shop Display',
            style: TextStyle(
              color: Colors.amber,
              fontSize: 24,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          
          // Display slots
          Expanded(
            child: GridView.builder(
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 4,
                childAspectRatio: 1,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
              ),
              itemCount: shop.maxDisplaySlots,
              itemBuilder: (context, index) {
                if (index < shop.displayItems.length) {
                  final item = shop.displayItems[index];
                  return _buildDisplaySlot(item);
                } else {
                  return _buildEmptySlot();
                }
              },
            ),
          ),
          
          // Selected item controls
          if (selectedItem != null)
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.black.withOpacity(0.5),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Column(
                children: [
                  Text(
                    selectedItem!.name,
                    style: TextStyle(
                      color: _getRarityColor(selectedItem!.rarity),
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text(
                        'Price: ',
                        style: TextStyle(color: Colors.white),
                      ),
                      SizedBox(
                        width: 100,
                        child: TextField(
                          style: const TextStyle(color: Colors.amber),
                          textAlign: TextAlign.center,
                          keyboardType: TextInputType.number,
                          decoration: const InputDecoration(
                            enabledBorder: UnderlineInputBorder(
                              borderSide: BorderSide(color: Colors.amber),
                            ),
                          ),
                          controller: TextEditingController(
                            text: customPrice.toString(),
                          ),
                          onChanged: (value) {
                            customPrice = int.tryParse(value) ?? 0;
                          },
                        ),
                      ),
                      const Text(
                        ' Gold',
                        style: TextStyle(color: Colors.amber),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.amber.shade700,
                    ),
                    onPressed: () {
                      _gameController.addItemToDisplay(selectedItem!);
                      setState(() {
                        selectedItem = null;
                      });
                    },
                    child: const Text('Add to Display'),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildCustomerArea() {
    return StreamBuilder<Customer?>(
      stream: _gameController.customerStream,
      builder: (context, snapshot) {
        final customer = snapshot.data;

        return Container(
          margin: const EdgeInsets.all(8),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.brown.shade900.withOpacity(0.8),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.amber.shade700, width: 2),
          ),
          child: Column(
            children: [
              const Text(
                'Customer',
                style: TextStyle(
                  color: Colors.amber,
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 16),
              
              if (customer != null) ...[
                CircleAvatar(
                  radius: 40,
                  backgroundColor: _getMoodColor(customer.mood),
                  child: Text(
                    customer.name[0],
                    style: const TextStyle(
                      fontSize: 32,
                      color: Colors.white,
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  customer.name,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  'Mood: ${customer.mood.displayName}',
                  style: TextStyle(
                    color: _getMoodColor(customer.mood),
                    fontSize: 14,
                  ),
                ),
                Text(
                  'Budget: ${customer.budget} Gold',
                  style: const TextStyle(
                    color: Colors.amber,
                    fontSize: 14,
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Looking for:',
                  style: TextStyle(
                    color: Colors.white70,
                    fontSize: 12,
                  ),
                ),
                Wrap(
                  spacing: 4,
                  children: customer.preferences.map((type) {
                    return Chip(
                      label: Text(
                        type.displayName,
                        style: const TextStyle(fontSize: 10),
                      ),
                      backgroundColor: Colors.brown.shade700,
                    );
                  }).toList(),
                ),
                const SizedBox(height: 16),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.red.shade700,
                  ),
                  onPressed: () {
                    _gameController.dismissCustomer();
                  },
                  child: const Text('Dismiss'),
                ),
              ] else ...[
                const Expanded(
                  child: Center(
                    child: Text(
                      'Waiting for customer...',
                      style: TextStyle(
                        color: Colors.white54,
                        fontSize: 16,
                      ),
                    ),
                  ),
                ),
              ],
            ],
          ),
        );
      },
    );
  }

  Widget _buildItemCard(Item item, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: selectedItem?.id == item.id
              ? Colors.amber.shade700
              : Colors.brown.shade700,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: _getRarityColor(item.rarity),
            width: 2,
          ),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              _getItemIcon(item.type),
              color: _getRarityColor(item.rarity),
              size: 24,
            ),
            const SizedBox(height: 4),
            Text(
              'x${item.quantity}',
              style: const TextStyle(
                color: Colors.white,
                fontSize: 12,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDisplaySlot(Item item) {
    return StreamBuilder<Customer?>(
      stream: _gameController.customerStream,
      builder: (context, snapshot) {
        final customer = snapshot.data;
        
        return GestureDetector(
          onTap: customer != null
              ? () {
                  final sold = _gameController.attemptSale(item, customPrice);
                  if (sold) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Item sold!'),
                        backgroundColor: Colors.green,
                      ),
                    );
                  } else {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Customer refused!'),
                        backgroundColor: Colors.red,
                      ),
                    );
                  }
                }
              : null,
          child: Container(
            decoration: BoxDecoration(
              gradient: RadialGradient(
                colors: [
                  _getRarityColor(item.rarity).withOpacity(0.3),
                  _getRarityColor(item.rarity).withOpacity(0.1),
                ],
              ),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: _getRarityColor(item.rarity),
                width: 3,
              ),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  _getItemIcon(item.type),
                  color: _getRarityColor(item.rarity),
                  size: 32,
                ),
                const SizedBox(height: 4),
                Text(
                  item.name,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 10,
                  ),
                ),
                Text(
                  '${item.sellPrice}G',
                  style: const TextStyle(
                    color: Colors.amber,
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildEmptySlot() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.brown.shade900.withOpacity(0.5),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: Colors.brown.shade700,
          width: 2,
        ),
      ),
      child: const Center(
        child: Icon(
          Icons.add,
          color: Colors.white24,
          size: 32,
        ),
      ),
    );
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

  Color _getMoodColor(CustomerMood mood) {
    switch (mood) {
      case CustomerMood.happy:
        return Colors.green;
      case CustomerMood.neutral:
        return Colors.blue;
      case CustomerMood.angry:
        return Colors.red;
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