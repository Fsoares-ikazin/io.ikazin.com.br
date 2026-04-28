import os
import sys
import uuid
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlmodel import Session, create_engine, select
from src.db.builds import Build, TierSlug

BUILDS = [
    # BASIC B1-B8
    dict(number=1,  tier=TierSlug.BASIC,      title="Boolean Logic Fundamentals"),
    dict(number=2,  tier=TierSlug.BASIC,      title="Timer & Counter Basics"),
    dict(number=3,  tier=TierSlug.BASIC,      title="Motion Axis Fundamentals"),
    dict(number=4,  tier=TierSlug.BASIC,      title="Sensor Integration (Digital/Analog)"),
    dict(number=5,  tier=TierSlug.BASIC,      title="HMI Basic Screens"),
    dict(number=6,  tier=TierSlug.BASIC,      title="Safety PLCopen Basics"),
    dict(number=7,  tier=TierSlug.BASIC,      title="Drive Commissioning V/F"),
    dict(number=8,  tier=TierSlug.BASIC,      title="Fieldbus Intro (PROFINET)"),
    # ESSENTIALS B9-B13
    dict(number=9,  tier=TierSlug.ESSENTIALS, title="PID Control Loop"),
    dict(number=10, tier=TierSlug.ESSENTIALS, title="Cam Profile Basics"),
    dict(number=11, tier=TierSlug.ESSENTIALS, title="Synchronized Axes"),
    dict(number=12, tier=TierSlug.ESSENTIALS, title="Flying Shear"),
    dict(number=13, tier=TierSlug.ESSENTIALS, title="Conveyor + Reject System"),
    # ADVANCED B14-B18
    dict(number=14, tier=TierSlug.ADVANCED,   title="SINAMICS S120 Commissioning"),
    dict(number=15, tier=TierSlug.ADVANCED,   title="Multi-Axis Coordinated Motion"),
    dict(number=16, tier=TierSlug.ADVANCED,   title="CNC G-Code Interpreter"),
    dict(number=17, tier=TierSlug.ADVANCED,   title="Rotary Knife (cam profiles, synchronized cut)"),
    dict(number=18, tier=TierSlug.ADVANCED,   title="Winding/Unwinding Tension Control"),
    # PREMIUM B19-B25
    dict(number=19, tier=TierSlug.PREMIUM,    title="Complete Packaging Machine"),
    dict(number=20, tier=TierSlug.PREMIUM,    title="Robot Cell Integration (KUKA/ABB)"),
    dict(number=21, tier=TierSlug.PREMIUM,    title="Vision System + Reject"),
    dict(number=22, tier=TierSlug.PREMIUM,    title="SIMOTION D Advanced"),
    dict(number=23, tier=TierSlug.PREMIUM,    title="OPC-UA Data Layer"),
    dict(number=24, tier=TierSlug.PREMIUM,    title="Digital Twin Commissioning"),
    dict(number=25, tier=TierSlug.PREMIUM,    title="Integrated OEM Machine"),
]

def main():
    conn = os.environ.get("LEARNHOUSE_SQL_CONNECTION_STRING")
    if not conn:
        print("ERROR: LEARNHOUSE_SQL_CONNECTION_STRING is not set")
        sys.exit(1)

    engine = create_engine(conn)
    now = datetime.utcnow().isoformat()
    inserted = 0
    skipped = 0

    with Session(engine) as session:
        for data in BUILDS:
            existing = session.exec(
                select(Build).where(Build.number == data["number"])
            ).first()
            if existing:
                skipped += 1
                continue
            build = Build(
                **data,
                build_uuid=str(uuid.uuid4()),
                description=None,
                exe_key=None,
                tia_key=None,
                youtube_url=None,
                tutorial_md=None,
                thumbnail_key=None,
                published=True,
                creation_date=now,
                update_date=now,
            )
            session.add(build)
            inserted += 1
        session.commit()

    print(f"Done - {inserted} inserted, {skipped} skipped")

if __name__ == "__main__":
    main()
