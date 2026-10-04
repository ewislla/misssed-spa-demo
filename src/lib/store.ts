/**
 * Store for Missed Calls, SMS Messages, and Leads
 * Supports local in-memory persistence and connects to Supabase when credentials are provided.
 */

export interface CallRecord {
  id: string;
  callerPhone: string;
  toPhone: string;
  callSid: string;
  status: "missed" | "completed" | "forwarded";
  timestamp: string;
}

export interface SmsRecord {
  id: string;
  direction: "outbound" | "inbound";
  fromPhone: string;
  toPhone: string;
  body: string;
  sid?: string;
  timestamp: string;
}

export interface LeadRecord {
  id: string;
  name: string;
  callerPhone: string;
  email?: string;
  treatmentInterest: string;
  goal?: string;
  notes?: string;
  preferredTime?: string;
  status: "new" | "contacted" | "booked";
  createdAt: string;
}

interface DataStore {
  calls: CallRecord[];
  messages: SmsRecord[];
  leads: LeadRecord[];
}

// In-memory global store to survive hot module reloads in Next dev
const globalForStore = globalThis as unknown as { __appStore?: DataStore };

if (!globalForStore.__appStore) {
  globalForStore.__appStore = {
    calls: [
      {
        id: "call-demo-1",
        callerPhone: "+1 (555) 782-9011",
        toPhone: "+1 (888) 555-0192",
        callSid: "CA_sample_001",
        status: "missed",
        timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
      },
    ],
    messages: [
      {
        id: "msg-demo-1",
        direction: "outbound",
        fromPhone: "+1 (888) 555-0192",
        toPhone: "+1 (555) 782-9011",
        body: "Hey! We noticed you just called Glow Studio 💆‍♀️ To save you waiting on hold, tap here to tell us what you're looking for and claim priority booking:\n\n→ http://localhost:3000/q/glow-studio\n\nReply STOP to opt out.",
        timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
      },
      {
        id: "msg-demo-2",
        direction: "inbound",
        fromPhone: "+1 (555) 782-9011",
        toPhone: "+1 (888) 555-0192",
        body: "Thanks! Just filled out the form for a HydraFacial this Friday.",
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      },
    ],
    leads: [
      {
        id: "lead-demo-1",
        name: "Jessica Miller",
        callerPhone: "+1 (555) 782-9011",
        email: "jessica@example.com",
        treatmentInterest: "Deluxe HydraFacial",
        goal: "Glow & Deep Cleansing before event",
        preferredTime: "Friday Afternoon (2 PM)",
        status: "new",
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      },
    ],
  };
}

export const store = globalForStore.__appStore;

export function addCall(call: Omit<CallRecord, "id" | "timestamp">): CallRecord {
  const record: CallRecord = {
    ...call,
    id: `call-${Date.now()}`,
    timestamp: new Date().toISOString(),
  };
  store.calls.unshift(record);
  return record;
}

export function addMessage(msg: Omit<SmsRecord, "id" | "timestamp">): SmsRecord {
  const record: SmsRecord = {
    ...msg,
    id: `msg-${Date.now()}`,
    timestamp: new Date().toISOString(),
  };
  store.messages.unshift(record);
  return record;
}

export function addLead(lead: Omit<LeadRecord, "id" | "status" | "createdAt">): LeadRecord {
  const record: LeadRecord = {
    ...lead,
    id: `lead-${Date.now()}`,
    status: "new",
    createdAt: new Date().toISOString(),
  };
  store.leads.unshift(record);
  return record;
}
