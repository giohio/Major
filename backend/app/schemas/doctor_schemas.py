"""
Doctor schemas for request validation
"""

from marshmallow import Schema, fields, validate


class CreateNoteSchema(Schema):
    """Schema for creating a doctor note"""
    patient_id = fields.Int(required=True)
    note_type = fields.Str(
        required=True,
        validate=validate.OneOf(['diagnosis', 'observation', 'prescription', 'treatment', 'general'])
    )
    content = fields.Str(
        required=True,
        validate=validate.Length(min=10, max=5000)
    )
    is_private = fields.Bool(required=False, missing=False)


class UpdateNoteSchema(Schema):
    """Schema for updating a doctor note"""
    note_type = fields.Str(
        required=False,
        validate=validate.OneOf(['diagnosis', 'observation', 'prescription', 'treatment', 'general'])
    )
    content = fields.Str(
        required=False,
        validate=validate.Length(min=10, max=5000)
    )
    is_private = fields.Bool(required=False)


class CreateTaskSchema(Schema):
    """Schema for creating a task"""
    patient_id = fields.Int(required=True)
    title = fields.Str(
        required=True,
        validate=validate.Length(min=3, max=255)
    )
    description = fields.Str(
        required=False,
        validate=validate.Length(max=1000)
    )
    task_type = fields.Str(
        required=True,
        validate=validate.OneOf(['medication', 'exercise', 'therapy', 'assessment', 'follow_up'])
    )
    due_date = fields.DateTime(required=False)
    priority = fields.Str(
        required=False,
        validate=validate.OneOf(['low', 'medium', 'high', 'urgent']),
        missing='medium'
    )


class UpdateTaskSchema(Schema):
    """Schema for updating a task"""
    title = fields.Str(
        required=False,
        validate=validate.Length(min=3, max=255)
    )
    description = fields.Str(
        required=False,
        validate=validate.Length(max=1000)
    )
    status = fields.Str(
        required=False,
        validate=validate.OneOf(['pending', 'in_progress', 'completed', 'cancelled'])
    )
    priority = fields.Str(
        required=False,
        validate=validate.OneOf(['low', 'medium', 'high', 'urgent'])
    )
    due_date = fields.DateTime(required=False)


class CreateTherapySessionSchema(Schema):
    """Schema for creating a therapy session"""
    patient_id = fields.Int(required=True)
    session_type = fields.Str(
        required=True,
        validate=validate.OneOf(['individual', 'group', 'family', 'couple', 'online'])
    )
    scheduled_at = fields.DateTime(required=True)
    duration_minutes = fields.Int(
        required=False,
        validate=validate.Range(min=15, max=240),
        missing=60
    )
    notes = fields.Str(
        required=False,
        validate=validate.Length(max=2000)
    )


class UpdateTherapySessionSchema(Schema):
    """Schema for updating a therapy session"""
    session_type = fields.Str(
        required=False,
        validate=validate.OneOf(['individual', 'group', 'family', 'couple', 'online'])
    )
    scheduled_at = fields.DateTime(required=False)
    status = fields.Str(
        required=False,
        validate=validate.OneOf(['scheduled', 'completed', 'cancelled', 'no_show'])
    )
    duration_minutes = fields.Int(
        required=False,
        validate=validate.Range(min=15, max=240)
    )
    notes = fields.Str(
        required=False,
        validate=validate.Length(max=2000)
    )


class CreateAppointmentSchema(Schema):
    """Schema for creating an appointment"""
    patient_id = fields.Int(required=True)
    appointment_type = fields.Str(
        required=True,
        validate=validate.OneOf(['initial', 'follow_up', 'emergency', 'consultation'])
    )
    scheduled_at = fields.DateTime(required=True)
    duration_minutes = fields.Int(
        required=False,
        validate=validate.Range(min=15, max=180),
        missing=30
    )
    notes = fields.Str(
        required=False,
        validate=validate.Length(max=1000)
    )


class UpdateAppointmentSchema(Schema):
    """Schema for updating an appointment"""
    scheduled_at = fields.DateTime(required=False)
    status = fields.Str(
        required=False,
        validate=validate.OneOf(['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'])
    )
    duration_minutes = fields.Int(
        required=False,
        validate=validate.Range(min=15, max=180)
    )
    notes = fields.Str(
        required=False,
        validate=validate.Length(max=1000)
    )
