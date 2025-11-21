"""
Authentication schemas for request validation
"""

from marshmallow import Schema, fields, validate, validates, ValidationError
import re


class RegisterSchema(Schema):
    """Schema for user registration"""
    email = fields.Email(required=True, validate=validate.Length(max=255))
    password = fields.Str(
        required=True,
        validate=validate.Length(min=8, max=100),
        load_only=True
    )
    full_name = fields.Str(required=True, validate=validate.Length(min=2, max=255))
    role = fields.Str(
        required=False,
        validate=validate.OneOf(['user', 'doctor']),
        missing='user'
    )
    phone = fields.Str(required=False, validate=validate.Length(max=20))
    
    @validates('password')
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
    
    @validates('phone')
    def validate_phone(self, value):
        """Validate phone number format"""
        if value and not re.match(r'^\+?[0-9]{10,15}$', value):
            raise ValidationError('Invalid phone number format')


class LoginSchema(Schema):
    """Schema for user login"""
    email = fields.Email(required=True)
    password = fields.Str(required=True, load_only=True)


class VerifyEmailSchema(Schema):
    """Schema for email verification"""
    token = fields.Str(required=True)


class ForgotPasswordSchema(Schema):
    """Schema for forgot password request"""
    email = fields.Email(required=True)


class ResetPasswordSchema(Schema):
    """Schema for password reset"""
    token = fields.Str(required=True)
    new_password = fields.Str(
        required=True,
        validate=validate.Length(min=8, max=100),
        load_only=True
    )
    
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


class RefreshTokenSchema(Schema):
    """Schema for token refresh"""
    refresh_token = fields.Str(required=True)
