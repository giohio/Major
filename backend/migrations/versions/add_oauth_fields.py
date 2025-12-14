"""Add OAuth fields to User model

Revision ID: add_oauth_fields
Revises: add_reset_token
Create Date: 2025-11-25 04:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_oauth_fields'
down_revision = 'add_reset_token'
branch_labels = None
depends_on = None


def upgrade():
    # Add OAuth fields
    op.add_column('users', sa.Column('oauth_provider', sa.String(length=20), nullable=True))
    op.add_column('users', sa.Column('oauth_uid', sa.String(length=255), nullable=True))


def downgrade():
    # Remove OAuth fields
    op.drop_column('users', 'oauth_uid')
    op.drop_column('users', 'oauth_provider')
