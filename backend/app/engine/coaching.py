"""
AuraKinematics — Coaching Engine
=================================
Compares observed joint-angle timelines against sport-specific biomechanical
baselines and produces coaching insights, critical events, and an overall
performance score.
"""

from __future__ import annotations

import logging
from typing import ClassVar

from app.models.schemas import (
    CoachingInsight,
    CriticalEvent,
    FrameKinematics,
)

logger = logging.getLogger(__name__)


class CoachingEngine:
    """Rule-based coaching evaluator driven by sport-specific baseline profiles."""

    # ------------------------------------------------------------------ #
    # Baseline biomechanical profiles                                     #
    # ------------------------------------------------------------------ #
    # Structure:                                                          #
    #   sport_type -> joint_name -> {                                     #
    #       min_angle, max_angle, optimal_angle, phase,                   #
    #       tip_below, tip_above                                          #
    #   }                                                                 #
    # ------------------------------------------------------------------ #
    BASELINE_PROFILES: ClassVar[
        dict[str, dict[str, dict]]
    ] = {
        # ============================================================== #
        # CRICKET — BATTING                                               #
        # ============================================================== #
        "cricket_batting": {
            "right_elbow": {
                "min_angle": 160.0,
                "max_angle": 180.0,
                "optimal_angle": 170.0,
                "phase": "bat_swing",
                "tip_below": (
                    "Your right elbow is collapsing during the swing. "
                    "Focus on extending the arm fully through the shot to "
                    "maximise bat speed and control."
                ),
                "tip_above": (
                    "Your right elbow is hyper-extended. Maintain a slight "
                    "natural bend to avoid strain and preserve shot flexibility."
                ),
            },
            "left_elbow": {
                "min_angle": 155.0,
                "max_angle": 175.0,
                "optimal_angle": 165.0,
                "phase": "bat_swing",
                "tip_below": (
                    "Your left (top-hand) elbow is too bent, reducing power "
                    "transfer. Keep the lead arm straighter through impact."
                ),
                "tip_above": (
                    "Your left elbow is locked out. Allow a slight cushion "
                    "to absorb the ball's force and maintain wrist fluidity."
                ),
            },
            "right_knee": {
                "min_angle": 130.0,
                "max_angle": 160.0,
                "optimal_angle": 145.0,
                "phase": "stance_and_drive",
                "tip_below": (
                    "Your right knee is bending too much, causing you to "
                    "'sit' on the shot. Push off the back foot more "
                    "aggressively to transfer weight forward."
                ),
                "tip_above": (
                    "Your right knee is too straight; you're losing the "
                    "loaded spring effect. Bend slightly to generate "
                    "explosive drive."
                ),
            },
            "left_knee": {
                "min_angle": 140.0,
                "max_angle": 170.0,
                "optimal_angle": 155.0,
                "phase": "front_foot_plant",
                "tip_below": (
                    "Your front knee is buckling on contact. Brace the "
                    "lead leg firmly to create a stable pivot for rotation."
                ),
                "tip_above": (
                    "Your front leg is stiff. A slight flex at impact "
                    "cushions the stride and improves timing."
                ),
            },
            "right_shoulder": {
                "min_angle": 80.0,
                "max_angle": 120.0,
                "optimal_angle": 100.0,
                "phase": "backlift",
                "tip_below": (
                    "Your backlift is too low — the bat isn't reaching a "
                    "high enough position for a full downswing. Lift the "
                    "bat higher in the backlift phase."
                ),
                "tip_above": (
                    "Your backlift is excessively high, which can delay "
                    "the downswing. Aim for a compact backlift that still "
                    "allows a full swing arc."
                ),
            },
            "right_hip": {
                "min_angle": 140.0,
                "max_angle": 170.0,
                "optimal_angle": 155.0,
                "phase": "hip_rotation",
                "tip_below": (
                    "Your hips are too closed at impact. Open them earlier "
                    "to engage the kinetic chain from the ground up."
                ),
                "tip_above": (
                    "Your hips are flying open too early, leaking power "
                    "before the bat arrives. Delay hip rotation slightly "
                    "to synchronise with the upper body."
                ),
            },
        },

        # ============================================================== #
        # CRICKET — BOWLING                                               #
        # ============================================================== #
        "cricket_bowling": {
            "right_elbow": {
                "min_angle": 165.0,
                "max_angle": 180.0,
                "optimal_angle": 175.0,
                "phase": "delivery_stride",
                "tip_below": (
                    "Your bowling arm is bending beyond the legal 15° "
                    "tolerance. Straighten your arm through delivery to "
                    "avoid a 'chucking' call."
                ),
                "tip_above": (
                    "Your elbow is locked rigidly; a tiny natural flex "
                    "helps with wrist snap and seam position."
                ),
            },
            "right_shoulder": {
                "min_angle": 160.0,
                "max_angle": 180.0,
                "optimal_angle": 170.0,
                "phase": "arm_rotation",
                "tip_below": (
                    "Your shoulder isn't reaching full height in the "
                    "bowling arc. Drive the arm higher to generate a "
                    "steeper release angle and extra bounce."
                ),
                "tip_above": (
                    "Your shoulder is over-rotating past vertical, "
                    "risking labrum strain. Keep the arc controlled "
                    "and aligned with the target."
                ),
            },
            "left_knee": {
                "min_angle": 155.0,
                "max_angle": 175.0,
                "optimal_angle": 165.0,
                "phase": "front_foot_brace",
                "tip_below": (
                    "Your front knee is collapsing on landing — this "
                    "absorbs energy meant for the ball. Brace the lead "
                    "leg to convert momentum into pace."
                ),
                "tip_above": (
                    "Your front leg is too stiff at landing; allow a "
                    "slight flex to cushion the impact and reduce stress "
                    "on the lower back."
                ),
            },
        },

        # ============================================================== #
        # BADMINTON — SMASH                                               #
        # ============================================================== #
        "badminton_smash": {
            "right_elbow": {
                "min_angle": 150.0,
                "max_angle": 180.0,
                "optimal_angle": 165.0,
                "phase": "overhead_swing",
                "tip_below": (
                    "Your elbow is dropping too early in the smash. "
                    "Delay the forearm snap to maximise racket-head "
                    "speed at contact."
                ),
                "tip_above": (
                    "Your arm is fully locked at contact. A slight bend "
                    "at the elbow gives room for a pronation whip."
                ),
            },
            "right_shoulder": {
                "min_angle": 160.0,
                "max_angle": 180.0,
                "optimal_angle": 170.0,
                "phase": "preparation",
                "tip_below": (
                    "Your racket arm isn't reaching high enough. Fully "
                    "extend the shoulder to gain maximum contact height "
                    "and steep angle."
                ),
                "tip_above": (
                    "Your shoulder is hyper-extended; this can strain "
                    "the rotator cuff. Aim for a controlled full reach."
                ),
            },
            "right_wrist": {
                "min_angle": 140.0,
                "max_angle": 170.0,
                "optimal_angle": 155.0,
                "phase": "pronation_snap",
                "tip_below": (
                    "Your wrist is too flexed before contact. Keep it "
                    "cocked back and snap through the shuttle for power."
                ),
                "tip_above": (
                    "Your wrist is too flat — you're losing the snap "
                    "action. Maintain slight extension to load the "
                    "forearm muscles."
                ),
            },
            "right_knee": {
                "min_angle": 120.0,
                "max_angle": 155.0,
                "optimal_angle": 138.0,
                "phase": "jump_and_landing",
                "tip_below": (
                    "You're crouching too low before the jump. A moderate "
                    "knee bend gives explosive lift without losing balance."
                ),
                "tip_above": (
                    "Your legs are too straight; you're not loading "
                    "enough for the jump. Bend your knees more to "
                    "generate upward thrust."
                ),
            },
        },

        # ============================================================== #
        # BADMINTON — DROP SHOT                                           #
        # ============================================================== #
        "badminton_drop": {
            "right_elbow": {
                "min_angle": 90.0,
                "max_angle": 140.0,
                "optimal_angle": 115.0,
                "phase": "deceptive_swing",
                "tip_below": (
                    "Your elbow is collapsing too much, telegraphing the "
                    "drop. Keep it higher to disguise the shot as a clear."
                ),
                "tip_above": (
                    "Your arm is too extended for a drop shot — the "
                    "shuttle will travel too far. Shorten the lever to "
                    "reduce power."
                ),
            },
            "right_wrist": {
                "min_angle": 120.0,
                "max_angle": 160.0,
                "optimal_angle": 140.0,
                "phase": "touch_and_release",
                "tip_below": (
                    "Your wrist is too closed; the shuttle is catching "
                    "the net. Open the racket face slightly for a higher "
                    "clearance over the net."
                ),
                "tip_above": (
                    "Your wrist is too open, pushing the shuttle long. "
                    "Close the racket face to keep the drop tight to "
                    "the net."
                ),
            },
            "right_shoulder": {
                "min_angle": 80.0,
                "max_angle": 130.0,
                "optimal_angle": 105.0,
                "phase": "preparation",
                "tip_below": (
                    "Your preparation is too low; opponents can read "
                    "the drop early. Raise the racket to mimic a smash "
                    "preparation."
                ),
                "tip_above": (
                    "Your shoulder is too high and stiff for a finesse "
                    "shot. Relax and lower the contact point slightly."
                ),
            },
        },
    }

    # ------------------------------------------------------------------ #
    # Severity classification                                             #
    # ------------------------------------------------------------------ #
    @staticmethod
    def _classify_severity(deviation: float) -> str:
        """Map the absolute angular deviation to a severity label.

        Parameters
        ----------
        deviation : float
            Absolute difference between observed and optimal angle (degrees).

        Returns
        -------
        str
            One of ``"info"``, ``"warning"``, or ``"critical"``.
        """
        if deviation <= 5.0:
            return "info"
        if deviation <= 15.0:
            return "warning"
        return "critical"

    # ------------------------------------------------------------------ #
    # Public analysis entry-point                                         #
    # ------------------------------------------------------------------ #
    def analyze(
        self,
        sport_type: str,
        timeline: list[FrameKinematics],
        fps: float,
    ) -> tuple[list[CoachingInsight], list[CriticalEvent], float]:
        """Run a full coaching analysis on a kinematic timeline.

        Parameters
        ----------
        sport_type : str
            Key into ``BASELINE_PROFILES`` (e.g. ``"cricket_batting"``).
        timeline : list[FrameKinematics]
            Ordered list of per-frame kinematics.
        fps : float
            Video frame rate.

        Returns
        -------
        tuple[list[CoachingInsight], list[CriticalEvent], float]
            ``(insights, critical_events, overall_score)`` where the score
            is in the range [0, 100].
        """
        profile = self.BASELINE_PROFILES.get(sport_type)
        if profile is None:
            logger.warning(
                "No baseline profile for sport_type='%s'. "
                "Returning empty analysis.",
                sport_type,
            )
            return [], [], 0.0

        insights: list[CoachingInsight] = []
        critical_events: list[CriticalEvent] = []

        # Accumulate per-joint deviation scores for final grading.
        deviation_scores: list[float] = []

        # Track peak extension per joint for critical-event detection.
        joint_peak_map: dict[str, tuple[float, int, float]] = {}
        # Maps joint_name -> (max_angle, frame_index, timestamp)

        for fk in timeline:
            timestamp = fk.timestamp_seconds
            frame_idx = fk.frame_index

            for angle_entry in fk.joint_angles:
                joint_name = angle_entry.joint_name
                observed = angle_entry.angle_degrees

                baseline = profile.get(joint_name)
                if baseline is None:
                    continue

                min_a = baseline["min_angle"]
                max_a = baseline["max_angle"]
                optimal = baseline["optimal_angle"]
                phase = baseline["phase"]

                deviation = abs(observed - optimal)
                deviation_scores.append(deviation)

                # --- Track peak extension for critical events ---------- #
                current_peak = joint_peak_map.get(joint_name)
                if current_peak is None or observed > current_peak[0]:
                    joint_peak_map[joint_name] = (observed, frame_idx, timestamp)

                # --- Out-of-range coaching insight --------------------- #
                if observed < min_a:
                    severity = self._classify_severity(min_a - observed)
                    insights.append(
                        CoachingInsight(
                            category=f"{phase}::{joint_name}",
                            severity=severity,
                            message=baseline["tip_below"],
                            frame_index=frame_idx,
                            timestamp_seconds=timestamp,
                            angle_actual=round(observed, 2),
                            angle_ideal=optimal,
                        )
                    )
                elif observed > max_a:
                    severity = self._classify_severity(observed - max_a)
                    insights.append(
                        CoachingInsight(
                            category=f"{phase}::{joint_name}",
                            severity=severity,
                            message=baseline["tip_above"],
                            frame_index=frame_idx,
                            timestamp_seconds=timestamp,
                            angle_actual=round(observed, 2),
                            angle_ideal=optimal,
                        )
                    )

        # ------------------------------------------------------------------ #
        # Critical events: impact frame (midpoint) and peak extensions       #
        # ------------------------------------------------------------------ #
        if timeline:
            mid = len(timeline) // 2
            mid_fk = timeline[mid]
            critical_events.append(
                CriticalEvent(
                    event_type="impact_frame",
                    frame_index=mid_fk.frame_index,
                    timestamp_seconds=mid_fk.timestamp_seconds,
                    description=(
                        f"Estimated impact frame at index {mid_fk.frame_index} "
                        f"({mid_fk.timestamp_seconds:.3f}s). "
                        "This is the midpoint of the detected motion window."
                    ),
                )
            )

        for joint_name, (peak_angle, peak_frame, peak_ts) in joint_peak_map.items():
            critical_events.append(
                CriticalEvent(
                    event_type="peak_extension",
                    frame_index=peak_frame,
                    timestamp_seconds=peak_ts,
                    description=(
                        f"Peak extension of {joint_name} reached "
                        f"{peak_angle:.1f}° at frame {peak_frame} "
                        f"({peak_ts:.3f}s)."
                    ),
                )
            )

        # ------------------------------------------------------------------ #
        # Overall score: 100 minus a weighted penalty of mean deviation       #
        # ------------------------------------------------------------------ #
        if deviation_scores:
            mean_deviation = sum(deviation_scores) / len(deviation_scores)
            # Each degree of mean deviation costs ~1.5 points (tunable).
            penalty = min(mean_deviation * 1.5, 100.0)
            overall_score = round(max(100.0 - penalty, 0.0), 2)
        else:
            overall_score = 0.0

        # De-duplicate insights: keep the worst-severity per category.
        insights = self._deduplicate_insights(insights)

        logger.info(
            "Coaching analysis complete for '%s': %d insights, %d events, score=%.1f",
            sport_type,
            len(insights),
            len(critical_events),
            overall_score,
        )

        return insights, critical_events, overall_score

    # ------------------------------------------------------------------ #
    # Helpers                                                              #
    # ------------------------------------------------------------------ #
    @staticmethod
    def _deduplicate_insights(
        insights: list[CoachingInsight],
    ) -> list[CoachingInsight]:
        """Keep only the highest-severity insight per category.

        When a single joint repeatedly triggers the same coaching tip, we
        surface only the most critical instance to avoid flooding the
        athlete's report with noise.
        """
        severity_rank = {"critical": 3, "warning": 2, "info": 1}
        best: dict[str, CoachingInsight] = {}

        for ins in insights:
            existing = best.get(ins.category)
            if existing is None or severity_rank.get(
                ins.severity, 0
            ) > severity_rank.get(existing.severity, 0):
                best[ins.category] = ins

        return list(best.values())
