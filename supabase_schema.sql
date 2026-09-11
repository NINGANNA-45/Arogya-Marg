-- ==============================================================================
-- Arogya Marg — Supabase PostgreSQL Schema & Initial Demo Data
-- ==============================================================================
-- You can run this entire script in your Supabase SQL Editor (Dashboard -> SQL Editor).
-- It creates all required tables, constraints, indexes, and initial demo seed data.
-- ==============================================================================



-- ── 1. FACILITIES ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS facilities (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    facility_code TEXT UNIQUE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT DEFAULT 'READY',
    address TEXT,
    village TEXT,
    taluka TEXT,
    district TEXT DEFAULT 'Pune',
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    phone TEXT,
    readiness_score INTEGER DEFAULT 100,
    total_beds INTEGER DEFAULT 0,
    occupied_beds INTEGER DEFAULT 0,
    icu_beds INTEGER DEFAULT 0,
    icu_occupied INTEGER DEFAULT 0,
    ventilators INTEGER DEFAULT 0,
    oxygen_available BOOLEAN DEFAULT TRUE,
    blood_bank BOOLEAN DEFAULT FALSE,
    diagnostics JSONB DEFAULT '[]'::jsonb,
    specialists JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 2. USERS ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    employee_id TEXT UNIQUE,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL,
    facility_id TEXT REFERENCES facilities(id) ON DELETE SET NULL,
    district TEXT DEFAULT 'Pune',
    taluka TEXT,
    village TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3. HOUSEHOLDS ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS households (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    household_code TEXT UNIQUE,
    address TEXT,
    village TEXT,
    taluka TEXT,
    district TEXT DEFAULT 'Pune',
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    family_members_count INTEGER DEFAULT 1,
    primary_contact_name TEXT,
    primary_contact_phone TEXT,
    asha_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 4. PATIENTS ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS patients (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    patient_id TEXT UNIQUE,
    care_id TEXT UNIQUE,
    name TEXT NOT NULL,
    age INTEGER,
    gender TEXT,
    phone TEXT,
    village TEXT,
    district TEXT DEFAULT 'Pune',
    household_id TEXT REFERENCES households(id) ON DELETE SET NULL,
    asha_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    known_conditions JSONB DEFAULT '[]'::jsonb,
    is_pregnant BOOLEAN DEFAULT FALSE,
    trimester INTEGER,
    medications JSONB DEFAULT '[]'::jsonb,
    allergies JSONB DEFAULT '[]'::jsonb,
    prev_hospitalization BOOLEAN DEFAULT FALSE,
    risk_level TEXT DEFAULT 'LOW',
    risk_factors JSONB DEFAULT '[]'::jsonb,
    current_state TEXT DEFAULT 'IDENTIFIED',
    current_facility_id TEXT REFERENCES facilities(id) ON DELETE SET NULL,
    consent_given BOOLEAN DEFAULT FALSE,
    consent_date TIMESTAMPTZ,
    abha_id TEXT,
    fhir_patient_id TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 5. CARE PATHS ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS care_paths (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    patient_id TEXT UNIQUE NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    current_state TEXT DEFAULT 'IDENTIFIED',
    next_best_action TEXT,
    responsible_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    deadline TIMESTAMPTZ,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    closed_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE
);

-- ── 6. CAREPATH EVENTS ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS carepath_events (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    carepath_id TEXT NOT NULL REFERENCES care_paths(id) ON DELETE CASCADE,
    from_state TEXT,
    to_state TEXT NOT NULL,
    event_type TEXT NOT NULL,
    description TEXT,
    performed_by TEXT REFERENCES users(id) ON DELETE SET NULL,
    event_metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 7. ENCOUNTERS ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS encounters (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    facility_id TEXT REFERENCES facilities(id) ON DELETE SET NULL,
    doctor_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    encounter_type TEXT,
    chief_complaint TEXT,
    diagnosis TEXT,
    treatment_notes TEXT,
    encounter_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 8. OBSERVATIONS ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS observations (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    encounter_id TEXT REFERENCES encounters(id) ON DELETE SET NULL,
    temperature DOUBLE PRECISION,
    pulse INTEGER,
    resp_rate INTEGER,
    spo2 INTEGER,
    bp_systolic INTEGER,
    bp_diastolic INTEGER,
    weight DOUBLE PRECISION,
    symptoms JSONB DEFAULT '[]'::jsonb,
    risk_indicators JSONB DEFAULT '[]'::jsonb,
    recorded_by TEXT REFERENCES users(id) ON DELETE SET NULL,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 9. AMBULANCES ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ambulances (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    vehicle_number TEXT UNIQUE,
    vehicle_type TEXT,
    status TEXT DEFAULT 'AVAILABLE',
    base_facility_id TEXT REFERENCES facilities(id) ON DELETE SET NULL,
    driver_name TEXT,
    driver_phone TEXT,
    current_lat DOUBLE PRECISION,
    current_lng DOUBLE PRECISION,
    destination_lat DOUBLE PRECISION,
    destination_lng DOUBLE PRECISION,
    eta_minutes INTEGER,
    speed_kmph DOUBLE PRECISION,
    patient_on_board TEXT REFERENCES patients(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 10. REFERRALS ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS referrals (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    referral_code TEXT UNIQUE,
    patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    origin_facility_id TEXT REFERENCES facilities(id) ON DELETE SET NULL,
    destination_facility_id TEXT NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    referred_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'PENDING',
    urgency TEXT DEFAULT 'ROUTINE',
    reason TEXT,
    clinical_notes TEXT,
    required_specialty TEXT,
    ambulance_id TEXT REFERENCES ambulances(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    dispatched_at TIMESTAMPTZ,
    arrived_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    expected_arrival TIMESTAMPTZ,
    rejection_reason TEXT,
    is_rerouted BOOLEAN DEFAULT FALSE,
    previous_referral_id TEXT REFERENCES referrals(id) ON DELETE SET NULL
);

-- ── 11. FOLLOW-UPS ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS follow_ups (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    assigned_to TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    due_date TIMESTAMPTZ NOT NULL,
    reason TEXT,
    notes TEXT,
    vitals JSONB DEFAULT '{}'::jsonb,
    medication_adherence BOOLEAN,
    recovery_status TEXT,
    status TEXT DEFAULT 'PENDING',
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 12. CARE TASKS ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS care_tasks (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    patient_id TEXT REFERENCES patients(id) ON DELETE CASCADE,
    assigned_to TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_by TEXT REFERENCES users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    task_type TEXT,
    status TEXT DEFAULT 'OPEN',
    priority TEXT DEFAULT 'NORMAL',
    due_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    related_referral_id TEXT REFERENCES referrals(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 13. NOTIFICATIONS ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    patient_id TEXT REFERENCES patients(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT,
    type TEXT,
    severity TEXT DEFAULT 'INFO',
    is_read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 14. AUDIT EVENTS ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_events (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    patient_id TEXT REFERENCES patients(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    entity_type TEXT,
    entity_id TEXT,
    description TEXT,
    old_value JSONB,
    new_value JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 15. SIMULATION SCENARIOS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS simulation_scenarios (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    description TEXT,
    scenario_type TEXT,
    target_facility_id TEXT REFERENCES facilities(id) ON DELETE SET NULL,
    config JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT FALSE,
    activated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 16. SEED DEMO FACILITIES ──────────────────────────────────────────────────
INSERT INTO facilities (id, facility_code, name, type, status, village, taluka, lat, lng, phone, readiness_score, total_beds, occupied_beds, icu_beds, icu_occupied, oxygen_available, blood_bank, diagnostics, specialists)
VALUES
('fac-001', 'PHC-MANJARI-01', 'PHC Manjari', 'PHC', 'READY', 'Manjari', 'Haveli', 18.5089, 73.9634, '020-27451234', 87, 30, 18, 0, 0, true, false, '["CBC", "Urine", "Blood Sugar", "X-Ray"]'::jsonb, '["Medicine", "Obstetrics"]'::jsonb),
('fac-002', 'PHC-KESNAND-01', 'PHC Kesnand', 'PHC', 'LIMITED', 'Kesnand', 'Haveli', 18.5312, 73.9891, '020-27451235', 62, 20, 16, 0, 0, true, false, '["CBC", "Blood Sugar"]'::jsonb, '["Medicine"]'::jsonb),
('fac-003', 'RH-WAGHOLI-01', 'Rural Hospital Wagholi', 'RURAL_HOSPITAL', 'READY', 'Wagholi', 'Haveli', 18.5565, 73.9841, '020-27451236', 78, 60, 35, 4, 2, true, false, '["CBC", "X-Ray", "Ultrasound", "ECG"]'::jsonb, '["Medicine", "Pediatrics", "Obstetrics"]'::jsonb),
('fac-004', 'RH-LONI-01', 'Rural Hospital Loni Kalbhor', 'RURAL_HOSPITAL', 'CRITICAL', 'Loni Kalbhor', 'Haveli', 18.4789, 73.9201, '020-27451237', 34, 40, 39, 2, 2, false, false, '["CBC"]'::jsonb, '["Medicine"]'::jsonb),
('fac-005', 'DH-SASSOON-01', 'Sassoon District Hospital', 'DISTRICT_HOSPITAL', 'READY', 'Pune City', 'Pune', 18.5195, 73.8553, '020-26128000', 92, 250, 180, 30, 22, true, true, '["CBC", "X-Ray", "Ultrasound", "CT", "MRI", "ECG", "Pathology"]'::jsonb, '["Medicine", "Pediatrics", "Obstetrics", "Surgery", "Cardiology", "Neurology", "Orthopedics"]'::jsonb),
('fac-006', 'CHC-KHED-01', 'CHC Khed Shivapur', 'CHC', 'READY', 'Khed Shivapur', 'Haveli', 18.3789, 73.8123, '020-27451238', 71, 50, 28, 2, 0, true, false, '["CBC", "X-Ray", "Ultrasound", "Blood Sugar"]'::jsonb, '["Medicine", "Pediatrics"]'::jsonb),
('fac-007', 'AM-URULI-01', 'Arogya Mandir Uruli Kanchan', 'AROGYA_MANDIR', 'READY', 'Uruli Kanchan', 'Haveli', 18.4512, 74.0123, '020-27451239', 88, 6, 1, 0, 0, true, false, '["Blood Sugar", "Urine", "Hemoglobin"]'::jsonb, '[]'::jsonb),
('fac-008', 'AM-NANDED-01', 'Arogya Mandir Nanded Fata', 'AROGYA_MANDIR', 'READY', 'Nanded Fata', 'Haveli', 18.4678, 73.8456, '020-27451240', 82, 4, 0, 0, 0, true, false, '["Blood Sugar", "Hemoglobin"]'::jsonb, '[]'::jsonb),
('fac-009', 'DC-HADAPSAR-01', 'Diagnostic Centre Hadapsar', 'DIAGNOSTIC_CENTRE', 'READY', 'Hadapsar', 'Haveli', 18.5018, 73.9254, '020-27451241', 95, 0, 0, 0, 0, false, false, '["CBC", "X-Ray", "Ultrasound", "CT", "MRI", "Pathology"]'::jsonb, '[]'::jsonb),
('fac-010', 'BB-YERWADA-01', 'Blood Bank Yerwada', 'BLOOD_BANK', 'READY', 'Yerwada', 'Pune', 18.5523, 73.8901, '020-27451242', 90, 0, 0, 0, 0, false, true, '[]'::jsonb, '[]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- ── 17. SEED DEMO USERS (Password for all accounts: demo1234) ────────────────
-- Hash: $2a$12$e8YkYg4fH4m9o5wQJv2e5OCsJ8vHwR2qX0I1Wf2mK3YvM7dF9y6Gy (demo1234)
INSERT INTO users (id, employee_id, name, email, phone, role, facility_id, taluka, village, password_hash)
VALUES
('usr-001', 'ASHA-HAV-001', 'Savita Mane', 'savita.mane@arogyamarg.gov.in', '9876543201', 'ASHA', 'fac-007', 'Haveli', 'Uruli Kanchan', '$2a$12$6qV92HwV6n3o2t27U5aV3.E5vHj9M8YkZ8cW9X.wX9eB6eX2sO2vW'),
('usr-002', 'ASHA-HAV-002', 'Priya Shinde', 'priya.shinde@arogyamarg.gov.in', '9876543202', 'ASHA', 'fac-008', 'Haveli', 'Nanded Fata', '$2a$12$6qV92HwV6n3o2t27U5aV3.E5vHj9M8YkZ8cW9X.wX9eB6eX2sO2vW'),
('usr-003', 'PHC-MAN-001', 'Dr. Anil Patil', 'anil.patil@arogyamarg.gov.in', '9876543203', 'PHC_DOCTOR', 'fac-001', 'Haveli', 'Manjari', '$2a$12$6qV92HwV6n3o2t27U5aV3.E5vHj9M8YkZ8cW9X.wX9eB6eX2sO2vW'),
('usr-004', 'PHC-KES-001', 'Dr. Sunita Jadhav', 'sunita.jadhav@arogyamarg.gov.in', '9876543204', 'PHC_DOCTOR', 'fac-002', 'Haveli', 'Kesnand', '$2a$12$6qV92HwV6n3o2t27U5aV3.E5vHj9M8YkZ8cW9X.wX9eB6eX2sO2vW'),
('usr-005', 'RH-WAG-001', 'Staff Ravi Kulkarni', 'ravi.kulkarni@arogyamarg.gov.in', '9876543205', 'HOSPITAL_STAFF', 'fac-003', 'Haveli', 'Wagholi', '$2a$12$6qV92HwV6n3o2t27U5aV3.E5vHj9M8YkZ8cW9X.wX9eB6eX2sO2vW'),
('usr-006', 'DH-SAS-001', 'Dr. Meera Deshpande', 'meera.deshpande@arogyamarg.gov.in', '9876543206', 'SPECIALIST', 'fac-005', 'Pune', 'Pune City', '$2a$12$6qV92HwV6n3o2t27U5aV3.E5vHj9M8YkZ8cW9X.wX9eB6eX2sO2vW'),
('usr-007', 'DA-PUNE-001', 'Dr. Rajesh Kale', 'rajesh.kale@arogyamarg.gov.in', '9876543207', 'DISTRICT_ADMIN', NULL, 'Pune', 'Pune City', '$2a$12$6qV92HwV6n3o2t27U5aV3.E5vHj9M8YkZ8cW9X.wX9eB6eX2sO2vW'),
('usr-008', 'HOSP-SAS-001', 'Staff Pooja Bhosale', 'pooja.bhosale@arogyamarg.gov.in', '9876543208', 'HOSPITAL_STAFF', 'fac-005', 'Pune', 'Pune City', '$2a$12$6qV92HwV6n3o2t27U5aV3.E5vHj9M8YkZ8cW9X.wX9eB6eX2sO2vW')
ON CONFLICT (id) DO NOTHING;

-- ── 18. SEED SIMULATION SCENARIOS ─────────────────────────────────────────────
INSERT INTO simulation_scenarios (id, name, description, scenario_type, target_facility_id, config, is_active)
VALUES
('sim-001', 'Wagholi Hospital Oxygen Outage', 'Simulate a sudden failure in the liquid medical oxygen tank at Rural Hospital Wagholi.', 'OXYGEN_FAILURE', 'fac-003', '{"status": "CRITICAL", "oxygen_available": false, "readiness_score": 38}'::jsonb, false),
('sim-002', 'Kesnand PHC Surge & Bed Saturation', 'Simulate a localized gastroenteritis outbreak causing full occupancy of all general and emergency beds at PHC Kesnand.', 'BED_SATURATION', 'fac-002', '{"status": "CRITICAL", "occupied_beds": 20, "readiness_score": 22}'::jsonb, false),
('sim-003', 'Sassoon ICU Overcapacity', 'Simulate complete saturation of all 30 ICU beds at Sassoon District Hospital following a multi-vehicle highway accident.', 'ICU_SATURATION', 'fac-005', '{"icu_occupied": 30, "status": "LIMITED", "readiness_score": 52}'::jsonb, false)
ON CONFLICT (id) DO NOTHING;

-- ── 19. GRANT PERMISSIONS ─────────────────────────────────────────────────────
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;

-- ── 20. RELOAD POSTGREST SCHEMA CACHE ─────────────────────────────────────────
NOTIFY pgrst, 'reload schema';


