"""
Chat schemas for request validation
"""

from marshmallow import Schema, fields, validate


class SendMessageSchema(Schema):
    """Schema for sending a chat message"""
    message = fields.Str(
        required=True,
        validate=validate.Length(min=1, max=5000)
    )
    session_id = fields.Int(required=False, allow_none=True)
    analyze_emotion = fields.Bool(required=False, missing=True)


class CreateSessionSchema(Schema):
    """Schema for creating a chat session"""
    title = fields.Str(
        required=False,
        validate=validate.Length(max=255)
    )


class ChatFeedbackSchema(Schema):
    """Schema for chat feedback"""
    message_id = fields.Int(required=True)
    rating = fields.Str(
        required=True,
        validate=validate.OneOf(['positive', 'negative'])
    )
    feedback_text = fields.Str(
        required=False,
        validate=validate.Length(max=1000)
    )
