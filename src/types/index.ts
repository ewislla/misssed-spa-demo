// ─── Shared Types ────────────────────────────────────────────────────────────

export interface Spa {
  id: string;
  name: string;
  slug: string;
  phone_number?: string;
  booking_url: string;
  notification_email: string;
  logo_emoji?: string;
  primary_color?: string;
}

export interface Lead {
  id: string;
  spa_id: string;
  caller_phone: string;
  treatment_interest: string;
  goal: string;
  name: string;
  email?: string;
  notes?: string;
  booked: boolean;
  created_at: string;
}

export interface MissedCall {
  id: string;
  spa_id: string;
  caller_phone: string;
  sms_sent: boolean;
  quiz_opened: boolean;
  lead_captured: boolean;
  called_at: string;
}

export interface QuizStep {
  id: string;
  question: string;
  type: "choice" | "input" | "textarea";
  options?: string[];
  placeholder?: string;
  field: keyof LeadFormData;
}

export interface LeadFormData {
  treatment_interest: string;
  goal: string;
  name: string;
  email: string;
  notes: string;
}
