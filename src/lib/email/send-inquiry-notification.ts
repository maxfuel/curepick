interface InquiryNotificationData {
  name: string;
  email: string;
  message: string;
  hospitalEmail?: string;
  hospitalName?: string;
}

function esc(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendInquiryNotification(
  data: InquiryNotificationData
) {
  const apiKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_EMAIL || "admin@curepick.com";

  if (!apiKey) {
    console.warn("RESEND_API_KEY not set, skipping email notification");
    return;
  }

  const { Resend } = await import("resend");
  const resend = new Resend(apiKey);

  const bodyHtml = `
    <h2>New Inquiry Received</h2>
    <p><strong>Name:</strong> ${esc(data.name)}</p>
    <p><strong>Email:</strong> ${esc(data.email)}</p>
    <p><strong>Message:</strong></p>
    <p>${esc(data.message)}</p>
    ${data.hospitalName ? `<p><strong>Hospital:</strong> ${esc(data.hospitalName)}</p>` : ""}
  `;

  const sends = [
    resend.emails.send({
      from: "Curepick <noreply@curepick.com>",
      to: [adminEmail],
      subject: `New Inquiry from ${data.name}`,
      html: bodyHtml,
    }),
  ];

  if (data.hospitalEmail) {
    sends.push(
      resend.emails.send({
        from: "Curepick <noreply@curepick.com>",
        to: [data.hospitalEmail],
        subject: `New Patient Inquiry — ${data.name}`,
        html: `
          <h2>You have a new inquiry from Curepick</h2>
          <p>A patient has expressed interest in your hospital.</p>
          ${bodyHtml}
          <hr/>
          <p>Please log in to your Curepick dashboard to respond.</p>
        `,
      })
    );
  }

  await Promise.allSettled(sends);
}
