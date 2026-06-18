import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'config/theme.dart';
import 'screens/home_screen.dart';
import 'screens/analyze_screen.dart';

import 'package:flutter_dotenv/flutter_dotenv.dart';

Future<void> main() async {
  await dotenv.load(fileName: ".env");
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
