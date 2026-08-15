import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // Parse request body
    const body = await req.json();

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        {
          error: "Name, email and message are required.",
        },
        { status: 400 },
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          error: "Please provide a valid email address.",
        },
        { status: 400 },
      );
    }

    // Environment variables
    const BREVO_API_KEY = process.env.BREVO_API_KEY;
    const BREVO_FROM_EMAIL = process.env.BREVO_FROM_EMAIL;
    const CONTACT_TO_EMAIL = process.env.CONTACT_TO_EMAIL;

    // Make sure environment variables exist
    if (!BREVO_API_KEY) {
      console.error("BREVO_API_KEY is missing");

      return NextResponse.json(
        {
          error: "Email service is not configured correctly.",
        },
        { status: 500 },
      );
    }

    if (!BREVO_FROM_EMAIL) {
      console.error("BREVO_FROM_EMAIL is missing");

      return NextResponse.json(
        {
          error: "Email sender is not configured.",
        },
        { status: 500 },
      );
    }

    if (!CONTACT_TO_EMAIL) {
      console.error("CONTACT_TO_EMAIL is missing");

      return NextResponse.json(
        {
          error: "Contact email is not configured.",
        },
        { status: 500 },
      );
    }

    // Escape HTML to prevent injected HTML from the contact form
    const escapeHtml = (value: string) => {
      return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeMessage = escapeHtml(message);
    const safePhone = escapeHtml(phone);

    // Convert new lines to HTML breaks
    const formattedMessage = safeMessage.replace(/\r?\n/g, "<br />");

    // Email HTML
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Contact Message</title>
</head>

<body
  style="
    margin: 0;
    padding: 0;
    background-color: #f4f4f5;
    font-family:
      -apple-system,
      BlinkMacSystemFont,
      'Segoe UI',
      Roboto,
      Helvetica,
      Arial,
      sans-serif;
  "
>
  <table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="
      background-color: #f4f4f5;
      padding: 40px 16px;
    "
  >
    <tr>
      <td align="center">

        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="
            max-width: 560px;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
          "
        >

          <!-- Header -->
          <tr>
            <td
              style="
                padding: 24px 32px;
                background-color: #18181b;
                color: #ffffff;
              "
            >
              <h1
                style="
                  margin: 0;
                  font-size: 20px;
                  font-weight: 600;
                "
              >
                New Contact Message
              </h1>

              <p
                style="
                  margin: 6px 0 0;
                  font-size: 13px;
                  color: #d4d4d8;
                "
              >
                Maraspot Services
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px;">

              <!-- Contact Details -->
              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="
                  background-color: #fafafa;
                  border-radius: 10px;
                  border: 1px solid #f0f0f0;
                "
              >
                <tr>
                  <td style="padding: 20px 24px;">

                    <p
                      style="
                        margin: 0 0 16px;
                        font-size: 11px;
                        font-weight: 600;
                        text-transform: uppercase;
                        letter-spacing: 0.6px;
                        color: #a1a1aa;
                      "
                    >
                      Contact Details
                    </p>

                    <!-- Name -->
                    <p
                      style="
                        margin: 0 0 14px;
                        font-size: 13px;
                        color: #71717a;
                      "
                    >
                      Name<br />

                      <strong
                        style="
                          font-size: 15px;
                          color: #18181b;
                        "
                      >
                        ${safeName}
                      </strong>
                    </p>

                    <!-- Email -->
                    <p
                      style="
                        margin: 0 0 14px;
                        font-size: 13px;
                        color: #71717a;
                      "
                    >
                      Email<br />

                      <a
                        href="mailto:${safeEmail}"
                        style="
                          font-size: 15px;
                          color: #ea580c;
                          text-decoration: none;
                        "
                      >
                        ${safeEmail}
                      </a>
                    </p>

                    ${
                      phone
                        ? `
                    <!-- Phone -->
                    <p
                      style="
                        margin: 0;
                        font-size: 13px;
                        color: #71717a;
                      "
                    >
                      Phone<br />

                      <a
                        href="tel:${safePhone}"
                        style="
                          font-size: 15px;
                          color: #18181b;
                          text-decoration: none;
                        "
                      >
                        ${safePhone}
                      </a>
                    </p>
                    `
                        : ""
                    }

                  </td>
                </tr>
              </table>

              <!-- Message -->
              <div style="margin-top: 28px;">

                <p
                  style="
                    margin: 0 0 10px;
                    font-size: 11px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.6px;
                    color: #a1a1aa;
                  "
                >
                  Message
                </p>

                <div
                  style="
                    background-color: #ffffff;
                    border: 1px solid #e4e4e7;
                    border-radius: 10px;
                    padding: 18px 20px;
                    font-size: 15px;
                    line-height: 1.6;
                    color: #3f3f46;
                  "
                >
                  ${formattedMessage}
                </div>

              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td
              style="
                padding: 20px 32px;
                background-color: #fafafa;
                border-top: 1px solid #f0f0f0;
                text-align: center;
              "
            >
              <p
                style="
                  margin: 0;
                  font-size: 12px;
                  color: #a1a1aa;
                "
              >
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

    // Plain-text version
    const textContent = [
      `Name: ${name}`,
      `Email: ${email}`,
      phone ? `Phone: ${phone}` : "",
      "",
      "Message:",
      message,
    ]
      .filter(Boolean)
      .join("\n");

    // Send email through Brevo
    const brevoResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",

      headers: {
        accept: "application/json",
        "api-key": BREVO_API_KEY,
        "content-type": "application/json",
      },

      body: JSON.stringify({
        sender: {
          name: "Maraspot Services",
          email: BREVO_FROM_EMAIL,
        },

        to: [
          {
            email: CONTACT_TO_EMAIL,
            name: "Maraspot Team",
          },
        ],

        replyTo: {
          email,
          name,
        },

        subject: `Inquiry message from ${name}`,

        htmlContent,

        textContent,
      }),
    });

    // Read response as text first
    const brevoResponseText = await brevoResponse.text();

    console.log("Brevo status:", brevoResponse.status);
    console.log("Brevo response:", brevoResponseText);

    // Brevo failed
    if (!brevoResponse.ok) {
      let brevoError: unknown = brevoResponseText;

      try {
        brevoError = JSON.parse(brevoResponseText);
      } catch {
        // Response wasn't JSON
      }

      return NextResponse.json(
        {
          error: "Failed to send email.",
          brevo: brevoError,
        },
        {
          status: brevoResponse.status,
        },
      );
    }

    // Success
    let brevoResult: unknown = null;

    try {
      brevoResult = JSON.parse(brevoResponseText);
    } catch {
      brevoResult = brevoResponseText;
    }

    return NextResponse.json({
      ok: true,
      message: "Email sent successfully.",
      brevo: brevoResult,
    });
  } catch (error) {
    console.error("Contact form error:", error);

    return NextResponse.json(
      {
        error: "An unexpected error occurred while sending the email.",
      },
      {
        status: 500,
      },
    );
  }
}
