"""
Patient schemas for request validation
"""

from marshmallow import Schema, fields, validate


class CreatePatientRecordSchema(Schema):
    """Schema for creating a patient record"""
    diagnosis = fields.Str(
        required=True,
        validate=validate.Length(min=5, max=1000)
    )
    symptoms = fields.Str(
        required=False,
        validate=validate.Length(max=2000)
    )
    treatment_plan = fields.Str(
        required=False,
        validate=validate.Length(max=2000)
    )
    medications = fields.Str(
        required=False,
        validate=validate.Length(max=1000)
    )
    allergies = fields.Str(
        required=False,
        validate=validate.Length(max=500)
    )
    medical_history = fields.Str(
        required=False,
        validate=validate.Length(max=3000)
    )
    notes = fields.Str(
        required=False,
        validate=validate.Length(max=2000)
    )


class UpdatePatientRecordSchema(Schema):
    """Schema for updating a patient record"""
    diagnosis = fields.Str(
        required=False,
        validate=validate.Length(min=5, max=1000)
    )
    symptoms = fields.Str(
        required=False,
        validate=validate.Length(max=2000)
    )
    treatment_plan = fields.Str(
        required=False,
        validate=validate.Length(max=2000)
    )
    medications = fields.Str(
        required=False,
        validate=validate.Length(max=1000)
    )
    allergies = fields.Str(
        required=False,
        validate=validate.Length(max=500)
    )
    medical_history = fields.Str(
        required=False,
        validate=validate.Length(max=3000)
    )
    notes = fields.Str(
        required=False,
        validate=validate.Length(max=2000)
    )
    status = fields.Str(
        required=False,
        validate=validate.OneOf(['active', 'inactive', 'completed'])
    )


class CreatePsychologicalTestSchema(Schema):
    """Schema for creating a psychological test"""
    test_name = fields.Str(
        required=True,
        validate=validate.Length(min=3, max=255)
    )
    test_type = fields.Str(
        required=True,
        validate=validate.OneOf(['depression', 'anxiety', 'stress', 'personality', 'cognitive', 'other'])
    )
    description = fields.Str(
        required=False,
        validate=validate.Length(max=1000)
    )
    questions = fields.List(
        fields.Dict(required=True),
        required=True,
        validate=validate.Length(min=1)
    )


class SubmitTestResponseSchema(Schema):
    """Schema for submitting test response"""
    test_id = fields.Int(required=True)
    responses = fields.Dict(required=True)
    completed_at = fields.DateTime(required=False)
