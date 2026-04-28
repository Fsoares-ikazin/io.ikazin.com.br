"""Add builds table

Revision ID: b2c3d4e5f601
Revises: z5a6b7c8d9e0
Create Date: 2026-04-27

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel  # noqa: F401

revision: str = 'b2c3d4e5f601'
down_revision: Union[str, None] = 'z5a6b7c8d9e0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'build',
        sa.Column('number', sa.Integer(), nullable=False),
        sa.Column('tier', sa.String(), nullable=False),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('exe_key', sa.String(length=500), nullable=True),
        sa.Column('tia_key', sa.String(length=500), nullable=True),
        sa.Column('youtube_url', sa.String(length=500), nullable=True),
        sa.Column('tutorial_md', sa.Text(), nullable=True),
        sa.Column('thumbnail_key', sa.String(length=500), nullable=True),
        sa.Column('published', sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('build_uuid', sqlmodel.AutoString(), nullable=False),
        sa.Column('creation_date', sqlmodel.AutoString(), nullable=False),
        sa.Column('update_date', sqlmodel.AutoString(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('build_uuid'),
        sa.UniqueConstraint('number'),
    )
    op.create_index('ix_build_build_uuid', 'build', ['build_uuid'])
    op.create_index('ix_build_number', 'build', ['number'])


def downgrade() -> None:
    op.drop_index('ix_build_number', table_name='build')
    op.drop_index('ix_build_build_uuid', table_name='build')
    op.drop_table('build')
