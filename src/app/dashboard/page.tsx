"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { activeClient } from "@/config/client";
import type { LeadRecord, CallRecord, SmsRecord } from "@/lib/store";

export default function DashboardPage() {
  const [filter, setFilter] = useState<"all" | "booked" | "pending">("all");
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [messages, setMessages] = useState<SmsRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch real data from store
  const fetchData = async () => {
    try {
      const res = await fetch("/api/leads");
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
        setCalls(data.calls || []);
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, []);

  const filteredLeads = leads.filter((l) => {
    if (filter === "booked") return l.status === "booked";
    if (filter === "pending") return l.status !== "booked";
    return true;
  });

  return (
    <main style={{ minHeight: "100vh", background: "#0a0a0f", color: "#fff", fontFamily: "system-ui, -apple-system, sans-serif" }}>
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
        zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 20 }}>{activeClient.logoEmoji}</span>
            <span style={{ fontWeight: 800, fontSize: 16, color: "#fff" }}>
              Missed<span style={{ color: "#10b981" }}>Spa</span>
            </span>
          </Link>
          <span style={{ color: "rgba(255,255,255,0.2)" }}>|</span>
          <span style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>
            {activeClient.name}
          </span>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{
            fontSize: 12,
            background: "rgba(16,185,129,0.12)",
            color: "#34d399",
            padding: "4px 10px",
            borderRadius: 20,
            border: "1px solid rgba(16,185,129,0.25)",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981" }} />
            Active Client Line
          </span>
          <Link
            href="/demo"
            style={{
              textDecoration: "none",
              fontSize: 13,
              background: "linear-gradient(135deg, #059669, #10b981)",
              color: "#fff",
              padding: "8px 14px",
              borderRadius: 8,
              fontWeight: 700,
            }}
          >
            📱 Open Phone &amp; SMS Simulator →
          </Link>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "36px 20px" }}>
        
        {/* Top Banner: Carrier Setup Code for this Client */}
        <div style={{
          background: "rgba(16,185,129,0.06)",
          border: "1px solid rgba(16,185,129,0.2)",
          borderRadius: 16,
          padding: "16px 20px",
          marginBottom: 32,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#34d399", marginBottom: 2 }}>
              Client Forwarding Setup Code (*71)
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
              Ask the spa receptionist to dial on office phone: <strong style={{ color: "#fff" }}>*71 {activeClient.dedicatedTwilioPhone}</strong>
            </div>
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.05)", padding: "6px 12px", borderRadius: 8 }}>
            Assigned Line: {activeClient.dedicatedTwilioPhone}
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 32 }}>
          
          <div style={{ background: "rgba(22,22,30,0.8)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "20px 24px" }}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>Missed Calls Captured</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: "#f43f5e" }}>{calls.length}</div>
          </div>

          <div style={{ background: "rgba(22,22,30,0.8)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "20px 24px" }}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>SMS Sent &amp; Received</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: "#38bdf8" }}>{messages.length}</div>
          </div>

          <div style={{ background: "rgba(22,22,30,0.8)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "20px 24px" }}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>Completed Quiz Leads</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: "#10b981" }}>{leads.length}</div>
          </div>

          <div style={{ background: "rgba(22,22,30,0.8)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "20px 24px" }}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>Owner Instant Alerts</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: "#fbbf24" }}>{leads.length}</div>
          </div>

        </div>

        {/* Leads Table & Filter Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Captured Appointment Leads</h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
              Leads captured from missed calls. Remember: the spa owner also gets an immediate alert directly on their cell phone.
            </p>
          </div>

          {/* Filter Pills */}
          <div style={{ display: "flex", gap: 8 }}>
            {(["all", "pending", "booked"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  border: filter === f ? "1px solid #10b981" : "1px solid rgba(255,255,255,0.1)",
                  background: filter === f ? "rgba(16,185,129,0.15)" : "transparent",
                  color: filter === f ? "#34d399" : "rgba(255,255,255,0.6)",
                }}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Leads List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filteredLeads.map((lead) => (
            <div
              key={lead.id}
              style={{
                background: "rgba(22, 22, 30, 0.8)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 16,
                padding: "18px 20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 16,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #059669, #10b981)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: 18,
                }}>
                  {lead.name.charAt(0)}
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <strong style={{ fontSize: 16 }}>{lead.name}</strong>
                    <span style={{
                      fontSize: 11,
                      background: "rgba(16,185,129,0.15)",
                      color: "#34d399",
                      padding: "2px 8px",
                      borderRadius: 12,
                      fontWeight: 600,
                    }}>
                      {lead.treatmentInterest}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>
                    {lead.callerPhone} · Preferred: {lead.preferredTime || "Flexible"}
                  </div>
                </div>
              </div>

              {/* Action */}
              <div style={{ display: "flex", gap: 10 }}>
                <a
                  href={`tel:${lead.callerPhone.replace(/\D/g, "")}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 16px",
                    background: "#059669",
                    color: "#fff",
                    borderRadius: 8,
                    textDecoration: "none",
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  📞 Call Client
                </a>
              </div>
            </div>
          ))}

          {filteredLeads.length === 0 && (
            <div style={{ textAlign: "center", padding: "48px 20px", color: "rgba(255,255,255,0.4)" }}>
              No leads found in this view. Use the simulator to generate a test lead!
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
