"""
Plan schemas for request validation
"""

from marshmallow import Schema, fields, validate


class SubscribePlanSchema(Schema):
    """Schema for subscribing to a plan"""
    plan_id = fields.Int(required=True)
    billing_cycle = fields.Str(
        required=True,
        validate=validate.OneOf(['monthly', 'yearly'])
    )
    payment_method = fields.Str(
        required=True,
        validate=validate.OneOf(['vnpay', 'stripe', 'bank_transfer'])
    )
    return_url = fields.Url(required=False)


class UpdatePlanSchema(Schema):
    """Schema for updating plan subscription"""
    plan_id = fields.Int(required=True)
    billing_cycle = fields.Str(
        required=False,
        validate=validate.OneOf(['monthly', 'yearly'])
    )
