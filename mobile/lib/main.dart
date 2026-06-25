import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'config/theme.dart';
import 'screens/home_screen.dart';
import 'screens/analyze_screen.dart';
import 'screens/auth_screen.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await dotenv.load(fileName: ".env");
  
  await Supabase.initialize(
    url: dotenv.env['SUPABASE_URL']!,
    anonKey: dotenv.env['SUPABASE_ANON_KEY']!,
  );

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
      home: Supabase.instance.client.auth.currentSession == null 
          ? const AuthScreen() 
          : const HomeScreen(),
      routes: {
        '/home': (context) => const HomeScreen(),
        '/analyze': (context) => const AnalyzeScreen(),
      },
    );
  }
}
