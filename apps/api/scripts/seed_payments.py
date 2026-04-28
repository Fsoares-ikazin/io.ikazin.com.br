"""
Seed payment groups and offers for IKAZIN.IO tiers.
Creates:
  - 1 PaymentsConfig (Stripe, inactive — fill Stripe keys later)
  - 4 PaymentsGroup  (one per tier)
  - N PaymentsGroupResource (each build → its tier group)
  - 4 PaymentsOffer  (BRL prices, one per tier)

Idempotent — skips records that already exist by name/slug.

Usage:
    cd apps/api
    LEARNHOUSE_SQL_CONNECTION_STRING=postgresql://... uv run python scripts/seed_payments.py

To grant a user access manually (testing without Stripe):
    LEARNHOUSE_SQL_CONNECTION_STRING=... uv run python scripts/seed_payments.py --enroll user@email.com basic
"""
import os
import sys
import argparse
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlmodel import Session, create_engine, select
from ee.db.payments.payments import PaymentsConfig, PaymentProviderEnum, PaymentsModeEnum
from ee.db.payments.payments_groups import PaymentsGroup, PaymentsGroupResource
from ee.db.payments.payments_offers import PaymentsOffer, OfferTypeEnum, OfferPriceTypeEnum
from ee.db.payments.payments_enrollments import PaymentsEnrollment, EnrollmentStatusEnum
from src.db.builds import Build, TierSlug
from src.db.users import User

ORG_ID = 1

TIERS = [
    dict(slug=TierSlug.BASIC,      name="BASIC",      amount=399.0,  currency="BRL"),
    dict(slug=TierSlug.ESSENTIALS, name="ESSENTIALS",  amount=699.0,  currency="BRL"),
    dict(slug=TierSlug.ADVANCED,   name="ADVANCED",    amount=899.0,  currency="BRL"),
    dict(slug=TierSlug.PREMIUM,    name="PREMIUM",     amount=1199.0, currency="BRL"),
]


def get_or_create_config(session: Session) -> PaymentsConfig:
    cfg = session.exec(
        select(PaymentsConfig).where(PaymentsConfig.org_id == ORG_ID)
    ).first()
    if cfg:
        return cfg
    cfg = PaymentsConfig(
        org_id=ORG_ID,
        enabled=True,
        active=False,
        provider=PaymentProviderEnum.STRIPE,
        mode=PaymentsModeEnum.standard,
    )
    session.add(cfg)
    session.flush()
    print(f"  created PaymentsConfig id={cfg.id}")
    return cfg


def seed_tier(session: Session, config: PaymentsConfig, tier_data: dict, builds: list[Build]) -> PaymentsOffer:
    slug = tier_data["slug"]
    name = tier_data["name"]

    # PaymentsGroup
    group = session.exec(
        select(PaymentsGroup).where(
            PaymentsGroup.org_id == ORG_ID,
            PaymentsGroup.name == f"IKAZIN {name}",
        )
    ).first()
    if not group:
        group = PaymentsGroup(
            org_id=ORG_ID,
            name=f"IKAZIN {name}",
            description=f"Builds do tier {name}",
        )
        session.add(group)
        session.flush()
        print(f"  created PaymentsGroup '{group.name}' id={group.id}")
    else:
        print(f"  skip PaymentsGroup '{group.name}' (exists)")

    # PaymentsGroupResource per build
    tier_builds = [b for b in builds if b.tier == slug]
    for build in tier_builds:
        existing = session.exec(
            select(PaymentsGroupResource).where(
                PaymentsGroupResource.payments_group_id == group.id,
                PaymentsGroupResource.resource_uuid == build.build_uuid,
            )
        ).first()
        if not existing:
            session.add(PaymentsGroupResource(
                payments_group_id=group.id,
                resource_uuid=build.build_uuid,
                org_id=ORG_ID,
            ))
    session.flush()
    print(f"  linked {len(tier_builds)} builds to group '{group.name}'")

    # PaymentsOffer
    offer = session.exec(
        select(PaymentsOffer).where(
            PaymentsOffer.org_id == ORG_ID,
            PaymentsOffer.name == f"IKAZIN {name}",
        )
    ).first()
    if not offer:
        offer = PaymentsOffer(
            org_id=ORG_ID,
            payments_config_id=config.id,
            payments_group_id=group.id,
            name=f"IKAZIN {name}",
            description=f"Acesso vitalício ao tier {name}",
            offer_type=OfferTypeEnum.ONE_TIME,
            price_type=OfferPriceTypeEnum.FIXED_PRICE,
            amount=tier_data["amount"],
            currency=tier_data["currency"],
            is_publicly_listed=True,
        )
        session.add(offer)
        session.flush()
        print(f"  created PaymentsOffer '{offer.name}' R${offer.amount} id={offer.id}")
    else:
        print(f"  skip PaymentsOffer '{offer.name}' (exists)")

    return offer


def enroll_user(session: Session, email: str, tier_slug: str) -> None:
    user = session.exec(select(User).where(User.email == email)).first()
    if not user:
        print(f"ERROR: user '{email}' not found")
        return

    offer = session.exec(
        select(PaymentsOffer).where(
            PaymentsOffer.org_id == ORG_ID,
            PaymentsOffer.name == f"IKAZIN {tier_slug.upper()}",
        )
    ).first()
    if not offer:
        print(f"ERROR: offer for tier '{tier_slug}' not found — run seed first")
        return

    existing = session.exec(
        select(PaymentsEnrollment).where(
            PaymentsEnrollment.offer_id == offer.id,
            PaymentsEnrollment.user_id == user.id,
        )
    ).first()
    if existing:
        print(f"  user '{email}' already enrolled in {tier_slug.upper()}")
        return

    enrollment = PaymentsEnrollment(
        offer_id=offer.id,
        user_id=user.id,
        org_id=ORG_ID,
        status=EnrollmentStatusEnum.ACTIVE,
    )
    session.add(enrollment)
    session.commit()
    print(f"  enrolled '{email}' in {tier_slug.upper()} (ACTIVE)")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--enroll", nargs=2, metavar=("EMAIL", "TIER"),
                        help="Manually grant tier access to a user (e.g. --enroll user@x.com basic)")
    args = parser.parse_args()

    conn = os.environ.get("LEARNHOUSE_SQL_CONNECTION_STRING")
    if not conn:
        print("ERROR: LEARNHOUSE_SQL_CONNECTION_STRING is not set")
        sys.exit(1)

    engine = create_engine(conn)

    with Session(engine) as session:
        if args.enroll:
            enroll_user(session, args.enroll[0], args.enroll[1])
            return

        builds = session.exec(select(Build).order_by(Build.number)).all()
        if not builds:
            print("ERROR: no builds found — run seed_builds.py first")
            sys.exit(1)

        print("=== PaymentsConfig ===")
        config = get_or_create_config(session)

        for tier_data in TIERS:
            print(f"\n=== Tier {tier_data['name']} ===")
            seed_tier(session, config, tier_data, builds)

        session.commit()
        print("\nDone.")


if __name__ == "__main__":
    main()
