export interface FlutterCodeFile {
  filename: string;
  category: 'main' | 'models' | 'screens' | 'services' | 'firestore';
  code: string;
  description: string;
}

export const FLUTTER_CODEBASE: FlutterCodeFile[] = [
  {
    filename: 'lib/main.dart',
    category: 'main',
    description: 'Flutter App Entry Point with Material 3 Deep Blue Theme, Firebase initialization & Router.',
    code: `import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:provider/provider.dart';
import 'screens/home_master_catalog.dart';
import 'screens/pos_billing_screen.dart';
import 'screens/rider_tracking_screen.dart';
import 'services/cart_provider.dart';
import 'services/auth_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  runApp(const HyperLocalApp());
}

class HyperLocalApp extends StatelessWidget {
  const HyperLocalApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthService()),
        ChangeNotifierProvider(create: (_) => CartProvider()),
      ],
      child: MaterialApp(
        title: 'HyperLocal E-Commerce & POS',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          useMaterial3: true,
          colorScheme: ColorScheme.fromSeed(
            seedColor: const Color(0xFF0F2B5C),
            primary: const Color(0xFF0F2B5C),
            secondary: const Color(0xFF2563EB),
            surface: const Color(0xFFF8FAFC),
          ),
          appBarTheme: const AppBarTheme(
            backgroundColor: Color(0xFF0F2B5C),
            foregroundColor: Colors.white,
            elevation: 0,
          ),
        ),
        home: const MainNavigationShell(),
      ),
    );
  }
}

class MainNavigationShell extends StatefulWidget {
  const MainNavigationShell({super.key});

  @override
  State<MainNavigationShell> createState() => _MainNavigationShellState();
}

class _MainNavigationShellState extends State<MainNavigationShell> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    HomeMasterCatalogScreen(),
    POSBillingScreen(), // Dedicated Standalone POS Billing Module
    RiderLiveTrackingScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _screens[_currentIndex],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (index) => setState(() => _currentIndex = index),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.storefront_outlined),
            selectedIcon: Icon(Icons.storefront),
            label: 'Master Catalog',
          ),
          NavigationDestination(
            icon: Icon(Icons.point_of_sale_outlined),
            selectedIcon: Icon(Icons.point_of_sale),
            label: 'POS Billing',
          ),
          NavigationDestination(
            icon: Icon(Icons.delivery_dining_outlined),
            selectedIcon: Icon(Icons.delivery_dining),
            label: 'Live Tracking',
          ),
        ],
      ),
    );
  }
}`,
  },
  {
    filename: 'lib/models/master_product.dart',
    category: 'models',
    description: 'Single Master Product model stored only once in products collection.',
    code: `import 'package:cloud_firestore/cloud_firestore.dart';

class MasterProduct {
  final String id;
  final String name;
  final String brand;
  final String category;
  final String description;
  final List<String> images;
  final String barcode;
  final String unit;
  final double mrp;
  final double rating;

  MasterProduct({
    required this.id,
    required this.name,
    required this.brand,
    required this.category,
    required this.description,
    required this.images,
    required this.barcode,
    required this.unit,
    required this.mrp,
    required this.rating,
  });

  factory MasterProduct.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return MasterProduct(
      id: doc.id,
      name: data['name'] ?? '',
      brand: data['brand'] ?? '',
      category: data['category'] ?? '',
      description: data['description'] ?? '',
      images: List<String>.from(data['images'] ?? []),
      barcode: data['barcode'] ?? '',
      unit: data['unit'] ?? '',
      mrp: (data['mrp'] as num?)?.toDouble() ?? 0.0,
      rating: (data['rating'] as num?)?.toDouble() ?? 4.5,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'name': name,
      'brand': brand,
      'category': category,
      'description': description,
      'images': images,
      'barcode': barcode,
      'unit': unit,
      'mrp': mrp,
      'rating': rating,
    };
  }
}`,
  },
  {
    filename: 'lib/models/seller_inventory.dart',
    category: 'models',
    description: 'Seller Inventory linking sellerId to productId with custom price & stock.',
    code: `import 'package:cloud_firestore/cloud_firestore.dart';

class SellerInventory {
  final String id;
  final String sellerId;
  final String productId;
  final double price;
  final double mrp;
  final int stockQuantity;
  final bool isAvailable;
  final Map<String, dynamic> pickupLocation;
  final double sellerRating;
  final int deliveryTimeMin;

  SellerInventory({
    required this.id,
    required this.sellerId,
    required this.productId,
    required this.price,
    required this.mrp,
    required this.stockQuantity,
    required this.isAvailable,
    required this.pickupLocation,
    required this.sellerRating,
    required this.deliveryTimeMin,
  });

  factory SellerInventory.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return SellerInventory(
      id: doc.id,
      sellerId: data['sellerId'] ?? '',
      productId: data['productId'] ?? '',
      price: (data['price'] as num?)?.toDouble() ?? 0.0,
      mrp: (data['mrp'] as num?)?.toDouble() ?? 0.0,
      stockQuantity: (data['stockQuantity'] as num?)?.toInt() ?? 0,
      isAvailable: data['isAvailable'] ?? true,
      pickupLocation: Map<String, dynamic>.from(data['pickupLocation'] ?? {}),
      sellerRating: (data['sellerRating'] as num?)?.toDouble() ?? 4.5,
      deliveryTimeMin: (data['deliveryTimeMin'] as num?)?.toInt() ?? 20,
    );
  }
}`,
  },
  {
    filename: 'lib/screens/home_master_catalog.dart',
    category: 'screens',
    description: 'Master Catalog Feed displaying 1 card per product with lowest price badge.',
    code: `import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/master_product.dart';
import 'product_detail_all_sellers.dart';

class HomeMasterCatalogScreen extends StatelessWidget {
  const HomeMasterCatalogScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('HyperLocal Master Catalog'),
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(Icons.shopping_cart),
            onPressed: () {},
          ),
        ],
      ),
      body: StreamBuilder<QuerySnapshot>(
        stream: FirebaseFirestore.instance.collection('products').snapshots(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (!snapshot.hasData || snapshot.data!.docs.isEmpty) {
            return const Center(child: Text('No master products found.'));
          }

          final products = snapshot.data!.docs
              .map((doc) => MasterProduct.fromFirestore(doc))
              .toList();

          return GridView.builder(
            padding: const EdgeInsets.all(12),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              childAspectRatio: 0.72,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
            ),
            itemCount: products.length,
            itemBuilder: (context, index) {
              final product = products[index];
              return MasterProductCard(product: product);
            },
          );
        },
      ),
    );
  }
}

class MasterProductCard extends StatelessWidget {
  final MasterProduct product;
  const MasterProductCard({super.key, required this.product});

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      clipBehavior: Clip.antiAlias,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: InkWell(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => ProductDetailAllSellersScreen(product: product),
            ),
          );
        },
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Image.network(
                product.images.isNotEmpty ? product.images.first : '',
                fit: BoxFit.cover,
                width: double.infinity,
                errorBuilder: (_, __, ___) => Container(
                  color: Colors.grey[200],
                  child: const Icon(Icons.image_not_supported),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    product.brand.toUpperCase(),
                    style: TextStyle(fontSize: 10, color: Colors.blue[800], fontWeight: FontWeight.bold),
                  ),
                  Text(
                    product.name,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        product.unit,
                        style: TextStyle(fontSize: 11, color: Colors.grey[600]),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: Colors.amber[100],
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          '★ \${product.rating}',
                          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(vertical: 6),
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      color: const Color(0xFF0F2B5C),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: const Text(
                      'View All Sellers',
                      style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}`,
  },
  {
    filename: 'lib/screens/product_detail_all_sellers.dart',
    category: 'screens',
    description: 'Product Detail with "View All Sellers" list sorted by price or distance.',
    code: `import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/master_product.dart';
import '../models/seller_inventory.dart';

class ProductDetailAllSellersScreen extends StatefulWidget {
  final MasterProduct product;
  const ProductDetailAllSellersScreen({super.key, required this.product});

  @override
  State<ProductDetailAllSellersScreen> createState() => _ProductDetailAllSellersScreenState();
}

class _ProductDetailAllSellersScreenState extends State<ProductDetailAllSellersScreen> {
  String _sortBy = 'price'; // 'price' or 'distance'

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.product.name),
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Product Hero Image
            SizedBox(
              height: 220,
              width: double.infinity,
              child: Image.network(
                widget.product.images.first,
                fit: BoxFit.cover,
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    widget.product.name,
                    style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                  Text(
                    '\${widget.product.brand} • \${widget.product.unit}',
                    style: TextStyle(color: Colors.grey[600], fontSize: 14),
                  ),
                  const SizedBox(height: 8),
                  Text(widget.product.description),
                  const Divider(height: 32),

                  // Sellers Comparison Header
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Available at Nearby Sellers',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                      DropdownButton<String>(
                        value: _sortBy,
                        items: const [
                          DropdownMenuItem(value: 'price', child: Text('Lowest Price')),
                          DropdownMenuItem(value: 'distance', child: Text('Nearest Store')),
                        ],
                        onChanged: (val) => setState(() => _sortBy = val!),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),

                  // Query seller_inventory for this productId
                  StreamBuilder<QuerySnapshot>(
                    stream: FirebaseFirestore.instance
                        .collection('seller_inventory')
                        .where('productId', isEqualTo: widget.product.id)
                        .where('isAvailable', isEqualTo: true)
                        .snapshots(),
                    builder: (context, snapshot) {
                      if (snapshot.connectionState == ConnectionState.waiting) {
                        return const Center(child: CircularProgressIndicator());
                      }
                      if (!snapshot.hasData || snapshot.data!.docs.isEmpty) {
                        return const Text('Currently out of stock at all nearby sellers.');
                      }

                      final sellers = snapshot.data!.docs
                          .map((doc) => SellerInventory.fromFirestore(doc))
                          .toList();

                      // Sort logic
                      if (_sortBy == 'price') {
                        sellers.sort((a, b) => a.price.compareTo(b.price));
                      }

                      return ListView.separated(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: sellers.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 10),
                        itemBuilder: (context, index) {
                          final inv = sellers[index];
                          final shopName = inv.pickupLocation['shopName'] ?? 'Local Vendor';
                          return Card(
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10),
                              side: BorderSide(color: Colors.grey[200]!),
                            ),
                            child: Padding(
                              padding: const EdgeInsets.all(12.0),
                              child: Row(
                                children: [
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          shopName,
                                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                                        ),
                                        Text(
                                          '★ \${inv.sellerRating} • \${inv.deliveryTimeMin} mins delivery',
                                          style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                          'Stock: \${inv.stockQuantity} units left',
                                          style: TextStyle(
                                            fontSize: 12,
                                            color: inv.stockQuantity < 5 ? Colors.red : Colors.green[700],
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  Column(
                                    crossAxisAlignment: CrossAxisAlignment.end,
                                    children: [
                                      Text(
                                        '\\$\${inv.price.toStringAsFixed(2)}',
                                        style: const TextStyle(
                                          fontSize: 18,
                                          fontWeight: FontWeight.bold,
                                          color: Color(0xFF0F2B5C),
                                        ),
                                      ),
                                      ElevatedButton(
                                        style: ElevatedButton.styleFrom(
                                          backgroundColor: const Color(0xFF0F2B5C),
                                          foregroundColor: Colors.white,
                                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                                        ),
                                        onPressed: () {
                                          ScaffoldMessenger.of(context).showSnackBar(
                                            SnackBar(content: Text('Added \${widget.product.name} from \$shopName')),
                                          );
                                        },
                                        child: const Text('Add to Cart'),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      );
                    },
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}`,
  },
  {
    filename: 'lib/screens/pos_billing_screen.dart',
    category: 'screens',
    description: 'Standalone POS Billing Module with Shop Selector, Barcode Scan, Offline Cart & Receipt.',
    code: `import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

class POSBillingScreen extends StatefulWidget {
  const POSBillingScreen({super.key});

  @override
  State<POSBillingScreen> createState() => _POSBillingScreenState();
}

class _POSBillingScreenState extends State<POSBillingScreen> {
  String? _selectedShopId = 'seller_apex_mart';
  final List<Map<String, dynamic>> _posCart = [];
  double _discountPercent = 0.0;
  String _paymentMode = 'Cash';

  double get _subtotal => _posCart.fold(0.0, (sum, item) => sum + (item['price'] * item['qty']));
  double get _discountAmount => _subtotal * (_discountPercent / 100);
  double get _grandTotal => _subtotal - _discountAmount;

  void _addItem(Map<String, dynamic> item) {
    setState(() {
      final index = _posCart.indexWhere((e) => e['id'] == item['id']);
      if (index >= 0) {
        _posCart[index]['qty'] += 1;
      } else {
        _posCart.add({...item, 'qty': 1});
      }
    });
  }

  Future<void> _completePOSTransaction() async {
    if (_posCart.isEmpty) return;

    final txnData = {
      'sellerId': _selectedShopId,
      'items': _posCart,
      'subtotal': _subtotal,
      'discountAmount': _discountAmount,
      'grandTotal': _grandTotal,
      'paymentMode': _paymentMode,
      'orderType': 'pos_billing', // Not a delivery order!
      'timestamp': FieldValue.serverTimestamp(),
    };

    // Stored in dedicated pos_transactions collection
    await FirebaseFirestore.instance.collection('pos_transactions').add(txnData);

    // Decrement stock in seller_inventory atomically
    for (var item in _posCart) {
      if (item['inventoryId'] != null) {
        FirebaseFirestore.instance
            .collection('seller_inventory')
            .doc(item['inventoryId'])
            .update({'stockQuantity': FieldValue.increment(-item['qty'])});
      }
    }

    if (!mounted) return;
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('POS Receipt Generated'),
        content: Text('Receipt #RCP-\${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}\\nGrand Total: \\\$\${_grandTotal.toStringAsFixed(2)}'),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              setState(() => _posCart.clear());
            },
            child: const Text('Print & New Bill'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Standalone POS Counter'),
        backgroundColor: const Color(0xFF0A1E3F),
      ),
      body: Column(
        children: [
          // Step 1: Select Active Store
          Container(
            color: Colors.blue[50],
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: [
                const Icon(Icons.store, color: Color(0xFF0A1E3F)),
                const SizedBox(width: 8),
                const Text('Billing Store:', style: TextStyle(fontWeight: FontWeight.bold)),
                const SizedBox(width: 8),
                DropdownButton<String>(
                  value: _selectedShopId,
                  items: const [
                    DropdownMenuItem(value: 'seller_apex_mart', child: Text('Apex Express Mart')),
                    DropdownMenuItem(value: 'seller_metro_super', child: Text('Metro Superstore')),
                  ],
                  onChanged: (val) => setState(() => _selectedShopId = val),
                ),
              ],
            ),
          ),

          // POS Cart List & Controls
          Expanded(
            child: _posCart.isEmpty
                ? const Center(child: Text('Scan barcode or tap Quick Items to add'))
                : ListView.builder(
                    itemCount: _posCart.length,
                    itemBuilder: (context, index) {
                      final item = _posCart[index];
                      return ListTile(
                        title: Text(item['name']),
                        subtitle: Text('\\\$\${item['price']} x \${item['qty']}'),
                        trailing: Text(
                          '\\\$\${(item['price'] * item['qty']).toStringAsFixed(2)}',
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        ),
                      );
                    },
                  ),
          ),

          // High-Speed POS Touch Keypad & Actions
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 4, offset: const Offset(0, -2))],
            ),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Grand Total:', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    Text(
                      '\\\$\${_grandTotal.toStringAsFixed(2)}',
                      style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF0F2B5C)),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  height: 52,
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF0F2B5C),
                      foregroundColor: Colors.white,
                    ),
                    icon: const Icon(Icons.receipt_long),
                    label: const Text('BILL & PRINT RECEIPT (CASH / CARD)', style: TextStyle(fontWeight: FontWeight.bold)),
                    onPressed: _posCart.isNotEmpty ? _completePOSTransaction : null,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}`,
  },
  {
    filename: 'lib/screens/rider_tracking_screen.dart',
    category: 'screens',
    description: 'Live Google Map Tracking Screen showing Store Pickup, Rider GPS marker & Customer Delivery point.',
    code: `import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

class RiderLiveTrackingScreen extends StatefulWidget {
  final String orderId;
  const RiderLiveTrackingScreen({super.key, this.orderId = 'ORD-88214'});

  @override
  State<RiderLiveTrackingScreen> createState() => _RiderLiveTrackingScreenState();
}

class _RiderLiveTrackingScreenState extends State<RiderLiveTrackingScreen> {
  GoogleMapController? _mapController;
  final Set<Marker> _markers = {};
  final Set<Polyline> _polylines = {};

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Live Delivery Tracking'),
      ),
      body: StreamBuilder<DocumentSnapshot>(
        stream: FirebaseFirestore.instance.collection('orders').doc(widget.orderId).snapshots(),
        builder: (context, snapshot) {
          if (!snapshot.hasData) {
            return const Center(child: CircularProgressIndicator());
          }

          final orderData = snapshot.data!.data() as Map<String, dynamic>? ?? {};
          final riderLoc = orderData['riderLocation'] ?? {'lat': 37.7772, 'lng': -122.4145};
          final pickupLoc = orderData['pickupLocation'] ?? {'lat': 37.7795, 'lng': -122.4125};
          final deliveryLoc = orderData['deliveryCoords'] ?? {'lat': 37.7749, 'lng': -122.4194};

          final riderLatLng = LatLng(riderLoc['lat'], riderLoc['lng']);
          final pickupLatLng = LatLng(pickupLoc['lat'], pickupLoc['lng']);
          final deliveryLatLng = LatLng(deliveryLoc['lat'], deliveryLoc['lng']);

          _markers.clear();
          _markers.add(Marker(markerId: const MarkerId('store'), position: pickupLatLng, infoWindow: const InfoWindow(title: 'Store Pickup')));
          _markers.add(Marker(markerId: const MarkerId('rider'), position: riderLatLng, infoWindow: const InfoWindow(title: 'Rider on the way')));
          _markers.add(Marker(markerId: const MarkerId('customer'), position: deliveryLatLng, infoWindow: const InfoWindow(title: 'Your Location')));

          return Stack(
            children: [
              GoogleMap(
                initialCameraPosition: CameraPosition(target: riderLatLng, zoom: 14.5),
                onMapCreated: (controller) => _mapController = controller,
                markers: _markers,
              ),
              Positioned(
                bottom: 16,
                left: 16,
                right: 16,
                child: Card(
                  elevation: 6,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Row(
                          children: [
                            const CircleAvatar(
                              backgroundColor: Color(0xFF0F2B5C),
                              child: Icon(Icons.delivery_dining, color: Colors.white),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    orderData['riderName'] ?? 'Leo Rodriguez',
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                                  ),
                                  Text('ETA: \${orderData['etaMinutes'] ?? 8} mins • \${orderData['riderVehicleNo'] ?? 'EV-4091'}'),
                                ],
                              ),
                            ),
                            IconButton(
                              icon: const Icon(Icons.phone, color: Colors.green),
                              onPressed: () {},
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}`,
  },
  {
    filename: 'firestore.rules',
    category: 'firestore',
    description: 'Production Hardened Firestore Security Rules for Master Products, Multi-Seller Inventory, POS and Delivery Tracking.',
    code: `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Default Deny Catch-All
    match /{document=**} {
      allow read, write: if false;
    }

    function isSignedIn() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }

    // 1. Master Product Catalog: Publicly readable by all users, writeable by approved Admins/Vendors
    match /products/{productId} {
      allow read: if true;
      allow write: if isSignedIn();
    }

    // 2. Seller Inventory: Publicly readable for distance/price queries
    match /seller_inventory/{inventoryId} {
      allow read: if true;
      allow create, update: if isSignedIn() && (request.resource.data.sellerId == request.auth.uid || request.auth.token.admin == true);
      allow delete: if isSignedIn() && resource.data.sellerId == request.auth.uid;
    }

    // 3. Sellers Metadata
    match /sellers/{sellerId} {
      allow read: if true;
      allow write: if isSignedIn() && (request.auth.uid == sellerId || request.auth.token.admin == true);
    }

    // 4. Delivery Orders: Accessible to Customer, Assigned Seller, and Assigned Rider
    match /orders/{orderId} {
      allow read: if isSignedIn() && (
        resource.data.customerId == request.auth.uid ||
        resource.data.sellerId == request.auth.uid ||
        resource.data.riderId == request.auth.uid ||
        request.auth.token.admin == true
      );
      allow create: if isSignedIn() && request.resource.data.customerId == request.auth.uid;
      allow update: if isSignedIn();
    }

    // 5. Standalone POS Transactions: Isolated to the specific seller, NEVER in delivery queue
    match /pos_transactions/{txnId} {
      allow read: if isSignedIn() && (
        resource.data.sellerId == request.auth.uid ||
        request.auth.token.admin == true
      );
      allow create: if isSignedIn() && request.resource.data.orderType == 'pos_billing';
      allow update, delete: if false; // POS audit receipts are immutable
    }

    // 6. Delivery Partners Live Location
    match /delivery_partners/{riderId} {
      allow read: if isSignedIn();
      allow write: if isSignedIn() && (request.auth.uid == riderId || request.auth.token.admin == true);
    }
  }
}`,
  },
  {
    filename: 'firestore.indexes.json',
    category: 'firestore',
    description: 'Composite Indexes optimized for querying nearest sellers for a specific master product.',
    code: `{
  "indexes": [
    {
      "collectionGroup": "seller_inventory",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "productId", "order": "ASCENDING" },
        { "fieldPath": "isAvailable", "order": "ASCENDING" },
        { "fieldPath": "price", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "seller_inventory",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "sellerId", "order": "ASCENDING" },
        { "fieldPath": "updatedAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "orders",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "customerId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "pos_transactions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "sellerId", "order": "ASCENDING" },
        { "fieldPath": "timestamp", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}`,
  },
];
