import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:camera/camera.dart';
import 'package:sensors_plus/sensors_plus.dart';
import 'package:http/http.dart' as http;
import 'package:supabase_flutter/supabase_flutter.dart';

class CameraScreen extends StatefulWidget {
  final String sportId;
  const CameraScreen({super.key, required this.sportId});

  @override
  State<CameraScreen> createState() => _CameraScreenState();
}

class _CameraScreenState extends State<CameraScreen> {
  CameraController? _controller;
  List<CameraDescription> _cameras = [];
  bool _isReady = false;
  
  // Alignment metrics
  double _pitch = 0.0;
  double _roll = 0.0;
  bool _isAligned = false;
  StreamSubscription<AccelerometerEvent>? _accelSubscription;

  @override
  void initState() {
    super.initState();
    _initCamera();
    _initSensors();
  }

  Future<void> _initCamera() async {
    try {
      _cameras = await availableCameras();
      if (_cameras.isEmpty) return;

      _controller = CameraController(
        _cameras[0],
        ResolutionPreset.high,
        enableAudio: true,
      );

      await _controller!.initialize();
      if (mounted) setState(() => _isReady = true);
    } catch (e) {
      debugPrint("Camera initialization error: $e");
    }
  }

  void _initSensors() {
    _accelSubscription = accelerometerEventStream().listen((AccelerometerEvent event) {
      if (!mounted) return;
      
      setState(() {
        // Calculate pitch and roll from accelerometer
        _pitch = atan2(event.y, sqrt(event.x * event.x + event.z * event.z)) * 180 / pi;
        _roll = atan2(-event.x, event.z) * 180 / pi;
        
        // Define perfect alignment threshold (e.g. holding phone vertically straight)
        // Adjust these depending on landscape vs portrait requirement
        _isAligned = (event.x.abs() < 1.5 && event.z.abs() < 1.5);
      });
    });
  }

  @override
  void dispose() {
    _controller?.dispose();
    _accelSubscription?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (!_isReady || _controller == null || !_controller!.value.isInitialized) {
      return const Scaffold(
        backgroundColor: Color(0xFF050810),
        body: Center(child: CircularProgressIndicator(color: Colors.cyanAccent)),
      );
    }

    final guideColor = _isAligned ? Colors.greenAccent : Colors.redAccent;

    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        fit: StackFit.expand,
        children: [
          // Camera Preview
          CameraPreview(_controller!),
          
          // Dark Stadium Vignette
          Container(
            decoration: BoxDecoration(
              gradient: RadialGradient(
                colors: [Colors.transparent, Colors.black.withOpacity(0.8)],
                stops: const [0.5, 1.0],
                radius: 1.2,
              ),
            ),
          ),
          
          // Alignment Overlay (Red/Green Lines)
          Center(
            child: CustomPaint(
              size: const Size(300, 300),
              painter: AlignmentGuidePainter(
                color: guideColor,
                pitchOffset: _pitch,
                rollOffset: _roll,
              ),
            ),
          ),

          // Top Info Bar
          Positioned(
            top: 50,
            left: 20,
            right: 20,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                IconButton(
                  icon: const Icon(Icons.close, color: Colors.white, size: 30),
                  onPressed: () => Navigator.of(context).pop(),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  decoration: BoxDecoration(
                    color: Colors.black54,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: guideColor, width: 2),
                  ),
                  child: Text(
                    _isAligned ? 'PERFECT ALIGNMENT' : 'LEVEL DEVICE',
                    style: TextStyle(
                      color: guideColor,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.5,
                    ),
                  ),
                ),
                const SizedBox(width: 40), // Balance spacing
              ],
            ),
          ),

          // Bottom Controls
          Positioned(
            bottom: 40,
            left: 0,
            right: 0,
            child: Center(
              child: GestureDetector(
                onTap: () async {
                  if (_controller == null || !_controller!.value.isInitialized) return;

                  if (_controller!.value.isRecordingVideo) {
                    // Stop recording
                    final file = await _controller!.stopVideoRecording();
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Recording saved: ${file.path}. Uploading to AI...')),
                    );
                    
                    // Upload via HTTP
                    try {
                      final uri = Uri.parse('http://10.0.2.2:8000/api/v1/analyze');
                      final request = http.MultipartRequest('POST', uri);
                      
                      // Add Supabase Auth header
                      final token = Supabase.instance.client.auth.currentSession?.accessToken;
                      if (token != null) {
                        request.headers['Authorization'] = 'Bearer $token';
                      }
                      
                      request.fields['sport_type'] = widget.sportId;
                      request.files.add(await http.MultipartFile.fromPath('file', file.path));
                      
                      final response = await request.send();
                      if (response.statusCode == 202) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Analysis started successfully!'), backgroundColor: Colors.green),
                        );
                        Navigator.of(context).pop();
                      } else {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('Failed to start analysis: ${response.statusCode}'), backgroundColor: Colors.red),
                        );
                      }
                    } catch (e) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('Upload error: $e'), backgroundColor: Colors.red),
                      );
                    }
                    
                  } else {
                    // Start recording
                    await _controller!.startVideoRecording();
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Recording started...')),
                    );
                    setState(() {}); // trigger rebuild to update UI if needed
                  }
                },
                child: Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(color: Colors.white, width: 4),
                  ),
                  child: Center(
                    child: Container(
                      width: 60,
                      height: 60,
                      decoration: BoxDecoration(
                        shape: _controller!.value.isRecordingVideo ? BoxShape.rectangle : BoxShape.circle,
                        borderRadius: _controller!.value.isRecordingVideo ? BorderRadius.circular(8) : null,
                        color: Colors.redAccent,
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class AlignmentGuidePainter extends CustomPainter {
  final Color color;
  final double pitchOffset;
  final double rollOffset;

  AlignmentGuidePainter({
    required this.color,
    required this.pitchOffset,
    required this.rollOffset,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..strokeWidth = 2.0
      ..style = PaintingStyle.stroke;
      
    final center = Offset(size.width / 2, size.height / 2);
    
    // Draw outer crosshairs (fixed)
    canvas.drawLine(Offset(center.dx - 40, center.dy), Offset(center.dx - 10, center.dy), paint);
    canvas.drawLine(Offset(center.dx + 10, center.dy), Offset(center.dx + 40, center.dy), paint);
    canvas.drawLine(Offset(center.dx, center.dy - 40), Offset(center.dx, center.dy - 10), paint);
    canvas.drawLine(Offset(center.dx, center.dy + 10), Offset(center.dx, center.dy + 40), paint);

    // Draw dynamic horizon line based on pitch and roll
    final horizonPaint = Paint()
      ..color = color.withOpacity(0.6)
      ..strokeWidth = 4.0
      ..style = PaintingStyle.stroke;
      
    // A simple representation of roll and pitch translation
    final dy = (pitchOffset / 90.0) * size.height / 2;
    canvas.save();
    canvas.translate(center.dx, center.dy + dy);
    canvas.rotate(-rollOffset * pi / 180);
    canvas.drawLine(const Offset(-100, 0), const Offset(100, 0), horizonPaint);
    canvas.restore();
  }

  @override
  bool shouldRepaint(covariant AlignmentGuidePainter oldDelegate) {
    return oldDelegate.color != color || 
           oldDelegate.pitchOffset != pitchOffset || 
           oldDelegate.rollOffset != rollOffset;
  }
}
