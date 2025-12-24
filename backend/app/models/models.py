"""
Main Models Module - Import all models from separate files
This file serves as the central import point for all database models
"""

# User and Authentication
from app.models.user import User

# Doctor and Appointments
from app.models.doctor import DoctorProfile, Appointment

# Chat System
from app.models.chat import ChatSession, ChatMessage

# Mental Health Tracking
from app.models.emotion import EmotionLog, Alert, PsychologicalTest

# Exercises and Tasks
from app.models.exercise import Exercise, UserExerciseProgress, Task

# Payments and Plans
from app.models.payment import Plan, Payment

# Medical Records and Therapy
from app.models.medical import PatientRecord, DoctorNote, TherapySession

# AI Configuration
from app.models.ai_model import AIModel

# Doctor Reviews and Availability
from app.models.doctor_reviews import DoctorReview, DoctorAvailability, DoctorTimeOff

# Session Analysis (unified)
from app.models.session_analysis import SessionAnalysis

# Export all models for easy import
__all__ = [
    'User',
    'DoctorProfile',
    'Appointment',
    'ChatSession',
    'ChatMessage',
    'EmotionLog',
    'Alert',
    'PsychologicalTest',
    'Exercise',
    'UserExerciseProgress',
    'Task',
    'Plan',
    'Payment',
    'PatientRecord',
    'DoctorNote',
    'TherapySession',
    'AIModel',
    'DoctorReview',
    'DoctorAvailability',
    'DoctorTimeOff',
    'SessionAnalysis',
]
