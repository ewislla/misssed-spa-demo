/**
 * Client Configuration
 * 
 * To replicate this system for a new client (Spa #2, Spa #3):
 * Simply update this single file with the new client's details!
 */

export interface ClientService {
  id: string;
  name: string;
  category: string;
  price: string;
  duration: string;
}

export interface ClientConfig {
  // Business Profile
  id: string;
  name: string;
  slug: string;
  tagline: string;
  logoEmoji: string;
  primaryColor: string;
  
  // Contact Details
  realOfficePhone: string;     // Client's existing phone number (keeps this)
  dedicatedTwilioPhone: string; // The virtual number assigned to this client
  ownerNotificationPhone: string; // Owner's cell phone for instant lead SMS alerts
  ownerNotificationEmail: string; // Owner's email for lead alerts
  
  // Existing Booking Engine (e.g. Vagaro, Boulevard, Calendly, Fresha, Square)
  externalBookingUrl: string;
  
  // Telephony Voice & SMS Scripts
  voiceGreeting: string;
  smsMessageTemplate: string;
  
  // Treatment Menu
  services: ClientService[];
}

export const activeClient: ClientConfig = {
  id: "client-001",
  name: "Glow Studio Medspa",
  slug: "glow-studio",
  tagline: "Luxury Aesthetics & Skin Wellness",
  logoEmoji: "💆‍♀️",
  primaryColor: "#059669", // Emerald / Spa green
  
  realOfficePhone: "+1 (555) 349-8800",
  dedicatedTwilioPhone: "+1 (888) 555-0192",
  ownerNotificationPhone: "+1 (555) 920-1122",
  ownerNotificationEmail: "owner@glowstudiomedspa.com",
  
  // Link to the spa's existing booking system (Vagaro, Boulevard, Square, etc.)
  externalBookingUrl: "https://www.vagaro.com/glowstudiomedspa",
  
  // Respectful VIP Voice Greeting (Spoken by Amazon Polly Neural Voice if caller is forwarded)
  voiceGreeting: "Hey! Thanks for calling Glow Studio. To get you scheduled and taken care of right away without waiting on hold, we just sent a direct link to your phone so you can pick your preferred time. Have a wonderful day!",
  
  // SMS sent immediately to caller's mobile number
  smsMessageTemplate: "Hey! We noticed you just called Glow Studio 💆‍♀️ To save you waiting on hold, tap here to tell us what you're looking for and claim priority booking:\n\n→ {quiz_link}\n\nReply STOP to opt out.",
  
  // Services shown on the quick intake quiz
  services: [
    { id: "hydrafacial", name: "Deluxe HydraFacial", category: "Facials", price: "$175", duration: "50 min" },
    { id: "microneedling", name: "Collagen Microneedling", category: "Skin Rejuvenation", price: "$250", duration: "60 min" },
    { id: "botox", name: "Botox & Wrinkle Smoothing", category: "Injectables", price: "$12/unit", duration: "30 min" },
    { id: "laser", name: "Laser Hair Removal", category: "Body & Laser", price: "$120", duration: "45 min" },
    { id: "massage", name: "Signature Deep Tissue Massage", category: "Wellness", price: "$130", duration: "60 min" },
  ]
};
