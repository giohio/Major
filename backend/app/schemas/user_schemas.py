"""
User schemas for request validation
"""

from marshmallow import Schema, fields, validate, validates, ValidationError
import re


class UpdateProfileSchema(Schema):
    """Schema for updating user profile"""
    full_name = fields.Str(required=False, validate=validate.Length(min=2, max=255))
    phone = fields.Str(required=False, validate=validate.Length(max=20))
    date_of_birth = fields.Date(required=False)
    gender = fields.Str(
        required=False,
        validate=validate.OneOf(['male', 'female', 'other'])
    )
    address = fields.Str(required=False, validate=validate.Length(max=500))
    emergency_contact = fields.Str(required=False, validate=validate.Length(max=255))
    
    @validates('phone')
    def validate_phone(self, value):
        """Validate phone number format"""
        if value and not re.match(r'^\+?[0-9]{10,15}$', value):
            raise ValidationError('Invalid phone number format')


class UpdatePasswordSchema(Schema):
    """Schema for updating password"""
    current_password = fields.Str(required=True, load_only=True)
    new_password = fields.Str(
        required=True,
        validate=validate.Length(min=8, max=100),
        load_only=True
    )
    confirm_password = fields.Str(required=True, load_only=True)
    
    @validates('new_password')
    def validate_password(self, value):
        """Validate password strength"""
        if not re.search(r'[A-Z]', value):
            raise ValidationError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', value):
            raise ValidationError('Password must contain at least one lowercase letter')
        if not re.search(r'\d', value):
            raise ValidationError('Password must contain at least one digit')
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', value):
            raise ValidationError('Password must contain at least one special character')


class UpdateAvatarSchema(Schema):
    """Schema for updating avatar"""
    avatar_url = fields.Url(required=True)
