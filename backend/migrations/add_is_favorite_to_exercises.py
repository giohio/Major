"""
Database migration script to add is_favorite column to user_exercise_progress table
"""

from alembic import op
import sqlalchemy as sa


def upgrade():
    # Add is_favorite column to user_exercise_progress table
    op.add_column('user_exercise_progress',
        sa.Column('is_favorite', sa.Boolean(), nullable=True, server_default='0')
    )
    

def downgrade():
    # Remove is_favorite column
    op.drop_column('user_exercise_progress', 'is_favorite')
