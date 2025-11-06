"""
Schemas package for request/response validation
"""

from .auth_schemas import (
    RegisterSchema,
    LoginSchema,
    VerifyEmailSchema,
    ForgotPasswordSchema,
    ResetPasswordSchema,
    RefreshTokenSchema
)

from .user_schemas import (
    UpdateProfileSchema,
    UpdatePasswordSchema,
    UpdateAvatarSchema
)

from .chat_schemas import (
    SendMessageSchema,
    CreateSessionSchema,
    ChatFeedbackSchema
)

from .plan_schemas import (
    SubscribePlanSchema,
    UpdatePlanSchema
)

from .payment_schemas import (
    CreatePaymentSchema,
    VerifyPaymentSchema,
    RefundPaymentSchema
)

from .doctor_schemas import (
    CreateNoteSchema,
    UpdateNoteSchema,
    CreateTaskSchema,
    UpdateTaskSchema,
    CreateTherapySessionSchema,
    UpdateTherapySessionSchema,
    CreateAppointmentSchema,
    UpdateAppointmentSchema
)

from .patient_schemas import (
    CreatePatientRecordSchema,
    UpdatePatientRecordSchema,
    CreatePsychologicalTestSchema,
    SubmitTestResponseSchema
)

from .admin_schemas import (
    CreateUserSchema,
    UpdateUserSchema,
    CreatePlanSchema,
    UpdatePlanSchema as AdminUpdatePlanSchema,
    CreateAIModelSchema,
    UpdateAIModelSchema
)

__all__ = [
    # Auth
    'RegisterSchema',
    'LoginSchema',
    'VerifyEmailSchema',
    'ForgotPasswordSchema',
    'ResetPasswordSchema',
    'RefreshTokenSchema',
    
    # User
    'UpdateProfileSchema',
    'UpdatePasswordSchema',
    'UpdateAvatarSchema',
    
    # Chat
    'SendMessageSchema',
    'CreateSessionSchema',
    'ChatFeedbackSchema',
    
    # Plan
    'SubscribePlanSchema',
    'UpdatePlanSchema',
    
    # Payment
    'CreatePaymentSchema',
    'VerifyPaymentSchema',
    'RefundPaymentSchema',
    
    # Doctor
    'CreateNoteSchema',
    'UpdateNoteSchema',
    'CreateTaskSchema',
    'UpdateTaskSchema',
    'CreateTherapySessionSchema',
    'UpdateTherapySessionSchema',
    'CreateAppointmentSchema',
    'UpdateAppointmentSchema',
    
    # Patient
    'CreatePatientRecordSchema',
    'UpdatePatientRecordSchema',
    'CreatePsychologicalTestSchema',
    'SubmitTestResponseSchema',
    
    # Admin
    'CreateUserSchema',
    'UpdateUserSchema',
    'CreatePlanSchema',
    'AdminUpdatePlanSchema',
    'CreateAIModelSchema',
    'UpdateAIModelSchema'
]
