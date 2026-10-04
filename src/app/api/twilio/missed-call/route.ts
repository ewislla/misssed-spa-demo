import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/twilio/missed-call
 * Twilio sends a webhook here when a call to the spa's number goes unanswered.
 * We detect the "no-answer" status and trigger an SMS to the caller.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const params = new URLSearchParams(body);

    const callStatus = params.get("CallStatus");
    const callerPhone = params.get("From") || "";
    const toPhone = params.get("To") || "";

    console.log("[Twilio Webhook] CallStatus:", callStatus, "From:", callerPhone);

    // Only act on missed calls
    if (callStatus !== "no-answer" && callStatus !== "busy" && callStatus !== "failed") {
      return NextResponse.json({ ok: true, action: "no_op" });
    }

    // Look up spa by Twilio number (toPhone)
    // In production: query DB for spa where phone_number = toPhone
    const spaSlug = "glow-studio"; // demo default
    const spaName = "Glow Studio Medspa"; // demo default

    // Build the quiz link
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://missedspa.vercel.app";
    const quizLink = `${baseUrl}/q/${spaSlug}`;

    // Send SMS via Twilio
    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioFromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (twilioAccountSid && twilioAuthToken && twilioFromNumber && callerPhone) {
      const smsBody = `Hey! We missed your call at ${spaName} 💆‍♀️\n\nClick below to tell us what you're looking for — takes 60 seconds and we'll get back to you right away.\n\n→ ${quizLink}\n\nReply STOP to opt out.`;

      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
      const response = await fetch(twilioUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString("base64")}`,
        },
        body: new URLSearchParams({
          From: twilioFromNumber,
          To: callerPhone,
          Body: smsBody,
        }),
      });

      const result = await response.json();
      console.log("[SMS sent]", result.sid || result.message);
    }

    // TwiML response (empty — we just want to end the call gracefully)
    return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?><Response></Response>`, {
      headers: { "Content-Type": "application/xml" },
    });
  } catch (err) {
    console.error("[Twilio webhook error]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
