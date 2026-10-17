// API Client for AI-Powered Preventive Healthcare System

const API_BASE = '/api';

export interface User {
  id: number;
  full_name: string;
  email: string;
  created_at: string;
}

export interface HealthProfile {
  id: number;
  user_id: number;
  age: number;
  sex: 'male' | 'female' | 'other';
  height_cm: number;
  weight_kg: number;
  bmi: number;
  systolic_bp: number;
  diastolic_bp: number;
  heart_rate: number;
  measured_on: string;
  blood_glucose?: number | null;
  hba1c?: number | null;
  serum_creatinine?: number | null;
  blood_urea?: number | null;
  total_cholesterol?: number | null;
  hdl?: number | null;
  ldl?: number | null;
  smoking_status?: 'never' | 'former' | 'current' | null;
  physical_activity?: 'sedentary' | 'light' | 'moderate' | 'active' | null;
  family_history_diabetes?: boolean | null;
  family_history_kidney?: boolean | null;
  family_history_cardio?: boolean | null;
  symptoms?: string | null;
  blood_group?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  emergency_contact_relation?: string | null;
  allergies?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContributingFactor {
  feature: string;
  importance: number;
  user_value?: number | string | null;
  description?: string;
}

export interface RecommendationItem {
  title: string;
  advice: string;
  trigger_rule: string;
  category: string;
}

export interface PredictionResultItem {
  id?: number;
  disease: string;
  risk_score?: number | null;
  risk_category?: string | null;
  contributing_factors?: ContributingFactor[];
  recommendations?: RecommendationItem[];
  model_version?: string | null;
  status: 'ok' | 'unavailable' | 'not_trained';
  missing_fields?: string[];
  instructions?: string;
}

export interface Assessment {
  id: number;
  user_id: number;
  health_profile_id: number;
  created_at: string;
  model_versions?: any;
  prediction_results: PredictionResultItem[];
  health_profile?: HealthProfile;
}

export interface EmergencySymptomsResponse {
  severity: 'emergency' | 'non_emergency';
  emergency_number: string;
  disclaimer: string;
  message: string;
  actions: string[];
  identified_symptoms: string[];
}

export interface MeasurementAlert {
  measurement: string;
  value: number;
  status: string;
  rule_triggered: string;
  advice: string;
}

export interface EmergencyMeasurementsResponse {
  severity: 'urgent' | 'normal';
  emergency_number: string;
  disclaimer: string;
  message: string;
  alerts: MeasurementAlert[];
}

export interface SingleModelStatus {
  disease: string;
  display_name: string;
  is_trained: boolean;
  status: 'ready' | 'not_trained';
  file_path: string;
  dataset_name: string;
  required_features: string[];
  optional_features: string[];
  instructions?: string;
}

export interface ModelStatusSummary {
  models: Record<string, SingleModelStatus>;
}

export interface SingleModelMetrics {
  disease: string;
  display_name: string;
  algorithm: string;
  dataset_name: string;
  train_samples: number;
  test_samples: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  roc_auc: number | null;
  feature_names: string[];
  feature_importances: Record<string, number>;
  trained_at: string;
}

export interface ModelMetricsSummary {
  metrics: Record<string, SingleModelMetrics>;
}

export interface MedicationItem {
  id: number;
  user_id: number;
  name: string;
  dosage: string;
  frequency: string;
  time_of_day: string;
  instructions?: string | null;
  is_active: boolean;
  taken_today: boolean;
  created_at: string;
}

export interface AdherenceSummary {
  total_medications: number;
  taken_today_count: number;
  adherence_rate_7d: number;
  adherence_rate_30d: number;
  streak_days: number;
}

export interface CounterfactualSimulationRequest {
  health_profile_id?: number;
  simulated_bmi?: number;
  simulated_systolic_bp?: number;
  simulated_diastolic_bp?: number;
  simulated_blood_glucose?: number;
  simulated_total_cholesterol?: number;
  simulated_smoking_status?: string;
  simulated_physical_activity?: string;
}

export interface DiseaseSimulationComparison {
  disease: string;
  display_name: string;
  baseline_risk: number | null;
  baseline_category: string | null;
  simulated_risk: number | null;
  simulated_category: string | null;
  risk_delta: number | null;
  percent_change: number | null;
  key_driver: string;
}

export interface CounterfactualSimulationResponse {
  comparisons: DiseaseSimulationComparison[];
  overall_summary: string;
}

export interface PublicEmergencyCard {
  profile_id: number;
  full_name: string;
  age: number;
  sex: string;
  blood_group?: string;
  allergies?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relation?: string;
  systolic_bp: number;
  diastolic_bp: number;
  heart_rate: number;
  blood_glucose?: number | null;
  bmi: number;
  measured_on: string;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: 'include', // sends and receives httpOnly cookies
  });

  if (!response.ok) {
    let errorDetail = 'An error occurred';
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail || JSON.stringify(errorJson);
    } catch {
      errorDetail = `Request failed with status ${response.status} (${response.statusText})`;
    }
    throw new Error(errorDetail);
  }

  // Handle 204 or empty responses
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }
  return {} as T;
}

export const api = {
  // Auth
  register: (data: any) => request<{ access_token: string; user: User }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  login: (data: any) => request<{ access_token: string; user: User }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  logout: () => request<{ message: string }>('/auth/logout', {
    method: 'POST',
  }),

  getMe: () => request<User>('/auth/me'),

  // Health Profile
  getCurrentProfile: () => request<HealthProfile | null>('/health/profile'),
  getHealthHistory: () => request<HealthProfile[]>('/health/history'),
  getProfileById: (id: number) => request<HealthProfile>(`/health/profile/${id}`),
  createProfile: (data: any) => request<HealthProfile>('/health/profile', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateProfile: (id: number, data: any) => request<HealthProfile>(`/health/profile/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  // Assessments
  runAssessment: (healthProfileId?: number) => request<Assessment>('/assessments', {
    method: 'POST',
    body: JSON.stringify({ health_profile_id: healthProfileId }),
  }),
  getAssessments: () => request<Assessment[]>('/assessments'),
  getAssessmentById: (id: number) => request<Assessment>(`/assessments/${id}`),

  // Emergency
  checkSymptoms: (symptoms: string[]) => request<EmergencySymptomsResponse>('/emergency/symptoms', {
    method: 'POST',
    body: JSON.stringify({ symptoms }),
  }),
  checkMeasurements: (data: any) => request<EmergencyMeasurementsResponse>('/emergency/measurements', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getPublicEmergencyCard: (profileId: number) => request<PublicEmergencyCard>(`/emergency/card/${profileId}`),

  // Medications Adherence
  getMedications: () => request<MedicationItem[]>('/medications'),
  addMedication: (data: any) => request<MedicationItem>('/medications', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  deleteMedication: (id: number) => request<{ message: string }>(`/medications/${id}`, {
    method: 'DELETE',
  }),
  toggleMedication: (id: number) => request<{ medication_id: number; taken_today: boolean }>(`/medications/${id}/toggle`, {
    method: 'POST',
  }),
  getAdherence: () => request<AdherenceSummary>('/medications/adherence'),

  // Counterfactual What-If Simulation
  simulateRisk: (data: CounterfactualSimulationRequest) => request<CounterfactualSimulationResponse>('/assessments/simulate', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Models
  getModelsStatus: () => request<ModelStatusSummary>('/models/status'),
  getModelsMetrics: () => request<ModelMetricsSummary>('/models/metrics'),
};
