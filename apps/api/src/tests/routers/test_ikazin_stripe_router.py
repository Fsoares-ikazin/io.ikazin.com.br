"""Router tests for src/routers/ikazin_stripe.py."""

from unittest.mock import Mock, patch

import pytest
import stripe
from fastapi import HTTPException
from starlette.requests import Request

from src.routers.ikazin_stripe import stripe_webhook


def _make_request(body: bytes = b"{}") -> Request:
    async def receive():
        return {"type": "http.request", "body": body, "more_body": False}

    return Request({"type": "http", "method": "POST", "headers": []}, receive)


class TestIkazinStripeRouter:
    async def test_webhook_activates_checkout_session(self, monkeypatch):
        db_session = Mock()
        monkeypatch.setenv("STRIPE_SECRET_KEY", "sk_test_123")
        monkeypatch.setenv("STRIPE_WEBHOOK_SECRET", "whsec_test_123")
        event = {
            "id": "evt_123",
            "type": "checkout.session.completed",
            "data": {
                "object": {
                    "id": "cs_test_123",
                    "customer": "cus_123",
                    "payment_status": "paid",
                    "metadata": {"user_id": "42", "ikazin_plan": "advanced"},
                }
            },
        }

        with (
            patch(
                "src.routers.ikazin_stripe.stripe.Webhook.construct_event",
                return_value=event,
            ),
            patch(
                "src.routers.ikazin_stripe.activate_ikazin_plan_from_stripe_checkout",
                return_value={"status": "activated", "user_id": 42, "plan": "advanced"},
            ) as activate_mock,
        ):
            response = await stripe_webhook(
                _make_request(),
                stripe_signature="t=1,v1=test",
                db_session=db_session,
            )

        assert response == {
            "ok": True,
            "status": "activated",
            "user_id": 42,
            "plan": "advanced",
        }
        activate_mock.assert_called_once_with(
            db_session,
            event_id="evt_123",
            session_id="cs_test_123",
            metadata={
                "user_id": "42",
                "ikazin_plan": "advanced",
                "stripe_customer_id": "cus_123",
                "stripe_payment_status": "paid",
            },
        )

    async def test_webhook_is_idempotent_for_same_event(self, monkeypatch):
        monkeypatch.setenv("STRIPE_SECRET_KEY", "sk_test_123")
        monkeypatch.setenv("STRIPE_WEBHOOK_SECRET", "whsec_test_123")

        with (
            patch(
                "src.routers.ikazin_stripe.stripe.Webhook.construct_event",
                return_value={
                    "id": "evt_repeat",
                    "type": "checkout.session.completed",
                    "data": {"object": {"id": "cs_repeat", "metadata": {}}},
                },
            ),
            patch(
                "src.routers.ikazin_stripe.activate_ikazin_plan_from_stripe_checkout",
                return_value={"status": "already_activated", "user_id": 77, "plan": "premium"},
            ),
        ):
            response = await stripe_webhook(
                _make_request(),
                stripe_signature="t=1,v1=test",
                db_session=Mock(),
            )

        assert response["status"] == "already_activated"

    async def test_webhook_ignores_non_checkout_events(self, monkeypatch):
        monkeypatch.setenv("STRIPE_SECRET_KEY", "sk_test_123")
        monkeypatch.setenv("STRIPE_WEBHOOK_SECRET", "whsec_test_123")

        with patch(
            "src.routers.ikazin_stripe.stripe.Webhook.construct_event",
            return_value={"id": "evt_ignored", "type": "payment_intent.succeeded"},
        ):
            response = await stripe_webhook(
                _make_request(),
                stripe_signature="t=1,v1=test",
                db_session=Mock(),
            )

        assert response == {
            "ok": True,
            "status": "ignored",
            "event_type": "payment_intent.succeeded",
        }

    async def test_webhook_rejects_invalid_signature(self, monkeypatch):
        monkeypatch.setenv("STRIPE_SECRET_KEY", "sk_test_123")
        monkeypatch.setenv("STRIPE_WEBHOOK_SECRET", "whsec_test_123")

        with patch(
            "src.routers.ikazin_stripe.stripe.Webhook.construct_event",
            side_effect=stripe.SignatureVerificationError("invalid signature", "t=1,v1=bad"),
        ):
            with pytest.raises(HTTPException) as exc:
                await stripe_webhook(
                    _make_request(),
                    stripe_signature="t=1,v1=bad",
                    db_session=Mock(),
                )

        assert exc.value.status_code == 400
        assert exc.value.detail == "Invalid Stripe signature"
