// Central type definitions for Arogya Marg

export type Role = "ASHA" | "CHO" | "PHC_DOCTOR" | "HOSPITAL_STAFF" | "SPECIALIST" | "DISTRICT_ADMIN";

export type Gender = "MALE" | "FEMALE" | "OTHER";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type CarePathState =
  | "IDENTIFIED"
  | "TRIAGED"
  | "CONSULTATION_PENDING"
  | "CONSULTED"
  | "REFERRAL_CREATED"
  | "FACILITY_ACCEPTED"
  | "EN_ROUTE"
  | "ARRIVED"
  | "TREATED"
  | "BACK_REFERRED"
  | "FOLLOW_UP_DUE"
  | "CLOSED"
  | "STUCK"
  | "NO_SHOW"
  | "ESCALATED"
  | "FACILITY_UNAVAILABLE";

export type FacilityType =
  | "ASHA_WORKER"
  | "AROGYA_MANDIR"
  | "SUB_CENTRE"
  | "PHC"
  | "CHC"
  | "RURAL_HOSPITAL"
  | "DISTRICT_HOSPITAL"
  | "DIAGNOSTIC_CENTRE"
  | "BLOOD_BANK";

export type FacilityStatus = "READY" | "LIMITED" | "CRITICAL" | "OFFLINE";

export type ReferralStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "EN_ROUTE"
  | "ARRIVED"
  | "COMPLETED"
  | "CANCELLED"
  | "REROUTED";

export type ReferralUrgency = "ROUTINE" | "URGENT" | "EMERGENCY";

export type TaskStatus = "OPEN" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export type AmbulanceStatus =
  | "AVAILABLE"
  | "DISPATCHED"
  | "EN_ROUTE"
  | "AT_SCENE"
  | "TRANSPORTING"
  | "OFFLINE";

export interface User {
  id: string;
  employee_id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  facility_id?: string;
  district?: string;
  taluka?: string;
  village?: string;
  is_active: boolean;
  created_at: string;
}

export interface Patient {
  id: string;
  patient_id: string;
  care_id: string;
  name: string;
  age: number;
  gender: Gender;
  phone?: string;
  village: string;
  district: string;
  asha_id?: string;
  known_conditions: string[];
  is_pregnant: boolean;
  trimester?: number;
  medications: string[];
  allergies: string[];
  risk_level: RiskLevel;
  risk_factors: string[];
  current_state: CarePathState;
  current_facility_id?: string;
  consent_given: boolean;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Facility {
  id: string;
  facility_code: string;
  name: string;
  type: FacilityType;
  status: FacilityStatus;
  address?: string;
  village?: string;
  taluka?: string;
  district: string;
  lat: number;
  lng: number;
  phone?: string;
  readiness_score: number;
  total_beds: number;
  occupied_beds: number;
  icu_beds: number;
  icu_occupied: number;
  ventilators: number;
  oxygen_available: boolean;
  blood_bank: boolean;
  diagnostics: string[];
  specialists: string[];
  is_active: boolean;
  updated_at?: string;
}

export interface CarePath {
  id: string;
  patient_id: string;
  current_state: CarePathState;
  next_best_action?: string;
  responsible_user_id?: string;
  deadline?: string;
  started_at: string;
  updated_at?: string;
  is_active: boolean;
  events: CarePathEvent[];
}

export interface CarePathEvent {
  id: string;
  from_state?: CarePathState;
  to_state: CarePathState;
  event_type: string;
  description?: string;
  created_at: string;
}

export interface Referral {
  id: string;
  referral_code: string;
  patient_id: string;
  origin_facility_id?: string;
  destination_facility_id: string;
  referred_by: string;
  status: ReferralStatus;
  urgency: ReferralUrgency;
  reason: string;
  clinical_notes?: string;
  required_specialty?: string;
  ambulance_id?: string;
  created_at: string;
  accepted_at?: string;
  arrived_at?: string;
  completed_at?: string;
  expected_arrival?: string;
  is_rerouted: boolean;
}

export interface Observation {
  id: string;
  patient_id: string;
  temperature?: number;
  pulse?: number;
  resp_rate?: number;
  spo2?: number;
  bp_systolic?: number;
  bp_diastolic?: number;
  weight?: number;
  symptoms: string[];
  risk_indicators: string[];
  recorded_at: string;
}

export interface CareTask {
  id: string;
  patient_id?: string;
  assigned_to: string;
  title: string;
  description?: string;
  task_type?: string;
  status: TaskStatus;
  priority: string;
  due_at?: string;
  completed_at?: string;
  related_referral_id?: string;
  created_at: string;
}

export interface Ambulance {
  id: string;
  vehicle_number: string;
  vehicle_type: string;
  status: AmbulanceStatus;
  base_facility_id?: string;
  driver_name?: string;
  current_lat?: number;
  current_lng?: number;
  destination_lat?: number;
  destination_lng?: number;
  eta_minutes?: number;
  speed_kmph?: number;
  patient_on_board?: string;
  is_active: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message?: string;
  type?: string;
  severity: string;
  is_read: boolean;
  action_url?: string;
  created_at: string;
}

export interface AnalyticsSummary {
  total_patients: number;
  active_journeys: number;
  high_risk_patients: number;
  referrals_today: number;
  referrals_pending: number;
  referrals_completed: number;
  referral_completion_rate: number;
  avg_referral_accept_minutes: number;
  stuck_patients: number;
  follow_ups_due_today: number;
  follow_ups_overdue: number;
  facilities_ready: number;
  facilities_limited: number;
  facilities_critical: number;
  facilities_offline: number;
}

export interface SimulationResult {
  scenario_name: string;
  affected_referrals: string[];
  affected_facility?: Facility;
  alternative_facilities: Facility[];
  actions_taken: string[];
  notifications_created: number;
}

export interface FacilityRouterResult {
  facility: {
    id: string;
    name: string;
    type: FacilityType;
    status: FacilityStatus;
    lat: number;
    lng: number;
    readiness_score: number;
    total_beds: number;
    occupied_beds: number;
    icu_beds: number;
    icu_occupied: number;
    oxygen_available: boolean;
    blood_bank: boolean;
    diagnostics: string[];
    specialists: string[];
  };
  score: number;
  match_pct: number;
  distance_km: number;
  travel_time_min: number;
  reasons: string[];
  disqualifiers: string[];
}

// UI state helpers
export const CAREPATH_ORDER: CarePathState[] = [
  "IDENTIFIED",
  "TRIAGED",
  "CONSULTATION_PENDING",
  "CONSULTED",
  "REFERRAL_CREATED",
  "FACILITY_ACCEPTED",
  "EN_ROUTE",
  "ARRIVED",
  "TREATED",
  "BACK_REFERRED",
  "FOLLOW_UP_DUE",
  "CLOSED",
];

export const CAREPATH_LABELS: Record<CarePathState, string> = {
  IDENTIFIED: "Identified",
  TRIAGED: "Triaged",
  CONSULTATION_PENDING: "Consultation Pending",
  CONSULTED: "Consulted",
  REFERRAL_CREATED: "Referral Created",
  FACILITY_ACCEPTED: "Facility Accepted",
  EN_ROUTE: "En Route",
  ARRIVED: "Arrived",
  TREATED: "Treated",
  BACK_REFERRED: "Back Referred",
  FOLLOW_UP_DUE: "Follow-up Due",
  CLOSED: "Closed",
  STUCK: "Stuck",
  NO_SHOW: "No Show",
  ESCALATED: "Escalated",
  FACILITY_UNAVAILABLE: "Facility Unavailable",
};

export const RISK_LABELS: Record<RiskLevel, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
};

export const FACILITY_TYPE_LABELS: Record<FacilityType, string> = {
  ASHA_WORKER: "ASHA Worker",
  AROGYA_MANDIR: "Arogya Mandir",
  SUB_CENTRE: "Sub-Centre",
  PHC: "PHC",
  CHC: "CHC",
  RURAL_HOSPITAL: "Rural Hospital",
  DISTRICT_HOSPITAL: "District Hospital",
  DIAGNOSTIC_CENTRE: "Diagnostic Centre",
  BLOOD_BANK: "Blood Bank",
};
