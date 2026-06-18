import os

mobile_dir = r"d:\PROJECTS\ApexStride\mobile"

files = {
    "lib/main.dart": """import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'config/theme.dart';
import 'screens/home_screen.dart';
import 'screens/analyze_screen.dart';

void main() {
  runApp(
    MultiProvider(
      providers: [
        // Dummy provider setup
        Provider(create: (_) => 'AnalysisProviderPlaceholder'),
      ],
      child: const AuraKinematicsApp(),
    ),
  );
}

class AuraKinematicsApp extends StatelessWidget {
  const AuraKinematicsApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'AuraKinematics',
      theme: AppTheme.darkTheme,
      initialRoute: '/',
      routes: {
        '/': (context) => const HomeScreen(),
        '/analyze': (context) => const AnalyzeScreen(),
      },
    );
  }
}
""",
    "lib/config/theme.dart": """import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  static const Color background = Color(0xFF0A0E1A);
  static const Color card = Color(0xFF0F172A);
  static const Color primary = Color(0xFF10B981);
  static const Color error = Color(0xFFEF4444);
  static const Color warning = Color(0xFFF59E0B);
  static const Color textMain = Color(0xFFF1F5F9);
  static const Color textMuted = Color(0xFF94A3B8);

  static ThemeData get darkTheme {
    return ThemeData.dark().copyWith(
      scaffoldBackgroundColor: background,
      primaryColor: primary,
      colorScheme: const ColorScheme.dark(
        primary: primary,
        background: background,
        surface: card,
        error: error,
      ),
      textTheme: GoogleFonts.interTextTheme(ThemeData.dark().textTheme).copyWith(
        bodyLarge: const TextStyle(color: textMain),
        bodyMedium: const TextStyle(color: textMuted),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primary,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          padding: const EdgeInsets.symmetric(vertical: 16),
        ),
      ),
    );
  }
}
""",
    "lib/screens/home_screen.dart": """import 'package:flutter/material.dart';
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
                  'Aura\\nKinematics',
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
""",
    "lib/screens/analyze_screen.dart": """import 'package:flutter/material.dart';
import '../config/theme.dart';

class AnalyzeScreen extends StatefulWidget {
  const AnalyzeScreen({super.key});

  @override
  State<AnalyzeScreen> createState() => _AnalyzeScreenState();
}

class _AnalyzeScreenState extends State<AnalyzeScreen> {
  bool _isAnalyzing = false;
  bool _isComplete = false;

  void _startAnalysis() async {
    setState(() => _isAnalyzing = true);
    await Future.delayed(const Duration(seconds: 3));
    setState(() {
      _isAnalyzing = false;
      _isComplete = true;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_isComplete) {
      return _buildResults(context);
    }

    return Scaffold(
      appBar: AppBar(backgroundColor: Colors.transparent, elevation: 0),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (_isAnalyzing) ...[
              const Center(
                child: CircularProgressIndicator(color: AppTheme.primary),
              ),
              const SizedBox(height: 24),
              const Text(
                'Running AI Pipeline...',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
            ] else ...[
              const Icon(Icons.upload_file, size: 80, color: AppTheme.textMuted),
              const SizedBox(height: 24),
              const Text(
                'Upload Video',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 48),
              ElevatedButton(
                onPressed: _startAnalysis,
                child: const Text('Select File & Analyze', style: TextStyle(fontSize: 18)),
              ),
            ]
          ],
        ),
      ),
    );
  }

  Widget _buildResults(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Analysis Complete')),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(32),
              decoration: BoxDecoration(
                color: AppTheme.card,
                borderRadius: BorderRadius.circular(24),
              ),
              child: Column(
                children: [
                  const Text('Form Score', style: TextStyle(color: AppTheme.textMuted)),
                  const Text('82', style: TextStyle(fontSize: 72, fontWeight: FontWeight.bold, color: AppTheme.primary)),
                  const Text('out of 100', style: TextStyle(color: AppTheme.textMuted)),
                ],
              ),
            ),
            const SizedBox(height: 24),
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: AppTheme.card,
                borderRadius: BorderRadius.circular(24),
                border: Border(left: BorderSide(color: AppTheme.warning, width: 4)),
              ),
              child: const Text(
                'Your elbow dropped by 15 degrees. Keep it high during impact.',
                style: TextStyle(fontSize: 16),
              ),
            ),
            const Spacer(),
            ElevatedButton(
              onPressed: () => Navigator.pop(context),
              child: const Center(child: Text('Done')),
            )
          ],
        ),
      ),
    );
  }
}
"""
}

for filepath, content in files.items():
    full_path = os.path.join(mobile_dir, filepath)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)

print("Mobile files generated successfully.")
