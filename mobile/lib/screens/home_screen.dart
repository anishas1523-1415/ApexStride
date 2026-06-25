import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'dart:ui';
import 'auth_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final user = Supabase.instance.client.auth.currentUser;

  final List<Map<String, dynamic>> _sports = [
    {'id': 'cricket', 'name': 'Cricket', 'icon': '🏏', 'color': Colors.teal},
    {'id': 'football', 'name': 'Football', 'icon': '⚽', 'color': Colors.blue},
    {'id': 'weightlifting', 'name': 'Weightlifting', 'icon': '🏋️', 'color': Colors.orange},
    {'id': 'badminton', 'name': 'Badminton', 'icon': '🏸', 'color': Colors.amber},
    {'id': 'running', 'name': 'Athlete Running', 'icon': '🏃', 'color': Colors.pink},
  ];

  Future<void> _logout() async {
    await Supabase.instance.client.auth.signOut();
    if (mounted) {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (context) => const AuthScreen()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final String fullName = user?.userMetadata?['full_name'] ?? 'Athlete';

    return Scaffold(
      backgroundColor: const Color(0xFF050810),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.logout, color: Colors.cyanAccent),
            onPressed: _logout,
          )
        ],
      ),
      body: Stack(
        children: [
          // Ambient Glows
          Positioned(
            top: 50, left: -100,
            child: Container(
              width: 300, height: 300,
              decoration: BoxDecoration(shape: BoxShape.circle, color: Colors.cyan.withOpacity(0.1)),
              child: BackdropFilter(filter: ImageFilter.blur(sigmaX: 100, sigmaY: 100), child: const SizedBox()),
            ),
          ),
          Positioned(
            bottom: -50, right: -100,
            child: Container(
              width: 350, height: 350,
              decoration: BoxDecoration(shape: BoxShape.circle, color: Colors.teal.withOpacity(0.1)),
              child: BackdropFilter(filter: ImageFilter.blur(sigmaX: 100, sigmaY: 100), child: const SizedBox()),
            ),
          ),
          
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 10),
                  Text(
                    'Welcome back,',
                    style: TextStyle(fontSize: 24, color: Colors.white.withOpacity(0.7), fontWeight: FontWeight.w300),
                  ),
                  Text(
                    fullName,
                    style: const TextStyle(fontSize: 36, color: Colors.cyanAccent, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  const Text('Ready to break your records today?', style: TextStyle(color: Colors.white54)),
                  const SizedBox(height: 40),
                  const Text('SELECT YOUR SPORT', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w900, letterSpacing: 1.5)),
                  const SizedBox(height: 16),
                  
                  Expanded(
                    child: ListView.separated(
                      itemCount: _sports.length,
                      separatorBuilder: (context, index) => const SizedBox(height: 16),
                      itemBuilder: (context, index) {
                        final sport = _sports[index];
                        return GestureDetector(
                          onTap: () => Navigator.pushNamed(context, '/analyze', arguments: sport['id']),
                          child: Container(
                            height: 120,
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.05),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(color: Colors.white.withOpacity(0.1)),
                            ),
                            child: Stack(
                              children: [
                                Positioned(
                                  right: -20, bottom: -20,
                                  child: Text(sport['icon'], style: TextStyle(fontSize: 100, color: Colors.white.withOpacity(0.1))),
                                ),
                                Padding(
                                  padding: const EdgeInsets.all(24.0),
                                  child: Row(
                                    children: [
                                      Text(sport['icon'], style: const TextStyle(fontSize: 40)),
                                      const SizedBox(width: 20),
                                      Text(
                                        sport['name'],
                                        style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold, letterSpacing: 1.2),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
