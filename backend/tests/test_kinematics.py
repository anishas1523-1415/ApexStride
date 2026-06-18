import pytest
import numpy as np
from app.engine.kinematics import KinematicsEngine
from app.models.schemas import JointCoordinate, JointAngles


class TestCalculateAngle3D:
    def test_right_angle(self):
        """3 points forming 90 degrees."""
        a = np.array([1.0, 0.0, 0.0])
        b = np.array([0.0, 0.0, 0.0])
        c = np.array([0.0, 1.0, 0.0])
        angle = KinematicsEngine.calculate_angle_3d(a, b, c)
        assert abs(angle - 90.0) < 0.1

    def test_straight_line(self):
        """3 collinear points -> 180 degrees."""
        a = np.array([0.0, 0.0, 0.0])
        b = np.array([1.0, 0.0, 0.0])
        c = np.array([2.0, 0.0, 0.0])
        angle = KinematicsEngine.calculate_angle_3d(a, b, c)
        assert abs(angle - 180.0) < 0.1

    def test_acute_angle(self):
        """3 points forming ~45 degrees."""
        a = np.array([1.0, 0.0, 0.0])
        b = np.array([0.0, 0.0, 0.0])
        c = np.array([1.0, 1.0, 0.0])
        angle = KinematicsEngine.calculate_angle_3d(a, b, c)
        assert abs(angle - 45.0) < 0.1


class TestAngularVelocity:
    def test_linear_angles(self):
        """Linear angle change should give consistent angular velocity."""
        angles = [0.0, 10.0, 20.0, 30.0, 40.0]
        fps = 30.0
        result = KinematicsEngine.calculate_angular_velocity(angles, fps)
        assert len(result) == 5
        assert all(isinstance(v, (float, np.floating)) for v in result)
        # For linear change of 10 deg/frame at 30fps:
        # velocity = np.gradient(np.radians(angles)) * fps
        expected = np.gradient(np.radians(angles)) * fps
        np.testing.assert_allclose(result, expected, rtol=1e-5)


class TestAllJointAngles:
    def test_all_angles_computed(self):
        """Verify all 10 joint angles are computed from complete landmarks."""
        engine = KinematicsEngine()
        # Create landmarks with realistic positions
        landmarks = {
            'RIGHT_SHOULDER': JointCoordinate(x=0.6, y=0.3, z=0.0, visibility=1.0),
            'RIGHT_ELBOW': JointCoordinate(x=0.7, y=0.5, z=0.0, visibility=1.0),
            'RIGHT_WRIST': JointCoordinate(x=0.8, y=0.7, z=0.0, visibility=1.0),
            'LEFT_SHOULDER': JointCoordinate(x=0.4, y=0.3, z=0.0, visibility=1.0),
            'LEFT_ELBOW': JointCoordinate(x=0.3, y=0.5, z=0.0, visibility=1.0),
            'LEFT_WRIST': JointCoordinate(x=0.2, y=0.7, z=0.0, visibility=1.0),
            'RIGHT_HIP': JointCoordinate(x=0.55, y=0.6, z=0.0, visibility=1.0),
            'RIGHT_KNEE': JointCoordinate(x=0.55, y=0.8, z=0.0, visibility=1.0),
            'RIGHT_ANKLE': JointCoordinate(x=0.55, y=1.0, z=0.0, visibility=1.0),
            'LEFT_HIP': JointCoordinate(x=0.45, y=0.6, z=0.0, visibility=1.0),
            'LEFT_KNEE': JointCoordinate(x=0.45, y=0.8, z=0.0, visibility=1.0),
            'LEFT_ANKLE': JointCoordinate(x=0.45, y=1.0, z=0.0, visibility=1.0),
            'RIGHT_INDEX': JointCoordinate(x=0.85, y=0.75, z=0.0, visibility=1.0),
            'LEFT_INDEX': JointCoordinate(x=0.15, y=0.75, z=0.0, visibility=1.0),
        }
        result = engine.calculate_all_joint_angles(landmarks)
        assert isinstance(result, list)
        assert len(result) == 10
        assert all(isinstance(a, JointAngles) for a in result)
        # Verify all angle names are present
        angle_names = {a.joint_name for a in result}
        expected_names = {'right_elbow', 'left_elbow', 'right_knee', 'left_knee',
                         'right_shoulder', 'left_shoulder', 'right_hip', 'left_hip',
                         'right_wrist', 'left_wrist'}
        assert angle_names == expected_names
