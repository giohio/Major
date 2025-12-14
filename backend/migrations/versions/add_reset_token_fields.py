"""Add reset_token fields to User model

Revision ID: add_reset_token
Revises: 584752338d17
Create Date: 2025-11-25 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_reset_token'
down_revision = '584752338d17'
branch_labels = None
depends_on = None


def upgrade():
    # Add reset_token and reset_token_expires columns to users table
    op.add_column('users', sa.Column('reset_token', sa.String(255), nullable=True))
    op.add_column('users', sa.Column('reset_token_expires', sa.DateTime(), nullable=True))


def downgrade():
    # Remove reset_token and reset_token_expires columns from users table
    op.drop_column('users', 'reset_token_expires')
    op.drop_column('users', 'reset_token')
