"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

// ─── Animated Counter ──────────────────────────────────────────
function Counter({ end, prefix = "", suffix = "", duration = 2000 }: {
  end: number; prefix?: string; suffix?: string; duration?: number;
}) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration]);
  return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
}

// ─── Nav ───────────────────────────────────────────────────────
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <nav
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "16px 24px",
        background: scrolled ? "rgba(10,10,15,0.9)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
        transition: "all 0.3s",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: "var(--gradient-brand)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16,
        }}>💆</div>
        <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: "-0.02em" }}>
          Missed<span className="gradient-text">Spa</span>
        </span>
      </div>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <Link href="/demo" className="btn-ghost" style={{ textDecoration: "none" }}>
          Live Demo
        </Link>
        <Link href="/demo" className="btn-primary" style={{ textDecoration: "none", padding: "10px 22px", fontSize: 14 }}>
          See It Work →
        </Link>
      </div>
    </nav>
  );
}

// ─── Hero ──────────────────────────────────────────────────────
function Hero() {
  return (
    <section
      style={{
        minHeight: "100vh",
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", textAlign: "center",
        padding: "120px 24px 80px",
        background: "var(--gradient-glow)",
        position: "relative", overflow: "hidden",
      }}
    >
      {/* Background orbs */}
      <div style={{
        position: "absolute", top: "20%", left: "10%",
        width: 600, height: 600, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(232,98,122,0.06) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "20%", right: "10%",
        width: 400, height: 400, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(212,168,83,0.05) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div className="animate-fade-in" style={{ maxWidth: 800, position: "relative" }}>
        {/* Badge */}
        <div style={{ marginBottom: 24 }}>
          <span className="badge badge-rose">
            <span className="live-dot" />
            Live Demo Available
          </span>
        </div>

        {/* Headline */}
        <h1 style={{ fontSize: "clamp(42px, 6vw, 80px)", fontWeight: 900, lineHeight: 1.05, marginBottom: 24 }}>
          Your Medspa is Losing{" "}
          <span className="gradient-text font-display" style={{ fontStyle: "italic" }}>$8,000+</span>
          <br />Every Month to Missed Calls
        </h1>

        <p style={{
          fontSize: "clamp(16px, 2vw, 20px)", color: "var(--text-secondary)",
          maxWidth: 600, margin: "0 auto 40px", lineHeight: 1.7,
        }}>
          When your front desk is mid-consult, 85% of callers who hit voicemail
          just call the next spa on Google. <strong style={{ color: "var(--text-primary)" }}>MissedSpa catches them
          before they leave</strong> — automatically, in under 60 seconds.
        </p>

        {/* CTA */}
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/demo" className="btn-primary animate-pulse-glow" style={{ textDecoration: "none", fontSize: 17, padding: "16px 36px" }}>
            Watch It Work Live →
          </Link>
          <a href="#how-it-works" className="btn-secondary" style={{ textDecoration: "none" }}>
            See the Flow ↓
          </a>
        </div>

        {/* Social proof numbers */}
        <div style={{
          display: "flex", gap: 48, justifyContent: "center", marginTop: 72,
          flexWrap: "wrap",
        }}>
          {[
            { n: 85, suffix: "%", label: "of callers never leave a voicemail" },
            { n: 60, suffix: "s", label: "average response time" },
            { n: 8000, prefix: "$", suffix: "+", label: "recovered per spa monthly" },
          ].map((s, i) => (
            <div key={i} className={`animate-fade-in delay-${(i + 2) * 100}`} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 40, fontWeight: 800, lineHeight: 1 }}>
                <Counter end={s.n} prefix={s.prefix || ""} suffix={s.suffix} />
              </div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 6, maxWidth: 140 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── How It Works ──────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    {
      icon: "📞",
      step: "01",
      title: "Call Missed",
      desc: "A patient calls your spa. Your front desk is busy with someone in person. The call goes unanswered.",
      detail: "Happens 20–25% of the time at every medspa.",
    },
    {
      icon: "⚡",
      step: "02",
      title: "Detected Instantly",
      desc: "The moment the call drops, MissedSpa detects it via your phone system — no staff needed.",
      detail: "Response triggered in under 5 seconds.",
    },
    {
      icon: "💬",
      step: "03",
      title: "Text Sent in 60s",
      desc: "The caller gets a personalized text with a link to a short quiz — not a generic 'sorry we missed you.'",
      detail: "Open rate 4× higher than voicemail.",
    },
    {
      icon: "📋",
      step: "04",
      title: "Quiz Completed",
      desc: "They answer 3 quick questions: treatment interest, their goal, contact info. Takes under 2 minutes.",
      detail: "Beautiful, mobile-optimized experience.",
    },
    {
      icon: "📅",
      step: "05",
      title: "Booked or Captured",
      desc: "A 'Book Now' button links straight to your Vagaro/Fresha page. If they don't book, the lead lands in your inbox.",
      detail: "Zero new tools for your staff to learn.",
    },
  ];

  return (
    <section id="how-it-works" className="section">
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <span className="badge badge-gold" style={{ marginBottom: 16 }}>The Flow</span>
          <h2 style={{ fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 800, marginBottom: 16 }}>
            Missed call in.{" "}
            <span className="gradient-text">Booked appointment out.</span>
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 17, maxWidth: 480, margin: "0 auto" }}>
            Five steps. Zero work for your staff. Everything automated.
          </p>
        </div>

        {/* Timeline */}
        <div style={{ position: "relative" }}>
          {/* Connecting line */}
          <div style={{
            position: "absolute", left: "50%", top: 0, bottom: 0,
            width: 2, background: "linear-gradient(to bottom, var(--rose), var(--gold))",
            transform: "translateX(-50%)", opacity: 0.2,
          }} />

          <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
            {steps.map((s, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: i % 2 === 0 ? "row" : "row-reverse",
                  gap: 48, alignItems: "center",
                }}
              >
                {/* Card */}
                <div className="card" style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                      background: "var(--gradient-brand)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 22,
                    }}>{s.icon}</div>
                    <div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600, marginBottom: 4 }}>
                        STEP {s.step}
                      </div>
                      <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{s.title}</h3>
                      <p style={{ color: "var(--text-secondary)", fontSize: 15, marginBottom: 8 }}>{s.desc}</p>
                      <span className="badge badge-muted">{s.detail}</span>
                    </div>
                  </div>
                </div>

                {/* Center dot */}
                <div style={{
                  width: 48, height: 48, borderRadius: "50%", flexShrink: 0,
                  background: "var(--gradient-brand)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, boxShadow: "var(--shadow-glow)",
                  position: "relative", zIndex: 1,
                }}>{s.icon}</div>

                {/* Spacer */}
                <div style={{ flex: 1 }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Pain Section ──────────────────────────────────────────────
function PainSection() {
  return (
    <section className="section-sm" style={{ background: "var(--bg-surface)" }}>
      <div className="container">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
          {/* Left: the problem */}
          <div>
            <span className="badge badge-rose" style={{ marginBottom: 20 }}>The Problem</span>
            <h2 style={{ fontSize: "clamp(28px, 3.5vw, 44px)", fontWeight: 800, marginBottom: 20 }}>
              Nothing gets logged. <br />
              <span className="gradient-text">The phone just stops ringing.</span>
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 16, lineHeight: 1.8, marginBottom: 24 }}>
              Your front desk is doing everything right — checking in patients, processing payments,
              running consultations. But when the phone rings during that window, the caller doesn't wait.
            </p>
            <p style={{ color: "var(--text-secondary)", fontSize: 16, lineHeight: 1.8 }}>
              They don't leave a message. They don't call back. They tap the next result on Google.
              And you never know it happened.
            </p>
          </div>

          {/* Right: stats box */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { color: "var(--rose)", label: "Calls missed during peak hours", value: "20–25%" },
              { color: "var(--gold)", label: "Callers who never leave voicemail", value: "85%" },
              { color: "#60a5fa", label: "Monthly revenue lost per medspa", value: "$8–10K" },
              { color: "#34d399", label: "Of callers book after a quick text-back", value: "~40%" },
            ].map((item, i) => (
              <div key={i} className="card" style={{ display: "flex", gap: 16, alignItems: "center", padding: 20 }}>
                <div style={{
                  width: 4, height: 48, borderRadius: 2, background: item.color, flexShrink: 0,
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: item.color }}>{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Pricing ───────────────────────────────────────────────────
function Pricing() {
  return (
    <section id="pricing" className="section">
      <div className="container-sm">
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <span className="badge badge-gold" style={{ marginBottom: 16 }}>Pricing</span>
          <h2 style={{ fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 800, marginBottom: 16 }}>
            Simple, transparent pricing
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 17 }}>
            One medspa. One monthly fee. Unlimited missed calls recovered.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {/* Monthly */}
          <div className="card" style={{ padding: 40, textAlign: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-muted)", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Monthly
            </div>
            <div style={{ fontSize: 60, fontWeight: 900, lineHeight: 1, marginBottom: 8 }}>
              <span className="gradient-text">$750</span>
            </div>
            <div style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 32 }}>per month, cancel anytime</div>
            <ul style={{ textAlign: "left", listStyle: "none", padding: 0, marginBottom: 32, display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                "Missed call detection",
                "Instant SMS text-back",
                "Branded quiz funnel",
                "Lead inbox + email alerts",
                "Booking link integration",
                "Unlimited leads captured",
              ].map((f, i) => (
                <li key={i} style={{ display: "flex", gap: 10, alignItems: "center", color: "var(--text-secondary)", fontSize: 14 }}>
                  <span style={{ color: "#34d399", fontWeight: 700 }}>✓</span> {f}
                </li>
              ))}
            </ul>
            <Link href="/demo" className="btn-secondary" style={{ textDecoration: "none", width: "100%", display: "block" }}>
              Start Monthly
            </Link>
          </div>

          {/* One-time Setup */}
          <div
            className="card glow-rose"
            style={{
              padding: 40, textAlign: "center",
              border: "1px solid rgba(232,98,122,0.4)",
              position: "relative", overflow: "hidden",
            }}
          >
            {/* Popular badge */}
            <div style={{
              position: "absolute", top: 16, right: 16,
            }}>
              <span className="badge badge-rose">Most Popular</span>
            </div>

            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-muted)", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Done-For-You Setup
            </div>
            <div style={{ fontSize: 60, fontWeight: 900, lineHeight: 1, marginBottom: 8 }}>
              <span className="gradient-text">$5,000</span>
            </div>
            <div style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 32 }}>one-time + $497/mo after first year</div>
            <ul style={{ textAlign: "left", listStyle: "none", padding: 0, marginBottom: 32, display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                "Everything in Monthly",
                "Full system setup by us",
                "Custom quiz for your spa",
                "Phone forwarding configured",
                "Staff training session",
                "90-day priority support",
                "Analytics dashboard access",
                "Quarterly strategy call",
              ].map((f, i) => (
                <li key={i} style={{ display: "flex", gap: 10, alignItems: "center", color: "var(--text-secondary)", fontSize: 14 }}>
                  <span style={{ color: "var(--gold)", fontWeight: 700 }}>✓</span> {f}
                </li>
              ))}
            </ul>
            <Link href="/demo" className="btn-primary" style={{ textDecoration: "none", width: "100%", display: "block" }}>
              Get Set Up →
            </Link>
          </div>
        </div>

        {/* ROI callout */}
        <div className="card" style={{ marginTop: 32, textAlign: "center", padding: 32, background: "rgba(212,168,83,0.05)", borderColor: "rgba(212,168,83,0.2)" }}>
          <p style={{ fontSize: 17, color: "var(--text-secondary)" }}>
            At <strong style={{ color: "var(--gold)" }}>$750/month</strong>, you only need to recover{" "}
            <strong style={{ color: "var(--text-primary)" }}>1 extra client per month</strong> to break even.
            Most spas recover 8–15. That&apos;s{" "}
            <strong style={{ color: "var(--rose)" }}>10–20× ROI</strong> from month one.
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── Final CTA ─────────────────────────────────────────────────
function FinalCTA() {
  return (
    <section className="section" style={{ textAlign: "center" }}>
      <div className="container-sm">
        <div style={{
          padding: 64, borderRadius: "var(--radius-xl)",
          background: "var(--gradient-brand)",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", inset: 0,
            background: "radial-gradient(ellipse at center, rgba(255,255,255,0.1) 0%, transparent 70%)",
          }} />
          <div style={{ position: "relative" }}>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 900, color: "#fff", marginBottom: 16 }}>
              See it live in 60 seconds
            </h2>
            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 17, marginBottom: 32 }}>
              Hit the demo — watch a missed call turn into a captured lead right in front of you.
            </p>
            <Link
              href="/demo"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "16px 40px", background: "#fff",
                color: "#e8627a", fontWeight: 700, fontSize: 17,
                borderRadius: 50, textDecoration: "none",
                boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                transition: "transform 0.2s",
              }}
            >
              Launch Live Demo →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ─────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ padding: "32px 24px", borderTop: "1px solid var(--border)", textAlign: "center" }}>
      <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
        © 2025 MissedSpa. Built for independent medspas. 🇺🇸
      </p>
    </footer>
  );
}

// ─── Page ──────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <>
      <Nav />
      <Hero />
      <PainSection />
      <HowItWorks />
      <Pricing />
      <FinalCTA />
      <Footer />
    </>
  );
}
