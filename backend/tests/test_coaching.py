import pytest
from app.engine.coaching import CoachingEngine
from app.models.schemas import (
    JointCoordinate, JointAngles, FrameKinematics, CoachingInsight, CriticalEvent
)


def make_frame_kinematics(
    frame_index: int,
    joint_angles_dict: dict[str, float],
    fps: float = 30.0
) -> FrameKinematics:
    """Helper to build FrameKinematics with given joint angles."""
    joint_angles = [
        JointAngles(
            joint_name=name,
            angle_degrees=angle,
            is_optimal=True,
            threshold_min=0.0,
            threshold_max=360.0
        )
        for name, angle in joint_angles_dict.items()
    ]
    # Minimal landmarks
    landmarks = {
        'RIGHT_SHOULDER': JointCoordinate(x=0.5, y=0.3, z=0.0, visibility=1.0),
        'RIGHT_ELBOW': JointCoordinate(x=0.6, y=0.5, z=0.0, visibility=1.0),
        'RIGHT_WRIST': JointCoordinate(x=0.7, y=0.7, z=0.0, visibility=1.0),
    }
    return FrameKinematics(
        frame_index=frame_index,
        timestamp_seconds=frame_index / fps,
        landmarks=landmarks,
        joint_angles=joint_angles,
        angular_velocities=None
    )


class TestCoachingEngine:
    def setup_method(self):
        self.engine = CoachingEngine()

    def test_optimal_angle_no_warning(self):
        """Joint at optimal angle should not produce warning insights."""
        timeline = [
            make_frame_kinematics(i, {'right_elbow': 170.0})
            for i in range(10)
        ]
        insights, events, score = self.engine.analyze('cricket_batting', timeline, 30.0)
        elbow_warnings = [
            ins for ins in insights
            if 'right_elbow' in ins.category.lower()
            and ins.severity in ('warning', 'critical')
        ]
        assert len(elbow_warnings) == 0

    def test_below_threshold_warning(self):
        """Joint below min should produce warning with tip_below."""
        timeline = [
            make_frame_kinematics(i, {'right_elbow': 140.0})
            for i in range(10)
        ]
        insights, events, score = self.engine.analyze('cricket_batting', timeline, 30.0)
        elbow_warnings = [
            ins for ins in insights
            if 'right_elbow' in ins.category.lower()
            and ins.severity in ('warning', 'critical')
        ]
        assert len(elbow_warnings) > 0

    def test_above_threshold_warning(self):
        """Joint above max should produce warning with tip_above."""
        timeline = [
            make_frame_kinematics(i, {'right_elbow': 190.0})
            for i in range(10)
        ]
        insights, events, score = self.engine.analyze('cricket_batting', timeline, 30.0)
        elbow_warnings = [
            ins for ins in insights
            if 'right_elbow' in ins.category.lower()
            and ins.severity in ('warning', 'critical')
        ]
        assert len(elbow_warnings) > 0

    def test_overall_score_perfect(self):
        """All joints at optimal angles -> score near 100."""
        optimal_angles = {
            'right_elbow': 170.0,
            'left_elbow': 165.0,
            'right_knee': 145.0,
            'left_knee': 155.0,
            'right_shoulder': 100.0,
            'right_hip': 155.0,
        }
        timeline = [
            make_frame_kinematics(i, optimal_angles)
            for i in range(20)
        ]
        insights, events, score = self.engine.analyze('cricket_batting', timeline, 30.0)
        assert score >= 80.0  # Should be close to 100

    def test_overall_score_poor(self):
        """All joints far out of range -> low score."""
        bad_angles = {
            'right_elbow': 90.0,
            'left_elbow': 90.0,
            'right_knee': 90.0,
            'left_knee': 90.0,
            'right_shoulder': 10.0,
            'right_hip': 90.0,
        }
        timeline = [
            make_frame_kinematics(i, bad_angles)
            for i in range(20)
        ]
        insights, events, score = self.engine.analyze('cricket_batting', timeline, 30.0)
        assert score < 50.0
