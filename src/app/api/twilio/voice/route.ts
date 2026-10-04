import { NextRequest, NextResponse } from "next/server";
import { activeClient } from "@/config/client";
import { addCall, addMessage } from "@/lib/store";

/**
 * POST /api/twilio/voice
 * 
 * Called by Twilio when an unanswered call is forwarded via *71 conditional call forwarding.
 * 1. Speaks a warm, VIP greeting: "To get you taken care of right away without waiting on hold..."
 * 2. Immediately sends an SMS with the client's direct intake quiz link.
 * 3. Records the missed call and outbound text in the local store.
 */
export async function POST(req: NextRequest) {
  try {
    let callerPhone = "";
    let toPhone = "";
    let callSid = "";

    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const json = await req.json();
      callerPhone = json.From || json.callerPhone || "";
      toPhone = json.To || json.toPhone || "";
      callSid = json.CallSid || `sim-${Date.now()}`;
    } else {
      const body = await req.text();
      const params = new URLSearchParams(body);
      callerPhone = params.get("From") || "";
      toPhone = params.get("To") || "";
      callSid = params.get("CallSid") || "";
    }

    console.log(`[Twilio Voice] Incoming forwarded call from: ${callerPhone}, to: ${toPhone}`);

    // Log call event
    addCall({
      callerPhone: callerPhone || "+1 (555) 000-0000",
      toPhone: toPhone || activeClient.dedicatedTwilioPhone,
      callSid: callSid || `call-${Date.now()}`,
      status: "missed",
    });

    // Build the personalized quiz link
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const quizLink = `${baseUrl}/q/${activeClient.slug}`;

    // Format the text message
    const smsBody = activeClient.smsMessageTemplate.replace("{quiz_link}", quizLink);

    // Save outbound SMS to store
    addMessage({
      direction: "outbound",
      fromPhone: activeClient.dedicatedTwilioPhone,
      toPhone: callerPhone || "+1 (555) 000-0000",
      body: smsBody,
    });

    // Send real SMS if Twilio credentials exist
    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioFromNumber = process.env.TWILIO_PHONE_NUMBER || activeClient.dedicatedTwilioPhone;

    if (twilioAccountSid && twilioAuthToken && twilioFromNumber && callerPhone && callerPhone.startsWith("+")) {
      try {
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
        await fetch(twilioUrl, {
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
        console.log(`[Twilio SMS] Real SMS sent to ${callerPhone}`);
      } catch (smsErr) {
        console.error("[Twilio SMS error]", smsErr);
      }
    } else {
      console.log(`[Dev Mode] SMS simulated and logged for ${callerPhone}`);
    }

    // Return TwiML Voice XML
    const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna-Neural">${escapeXml(activeClient.voiceGreeting)}</Say>
  <Hangup/>
</Response>`;

    return new NextResponse(twimlResponse, {
      headers: { "Content-Type": "application/xml" },
    });
  } catch (err) {
    console.error("[Twilio voice webhook error]", err);
    return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?><Response><Hangup/></Response>`, {
      headers: { "Content-Type": "application/xml" },
    });
  }
}

function escapeXml(unsafe: string) {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
      case "'": return "&apos;";
      case '"': return "&quot;";
      default: return c;
    }
  });
}
