import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, message, phone } = body;

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }

    const TO_EMAIL = process.env.CONTACT_TO_EMAIL || process.env.GMAIL_USER;

    if (
      !process.env.GMAIL_USER ||
      !process.env.GMAIL_APP_PASSWORD ||
      !TO_EMAIL
    ) {
      console.error(
        "Missing GMAIL_USER, GMAIL_APP_PASSWORD or CONTACT_TO_EMAIL",
      );
      return NextResponse.json(
        { error: "Email service is not configured" },
        { status: 500 },
      );
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const safeMessage = message
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\n/g, "<br/>");

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Contact Message</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5; ">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; background-color:#ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.08);">
          
          <!-- Body -->
          <tr>
            <td style="padding: 32px;">
              
              <!-- Contact details card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#fafafa; border-radius: 10px; border: 1px solid #f0f0f0;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <p style="margin:0 0 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.6px; color:#a1a1aa;">
                      Contact Details
                    </p>
                    
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-bottom: 10px;">
                          <span style="font-size: 13px; color:#71717a;">Name</span><br/>
                          <span style="font-size: 15px; font-weight: 500; color:#18181b;">${name}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 10px;">
                          <span style="font-size: 13px; color:#71717a;">Email</span><br/>
                          <a href="mailto:${email}" style="font-size: 15px; font-weight: 500; color:#ea580c; text-decoration: none;">
                            ${email}
                          </a>
                        </td>
                      </tr>
                      ${
                        phone
                          ? `
                      <tr>
                        <td>
                          <span style="font-size: 13px; color:#71717a;">Phone</span><br/>
                          <a href="tel:${phone}" style="font-size: 15px; font-weight: 500; color:#18181b; text-decoration: none;">
                            ${phone}
                          </a>
                        </td>
                      </tr>`
                          : ""
                      }
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Message -->
              <div style="margin-top: 28px;">
                <p style="margin:0 0 10px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.6px; color:#a1a1aa;">
                  Message
                </p>
                <div style="background-color:#ffffff; border: 1px solid #e4e4e7; border-radius: 10px; padding: 18px 20px; font-size: 15px; line-height: 1.6; color:#3f3f46;">
                  ${safeMessage}
                </div>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color:#fafafa; border-top: 1px solid #f0f0f0; text-align: center;">
              <p style="margin:0; font-size: 12px; color:#a1a1aa;">
                Sent via Maraspot Contact Form
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    await transporter.sendMail({
      from: `"Maraspot Services" <${process.env.GMAIL_USER}>`,
      to: TO_EMAIL,
      replyTo: email, // ← correctly set to the user's email
      subject: `Inquiry message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}${phone ? `\nPhone: ${phone}` : ""}\n\nMessage:\n${message}`,
      html,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact form error:", err);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 },
    );
  }
}
