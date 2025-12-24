"""Add payment_id to appointments and update payment model

Revision ID: add_appointment_payment_link
Revises: 
Create Date: 2025-12-13

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_appointment_payment_link'
down_revision = '08d55e7a5f2c'  # Previous migration
branch_labels = None
depends_on = None


def upgrade():
    # Add payment_id to appointments table
    op.add_column('appointments', sa.Column('payment_id', sa.Integer(), nullable=True))
    op.create_index(op.f('ix_appointments_payment_id'), 'appointments', ['payment_id'], unique=False)
    op.create_foreign_key('fk_appointments_payment_id', 'appointments', 'payments', ['payment_id'], ['id'])
    
    # Modify default status for appointments
    op.alter_column('appointments', 'status',
               existing_type=sa.VARCHAR(length=20),
               server_default='pending_payment',
               existing_nullable=True)
    
    # Update payments table - make plan_id nullable and add payment_type
    op.alter_column('payments', 'plan_id',
               existing_type=sa.INTEGER(),
               nullable=True)
    
    op.add_column('payments', sa.Column('payment_type', sa.String(length=20), nullable=False, server_default='subscription'))
    
    # Make billing_cycle nullable (not required for appointment payments)
    op.alter_column('payments', 'billing_cycle',
               existing_type=sa.VARCHAR(length=20),
               nullable=True)


def downgrade():
    # Remove payment_type from payments
    op.drop_column('payments', 'payment_type')
    
    # Revert billing_cycle to not nullable
    op.alter_column('payments', 'billing_cycle',
               existing_type=sa.VARCHAR(length=20),
               nullable=False)
    
    # Revert plan_id to not nullable
    op.alter_column('payments', 'plan_id',
               existing_type=sa.INTEGER(),
               nullable=False)
    
    # Revert appointment status default
    op.alter_column('appointments', 'status',
               existing_type=sa.VARCHAR(length=20),
               server_default='scheduled',
               existing_nullable=True)
    
    # Remove payment_id from appointments
    op.drop_constraint('fk_appointments_payment_id', 'appointments', type_='foreignkey')
    op.drop_index(op.f('ix_appointments_payment_id'), table_name='appointments')
    op.drop_column('appointments', 'payment_id')
