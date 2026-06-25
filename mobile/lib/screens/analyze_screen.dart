import 'package:flutter/material.dart';
import '../config/theme.dart';
import 'camera_screen.dart';

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
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.videocam, size: 60, color: Colors.cyanAccent),
                  const SizedBox(width: 20),
                  const Icon(Icons.upload_file, size: 60, color: AppTheme.textMuted),
                ],
              ),
              const SizedBox(height: 24),
              const Text(
                'Provide Media',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 48),
              ElevatedButton.icon(
                icon: const Icon(Icons.camera_alt),
                label: const Text('Record Live Video', style: TextStyle(fontSize: 18)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.cyanAccent,
                  foregroundColor: Colors.black,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                onPressed: () {
                  final sportId = ModalRoute.of(context)?.settings.arguments as String? ?? 'cricket';
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => CameraScreen(sportId: sportId)),
                  );
                },
              ),
              const SizedBox(height: 16),
              OutlinedButton.icon(
                icon: const Icon(Icons.upload_file),
                label: const Text('Select File & Analyze', style: TextStyle(fontSize: 18)),
                style: OutlinedButton.styleFrom(
                  foregroundColor: Colors.white,
                  side: BorderSide(color: Colors.white.withOpacity(0.3)),
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                onPressed: _startAnalysis,
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
