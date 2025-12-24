"""
Migration: Merge Session Analysis Tables

This migration:
1. Creates new session_analysis table
2. Migrates data from session_emotion_analytics
3. Migrates data from clinical_emotion_reports
4. Drops old tables

Run with: flask db upgrade
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy import text
from sqlalchemy.dialects import postgresql


# Revision identifiers
revision = 'merge_session_analysis'
down_revision = 'merge_chat_feedback'  # Run after chat feedback migration
branch_labels = None
depends_on = None


def upgrade():
    """Create unified session_analysis table and migrate data"""
    
    # Step 1: Create new session_analysis table
    op.create_table('session_analysis',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('session_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        
        # Session Summary
        sa.Column('duration_minutes', sa.Integer(), nullable=True),
        sa.Column('total_messages', sa.Integer(), nullable=True),
        sa.Column('user_messages', sa.Integer(), nullable=True),
        
        # Emotion Analysis (Common)
        sa.Column('dominant_emotion', sa.String(length=50), nullable=False),
        sa.Column('emotional_breakdown', sa.JSON(), nullable=True),
        sa.Column('overall_sentiment', sa.Numeric(precision=5, scale=2), nullable=True),
        sa.Column('intensity_average', sa.Numeric(precision=5, scale=2), nullable=True),
        sa.Column('emotional_progression', sa.JSON(), nullable=True),
        sa.Column('emotional_changes', sa.String(length=500), nullable=True),
        
        # Triggers
        sa.Column('triggers_primary', sa.String(length=200), nullable=True),
        sa.Column('triggers_secondary', sa.JSON(), nullable=True),
        
        # Risk Assessment (Combined)
        sa.Column('risk_level', sa.String(length=20), nullable=True),
        sa.Column('risk_flags', sa.JSON(), nullable=True),
        sa.Column('suicidal_ideation', sa.Boolean(), nullable=True, server_default='0'),
        sa.Column('self_harm_risk', sa.Boolean(), nullable=True, server_default='0'),
        sa.Column('severity_level', sa.String(length=20), nullable=True),
        sa.Column('requires_immediate_intervention', sa.Boolean(), nullable=True, server_default='0'),
        sa.Column('risk_notes', sa.Text(), nullable=True),
        
        # Trend
        sa.Column('trend', sa.String(length=20), nullable=True),
        
        # Summary
        sa.Column('simple_summary', sa.Text(), nullable=True),
        sa.Column('clinical_summary', sa.Text(), nullable=True),
        
        # Case Formulation (CBT Framework)
        sa.Column('precipitants', sa.JSON(), nullable=True),
        sa.Column('automatic_thoughts', sa.JSON(), nullable=True),
        sa.Column('maladaptive_behaviors', sa.JSON(), nullable=True),
        sa.Column('core_beliefs', sa.JSON(), nullable=True),
        
        # Clinical Plan
        sa.Column('interventions_used', sa.JSON(), nullable=True),
        sa.Column('recommended_interventions', sa.JSON(), nullable=True),
        sa.Column('next_steps', sa.JSON(), nullable=True),
        sa.Column('follow_up_timeline', sa.String(length=100), nullable=True),
        
        # Doctor Review
        sa.Column('reviewed_by_doctor_id', sa.Integer(), nullable=True),
        sa.Column('doctor_reviewed', sa.Boolean(), nullable=True, server_default='0'),
        sa.Column('doctor_notes', sa.Text(), nullable=True),
        sa.Column('doctor_reviewed_at', sa.DateTime(), nullable=True),
        
        # Metadata
        sa.Column('analyzed_at', sa.DateTime(), nullable=True),
        sa.Column('model_version', sa.String(length=50), nullable=True),
        
        sa.ForeignKeyConstraint(['reviewed_by_doctor_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['session_id'], ['chat_sessions.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes
    with op.batch_alter_table('session_analysis', schema=None) as batch_op:
        batch_op.create_index('ix_session_analysis_session_id', ['session_id'], unique=True)
        batch_op.create_index('ix_session_analysis_user_id', ['user_id'], unique=False)
        batch_op.create_index('ix_session_analysis_dominant_emotion', ['dominant_emotion'], unique=False)
        batch_op.create_index('ix_session_analysis_risk_level', ['risk_level'], unique=False)
        batch_op.create_index('ix_session_analysis_severity_level', ['severity_level'], unique=False)
        batch_op.create_index('ix_session_analysis_suicidal_ideation', ['suicidal_ideation'], unique=False)
        batch_op.create_index('ix_session_analysis_analyzed_at', ['analyzed_at'], unique=False)
    
    connection = op.get_bind()
    inspector = sa.inspect(connection)
    
    # Step 2: Migrate data from session_emotion_analytics
    if 'session_emotion_analytics' in inspector.get_table_names():
        connection.execute(text("""
            INSERT INTO session_analysis (
                session_id, user_id, duration_minutes, total_messages, user_messages,
                dominant_emotion, emotional_breakdown, overall_sentiment, intensity_average,
                emotional_progression, triggers_primary, triggers_secondary,
                risk_level, risk_flags, trend, simple_summary, analyzed_at, model_version
            )
            SELECT 
                session_id, user_id, duration_minutes, total_messages, user_messages,
                dominant_emotion, emotional_breakdown, overall_sentiment, intensity_average,
                emotional_progression, triggers_primary, triggers_secondary,
                risk_level, risk_flags, trend, simple_summary, analyzed_at, model_version
            FROM session_emotion_analytics
        """))
        print(f"✓ Migrated {connection.execute(text('SELECT COUNT(*) FROM session_emotion_analytics')).scalar()} records from session_emotion_analytics")
    
    # Step 3: Update with clinical data from clinical_emotion_reports
    if 'clinical_emotion_reports' in inspector.get_table_names():
        connection.execute(text("""
            UPDATE session_analysis
            SET 
                emotional_changes = cer.emotional_changes,
                suicidal_ideation = cer.suicidal_ideation,
                self_harm_risk = cer.self_harm_risk,
                severity_level = cer.severity_level,
                requires_immediate_intervention = cer.requires_immediate_intervention,
                risk_notes = cer.risk_notes,
                clinical_summary = cer.clinical_summary,
                precipitants = cer.precipitants,
                automatic_thoughts = cer.automatic_thoughts,
                maladaptive_behaviors = cer.maladaptive_behaviors,
                core_beliefs = cer.core_beliefs,
                interventions_used = cer.interventions_used,
                recommended_interventions = cer.recommended_interventions,
                next_steps = cer.next_steps,
                follow_up_timeline = cer.follow_up_timeline,
                reviewed_by_doctor_id = cer.reviewed_by_doctor_id,
                doctor_reviewed = cer.doctor_reviewed,
                doctor_notes = cer.doctor_notes,
                doctor_reviewed_at = cer.doctor_reviewed_at
            FROM clinical_emotion_reports cer
            WHERE session_analysis.session_id = cer.session_id
        """))
        print(f"✓ Merged clinical data from clinical_emotion_reports")
    
    # Step 4: Drop old tables
    if 'session_emotion_analytics' in inspector.get_table_names():
        op.drop_table('session_emotion_analytics')
        print(f"✓ Dropped session_emotion_analytics table")
    
    if 'clinical_emotion_reports' in inspector.get_table_names():
        op.drop_table('clinical_emotion_reports')
        print(f"✓ Dropped clinical_emotion_reports table")


def downgrade():
    """Split session_analysis back into two tables"""
    
    # Recreate session_emotion_analytics
    op.create_table('session_emotion_analytics',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('session_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('duration_minutes', sa.Integer(), nullable=True),
        sa.Column('total_messages', sa.Integer(), nullable=True),
        sa.Column('user_messages', sa.Integer(), nullable=True),
        sa.Column('dominant_emotion', sa.String(length=50), nullable=False),
        sa.Column('emotional_breakdown', sa.JSON(), nullable=True),
        sa.Column('overall_sentiment', sa.Numeric(precision=5, scale=2), nullable=True),
        sa.Column('intensity_average', sa.Numeric(precision=5, scale=2), nullable=True),
        sa.Column('emotional_progression', sa.JSON(), nullable=True),
        sa.Column('triggers_primary', sa.String(length=200), nullable=True),
        sa.Column('triggers_secondary', sa.JSON(), nullable=True),
        sa.Column('risk_level', sa.String(length=20), nullable=True),
        sa.Column('risk_flags', sa.JSON(), nullable=True),
        sa.Column('trend', sa.String(length=20), nullable=True),
        sa.Column('simple_summary', sa.Text(), nullable=True),
        sa.Column('analyzed_at', sa.DateTime(), nullable=True),
        sa.Column('model_version', sa.String(length=50), nullable=True),
        sa.ForeignKeyConstraint(['session_id'], ['chat_sessions.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Recreate clinical_emotion_reports
    op.create_table('clinical_emotion_reports',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('session_id', sa.Integer(), nullable=False),
        sa.Column('patient_id', sa.Integer(), nullable=False),
        sa.Column('reviewed_by_doctor_id', sa.Integer(), nullable=True),
        sa.Column('dominant_emotion', sa.String(length=50), nullable=False),
        sa.Column('emotional_changes', sa.String(length=500), nullable=True),
        sa.Column('precipitants', sa.JSON(), nullable=True),
        sa.Column('automatic_thoughts', sa.JSON(), nullable=True),
        sa.Column('maladaptive_behaviors', sa.JSON(), nullable=True),
        sa.Column('core_beliefs', sa.JSON(), nullable=True),
        sa.Column('suicidal_ideation', sa.Boolean(), nullable=True),
        sa.Column('self_harm_risk', sa.Boolean(), nullable=True),
        sa.Column('severity_level', sa.String(length=20), nullable=False),
        sa.Column('requires_immediate_intervention', sa.Boolean(), nullable=True),
        sa.Column('risk_notes', sa.Text(), nullable=True),
        sa.Column('interventions_used', sa.JSON(), nullable=True),
        sa.Column('recommended_interventions', sa.JSON(), nullable=True),
        sa.Column('next_steps', sa.JSON(), nullable=True),
        sa.Column('follow_up_timeline', sa.String(length=100), nullable=True),
        sa.Column('clinical_summary', sa.Text(), nullable=False),
        sa.Column('analyzed_at', sa.DateTime(), nullable=True),
        sa.Column('model_version', sa.String(length=50), nullable=True),
        sa.Column('doctor_reviewed', sa.Boolean(), nullable=True),
        sa.Column('doctor_notes', sa.Text(), nullable=True),
        sa.Column('doctor_reviewed_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['patient_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['reviewed_by_doctor_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['session_id'], ['chat_sessions.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Restore data
    connection = op.get_bind()
    connection.execute(text("""
        INSERT INTO session_emotion_analytics 
        SELECT id, session_id, user_id, duration_minutes, total_messages, user_messages,
               dominant_emotion, emotional_breakdown, overall_sentiment, intensity_average,
               emotional_progression, triggers_primary, triggers_secondary,
               risk_level, risk_flags, trend, simple_summary, analyzed_at, model_version
        FROM session_analysis
    """))
    
    connection.execute(text("""
        INSERT INTO clinical_emotion_reports 
        SELECT id, session_id, user_id, reviewed_by_doctor_id,
               dominant_emotion, emotional_changes, precipitants, automatic_thoughts,
               maladaptive_behaviors, core_beliefs, suicidal_ideation, self_harm_risk,
               severity_level, requires_immediate_intervention, risk_notes,
               interventions_used, recommended_interventions, next_steps, follow_up_timeline,
               clinical_summary, analyzed_at, model_version, doctor_reviewed,
               doctor_notes, doctor_reviewed_at
        FROM session_analysis
        WHERE clinical_summary IS NOT NULL
    """))
    
    # Drop unified table
    op.drop_table('session_analysis')
