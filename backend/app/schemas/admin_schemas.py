"""
Admin schemas for request validation
"""

from marshmallow import Schema, fields, validate, validates, ValidationError
import re


class CreateUserSchema(Schema):
    """Schema for admin creating a user"""
    email = fields.Email(required=True, validate=validate.Length(max=255))
    password = fields.Str(
        required=True,
        validate=validate.Length(min=8, max=100),
        load_only=True
    )
    full_name = fields.Str(required=True, validate=validate.Length(min=2, max=255))
    role = fields.Str(
        required=True,
        validate=validate.OneOf(['user', 'doctor', 'admin'])
    )
    phone = fields.Str(required=False, validate=validate.Length(max=20))
    is_verified = fields.Bool(required=False, missing=False)
    
    @validates('password')
    def validate_password(self, value):
        """Validate password strength"""
        if not re.search(r'[A-Z]', value):
            raise ValidationError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', value):
            raise ValidationError('Password must contain at least one lowercase letter')
        if not re.search(r'\d', value):
            raise ValidationError('Password must contain at least one digit')


class UpdateUserSchema(Schema):
    """Schema for admin updating a user"""
    full_name = fields.Str(required=False, validate=validate.Length(min=2, max=255))
    phone = fields.Str(required=False, validate=validate.Length(max=20))
    role = fields.Str(
        required=False,
        validate=validate.OneOf(['user', 'doctor', 'admin'])
    )
    is_verified = fields.Bool(required=False)
    is_active = fields.Bool(required=False)
    subscription_plan = fields.Str(required=False)
    subscription_status = fields.Str(
        required=False,
        validate=validate.OneOf(['active', 'expired', 'cancelled'])
    )


class CreatePlanSchema(Schema):
    """Schema for creating a subscription plan"""
    name = fields.Str(
        required=True,
        validate=validate.Length(min=2, max=100)
    )
    description = fields.Str(
        required=False,
        validate=validate.Length(max=500)
    )
    price_monthly = fields.Decimal(required=True, places=2, as_string=True)
    price_yearly = fields.Decimal(required=False, places=2, as_string=True)
    plan_type = fields.Str(
        required=True,
        validate=validate.OneOf(['user', 'doctor'])
    )
    chat_limit = fields.Int(required=False, missing=-1)
    voice_enabled = fields.Bool(required=False, missing=False)
    video_enabled = fields.Bool(required=False, missing=False)
    empathy_layer_enabled = fields.Bool(required=False, missing=False)
    doctor_access = fields.Bool(required=False, missing=False)
    priority_support = fields.Bool(required=False, missing=False)
    patient_limit = fields.Int(required=False, missing=-1)
    analytics_enabled = fields.Bool(required=False, missing=False)
    is_active = fields.Bool(required=False, missing=True)


class UpdatePlanSchema(Schema):
    """Schema for updating a subscription plan"""
    name = fields.Str(
        required=False,
        validate=validate.Length(min=2, max=100)
    )
    description = fields.Str(
        required=False,
        validate=validate.Length(max=500)
    )
    price_monthly = fields.Decimal(required=False, places=2, as_string=True)
    price_yearly = fields.Decimal(required=False, places=2, as_string=True)
    chat_limit = fields.Int(required=False)
    voice_enabled = fields.Bool(required=False)
    video_enabled = fields.Bool(required=False)
    empathy_layer_enabled = fields.Bool(required=False)
    doctor_access = fields.Bool(required=False)
    priority_support = fields.Bool(required=False)
    patient_limit = fields.Int(required=False)
    analytics_enabled = fields.Bool(required=False)
    is_active = fields.Bool(required=False)


class CreateAIModelSchema(Schema):
    """Schema for creating an AI model configuration"""
    name = fields.Str(
        required=True,
        validate=validate.Length(min=2, max=100)
    )
    model_type = fields.Str(
        required=True,
        validate=validate.OneOf(['gemini', 'openai', 'claude', 'custom'])
    )
    model_version = fields.Str(
        required=True,
        validate=validate.Length(max=50)
    )
    description = fields.Str(
        required=False,
        validate=validate.Length(max=500)
    )
    api_endpoint = fields.Url(required=False)
    is_active = fields.Bool(required=False, missing=True)
    is_default = fields.Bool(required=False, missing=False)


class UpdateAIModelSchema(Schema):
    """Schema for updating an AI model configuration"""
    name = fields.Str(
        required=False,
        validate=validate.Length(min=2, max=100)
    )
    model_version = fields.Str(
        required=False,
        validate=validate.Length(max=50)
    )
    description = fields.Str(
        required=False,
        validate=validate.Length(max=500)
    )
    api_endpoint = fields.Url(required=False)
    is_active = fields.Bool(required=False)
    is_default = fields.Bool(required=False)
