import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Dark-Stadium Aesthetic Colors
  static const Color background = Color(0xFF050810);
  static const Color card = Color(0xFF0A0E1A);
  static const Color primary = Color(0xFF10B981);
  static const Color secondary = Color(0xFF06B6D4);
  static const Color error = Color(0xFFEF4444);
  static const Color warning = Color(0xFFF59E0B);
  static const Color textMain = Color(0xFFFFFFFF);
  static const Color textMuted = Color(0xFF94A3B8);
  static const Color borderGlow = Color(0x3310B981);

  static ThemeData get darkTheme {
    return ThemeData.dark().copyWith(
      scaffoldBackgroundColor: background,
      primaryColor: primary,
      colorScheme: const ColorScheme.dark(
        primary: primary,
        secondary: secondary,
        background: background,
        surface: card,
        error: error,
      ),
      textTheme: GoogleFonts.interTextTheme(ThemeData.dark().textTheme).copyWith(
        displayLarge: const TextStyle(color: textMain, fontWeight: FontWeight.w900, letterSpacing: -1.5),
        bodyLarge: const TextStyle(color: textMain),
        bodyMedium: const TextStyle(color: textMuted),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primary,
          foregroundColor: background, // High contrast text on buttons
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(30),
          ),
          padding: const EdgeInsets.symmetric(vertical: 18, horizontal: 32),
          elevation: 10,
          shadowColor: primary.withOpacity(0.5),
          textStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, letterSpacing: 1.2),
        ),
      ),
      cardTheme: CardTheme(
        color: card.withOpacity(0.8),
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(24),
          side: const BorderSide(color: borderGlow, width: 1),
        ),
      ),
    );
  }
}
