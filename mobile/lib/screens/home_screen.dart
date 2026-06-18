import 'package:flutter/material.dart';
import '../config/theme.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 60),
              ShaderMask(
                shaderCallback: (bounds) => const LinearGradient(
                  colors: [AppTheme.primary, Colors.cyan],
                ).createShader(bounds),
                child: const Text(
                  'Aura\nKinematics',
                  style: TextStyle(
                    fontSize: 48,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                    height: 1.1,
                  ),
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                '3D Biomechanical AI Analyzer',
                style: TextStyle(
                  fontSize: 18,
                  color: AppTheme.textMuted,
                ),
              ),
              const Spacer(),
              _FeatureCard(title: 'AI Pose Detection', subtitle: '33 3D Joints'),
              const SizedBox(height: 16),
              _FeatureCard(title: 'Physics Engine', subtitle: 'Angles & Velocities'),
              const Spacer(),
              ElevatedButton(
                onPressed: () => Navigator.pushNamed(context, '/analyze'),
                child: const Text('Start Analysis', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }
}

class _FeatureCard extends StatelessWidget {
  final String title;
  final String subtitle;

  const _FeatureCard({required this.title, required this.subtitle});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppTheme.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.primary.withOpacity(0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.primary)),
          const SizedBox(height: 4),
          Text(subtitle, style: const TextStyle(color: AppTheme.textMuted)),
        ],
      ),
    );
  }
}
