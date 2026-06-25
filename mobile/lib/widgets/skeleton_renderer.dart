import 'package:flutter/material.dart';
import 'package:video_player/video_player.dart';
import '../config/theme.dart';

class JointCoordinate {
  final double x;
  final double y;
  final double z;
  final double visibility;

  JointCoordinate({required this.x, required this.y, required this.z, required this.visibility});
  
  factory JointCoordinate.fromJson(Map<String, dynamic> json) {
    return JointCoordinate(
      x: json['x'].toDouble(),
      y: json['y'].toDouble(),
      z: json['z'].toDouble(),
      visibility: json['visibility'].toDouble(),
    );
  }
}

class FrameKinematics {
  final int frameIndex;
  final double timestampSeconds;
  final Map<String, JointCoordinate> landmarks;

  FrameKinematics({required this.frameIndex, required this.timestampSeconds, required this.landmarks});
}

class SkeletonRenderer extends StatefulWidget {
  final VideoPlayerController videoController;
  final List<FrameKinematics> kinematicTimeline;
  final List<FrameKinematics>? baselinePro;
  final bool showGhostPro;

  const SkeletonRenderer({
    super.key,
    required this.videoController,
    required this.kinematicTimeline,
    this.baselinePro,
    this.showGhostPro = false,
  });

  @override
  State<SkeletonRenderer> createState() => _SkeletonRendererState();
}

class _SkeletonRendererState extends State<SkeletonRenderer> {
  int _currentFrame = 0;

  @override
  void initState() {
    super.initState();
    widget.videoController.addListener(_onVideoTick);
  }

  @override
  void dispose() {
    widget.videoController.removeListener(_onVideoTick);
    super.dispose();
  }

  void _onVideoTick() {
    if (widget.videoController.value.isInitialized) {
      final position = widget.videoController.value.position.inMilliseconds;
      // Assuming 30fps
      final frameIndex = (position / 1000.0 * 30).floor();
      if (_currentFrame != frameIndex) {
        setState(() {
          _currentFrame = frameIndex;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        if (!widget.videoController.value.isInitialized) {
          return const Center(child: CircularProgressIndicator(color: AppTheme.primary));
        }

        final videoSize = widget.videoController.value.size;
        final containerSize = Size(constraints.maxWidth, constraints.maxHeight);

        // Explicitly calculate letterboxing (BoxFit.contain math)
        final fittedSizes = applyBoxFit(BoxFit.contain, videoSize, containerSize);
        final sourceSize = fittedSizes.source;
        final destinationSize = fittedSizes.destination;

        // Calculate offsets to center the video
        final offsetX = (containerSize.width - destinationSize.width) / 2;
        final offsetY = (containerSize.height - destinationSize.height) / 2;

        final currentKinematics = _currentFrame < widget.kinematicTimeline.length
            ? widget.kinematicTimeline[_currentFrame]
            : null;
            
        final ghostKinematics = (widget.showGhostPro && widget.baselinePro != null && _currentFrame < widget.baselinePro!.length)
            ? widget.baselinePro![_currentFrame]
            : null;

        return Stack(
          fit: StackFit.expand,
          children: [
            // Bottom Layer: Video Player
            Center(
              child: AspectRatio(
                aspectRatio: widget.videoController.value.aspectRatio,
                child: VideoPlayer(widget.videoController),
              ),
            ),
            
            // Middle Layer: Explicitly constrained CustomPaint for zero-misalignment
            Positioned(
              left: offsetX,
              top: offsetY,
              width: destinationSize.width,
              height: destinationSize.height,
              child: CustomPaint(
                painter: _SkeletonPainter(
                  liveLandmarks: currentKinematics?.landmarks,
                  ghostLandmarks: ghostKinematics?.landmarks,
                ),
              ),
            ),
            
            // Top Layer: Interactive UI Controls would go here, provided by parent widget
          ],
        );
      },
    );
  }
}

class _SkeletonPainter extends CustomPainter {
  final Map<String, JointCoordinate>? liveLandmarks;
  final Map<String, JointCoordinate>? ghostLandmarks;

  _SkeletonPainter({this.liveLandmarks, this.ghostLandmarks});

  @override
  void paint(Canvas canvas, Size size) {
    if (ghostLandmarks != null) {
      _drawSkeleton(canvas, size, ghostLandmarks!, const Color(0x66FFFFFF), false);
    }
    if (liveLandmarks != null) {
      _drawSkeleton(canvas, size, liveLandmarks!, AppTheme.primary, true);
    }
  }

  void _drawSkeleton(Canvas canvas, Size size, Map<String, JointCoordinate> landmarks, Color color, bool isLive) {
    final paint = Paint()
      ..color = color
      ..strokeWidth = isLive ? 4.0 : 2.5
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    if (isLive) {
      // Neon glow effect
      paint.maskFilter = const MaskFilter.blur(BlurStyle.solid, 4.0);
    }

    void drawBone(String joint1, String joint2) {
      final p1 = landmarks[joint1];
      final p2 = landmarks[joint2];
      if (p1 != null && p2 != null && p1.visibility > 0.4 && p2.visibility > 0.4) {
        canvas.drawLine(
          Offset(p1.x * size.width, p1.y * size.height),
          Offset(p2.x * size.width, p2.y * size.height),
          paint,
        );
      }
    }

    final bones = [
      ['LEFT_SHOULDER', 'RIGHT_SHOULDER'],
      ['LEFT_SHOULDER', 'LEFT_ELBOW'],
      ['RIGHT_SHOULDER', 'RIGHT_ELBOW'],
      ['LEFT_ELBOW', 'LEFT_WRIST'],
      ['RIGHT_ELBOW', 'RIGHT_WRIST'],
      ['LEFT_SHOULDER', 'LEFT_HIP'],
      ['RIGHT_SHOULDER', 'RIGHT_HIP'],
      ['LEFT_HIP', 'RIGHT_HIP'],
      ['LEFT_HIP', 'LEFT_KNEE'],
      ['RIGHT_HIP', 'RIGHT_KNEE'],
      ['LEFT_KNEE', 'LEFT_ANKLE'],
      ['RIGHT_KNEE', 'RIGHT_ANKLE'],
    ];

    for (var bone in bones) {
      drawBone(bone[0], bone[1]);
    }

    // Draw joints
    final jointPaint = Paint()
      ..color = color
      ..style = PaintingStyle.fill;
      
    if (isLive) {
      jointPaint.maskFilter = const MaskFilter.blur(BlurStyle.solid, 3.0);
    }

    for (var joint in landmarks.values) {
      if (joint.visibility > 0.4) {
        canvas.drawCircle(
          Offset(joint.x * size.width, joint.y * size.height),
          isLive ? 6.0 : 4.0,
          jointPaint,
        );
      }
    }
  }

  @override
  bool shouldRepaint(covariant _SkeletonPainter oldDelegate) {
    return oldDelegate.liveLandmarks != liveLandmarks || oldDelegate.ghostLandmarks != ghostLandmarks;
  }
}
