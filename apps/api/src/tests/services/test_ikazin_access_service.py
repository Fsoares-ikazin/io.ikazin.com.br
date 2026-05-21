"""Service tests for src/services/ikazin/access.py."""

from datetime import datetime
from unittest.mock import Mock, patch

from fastapi import HTTPException

from src.db.users import User
from src.services.ikazin.access import activate_ikazin_plan_from_stripe_checkout


def _make_user(*, user_id: int = 42, details: dict | None = None) -> User:
    return User(
        id=user_id,
        username=f"user-{user_id}",
        first_name="Ikazin",
        last_name="Learner",
        email=f"user-{user_id}@example.com",
        password="secret",
        user_uuid=f"user_{user_id}",
        creation_date=str(datetime.now()),
        update_date=str(datetime.now()),
        details=details or {},
    )


class TestIkazinAccessService:
    def test_activate_ikazin_plan_from_stripe_checkout_assigns_plan(self):
        db_session = Mock()
        user = _make_user(user_id=42)

        with (
            patch(
                "src.services.ikazin.access.resolve_user_for_ikazin_activation",
                return_value=user,
            ),
            patch(
                "src.services.ikazin.access.activate_ikazin_user",
                return_value=_make_user(
                    user_id=42,
                    details={"ikazin_plan": "advanced"},
                ),
            ) as activate_mock,
        ):
            result = activate_ikazin_plan_from_stripe_checkout(
                db_session,
                event_id="evt_123",
                session_id="cs_123",
                metadata={
                    "user_id": "42",
                    "ikazin_plan": "advanced",
                    "stripe_customer_id": "cus_123",
                },
            )

        assert result == {"status": "activated", "user_id": 42, "plan": "advanced"}
        activate_mock.assert_called_once_with(
            db_session,
            user_id=42,
            plan="advanced",
            source="stripe",
            metadata={
                "user_id": "42",
                "ikazin_plan": "advanced",
                "stripe_customer_id": "cus_123",
                "stripe_session_id": "cs_123",
                "stripe_event_id": "evt_123",
            },
        )

    def test_activate_ikazin_plan_from_stripe_checkout_is_idempotent(self):
        db_session = Mock()
        user = _make_user(
            user_id=77,
            details={
                "ikazin_plan": "premium",
                "ikazin_plan_metadata": {
                    "stripe_event_id": "evt_repeat",
                    "stripe_session_id": "cs_repeat",
                },
            },
        )

        with (
            patch(
                "src.services.ikazin.access.resolve_user_for_ikazin_activation",
                return_value=user,
            ),
            patch("src.services.ikazin.access.activate_ikazin_user") as activate_mock,
        ):
            result = activate_ikazin_plan_from_stripe_checkout(
                db_session,
                event_id="evt_repeat",
                session_id="cs_repeat",
                metadata={"user_id": "77", "ikazin_plan": "premium"},
            )

        assert result == {"status": "already_activated", "user_id": 77, "plan": "premium"}
        activate_mock.assert_not_called()

    def test_activate_ikazin_plan_from_stripe_checkout_ignores_invalid_metadata(self):
        result = activate_ikazin_plan_from_stripe_checkout(
            Mock(),
            event_id="evt_missing",
            session_id="cs_missing",
            metadata={"ikazin_plan": "basic"},
        )

        assert result == {
            "status": "ignored",
            "reason": "Missing metadata.user_id or metadata.ikazin_plan",
        }

    def test_activate_ikazin_plan_from_stripe_checkout_ignores_activation_http_errors(self):
        db_session = Mock()
        user = _make_user(user_id=42)

        with (
            patch(
                "src.services.ikazin.access.resolve_user_for_ikazin_activation",
                return_value=user,
            ),
            patch(
                "src.services.ikazin.access.activate_ikazin_user",
                side_effect=HTTPException(status_code=404, detail="User not found"),
            ),
        ):
            result = activate_ikazin_plan_from_stripe_checkout(
                db_session,
                event_id="evt_404",
                session_id="cs_404",
                metadata={"user_id": "42", "ikazin_plan": "basic"},
            )

        assert result == {
            "status": "ignored",
            "reason": "User not found",
            "user_id": 42,
            "plan": "basic",
        }
