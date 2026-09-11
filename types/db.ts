// ─── Enums ────────────────────────────────────────────────────────────────────

export type RoleEnum =
  | "ASHA"
  | "CHO"
  | "PHC_DOCTOR"
  | "HOSPITAL_STAFF"
  | "SPECIALIST"
  | "DISTRICT_ADMIN";

export type GenderEnum = "MALE" | "FEMALE" | "OTHER";

export type RiskEnum = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

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

// ─── DB Row Types (mirror SQLAlchemy models) ──────────────────────────────────

export interface DbUser {
  id: string;
  employee_id: string;
  name: string;
  email: string;
  phone: string | null;
  password_hash: string;
  role: RoleEnum;
  facility_id: string | null;
  district: string | null;
  taluka: string | null;
  village: string | null;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface DbHousehold {
  id: string;
  household_code: string;
  address: string | null;
  village: string | null;
  taluka: string | null;
  district: string;
  lat: number | null;
  lng: number | null;
  family_members_count: number;
  primary_contact_name: string | null;
  primary_contact_phone: string | null;
  asha_id: string | null;
  created_at: string;
}

export interface DbPatient {
  id: string;
  patient_id: string;
  care_id: string;
  name: string;
  age: number;
  gender: GenderEnum;
  phone: string | null;
  village: string;
  district: string;
  household_id: string | null;
  asha_id: string | null;
  known_conditions: string[];
  is_pregnant: boolean;
  trimester: number | null;
  medications: string[];
  allergies: string[];
  prev_hospitalization: boolean;
  risk_level: RiskEnum;
  risk_factors: string[];
  current_state: CarePathState;
  current_facility_id: string | null;
  consent_given: boolean;
  consent_date: string | null;
  abha_id: string | null;
  fhir_patient_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface DbFacility {
  id: string;
  facility_code: string;
  name: string;
  type: FacilityType;
  status: FacilityStatus;
  address: string | null;
  village: string | null;
  taluka: string | null;
  district: string;
  lat: number;
  lng: number;
  phone: string | null;
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
  created_at: string;
  updated_at: string | null;
}

export interface DbCarePath {
  id: string;
  patient_id: string;
  current_state: CarePathState;
  next_best_action: string | null;
  responsible_user_id: string | null;
  deadline: string | null;
  started_at: string;
  updated_at: string | null;
  closed_at: string | null;
  is_active: boolean;
}

export interface DbCarePathEvent {
  id: string;
  carepath_id: string;
  from_state: CarePathState | null;
  to_state: CarePathState;
  event_type: string;
  description: string | null;
  performed_by: string | null;
  event_metadata: Record<string, unknown>;
  created_at: string;
}

export interface DbObservation {
  id: string;
  patient_id: string;
  encounter_id: string | null;
  temperature: number | null;
  pulse: number | null;
  resp_rate: number | null;
  spo2: number | null;
  bp_systolic: number | null;
  bp_diastolic: number | null;
  weight: number | null;
  symptoms: string[];
  risk_indicators: string[];
  recorded_by: string | null;
  recorded_at: string;
}

export interface DbEncounter {
  id: string;
  patient_id: string;
  facility_id: string | null;
  doctor_id: string | null;
  encounter_type: string;
  chief_complaint: string;
  diagnosis: string | null;
  treatment_notes: string | null;
  encounter_date: string;
  created_at: string;
}

export interface DbReferral {
  id: string;
  referral_code: string;
  patient_id: string;
  origin_facility_id: string | null;
  destination_facility_id: string;
  referred_by: string;
  status: ReferralStatus;
  urgency: ReferralUrgency;
  reason: string;
  clinical_notes: string | null;
  required_specialty: string | null;
  ambulance_id: string | null;
  created_at: string;
  accepted_at: string | null;
  dispatched_at: string | null;
  arrived_at: string | null;
  completed_at: string | null;
  expected_arrival: string | null;
  rejection_reason: string | null;
  is_rerouted: boolean;
  previous_referral_id: string | null;
}

export interface DbFollowUp {
  id: string;
  patient_id: string;
  assigned_to: string;
  due_date: string;
  reason: string;
  notes: string | null;
  vitals: Record<string, unknown>;
  medication_adherence: boolean | null;
  recovery_status: string | null;
  status: string;
  completed_at: string | null;
  created_at: string;
}

export interface DbCareTask {
  id: string;
  patient_id: string | null;
  assigned_to: string;
  assigned_by: string | null;
  title: string;
  description: string | null;
  task_type: string | null;
  status: TaskStatus;
  priority: string;
  due_at: string | null;
  completed_at: string | null;
  related_referral_id: string | null;
  created_at: string;
}

export interface DbNotification {
  id: string;
  user_id: string;
  patient_id: string | null;
  title: string;
  message: string | null;
  type: string | null;
  severity: string;
  is_read: boolean;
  action_url: string | null;
  created_at: string;
}

export interface DbAuditEvent {
  id: string;
  user_id: string | null;
  patient_id: string | null;
  event_type: string;
  entity_type: string | null;
  entity_id: string | null;
  description: string | null;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

export interface DbAmbulance {
  id: string;
  vehicle_number: string;
  vehicle_type: string;
  status: AmbulanceStatus;
  base_facility_id: string | null;
  driver_name: string | null;
  driver_phone: string | null;
  current_lat: number | null;
  current_lng: number | null;
  destination_lat: number | null;
  destination_lng: number | null;
  eta_minutes: number | null;
  speed_kmph: number | null;
  patient_on_board: string | null;
  is_active: boolean;
  updated_at: string | null;
}

export interface DbSimulationScenario {
  id: string;
  name: string;
  description: string | null;
  scenario_type: string;
  target_facility_id: string | null;
  config: Record<string, unknown>;
  is_active: boolean;
  activated_at: string | null;
  created_at: string;
}
