import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/send-sms
 * Manually trigger an SMS — used for the demo button.
 */
export async function POST(req: NextRequest) {
  try {
    const { to, spaName, spaSlug } = await req.json();

    if (!to) {
      return NextResponse.json({ error: "Phone number required" }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://missedspa.vercel.app";
    const quizLink = `${baseUrl}/q/${spaSlug || "demo"}`;

    const smsBody = `Hey! We missed your call at ${spaName || "the spa"} 💆‍♀️\n\nClick below to tell us what you're looking for — takes 60 seconds:\n\n→ ${quizLink}\n\nReply STOP to opt out.`;

    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioFromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!twilioAccountSid || !twilioAuthToken || !twilioFromNumber) {
      // Demo mode: pretend it worked
      console.log("[Demo SMS - not sent, no Twilio config]");
      console.log("Would send to:", to);
      console.log("Message:", smsBody);
      return NextResponse.json({ ok: true, mode: "demo", message: "SMS simulated (no Twilio keys)" });
    }

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
    const response = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString("base64")}`,
      },
      body: new URLSearchParams({ From: twilioFromNumber, To: to, Body: smsBody }),
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, sid: result.sid });
  } catch (err) {
    console.error("[send-sms error]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
