"""
Payment schemas for request validation
"""

from marshmallow import Schema, fields, validate


class CreatePaymentSchema(Schema):
    """Schema for creating a payment"""
    amount = fields.Decimal(required=True, places=2, as_string=True)
    payment_method = fields.Str(
        required=True,
        validate=validate.OneOf(['vnpay', 'stripe', 'bank_transfer'])
    )
    payment_type = fields.Str(
        required=True,
        validate=validate.OneOf(['subscription', 'one_time'])
    )
    plan_id = fields.Int(required=False, allow_none=True)
    description = fields.Str(
        required=False,
        validate=validate.Length(max=500)
    )
    return_url = fields.Url(required=False)


class VerifyPaymentSchema(Schema):
    """Schema for verifying payment"""
    transaction_id = fields.Str(required=True)
    payment_method = fields.Str(
        required=True,
        validate=validate.OneOf(['vnpay', 'stripe', 'bank_transfer'])
    )
    # VNPay specific fields
    vnp_ResponseCode = fields.Str(required=False)
    vnp_TransactionNo = fields.Str(required=False)
    vnp_SecureHash = fields.Str(required=False)
    # Stripe specific fields
    stripe_payment_intent = fields.Str(required=False)


class RefundPaymentSchema(Schema):
    """Schema for refunding payment"""
    payment_id = fields.Int(required=True)
    amount = fields.Decimal(required=False, places=2, as_string=True)
    reason = fields.Str(
        required=True,
        validate=validate.Length(min=10, max=500)
    )
