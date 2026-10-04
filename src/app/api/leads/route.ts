import { NextRequest, NextResponse } from "next/server";
import { activeClient } from "@/config/client";
import { addLead, store } from "@/lib/store";

/**
 * POST /api/leads
 * 
 * Called when a customer submits the 60-second intake quiz.
 * 1. Saves lead to store.
 * 2. Alerts the spa owner directly via SMS / Email without them needing to check a dashboard.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, caller_phone, treatment_interest, goal, email, notes, preferred_time } = body;

    if (!name || !caller_phone) {
      return NextResponse.json({ error: "Name and phone number are required" }, { status: 400 });
    }

    const lead = addLead({
      name,
      callerPhone: caller_phone,
      email: email || "",
      treatmentInterest: treatment_interest || "General Consultation",
      goal: goal || "",
      notes: notes || "",
      preferredTime: preferred_time || "Flexible",
    });

    console.log(`[Lead Captured] ${name} (${caller_phone}) for ${lead.treatmentInterest}`);

    // Alert the spa owner via SMS if Twilio credentials exist
    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioFromNumber = process.env.TWILIO_PHONE_NUMBER;
    const ownerPhone = activeClient.ownerNotificationPhone;

    if (twilioAccountSid && twilioAuthToken && twilioFromNumber && ownerPhone) {
      const alertSms = `🚨 [Glow Studio Alert] New Appointment Request!\n\nName: ${name}\nPhone: ${caller_phone}\nService: ${lead.treatmentInterest}\nTime: ${lead.preferredTime}\n\nTap to call back: tel:${caller_phone.replace(/\D/g, "")}`;
      try {
        await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString("base64")}`,
          },
          body: new URLSearchParams({
            From: twilioFromNumber,
            To: ownerPhone,
            Body: alertSms,
          }),
        });
        console.log(`[Owner Alert SMS] Sent to ${ownerPhone}`);
      } catch (err) {
        console.error("[Owner Alert SMS failed]", err);
      }
    }

    // Alert the spa owner via Resend Email if API key exists
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: "notifications@missedcallspa.com",
            to: activeClient.ownerNotificationEmail,
            subject: `🚨 New Lead: ${name} requested ${lead.treatmentInterest}`,
            html: `
              <h2>New Missed Call Lead Captured</h2>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Phone:</strong> <a href="tel:${caller_phone}">${caller_phone}</a></p>
              <p><strong>Treatment:</strong> ${lead.treatmentInterest}</p>
              <p><strong>Preferred Time:</strong> ${lead.preferredTime}</p>
              ${lead.goal ? `<p><strong>Goal:</strong> ${lead.goal}</p>` : ""}
              <br/>
              <p><a href="tel:${caller_phone}" style="background:#059669;color:white;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:bold;">Call Client Now</a></p>
            `,
          }),
        });
      } catch (emailErr) {
        console.error("[Resend Email Alert failed]", emailErr);
      }
    }

    return NextResponse.json({
      ok: true,
      lead,
      externalBookingUrl: activeClient.externalBookingUrl,
    });
  } catch (err) {
    console.error("[Leads POST error]", err);
    return NextResponse.json({ error: "Failed to process lead" }, { status: 500 });
  }
}

/**
 * GET /api/leads
 * Returns calls, messages, and leads for the dashboard
 */
export async function GET() {
  return NextResponse.json({
    calls: store.calls,
    messages: store.messages,
    leads: store.leads,
  });
}
