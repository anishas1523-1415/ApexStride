import 'package:flutter/material.dart';
import 'package:vector_math/vector_math_64.dart' as vector;

// 1. Goal Post Metric Pop
class GoalPostPopWidget extends StatefulWidget {
  final Widget child;
  final Duration delay;

  const GoalPostPopWidget({super.key, required this.child, this.delay = Duration.zero});

  @override
  State<GoalPostPopWidget> createState() => _GoalPostPopWidgetState();
}

class _GoalPostPopWidgetState extends State<GoalPostPopWidget> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );
    
    // Recoil bounce effect (elastic out)
    _scaleAnimation = Tween<double>(begin: 0.5, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.elasticOut),
    );

    Future.delayed(widget.delay, () {
      if (mounted) _controller.forward();
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ScaleTransition(
      scale: _scaleAnimation,
      child: widget.child,
    );
  }
}

// 2. Player Dive Slide Widget
class PlayerDiveSlideWidget extends StatefulWidget {
  final Widget child;
  final Duration delay;

  const PlayerDiveSlideWidget({super.key, required this.child, this.delay = Duration.zero});

  @override
  State<PlayerDiveSlideWidget> createState() => _PlayerDiveSlideWidgetState();
}

class _PlayerDiveSlideWidgetState extends State<PlayerDiveSlideWidget> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );
    
    // Fast entry with decel-cushioned curve
    _slideAnimation = Tween<Offset>(begin: const Offset(0, 0.5), end: Offset.zero).animate(
      CurvedAnimation(parent: _controller, curve: const Cubic(0.2, 0.8, 0.2, 1.0)),
    );

    Future.delayed(widget.delay, () {
      if (mounted) _controller.forward();
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SlideTransition(
      position: _slideAnimation,
      child: FadeTransition(
        opacity: _controller,
        child: widget.child,
      ),
    );
  }
}
