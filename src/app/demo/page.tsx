"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { QuizWidget } from "@/components/quiz/QuizWidget";
import { activeClient } from "@/config/client";
import type { LeadFormData } from "@/types";

type PhoneView = "lock" | "call" | "sms" | "quiz" | "complete";

interface ChatMessage {
  id: string;
  sender: "business" | "user";
  text: string;
  time: string;
}

export default function DemoPage() {
  const [callerPhone, setCallerPhone] = useState("+1 (555) 782-9011");
  const [phoneView, setPhoneView] = useState<PhoneView>("lock");
  const [callState, setCallState] = useState<"idle" | "ringing" | "forwarded" | "greeting">("idle");
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [smsReplyInput, setSmsReplyInput] = useState("");
  const [lastLead, setLastLead] = useState<{
    name: string;
    phone: string;
    treatment: string;
    preferredTime: string;
  } | null>(null);
  const [isCallingWebhook, setIsCallingWebhook] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Time formatter
  const currentTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Trigger the simulated missed call flow
  const triggerMissedCall = async () => {
    setIsCallingWebhook(true);
    setPhoneView("call");
    setCallState("ringing");
    setNotificationVisible(false);

    // 1. Ringing for 2.5 seconds
    setTimeout(async () => {
      setCallState("forwarded");

      // 2. Play greeting / speak
      setTimeout(() => {
        setCallState("greeting");
        setAudioPlaying(true);

        // Web speech synthesis if available in browser
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(activeClient.voiceGreeting);
          utterance.rate = 1.05;
          utterance.pitch = 1.0;
          utterance.onend = () => setAudioPlaying(false);
          window.speechSynthesis.speak(utterance);
        } else {
          setTimeout(() => setAudioPlaying(false), 5000);
        }
      }, 1500);

      // 3. Call the REAL /api/twilio/voice backend route
      try {
        const baseUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
        await fetch("/api/twilio/voice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            From: callerPhone,
            To: activeClient.dedicatedTwilioPhone,
            CallSid: `call-sim-${Date.now()}`,
          }),
        });
      } catch (err) {
        console.error("Webhook call failed", err);
      }

      // 4. Send the text message after 4.5 seconds
      setTimeout(() => {
        const baseUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
        const quizLink = `${baseUrl}/q/${activeClient.slug}`;
        const smsText = activeClient.smsMessageTemplate.replace("{quiz_link}", quizLink);

        setChatMessages([
          {
            id: `msg-${Date.now()}`,
            sender: "business",
            text: smsText,
            time: currentTime,
          },
        ]);

        setPhoneView("sms");
        setNotificationVisible(true);
        setIsCallingWebhook(false);
      }, 5500);
    }, 2500);
  };

  // Handle user replying to SMS directly on the phone screen
  const handleSendSmsReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smsReplyInput.trim()) return;

    const userText = smsReplyInput;
    setSmsReplyInput("");

    // Add user message to phone screen
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: userText,
      time: currentTime,
    };
    setChatMessages((prev) => [...prev, userMsg]);

    // Send to backend /api/twilio/sms route
    try {
      await fetch("/api/twilio/sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          From: callerPhone,
          To: activeClient.dedicatedTwilioPhone,
          Body: userText,
        }),
      });

      // Automated auto-reply on phone screen
      setTimeout(() => {
        const baseUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
        const quizLink = `${baseUrl}/q/${activeClient.slug}`;
        setChatMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: "business",
            text: `Thanks for texting ${activeClient.name}! Our receptionist has been notified. To secure your treatment spot right now, tap our quick link: ${quizLink}`,
            time: currentTime,
          },
        ]);
      }, 1000);
    } catch (err) {
      console.error("SMS reply error", err);
    }
  };

  // Handle quiz submission
  const handleQuizCompleted = (data: LeadFormData & { preferred_time?: string }) => {
    setLastLead({
      name: data.name || "Client",
      phone: callerPhone,
      treatment: data.treatment_interest,
      preferredTime: data.preferred_time || "Flexible",
    });
    setPhoneView("complete");
  };

  const resetAll = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setPhoneView("lock");
    setCallState("idle");
    setNotificationVisible(false);
    setLastLead(null);
    setChatMessages([]);
  };

  return (
    <main style={{ minHeight: "100vh", background: "#0a0a0f", color: "#fff", paddingBottom: 60, fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Top Navigation */}
      <nav style={{
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(18,18,24,0.8)",
        backdropFilter: "blur(12px)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 22 }}>{activeClient.logoEmoji}</span>
            <span style={{ fontWeight: 800, fontSize: 17, color: "#fff", letterSpacing: "-0.02em" }}>
              Missed<span style={{ color: "#10b981" }}>Spa</span>
            </span>
          </Link>
          <span style={{ color: "rgba(255,255,255,0.2)" }}>/</span>
          <span style={{ fontSize: 13, color: "#34d399", background: "rgba(16,185,129,0.12)", padding: "4px 10px", borderRadius: 20, border: "1px solid rgba(16,185,129,0.25)" }}>
            Client: {activeClient.name}
          </span>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Link
            href="/dashboard"
            style={{
              textDecoration: "none",
              fontSize: 13,
              color: "rgba(255,255,255,0.7)",
              padding: "8px 14px",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.03)",
            }}
          >
            📊 View Lead Archive
          </Link>
          <button
            onClick={resetAll}
            style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "rgba(255,255,255,0.8)",
              padding: "8px 14px",
              borderRadius: 8,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            ↺ Reset Simulator
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "36px 20px" }}>
        
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <h1 style={{ fontSize: "clamp(26px, 3.5vw, 40px)", fontWeight: 900, marginBottom: 8, letterSpacing: "-0.03em" }}>
            Live Missed Call &amp; <span style={{ color: "#10b981" }}>SMS Text Screen</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 15, maxWidth: 640, margin: "0 auto" }}>
            Experience the exact caller journey in real time: watch the call forward, listen to the VIP greeting, receive the SMS text, and send replies.
          </p>
        </div>

        {/* 2-Column Layout */}
        <div style={{ display: "grid", gridTemplateColumns: "minmax(320px, 380px) 1fr", gap: 36, alignItems: "start" }}>

          {/* LEFT: THE INTERACTIVE SMARTPHONE */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            
            {/* Phone Device Shell */}
            <div style={{
              width: 340,
              height: 690,
              background: "#000",
              borderRadius: 48,
              border: "8px solid #24242e",
              boxShadow: "0 25px 60px rgba(0,0,0,0.8), 0 0 40px rgba(16,185,129,0.12)",
              position: "relative",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}>
              
              {/* Dynamic Island / Notch */}
              <div style={{
                position: "absolute",
                top: 10,
                left: "50%",
                transform: "translateX(-50%)",
                width: 110,
                height: 26,
                background: "#000",
                borderRadius: 20,
                zIndex: 50,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#111" }} />
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#064e3b" }} />
              </div>

              {/* Status Bar */}
              <div style={{
                padding: "14px 24px 6px",
                display: "flex",
                justifyContent: "space-between",
                fontSize: 12,
                fontWeight: 600,
                color: "#fff",
                zIndex: 40,
              }}>
                <span>{currentTime}</span>
                <span style={{ fontSize: 11, letterSpacing: 2 }}>5G 100%</span>
              </div>

              {/* Push Notification Dropdown Banner */}
              {notificationVisible && (
                <div
                  onClick={() => setPhoneView("sms")}
                  style={{
                    margin: "4px 12px 10px",
                    padding: "10px 14px",
                    background: "rgba(35, 35, 45, 0.95)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: 16,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
                    cursor: "pointer",
                    zIndex: 60,
                    animation: "fadeInDown 0.3s ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 14 }}>💬</span>
                    <strong style={{ fontSize: 12, color: "#fff" }}>MESSAGES · {activeClient.name}</strong>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginLeft: "auto" }}>now</span>
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    Hey! We noticed you just called Glow Studio... tap here to tell us what you&apos;re looking for.
                  </div>
                </div>
              )}

              {/* SCREEN CONTENT */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
                
                {/* 1. LOCK SCREEN / IDLE */}
                {phoneView === "lock" && (
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20, textAlign: "center" }}>
                    <div style={{ fontSize: 48, fontWeight: 200, marginBottom: 4 }}>{currentTime}</div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 40 }}>Friday, October 24</div>
                    <div style={{
                      width: 68,
                      height: 68,
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.06)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 32,
                      marginBottom: 16,
                    }}>
                      📱
                    </div>
                    <div style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", maxWidth: 220 }}>
                      Click <strong>&quot;Simulate Call&quot;</strong> below to watch the call &amp; SMS trigger live.
                    </div>
                  </div>
                )}

                {/* 2. CALL SCREEN */}
                {phoneView === "call" && (
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "40px 20px 30px", textAlign: "center" }}>
                    <div>
                      <div style={{ fontSize: 13, color: "#10b981", fontWeight: 600, marginBottom: 8, letterSpacing: 1 }}>
                        {callState === "ringing" && "CALLING..."}
                        {callState === "forwarded" && "FORWARDED VIA *71"}
                        {callState === "greeting" && "AUTOMATED VIP GREETING"}
                      </div>
                      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{activeClient.name}</h2>
                      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{activeClient.realOfficePhone}</div>
                    </div>

                    {/* Center Animation */}
                    <div>
                      {callState === "ringing" && (
                        <div style={{
                          width: 84,
                          height: 84,
                          borderRadius: "50%",
                          background: "linear-gradient(135deg, #10b981, #059669)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 36,
                          animation: "pulse 1.2s infinite",
                          boxShadow: "0 0 35px rgba(16,185,129,0.5)",
                        }}>
                          📞
                        </div>
                      )}

                      {callState === "forwarded" && (
                        <div style={{
                          padding: "12px 18px",
                          background: "rgba(16,185,129,0.15)",
                          border: "1px solid #10b981",
                          borderRadius: 14,
                          fontSize: 13,
                          color: "#34d399",
                        }}>
                          ⚡ Carrier forwarded unanswered call to dedicated tracking line
                        </div>
                      )}

                      {callState === "greeting" && (
                        <div style={{
                          padding: "16px",
                          background: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.15)",
                          borderRadius: 16,
                          maxWidth: 280,
                        }}>
                          <div style={{ fontSize: 24, marginBottom: 8 }}>{audioPlaying ? "🔊" : "💬"}</div>
                          <div style={{ fontSize: 12, color: "#fff", lineHeight: 1.4, fontStyle: "italic" }}>
                            &quot;{activeClient.voiceGreeting}&quot;
                          </div>
                          <div style={{ fontSize: 11, color: "#10b981", marginTop: 8, fontWeight: 600 }}>
                            {audioPlaying ? "Playing audio..." : "Hanging up & sending text..."}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* End Call Button */}
                    <button
                      onClick={() => setPhoneView("lock")}
                      style={{
                        width: 58,
                        height: 58,
                        borderRadius: "50%",
                        background: "#ef4444",
                        border: "none",
                        color: "#fff",
                        fontSize: 24,
                        cursor: "pointer",
                      }}
                    >
                      📵
                    </button>
                  </div>
                )}

                {/* 3. REAL SMS TEXT MESSAGING SCREEN */}
                {phoneView === "sms" && (
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#0d0d12" }}>
                    
                    {/* Chat Header */}
                    <div style={{
                      padding: "10px 16px",
                      background: "rgba(255,255,255,0.04)",
                      borderBottom: "1px solid rgba(255,255,255,0.08)",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}>
                      <button
                        onClick={() => setPhoneView("lock")}
                        style={{ background: "none", border: "none", color: "#10b981", fontSize: 14, cursor: "pointer", padding: 0 }}
                      >
                        ‹ Back
                      </button>
                      <div style={{ textAlign: "center", flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>{activeClient.name}</div>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{activeClient.dedicatedTwilioPhone}</div>
                      </div>
                      <div style={{ width: 30 }} />
                    </div>

                    {/* Messages Body */}
                    <div style={{ flex: 1, padding: 14, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
                      <div style={{ textAlign: "center", fontSize: 10, color: "rgba(255,255,255,0.3)", margin: "4px 0" }}>
                        Today {currentTime}
                      </div>

                      {chatMessages.map((msg) => {
                        const isBiz = msg.sender === "business";
                        const quizUrl = `/q/${activeClient.slug}`;

                        return (
                          <div
                            key={msg.id}
                            style={{
                              alignSelf: isBiz ? "flex-start" : "flex-end",
                              maxWidth: "85%",
                              background: isBiz ? "#22222c" : "#059669",
                              color: "#fff",
                              padding: "10px 14px",
                              borderRadius: isBiz ? "16px 16px 16px 4px" : "16px 16px 4px 16px",
                              fontSize: 13,
                              lineHeight: 1.45,
                              boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                            }}
                          >
                            {msg.text.split("\n").map((line, idx) => {
                              if (line.includes("→") || line.includes("http")) {
                                return (
                                  <div key={idx} style={{ marginTop: 8, marginBottom: 8 }}>
                                    <button
                                      type="button"
                                      onClick={() => setPhoneView("quiz")}
                                      style={{
                                        display: "inline-block",
                                        padding: "8px 12px",
                                        background: "linear-gradient(135deg, #059669, #10b981)",
                                        color: "#fff",
                                        borderRadius: 8,
                                        fontWeight: 700,
                                        fontSize: 12,
                                        border: "none",
                                        cursor: "pointer",
                                        textDecoration: "none",
                                      }}
                                    >
                                      👉 Tap to Book Treatment
                                    </button>
                                  </div>
                                );
                              }
                              return <div key={idx}>{line}</div>;
                            })}
                            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", textAlign: "right", marginTop: 4 }}>
                              {msg.time}
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* 2-Way SMS Input Bar */}
                    <form
                      onSubmit={handleSendSmsReply}
                      style={{
                        padding: "8px 10px",
                        background: "rgba(255,255,255,0.03)",
                        borderTop: "1px solid rgba(255,255,255,0.08)",
                        display: "flex",
                        gap: 8,
                        alignItems: "center",
                      }}
                    >
                      <input
                        type="text"
                        placeholder="Text a reply (e.g. 'Are you open?')"
                        value={smsReplyInput}
                        onChange={(e) => setSmsReplyInput(e.target.value)}
                        style={{
                          flex: 1,
                          padding: "8px 12px",
                          borderRadius: 20,
                          background: "#1e1e28",
                          border: "1px solid rgba(255,255,255,0.1)",
                          color: "#fff",
                          fontSize: 12,
                          outline: "none",
                        }}
                      />
                      <button
                        type="submit"
                        disabled={!smsReplyInput.trim()}
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          background: smsReplyInput.trim() ? "#10b981" : "rgba(255,255,255,0.1)",
                          border: "none",
                          color: "#fff",
                          fontSize: 14,
                          cursor: smsReplyInput.trim() ? "pointer" : "default",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        ↑
                      </button>
                    </form>
                  </div>
                )}

                {/* 4. INTAKE QUIZ SCREEN INSIDE PHONE */}
                {phoneView === "quiz" && (
                  <div style={{ flex: 1, background: "#111118", overflowY: "auto", padding: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                      <button
                        onClick={() => setPhoneView("sms")}
                        style={{ background: "none", border: "none", color: "#10b981", fontSize: 13, cursor: "pointer" }}
                      >
                        ‹ Back to Text
                      </button>
                    </div>
                    <QuizWidget
                      spaName={activeClient.name}
                      bookingUrl={activeClient.externalBookingUrl}
                      logoEmoji={activeClient.logoEmoji}
                      callerPhone={callerPhone}
                      isDemo={true}
                      onComplete={handleQuizCompleted}
                    />
                  </div>
                )}

                {/* 5. SUCCESS / FINISHED SCREEN */}
                {phoneView === "complete" && (
                  <div style={{ flex: 1, background: "#111118", padding: 24, textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <div style={{ fontSize: 44, marginBottom: 12 }}>🎉</div>
                    <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Done on Customer&apos;s Phone!</h3>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 20 }}>
                      The customer requested their appointment and was redirected to your booking calendar.
                    </p>
                    <button
                      onClick={() => setPhoneView("sms")}
                      style={{
                        padding: "10px 16px",
                        borderRadius: 10,
                        background: "rgba(255,255,255,0.08)",
                        border: "1px solid rgba(255,255,255,0.15)",
                        color: "#fff",
                        fontSize: 13,
                        cursor: "pointer",
                      }}
                    >
                      ← Return to Text Thread
                    </button>
                  </div>
                )}
              </div>

              {/* Bottom Home Indicator Bar */}
              <div style={{ height: 18, display: "flex", justifyContent: "center", alignItems: "center" }}>
                <div style={{ width: 120, height: 4, background: "rgba(255,255,255,0.4)", borderRadius: 4 }} />
              </div>
            </div>

            {/* Test Trigger Button */}
            <div style={{ marginTop: 20, width: 340, display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                onClick={triggerMissedCall}
                disabled={isCallingWebhook}
                style={{
                  width: "100%",
                  padding: "14px 20px",
                  borderRadius: 14,
                  background: "linear-gradient(135deg, #059669, #10b981)",
                  border: "none",
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: 15,
                  cursor: isCallingWebhook ? "wait" : "pointer",
                  boxShadow: "0 4px 20px rgba(16,185,129,0.35)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                }}
              >
                <span>📞</span>
                <span>{isCallingWebhook ? "Processing Webhook..." : "Simulate Missed Call & SMS"}</span>
              </button>
              
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => setPhoneView("sms")}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "rgba(255,255,255,0.8)",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  💬 Open SMS App
                </button>
                <button
                  onClick={() => setPhoneView("quiz")}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "rgba(255,255,255,0.8)",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  📝 Open Quiz Form
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: SPA OWNER INSTANT NOTIFICATION & SYSTEM EXPLANATION */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            
            {/* CARD 1: SPA OWNER MOBILE ALERT (NO DASHBOARD LOGIN REQUIRED!) */}
            <div style={{
              background: "rgba(22, 22, 30, 0.8)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              borderRadius: 20,
              padding: 24,
              boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 20 }}>📱</span>
                  <strong style={{ fontSize: 16, color: "#34d399" }}>Spa Owner Mobile Alert</strong>
                </div>
                <span style={{ fontSize: 11, background: "rgba(16,185,129,0.15)", color: "#10b981", padding: "3px 8px", borderRadius: 12, fontWeight: 700 }}>
                  Zero Dashboard Needed
                </span>
              </div>

              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 16 }}>
                The spa owner or receptionist is on their feet. When the customer submits the quiz, the owner immediately receives this formatted notification on their personal cell phone:
              </p>

              {/* Mock SMS notification banner */}
              <div style={{
                background: "rgba(0,0,0,0.6)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 14,
                padding: "16px 18px",
                fontFamily: "monospace",
                fontSize: 13,
                lineHeight: 1.6,
                color: "#e2e8f0",
              }}>
                <div style={{ color: "#34d399", fontWeight: 700, marginBottom: 6 }}>
                  🚨 [Glow Studio Alert] New Appointment Request!
                </div>
                <div><strong>• Client:</strong> {lastLead ? lastLead.name : "Jessica Miller"}</div>
                <div><strong>• Phone:</strong> {lastLead ? lastLead.phone : callerPhone}</div>
                <div><strong>• Treatment:</strong> {lastLead ? lastLead.treatment : "Deluxe HydraFacial ($175)"}</div>
                <div><strong>• Preferred Time:</strong> {lastLead ? lastLead.preferredTime : "This Friday afternoon"}</div>
                
                <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                  <a
                    href={`tel:${(lastLead ? lastLead.phone : callerPhone).replace(/\D/g, "")}`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 16px",
                      background: "#059669",
                      color: "#fff",
                      borderRadius: 8,
                      textDecoration: "none",
                      fontWeight: 700,
                      fontSize: 13,
                    }}
                  >
                    📞 Tap to Call Client Back Now
                  </a>
                </div>
              </div>
            </div>

            {/* CARD 2: CARRIER SETUP CODE (*71) */}
            <div style={{
              background: "rgba(22, 22, 30, 0.8)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 20,
              padding: 24,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 20 }}>⚙️</span>
                <strong style={{ fontSize: 16 }}>Client Setup (*71 Conditional Forwarding)</strong>
              </div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 16 }}>
                The spa keeps their real phone number. To activate this for your client, they simply dial this code once from their office phone:
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ padding: "12px 14px", background: "rgba(255,255,255,0.04)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600, textTransform: "uppercase" }}>Verizon / US Cellular</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#34d399", marginTop: 4 }}>
                    *71 {activeClient.dedicatedTwilioPhone}
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>Dial once from phone</div>
                </div>

                <div style={{ padding: "12px 14px", background: "rgba(255,255,255,0.04)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600, textTransform: "uppercase" }}>AT&amp;T / T-Mobile</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#34d399", marginTop: 4 }}>
                    **61*{activeClient.dedicatedTwilioPhone}#
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>Dial once from phone</div>
                </div>
              </div>
            </div>

            {/* CARD 3: REPLICATION FOR CLIENT #2 */}
            <div style={{
              background: "rgba(22, 22, 30, 0.8)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 20,
              padding: 24,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 20 }}>📋</span>
                <strong style={{ fontSize: 16 }}>How to Replicate for a New Client</strong>
              </div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 12 }}>
                Everything is driven by <code>src/config/client.ts</code>. When you sign your next client, just update:
              </p>
              <ul style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", paddingLeft: 18, lineHeight: 1.8 }}>
                <li><code>name</code>: New Spa Name</li>
                <li><code>dedicatedTwilioPhone</code>: Their assigned Twilio number</li>
                <li><code>ownerNotificationPhone</code>: The owner&apos;s mobile number for instant alerts</li>
                <li><code>externalBookingUrl</code>: Their Vagaro, Boulevard, or Square calendar link</li>
                <li><code>services</code>: Their treatments and prices</li>
              </ul>
            </div>

          </div>

        </div>

      </div>
    </main>
  );
}
