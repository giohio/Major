"""
Migration: Merge ChatFeedback into ChatMessage

This migration:
1. Adds feedback columns to chat_messages table
2. Migrates data from chat_feedbacks to chat_messages
3. Drops chat_feedbacks table

Run with: flask db upgrade
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy import text


# Revision identifiers
revision = 'merge_chat_feedback'
down_revision = 'add_appointment_payment_link'  # Chain from latest migration
branch_labels = None
depends_on = None


def upgrade():
    """Add feedback fields to chat_messages and migrate data"""
    
    # Step 1: Add new columns to chat_messages
    with op.batch_alter_table('chat_messages', schema=None) as batch_op:
        batch_op.add_column(sa.Column('rating', sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column('feedback_text', sa.Text(), nullable=True))
        batch_op.add_column(sa.Column('feedback_created_at', sa.DateTime(), nullable=True))
    
    # Step 2: Migrate data from chat_feedbacks to chat_messages
    connection = op.get_bind()
    
    # Check if chat_feedbacks table exists
    inspector = sa.inspect(connection)
    if 'chat_feedbacks' in inspector.get_table_names():
        # Copy feedback data to messages
        connection.execute(text("""
            UPDATE chat_messages
            SET 
                rating = chat_feedbacks.rating,
                feedback_text = chat_feedbacks.feedback_text,
                feedback_created_at = chat_feedbacks.created_at
            FROM chat_feedbacks
            WHERE chat_messages.id = chat_feedbacks.message_id
        """))
        
        print(f"✓ Migrated feedback data from chat_feedbacks to chat_messages")
        
        # Step 3: Drop the old table
        op.drop_table('chat_feedbacks')
        print(f"✓ Dropped chat_feedbacks table")
    else:
        print(f"⚠ chat_feedbacks table not found, skipping migration")


def downgrade():
    """Recreate chat_feedbacks table and restore data"""
    
    # Recreate chat_feedbacks table
    op.create_table('chat_feedbacks',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('message_id', sa.Integer(), nullable=False),
        sa.Column('rating', sa.Integer(), nullable=False),
        sa.Column('feedback_text', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['message_id'], ['chat_messages.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Restore data from chat_messages
    connection = op.get_bind()
    connection.execute(text("""
        INSERT INTO chat_feedbacks (user_id, message_id, rating, feedback_text, created_at)
        SELECT 
            cs.user_id,
            cm.id,
            cm.rating,
            cm.feedback_text,
            cm.feedback_created_at
        FROM chat_messages cm
        JOIN chat_sessions cs ON cm.session_id = cs.id
        WHERE cm.rating IS NOT NULL
    """))
    
    # Remove feedback columns from chat_messages
    with op.batch_alter_table('chat_messages', schema=None) as batch_op:
        batch_op.drop_column('feedback_created_at')
        batch_op.drop_column('feedback_text')
        batch_op.drop_column('rating')
