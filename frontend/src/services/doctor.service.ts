/**
 * Doctor Service
 * Services for doctor-specific operations
 */

import { apiClient } from './api.client';
import { API_CONFIG } from '../config/api.config';
import type {
  DoctorDashboard,
  Patient,
  DoctorNote,
  Task,
  TherapySession,
  Appointment,
  ApiResponse
} from '../types/api.types';

export class DoctorService {
  /**
   * Get doctor dashboard with statistics
   */
  async getDashboard(): Promise<DoctorDashboard> {
    return apiClient.get<DoctorDashboard>(API_CONFIG.API_ENDPOINTS.DOCTOR.DASHBOARD);
  }

  /**
   * Get all assigned patients
   */
  async getPatients(page: number = 1, perPage: number = 20): Promise<ApiResponse<Patient[]>> {
    return apiClient.get<ApiResponse<Patient[]>>(
      `${API_CONFIG.API_ENDPOINTS.DOCTOR.PATIENTS}?page=${page}&per_page=${perPage}`
    );
  }

  /**
   * Get specific patient details
   */
  async getPatient(patientId: number): Promise<Patient> {
    return apiClient.get<Patient>(
      `${API_CONFIG.API_ENDPOINTS.DOCTOR.PATIENTS}/${patientId}`
    );
  }

  /**
   * Get all doctor notes
   */
  async getNotes(params?: {
    patientId?: number;
    noteType?: string;
    page?: number;
    perPage?: number;
  }): Promise<ApiResponse<DoctorNote[]>> {
    const query = new URLSearchParams();
    if (params?.patientId) query.append('patient_id', params.patientId.toString());
    if (params?.noteType) query.append('note_type', params.noteType);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.perPage) query.append('per_page', params.perPage.toString());

    return apiClient.get<ApiResponse<DoctorNote[]>>(
      `${API_CONFIG.API_ENDPOINTS.DOCTOR.NOTES}?${query.toString()}`
    );
  }

  /**
   * Get specific note
   */
  async getNote(noteId: number): Promise<DoctorNote> {
    return apiClient.get<DoctorNote>(
      `${API_CONFIG.API_ENDPOINTS.DOCTOR.NOTES}/${noteId}`
    );
  }

  /**
   * Create a new doctor note
   */
  async createNote(data: {
    patient_id: number;
    note_type: 'diagnosis' | 'observation' | 'prescription' | 'treatment' | 'general';
    content: string;
    is_private?: boolean;
  }): Promise<{ message: string; note: DoctorNote }> {
    return apiClient.post(API_CONFIG.API_ENDPOINTS.DOCTOR.NOTES, data);
  }

  /**
   * Update a doctor note
   */
  async updateNote(
    noteId: number,
    data: {
      note_type?: string;
      content?: string;
      is_private?: boolean;
    }
  ): Promise<{ message: string; note: DoctorNote }> {
    return apiClient.put(`${API_CONFIG.API_ENDPOINTS.DOCTOR.NOTES}/${noteId}`, data);
  }

  /**
   * Delete a doctor note
   */
  async deleteNote(noteId: number): Promise<{ message: string }> {
    return apiClient.delete(`${API_CONFIG.API_ENDPOINTS.DOCTOR.NOTES}/${noteId}`);
  }

  /**
   * Get all tasks
   */
  async getTasks(params?: {
    patientId?: number;
    status?: string;
    page?: number;
    perPage?: number;
  }): Promise<ApiResponse<Task[]>> {
    const query = new URLSearchParams();
    if (params?.patientId) query.append('patient_id', params.patientId.toString());
    if (params?.status) query.append('status', params.status);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.perPage) query.append('per_page', params.perPage.toString());

    return apiClient.get<ApiResponse<Task[]>>(
      `${API_CONFIG.API_ENDPOINTS.DOCTOR.TASKS}?${query.toString()}`
    );
  }

  /**
   * Create a new task
   */
  async createTask(data: {
    patient_id: number;
    title: string;
    description?: string;
    task_type: 'medication' | 'exercise' | 'therapy' | 'assessment' | 'follow_up';
    due_date?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
  }): Promise<{ message: string; task: Task }> {
    return apiClient.post(API_CONFIG.API_ENDPOINTS.DOCTOR.TASKS, data);
  }

  /**
   * Update a task
   */
  async updateTask(
    taskId: number,
    data: {
      title?: string;
      description?: string;
      status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
      priority?: string;
      due_date?: string;
    }
  ): Promise<{ message: string; task: Task }> {
    return apiClient.put(`${API_CONFIG.API_ENDPOINTS.DOCTOR.TASKS}/${taskId}`, data);
  }

  /**
   * Get all therapy sessions
   */
  async getSessions(params?: {
    patientId?: number;
    status?: string;
    page?: number;
    perPage?: number;
  }): Promise<ApiResponse<TherapySession[]>> {
    const query = new URLSearchParams();
    if (params?.patientId) query.append('patient_id', params.patientId.toString());
    if (params?.status) query.append('status', params.status);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.perPage) query.append('per_page', params.perPage.toString());

    return apiClient.get<ApiResponse<TherapySession[]>>(
      `${API_CONFIG.API_ENDPOINTS.DOCTOR.SESSIONS}?${query.toString()}`
    );
  }

  /**
   * Create a new therapy session
   */
  async createSession(data: {
    patient_id: number;
    session_type: 'individual' | 'group' | 'family' | 'couple' | 'online';
    scheduled_at: string;
    duration_minutes?: number;
    notes?: string;
  }): Promise<{ message: string; session: TherapySession }> {
    return apiClient.post(API_CONFIG.API_ENDPOINTS.DOCTOR.SESSIONS, data);
  }

  /**
   * Update a therapy session
   */
  async updateSession(
    sessionId: number,
    data: {
      session_type?: string;
      scheduled_at?: string;
      status?: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
      duration_minutes?: number;
      notes?: string;
    }
  ): Promise<{ message: string; session: TherapySession }> {
    return apiClient.put(`${API_CONFIG.API_ENDPOINTS.DOCTOR.SESSIONS}/${sessionId}`, data);
  }

  /**
   * Get all appointments
   */
  async getAppointments(params?: {
    patientId?: number;
    status?: string;
    page?: number;
    perPage?: number;
  }): Promise<ApiResponse<Appointment[]>> {
    const query = new URLSearchParams();
    if (params?.patientId) query.append('patient_id', params.patientId.toString());
    if (params?.status) query.append('status', params.status);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.perPage) query.append('per_page', params.perPage.toString());

    return apiClient.get<ApiResponse<Appointment[]>>(
      `${API_CONFIG.API_ENDPOINTS.DOCTOR.APPOINTMENTS}?${query.toString()}`
    );
  }

  /**
   * Create appointment
   */
  async createAppointment(data: {
    patient_id: number;
    appointment_type: 'initial' | 'follow_up' | 'emergency' | 'consultation';
    scheduled_at: string;
    duration_minutes?: number;
    notes?: string;
  }): Promise<{ message: string; appointment: Appointment }> {
    return apiClient.post(API_CONFIG.API_ENDPOINTS.DOCTOR.APPOINTMENTS, data);
  }

  /**
   * Update appointment
   */
  async updateAppointment(
    appointmentId: number,
    data: {
      scheduled_at?: string;
      status?: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
      duration_minutes?: number;
      notes?: string;
    }
  ): Promise<{ message: string; appointment: Appointment }> {
    return apiClient.put(`${API_CONFIG.API_ENDPOINTS.DOCTOR.APPOINTMENTS}/${appointmentId}`, data);
  }
}

export const doctorService = new DoctorService();
