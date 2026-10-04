"use client";
import { useState } from "react";
import { activeClient } from "@/config/client";
import type { LeadFormData, QuizStep } from "@/types";

export interface ExtendedQuizProps {
  spaName?: string;
  bookingUrl?: string;
  logoEmoji?: string;
  callerPhone?: string;
  isDemo?: boolean;
  onComplete?: (data: LeadFormData & { preferred_time?: string }) => void;
}

export function QuizWidget({
  spaName = activeClient.name,
  bookingUrl = activeClient.externalBookingUrl,
  logoEmoji = activeClient.logoEmoji,
  callerPhone = "+1 (555) 782-9011",
  isDemo = false,
  onComplete,
}: ExtendedQuizProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookedClicked, setBookedClicked] = useState(false);
  
  const [formData, setFormData] = useState({
    treatment_interest: activeClient.services[0]?.name || "Deluxe HydraFacial",
    goal: "Skin glow-up & deep cleansing",
    name: "",
    phone: callerPhone,
    preferred_time: "This Friday afternoon",
    email: "",
    notes: "",
  });

  const treatmentOptions = activeClient.services.map((s) => `${s.name} (${s.price})`);

  const steps = [
    {
      id: "treatment",
      question: "Which treatment are you interested in? 💆‍♀️",
      type: "choice" as const,
      field: "treatment_interest",
      options: treatmentOptions,
    },
    {
      id: "preferred_time",
      question: "When is best for your appointment? 🗓️",
      type: "choice" as const,
      field: "preferred_time",
      options: [
        "As soon as possible / Tomorrow",
        "This Friday afternoon",
        "This weekend",
        "Next week",
        "I'm flexible — call me with openings",
      ],
    },
    {
      id: "name",
      question: "What's your name and best phone number? 👋",
      type: "contact" as const,
    },
  ];

  const step = steps[currentStep];

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((p) => p + 1);
    } else {
      // Final submission
      setIsSubmitting(true);
      try {
        await fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name || "Valued Client",
            caller_phone: formData.phone || callerPhone,
            treatment_interest: formData.treatment_interest,
            goal: formData.goal,
            preferred_time: formData.preferred_time,
            email: formData.email,
            notes: formData.notes,
          }),
        });
      } catch (err) {
        console.error("Failed to submit lead", err);
      } finally {
        setIsSubmitting(false);
        setCompleted(true);
        onComplete?.({
          name: formData.name,
          treatment_interest: formData.treatment_interest,
          goal: formData.goal,
          email: formData.email,
          notes: formData.notes,
          preferred_time: formData.preferred_time,
        });
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((p) => p - 1);
  };

  const pct = Math.round(((currentStep + 1) / steps.length) * 100);

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: "linear-gradient(135deg, #059669, #10b981)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
          }}
        >
          {logoEmoji}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{spaName}</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
            {activeClient.tagline}
          </div>
        </div>
      </div>

      {!completed ? (
        <>
          {/* Progress bar */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>
                Step {currentStep + 1} of {steps.length}
              </span>
              <span style={{ fontSize: 12, color: "#10b981", fontWeight: 700 }}>{pct}%</span>
            </div>
            <div
              style={{
                height: 4,
                background: "rgba(255,255,255,0.08)",
                borderRadius: 4,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${pct}%`,
                  background: "linear-gradient(90deg, #059669, #34d399)",
                  borderRadius: 4,
                  transition: "width 0.4s ease",
                }}
              />
            </div>
          </div>

          {/* Step question */}
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, lineHeight: 1.3 }}>
            {step.question}
          </h2>

          {/* Choice steps */}
          {step.type === "choice" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {step.options?.map((opt) => {
                const isSelected =
                  step.field === "treatment_interest"
                    ? formData.treatment_interest === opt
                    : formData.preferred_time === opt;

                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      if (step.field === "treatment_interest") {
                        setFormData((p) => ({ ...p, treatment_interest: opt }));
                      } else {
                        setFormData((p) => ({ ...p, preferred_time: opt }));
                      }
                      setTimeout(handleNext, 180);
                    }}
                    style={{
                      padding: "14px 18px",
                      background: isSelected ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.04)",
                      border: `1px solid ${isSelected ? "#10b981" : "rgba(255,255,255,0.1)"}`,
                      borderRadius: 12,
                      color: isSelected ? "#34d399" : "var(--text-primary)",
                      fontSize: 14,
                      fontWeight: isSelected ? 600 : 400,
                      textAlign: "left",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      transition: "all 0.15s ease",
                    }}
                  >
                    <span
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        border: `2px solid ${isSelected ? "#10b981" : "rgba(255,255,255,0.3)"}`,
                        background: isSelected ? "#10b981" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 10,
                        color: "#fff",
                      }}
                    >
                      {isSelected ? "✓" : ""}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>
          )}

          {/* Contact step */}
          {step.type === "contact" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", marginBottom: 6, fontWeight: 500 }}>
                  Your Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sarah Jenkins"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "#fff",
                    fontSize: 14,
                    outline: "none",
                  }}
                  autoFocus
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", marginBottom: 6, fontWeight: 500 }}>
                  Your Mobile Phone (for appointment confirmation) *
                </label>
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "#fff",
                    fontSize: 14,
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                <button
                  type="button"
                  onClick={handleBack}
                  style={{
                    padding: "12px 18px",
                    borderRadius: 10,
                    background: "transparent",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "var(--text-secondary)",
                    cursor: "pointer",
                    fontSize: 14,
                  }}
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!formData.name || !formData.phone || isSubmitting}
                  style={{
                    flex: 1,
                    padding: "12px 20px",
                    borderRadius: 10,
                    background: (!formData.name || !formData.phone || isSubmitting)
                      ? "rgba(16,185,129,0.3)"
                      : "linear-gradient(135deg, #059669, #10b981)",
                    border: "none",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: (!formData.name || !formData.phone || isSubmitting) ? "not-allowed" : "pointer",
                  }}
                >
                  {isSubmitting ? "Saving..." : "Confirm & See Booking Options →"}
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Final Success & Direct Booking Link Screen */
        <div style={{ textAlign: "center", paddingTop: 8 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #059669, #34d399)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              fontSize: 28,
              boxShadow: "0 0 30px rgba(16,185,129,0.3)",
            }}
          >
            ✓
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
            You&apos;re all set, {formData.name || "there"}! 🎉
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 20, lineHeight: 1.5 }}>
            We received your request for <strong>{formData.treatment_interest}</strong>. Our front desk has been notified.
          </p>

          <div
            style={{
              padding: "14px 16px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12,
              textAlign: "left",
              marginBottom: 20,
              fontSize: 13,
            }}
          >
            <div style={{ color: "var(--text-muted)", marginBottom: 4 }}>REQUEST SUMMARY</div>
            <div style={{ fontWeight: 600, color: "#fff" }}>{formData.treatment_interest}</div>
            <div style={{ color: "var(--text-secondary)" }}>Preferred: {formData.preferred_time}</div>
          </div>

          {/* DIRECT BOOKING LINK BUTTON TO THE SPA'S EXISTING SYSTEM */}
          <a
            href={bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setBookedClicked(true)}
            style={{
              display: "block",
              width: "100%",
              padding: "16px 20px",
              borderRadius: 12,
              background: "linear-gradient(135deg, #059669, #10b981)",
              color: "#fff",
              fontWeight: 800,
              fontSize: 15,
              textDecoration: "none",
              marginBottom: 12,
              boxShadow: "0 4px 16px rgba(16,185,129,0.3)",
              transition: "transform 0.15s ease",
            }}
          >
            📅 Pick Your Exact Time on Our Calendar →
          </a>

          {bookedClicked && (
            <div style={{ fontSize: 12, color: "#34d399", marginBottom: 10 }}>
              ✓ Booking calendar opened!
            </div>
          )}

          <p style={{ color: "var(--text-muted)", fontSize: 12 }}>
            Or simply wait — our team will call or text you at {formData.phone} shortly.
          </p>
        </div>
      )}
    </div>
  );
}
