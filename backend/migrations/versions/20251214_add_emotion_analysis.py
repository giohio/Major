"""Add EmotionAnalysis table

Revision ID: add_emotion_analysis
Revises: 
Create Date: 2025-12-14

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_emotion_analysis'
down_revision = '584752338d17'  # initial_migration_with_all_models
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('emotion_analyses',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('dominant_emotion', sa.String(length=50), nullable=False),
    sa.Column('emotional_breakdown', sa.JSON(), nullable=True),
    sa.Column('overall_sentiment', sa.Numeric(precision=5, scale=2), nullable=False),
    sa.Column('intensity_average', sa.Numeric(precision=5, scale=2), nullable=False),
    sa.Column('emotional_progression', sa.JSON(), nullable=True),
    sa.Column('trend', sa.String(length=20), nullable=False),
    sa.Column('triggers', sa.JSON(), nullable=True),
    sa.Column('summary_message', sa.Text(), nullable=True),
    sa.Column('message_count', sa.Integer(), nullable=True),
    sa.Column('analysis_source', sa.String(length=50), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_emotion_analyses_created_at'), 'emotion_analyses', ['created_at'], unique=False)
    op.create_index(op.f('ix_emotion_analyses_user_id'), 'emotion_analyses', ['user_id'], unique=False)


def downgrade():
    op.drop_index(op.f('ix_emotion_analyses_user_id'), table_name='emotion_analyses')
    op.drop_index(op.f('ix_emotion_analyses_created_at'), table_name='emotion_analyses')
    op.drop_table('emotion_analyses')
