import { NextRequest, NextResponse } from "next/server";
import { activeClient } from "@/config/client";
import { addMessage } from "@/lib/store";

/**
 * POST /api/twilio/sms
 * 
 * Called by Twilio when a customer replies to an SMS.
 * 1. Logs the customer's text in the conversation thread.
 * 2. Replies with an instant acknowledgment and reminder of the direct booking link.
 */
export async function POST(req: NextRequest) {
  try {
    let callerPhone = "";
    let toPhone = "";
    let bodyText = "";

    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const json = await req.json();
      callerPhone = json.From || json.callerPhone || "";
      toPhone = json.To || json.toPhone || "";
      bodyText = json.Body || json.body || "";
    } else {
      const body = await req.text();
      const params = new URLSearchParams(body);
      callerPhone = params.get("From") || "";
      toPhone = params.get("To") || "";
      bodyText = params.get("Body") || "";
    }

    console.log(`[Twilio Inbound SMS] From: ${callerPhone}, Body: "${bodyText}"`);

    // Save inbound SMS to store
    addMessage({
      direction: "inbound",
      fromPhone: callerPhone || "+1 (555) 000-0000",
      toPhone: toPhone || activeClient.dedicatedTwilioPhone,
      body: bodyText,
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const quizLink = `${baseUrl}/q/${activeClient.slug}`;

    // Polite instant auto-reply
    const replyBody = `Thanks for reaching out to ${activeClient.name}! We got your message. To pick your preferred treatment and service time right away, you can use our direct link: ${quizLink}`;

    // Save outbound reply to store
    addMessage({
      direction: "outbound",
      fromPhone: activeClient.dedicatedTwilioPhone,
      toPhone: callerPhone || "+1 (555) 000-0000",
      body: replyBody,
    });

    // Return TwiML Messaging XML
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${escapeXml(replyBody)}</Message>
</Response>`;

    return new NextResponse(twiml, {
      headers: { "Content-Type": "application/xml" },
    });
  } catch (err) {
    console.error("[Twilio SMS Webhook error]", err);
    return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?><Response></Response>`, {
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
