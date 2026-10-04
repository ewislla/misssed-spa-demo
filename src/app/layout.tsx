import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MissedSpa — Never Lose a Patient to a Missed Call Again",
  description:
    "MissedSpa catches every missed call and converts it into a booked appointment or warm lead — automatically, in under 60 seconds. Built for independent medspas.",
  keywords: "medspa missed call, lead recovery, automated text back, medspa software",
  openGraph: {
    title: "MissedSpa — Turn Missed Calls Into Booked Appointments",
    description:
      "Stop losing $8,000+ a month to missed calls. MissedSpa sends an automatic text with a booking quiz the moment a call is missed.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="noise">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
