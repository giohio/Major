"""empty message

Revision ID: 40389f1646ce
Revises: 20236626d9e7, add_emotion_analysis, merge_session_analysis
Create Date: 2025-12-15 21:26:37.779921

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '40389f1646ce'
down_revision = ('20236626d9e7', 'add_emotion_analysis', 'merge_session_analysis')
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
