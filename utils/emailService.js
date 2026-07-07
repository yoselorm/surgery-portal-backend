const SibApiV3Sdk = require('sib-api-v3-sdk');

if (!process.env.BREVO_API_KEY) {
    throw new Error('BREVO_API_KEY missing');
}

if (!process.env.BREVO_SENDER_EMAIL) {
    throw new Error('BREVO_SENDER_EMAIL missing');
}

const client = SibApiV3Sdk.ApiClient.instance;
const apiKey = client.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const tranEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();

const sendEmail = ({ to, subject, html, text }) => {
    return tranEmailApi.sendTransacEmail({
        sender: {
            email: process.env.BREVO_SENDER_EMAIL,
            name: process.env.BREVO_SENDER_NAME || 'ISOLP Surgery Portal',
        },
        to: [{ email: to }],
        subject,
        htmlContent: html,
        textContent: text,
    });
};



// NOTE: this now returns the underlying promise and re-throws on failure
// instead of swallowing errors — callers can `await` it and decide what
// to do if the email genuinely fails to send (e.g. Brevo key/quota issue).
const sendDoctorCredentials = async (email, firstName, plainPassword) => {
    try {
        return await sendEmail({
            to: email,
            subject: 'Welcome to SurgiDesk – Your Account is Ready',
            html: `
        <body style="margin:0;padding:0;background:#eef1f5;font-family:Segoe UI,Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;box-shadow:0 4px 16px rgba(13,35,64,0.12);overflow:hidden;">

                  <!-- Header banner -->
                  <tr>
                    <td>
                      <img 
                        src="https://isolp.org/images/isolpicon.png"
                        alt="ISOLP Logo"
                        width="64"
                        height="64"
                        style="display:block;margin:0 auto 16px auto;border-radius:12px;"
                        />
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding:40px;">
                      <p style="font-size:16px;color:#22303f;line-height:1.7;">
                        Dear <strong>Dr. ${firstName}</strong>,
                      </p>

                      <p style="font-size:15px;color:#48586b;line-height:1.7;">
                        Welcome to <strong>SurgiDesk</strong> — your account has been created and is ready to use.
                        SurgiDesk is where you'll log surgeries, track patient records, and manage your cases
                        as part of the ISOLP network.
                      </p>

                      <p style="font-size:15px;color:#48586b;line-height:1.7;">
                        Your login details are below. We're glad to have you on board, and if you run into any
                        questions getting started, the ISOLP Executive Council is here to help.
                      </p>

                      <!-- Credentials Box -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin:30px 0;background:#f4f0e9;border:1px solid #e3d7c4;border-radius:10px;">
                        <tr>
                          <td style="padding:24px;">
                            <p style="margin:0 0 12px 0;font-size:13px;color:#8a6a42;text-transform:uppercase;letter-spacing:1px;">
                              Your Login Credentials
                            </p>

                            <p style="margin:8px 0;font-size:15px;color:#22303f;">
                              <strong>Email:</strong> ${email}
                            </p>

                            <p style="margin:8px 0;font-size:15px;color:#22303f;">
                              <strong>Temporary Password:</strong><br>
                              <span style="display:inline-block;margin-top:6px;padding:10px 16px;border:2px dashed #a9713f;border-radius:6px;font-family:Courier New,monospace;font-size:16px;color:#0d2340;background:#ffffff;">
                                ${plainPassword}
                              </span>
                            </p>
                          </td>
                        </tr>
                      </table>

                      <!-- Login Button -->
                      <div style="text-align:center;margin:35px 0;">
                        <a href="${process.env.FRONTEND_URL || 'https://surgery-portal-six.vercel.app'}/signin"
                           target="_blank"
                           style="background:#0d2340;color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:8px;font-size:16px;font-weight:600;">
                          Log in to SurgiDesk →
                        </a>
                      </div>

                      <!-- Security Notice -->
                      <div style="background:#fbf1e6;border-left:4px solid #a9713f;padding:16px;border-radius:6px;">
                        <p style="margin:0;font-size:14px;color:#6b4a26;">
                          🔒 <strong>Security tip:</strong>
                          Please change your password as soon as you log in for the first time.
                        </p>
                      </div>

                      <p style="margin-top:30px;font-size:15px;color:#48586b;">
                        Thank you for being part of SurgiDesk. We look forward to supporting your work.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background:#f6f7f9;padding:30px;text-align:center;border-top:1px solid #e5e7eb;">
                      <p style="margin:0;font-size:15px;color:#374151;">
                        Warm regards,
                      </p>
                      <p style="margin:6px 0 0 0;font-size:16px;font-weight:600;color:#0d2340;">
                        ISOLP Executive Council
                      </p>
                      <p style="margin-top:14px;font-size:12px;color:#9ca3af;">
                        © 2026 SurgiDesk. All rights reserved.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
      `,
        });
    } catch (err) {
        console.error('❌ Brevo send error:', err.response?.text || err.message);
        throw err; // let the caller decide how to handle a failed send
    }
};


module.exports = {
    sendEmail,
    sendDoctorCredentials,
};