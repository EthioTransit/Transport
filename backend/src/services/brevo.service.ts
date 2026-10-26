export class BrevoService {
  private static readonly API_URL = 'https://api.brevo.com/v3/smtp/email';

  /**
   * Send a 6-digit registration OTP code to the user via Brevo Transactional Email.
   */
  static async sendOtpEmail(
    toEmail: string,
    recipientName: string,
    otpCode: string,
    expiryMinutes: number = 5
  ): Promise<boolean> {
    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL || 'support@ethiotransit.et';
    const senderName = process.env.BREVO_SENDER_NAME || 'EthioTransit';

    // If API key is not configured or is a placeholder, log prominently and return false
    if (!apiKey || apiKey.includes('xxxx') || apiKey.trim() === '') {
      console.warn(
        `\n⚠️ [BrevoService] BREVO_API_KEY is not configured in .env.\n` +
        `🔑 [REGISTRATION OTP FOR ${toEmail}]: ${otpCode} (expires in ${expiryMinutes}m)\n` +
        `👉 To send real emails, set BREVO_API_KEY in backend/.env\n`
      );
      return false;
    }

    try {
      const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your EthioTransit Verification Code</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAF8F5; margin: 0; padding: 24px; color: #1e293b; }
    .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.06); }
    .header { background: #031d12; padding: 32px 24px; text-align: center; }
    .brand { font-size: 26px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px; }
    .subhead { font-size: 11px; font-weight: 700; color: #34d399; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px; }
    .content { padding: 32px 28px; }
    .greeting { font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 12px; }
    .desc { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
    .otp-card { background: #f0fdf4; border: 2px dashed #059669; border-radius: 14px; padding: 22px; text-align: center; margin: 24px 0; }
    .otp-code { font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 900; letter-spacing: 10px; color: #047857; display: inline-block; }
    .otp-timer { font-size: 12px; font-weight: 700; color: #059669; margin-top: 8px; }
    .notice { font-size: 12px; line-height: 1.5; color: #64748b; background: #f8fafc; border-radius: 10px; padding: 14px; margin-top: 24px; border: 1px solid #edf2f7; }
    .footer { background: #f8fafc; padding: 18px 24px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">EthioTransit</div>
      <div class="subhead">የኢትዮጵያ ከተማ አቋራጭ የትራንስፖርት መድረክ</div>
    </div>
    <div class="content">
      <div class="greeting">Hello, ${recipientName || 'Traveler'}! / ሰላም!</div>
      <p class="desc">
        Welcome to EthioTransit. To complete your account registration and verify your email address, please enter the 6-digit verification code below:
      </p>
      
      <div class="otp-card">
        <div class="otp-code">${otpCode}</div>
        <div class="otp-timer">⏱️ የማረጋገጫ ኮዱ ለ ${expiryMinutes} ደቂቃዎች ያገለግላል / Valid for ${expiryMinutes} minutes</div>
      </div>

      <div class="notice">
        🔒 <strong>የደህንነት ማስጠንቀቂያ / Security Note:</strong><br>
        ይህን ኮድ ለማንም አያጋሩ። የኢትዮትራንዚት ሰራተኞች የማረጋገጫ ኮድዎን በስልክ ወይም በሌላ መንገድ በፍጹም አይጠይቁም።<br>
        Never share this code with anyone. If you did not attempt to register on EthioTransit, please disregard this email.
      </div>
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} EthioTransit Inc. All rights reserved.<br>
      Addis Ababa, Ethiopia · support@ethiotransit.et
    </div>
  </div>
</body>
</html>
      `;

      const response = await fetch(BrevoService.API_URL, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': apiKey.trim(),
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          sender: {
            name: senderName,
            email: senderEmail,
          },
          to: [
            {
              email: toEmail,
              name: recipientName || 'Traveler',
            },
          ],
          subject: `${otpCode} is your EthioTransit verification code | የማረጋገጫ ኮድ`,
          htmlContent,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error(`[BrevoService] Brevo API responded with error status ${response.status}:`, errText);
        return false;
      }

      const resData: any = await response.json();
      console.log(`[BrevoService] OTP email dispatched successfully to ${toEmail}. MessageId:`, resData?.messageId);
      return true;
    } catch (err: any) {
      console.error('[BrevoService] Exception while sending email via Brevo:', err.message || err);
      return false;
    }
  }
}
