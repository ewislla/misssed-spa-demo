import type { Metadata } from "next";
import { QuizWidget } from "@/components/quiz/QuizWidget";
import { activeClient } from "@/config/client";

export const metadata: Metadata = {
  title: `Priority Booking — ${activeClient.name}`,
  description: "Take 60 seconds to claim your appointment time without waiting on hold.",
  robots: { index: false },
};

export default async function QuizPage({
  params,
}: {
  params: Promise<{ spaSlug: string }>;
}) {
  const { spaSlug } = await params;
  const isMatchingClient = spaSlug === activeClient.slug;

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        background: "#0a0a0f",
        position: "relative",
        overflow: "hidden",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: "fixed",
          top: "-15%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Top Banner */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          background: "rgba(5, 150, 105, 0.15)",
          borderBottom: "1px solid rgba(16, 185, 129, 0.25)",
          padding: "10px 16px",
          textAlign: "center",
          fontSize: 13,
          color: "#34d399",
          backdropFilter: "blur(12px)",
          zIndex: 10,
        }}
      >
        💬 <strong>Priority Service:</strong> Thanks for calling — pick your treatment in 60 seconds
      </div>

      {/* Quiz Card */}
      <div
        style={{
          width: "100%",
          maxWidth: 460,
          borderRadius: 24,
          padding: "32px 24px",
          marginTop: 40,
          background: "rgba(22, 22, 30, 0.8)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
          color: "#fff",
        }}
      >
        <QuizWidget
          spaName={isMatchingClient ? activeClient.name : "Luxury Medspa"}
          bookingUrl={activeClient.externalBookingUrl}
          logoEmoji={activeClient.logoEmoji}
        />
      </div>

      {/* Footer */}
      <div
        style={{
          position: "fixed",
          bottom: 14,
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: 12,
          color: "rgba(255,255,255,0.4)",
        }}
      >
        🔒 Secure & Private · Direct to {activeClient.name}
      </div>
    </main>
  );
}
