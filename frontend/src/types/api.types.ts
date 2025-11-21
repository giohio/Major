// User types
export interface User {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  role: 'user' | 'doctor' | 'admin';
  is_active: boolean;
  is_verified: boolean;
  avatar_url?: string;
  subscription_plan: string;
  subscription_status: 'active' | 'cancelled' | 'expired';
  created_at: string;
  last_login?: string;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  role?: 'user' | 'doctor';
}

export interface AuthResponse {
  message: string;
  user: User;
  access_token: string;
  refresh_token: string;
}

// Chat types
export interface ChatMessage {
  id: number;
  session_id: number;
  role: 'user' | 'assistant';
  content: string;
  emotion_detected?: string;
  sentiment_score?: number;
  risk_level?: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
}

export interface ChatSession {
  id: number;
  user_id: number;
  title: string;
  status: 'active' | 'completed' | 'archived';
  created_at: string;
  updated_at: string;
  message_count: number;
}

export interface SendMessageRequest {
  message: string;
  session_id?: number;
  analyze_emotion?: boolean;
}

export interface SendMessageResponse {
  success: boolean;
  session_id: number;
  user_message: ChatMessage;
  ai_message: ChatMessage;
  emotion_analysis?: EmotionAnalysis;
  alert?: Alert;
  remaining_chats?: number | 'unlimited';
}

// Emotion types
export interface EmotionAnalysis {
  primary_emotion: string;
  intensity: number;
  sentiment_score: number;
  secondary_emotions?: string[];
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  triggers?: string;
  needs_attention: boolean;
}

export interface EmotionLog {
  id: number;
  user_id: number;
  emotion: string;
  intensity: number;
  sentiment_score?: number;
  notes?: string;
  triggers?: string;
  logged_at: string;
}

export interface EmotionStats {
  period: 'week' | 'month' | 'year';
  total_logs: number;
  emotion_distribution: Record<string, number>;
  average_intensity: number;
  average_sentiment: number;
  trend: 'improving' | 'declining' | 'stable';
  recent_logs: EmotionLog[];
}

// Alert types
export interface Alert {
  id: number;
  user_id: number;
  alert_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  is_resolved: boolean;
  resolved_by?: number;
  resolved_at?: string;
  created_at: string;
}

// Plan types
export interface Plan {
  id: number;
  name: string;
  description?: string;
  user_type: 'user' | 'doctor';
  price_monthly: number;
  price_yearly: number;
  chat_limit: number;
  voice_enabled: boolean;
  video_enabled: boolean;
  empathy_layer_enabled: boolean;
  doctor_access: boolean;
  priority_support: boolean;
  max_patients?: number;
  can_assign_plans?: boolean;
  analytics_access?: boolean;
  is_active: boolean;
}

export interface Subscription {
  subscription_plan: string;
  subscription_status: 'active' | 'cancelled' | 'expired';
  subscription_start_date?: string;
  subscription_end_date?: string;
  plan_details?: Plan;
}

export interface SubscribeRequest {
  plan_id: number;
  billing_cycle: 'monthly' | 'yearly';
  payment_method: 'vnpay' | 'momo' | 'stripe';
}

// Doctor types
export interface PatientRecord {
  id: number;
  user_id: number;
  doctor_id?: number;
  diagnosis?: string;
  medications?: string;
  allergies?: string;
  medical_history?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  updated_at: string;
}

export interface DoctorNote {
  id: number;
  doctor_id: number;
  patient_id: number;
  session_id?: number;
  note_type: string;
  title: string;
  content: string;
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: number;
  patient_id: number;
  assigned_by: number;
  exercise_id?: number;
  title: string;
  description?: string;
  task_type: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  due_date?: string;
  completed_at?: string;
  patient_notes?: string;
  created_at: string;
}

export interface TherapySession {
  id: number;
  doctor_id: number;
  patient_id: number;
  appointment_id?: number;
  session_type: 'video' | 'audio' | 'chat' | 'individual' | 'group' | 'family' | 'couple' | 'online';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  scheduled_at?: string;
  start_time?: string;
  end_time?: string;
  duration_minutes?: number;
  notes?: string;
  ai_summary?: string;
  key_topics?: string;
  created_at: string;
  updated_at?: string;
}

export interface Appointment {
  id: number;
  doctor_id: number;
  patient_id: number;
  appointment_type: 'initial' | 'follow_up' | 'emergency' | 'consultation';
  scheduled_at: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  duration_minutes: number;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface Patient extends User {
  patient_record?: PatientRecord;
  recent_alerts?: Alert[];
  recent_emotions?: EmotionLog[];
}

export interface DoctorDashboard {
  patient_count: number;
  active_alerts: Alert[];
  active_alerts_count: number;
  upcoming_sessions: TherapySession[];
  recent_notes: DoctorNote[];
}

// Admin types
export interface UserStats {
  total_chat_sessions: number;
  total_emotion_logs: number;
  active_alerts: number;
  member_since: string;
  last_login?: string;
}

export interface AIModel {
  id: number;
  name: string;
  model_type: 'gemini' | 'openai' | 'claude' | 'custom';
  model_version: string;
  description?: string;
  api_endpoint?: string;
  is_active: boolean;
  is_default: boolean;
  created_at: string;
  updated_at?: string;
}

export interface AdminOverview {
  users: {
    total: number;
    doctors: number;
    patients: number;
  };
  subscriptions: {
    active: number;
  };
  alerts: {
    unresolved: number;
    critical: number;
  };
  today: {
    chats: number;
    signups: number;
  };
}

export interface UsageStats {
  period: 'week' | 'month' | 'year';
  users: {
    total: number;
    new: number;
    active: number;
  };
  chats: {
    total: number;
  };
  revenue: {
    total: number;
  };
  alerts: {
    total: number;
    critical: number;
  };
  subscriptions: Record<string, number>;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success?: boolean;
  message?: string;
  error?: string;
  data?: T;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

// Error types
export interface ApiError {
  error: string;
  message?: string;
  details?: string;
  upgrade_required?: boolean;
  current_plan?: string;
}
