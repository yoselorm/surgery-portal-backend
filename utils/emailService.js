const nodemailer = require('nodemailer');

const sendDoctorCredentials = async (email, firstName, plainPassword) => {
  try {
    // 1️⃣ Create reusable transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 2️⃣ Email options (HTML version)
    const mailOptions = {
      from: `"Surgery Portal" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your Surgery Portal Login Credentials',
      html: `<body style="margin: 0; padding: 0; background-color: #f4f7fa; font-family: 'Segoe UI', Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f7fa; padding: 40px 0;">
          <tr>
              <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
                      
                      <tr>
                          <td style="background: #ffffff; padding: 40px 30px; text-align: center;">
                              <h1 style="margin: 0; color:rgba(4, 22, 65, 0.05); font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
                                  Welcome to ISOLP
                              </h1>
                              <p style="margin: 10px 0 0 0; color:rgb(25, 77, 251); font-size: 16px;">
                                  Surgery Portal
                              </p>
                          </td>
                      </tr>
  
                      <tr>
                          <td style="padding: 40px 40px 30px 40px;">
                              <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                                  Hello <strong style="color: #667eea;">Dr. ${firstName}</strong>,
                              </p>
                              
                              <p style="margin: 0 0 25px 0; color: #6b7280; font-size: 15px; line-height: 1.7;">
                                  Your account has been successfully created! We're excited to have you on board. Below are your secure login credentials to access the ISOLP Surgery Portal.
                              </p>
  
                              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 10px; border: 1px solid #e2e8f0; margin: 25px 0;">
                                  <tr>
                                      <td style="padding: 25px;">
                                          <table width="100%" cellpadding="0" cellspacing="0">
                                              <tr>
                                                  <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                                                      <table width="100%">
                                                          <tr>
                                                              <td style="color: #64748b; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                                                                  Email Address
                                                              </td>
                                                          </tr>
                                                          <tr>
                                                              <td style="padding-top: 6px; color: #1e293b; font-size: 15px; font-weight: 500;">
                                                                  ${email}
                                                              </td>
                                                          </tr>
                                                      </table>
                                                  </td>
                                              </tr>
                                              <tr>
                                                  <td style="padding: 12px 0;">
                                                      <table width="100%">
                                                          <tr>
                                                              <td style="color: #64748b; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                                                                  Temporary Password
                                                              </td>
                                                          </tr>
                                                          <tr>
                                                              <td style="padding-top: 6px;">
                                                                  <span style="display: inline-block; background: #ffffff; border: 2px dashed #667eea; border-radius: 6px; padding: 10px 16px; color: #667eea; font-size: 16px; font-weight: 600; font-family: 'Courier New', monospace; letter-spacing: 1px;">
                                                                      ${plainPassword}
                                                                  </span>
                                                              </td>
                                                          </tr>
                                                      </table>
                                                  </td>
                                              </tr>
                                          </table>
                                      </td>
                                  </tr>
                              </table>
  
                              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 6px; margin: 25px 0;">
                                  <tr>
                                      <td style="padding: 16px 20px;">
                                          <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                                              <strong style="font-size: 15px;">🔒 Security Notice:</strong><br>
                                              Please change your password immediately after your first login for security purposes.
                                          </p>
                                      </td>
                                  </tr>
                              </table>
  
                              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                                  <tr>
                                      <td align="center">
                                          <a href="#" target='_blank' style="display: inline-block; background: white; color: black; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
                                              Login to Your Account →
                                          </a>
                                      </td>
                                  </tr>
                              </table>
  
                              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 30px; padding-top: 25px; border-top: 1px solid #e5e7eb;">
                                  <tr>
                                      <td>
                                          <p style="margin: 0 0 15px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                                              Need help getting started? Our support team is here to assist you 24/7.
                                          </p>
                                          <p style="margin: 0; color: #9ca3af; font-size: 13px;">
                                              📧 office@isolp.org
                                          </p>
                                      </td>
                                  </tr>
                              </table>
                          </td>
                      </tr>
  
                      <tr>
                          <td style="background-color: #f9fafb; padding: 30px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                              <p style="margin: 0 0 10px 0; color: #374151; font-size: 15px; font-weight: 500;">
                                  Best regards,
                              </p>
                              <p style="margin: 0 0 20px 0; color: #667eea; font-size: 18px; font-weight: 700; letter-spacing: 0.5px;">
                                  The ISOLP Team
                              </p>
                              <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 1.5;">
                                  © 2024 ISOLP Surgery Portal. All rights reserved.<br>
                                  This email contains confidential information intended only for the recipient.
                              </p>
                          </td>
                      </tr>
                  </table>
  
                  <table width="600" cellpadding="0" cellspacing="0" style="margin-top: 20px;">
                      <tr>
                          <td align="center" style="color: #9ca3af; font-size: 11px; line-height: 1.5;">
                              If you did not request this account, please contact us immediately.
                          </td>
                      </tr>
                  </table>
              </td>
          </tr>
      </table>
  </body>`
      ,
    };

    // 3️⃣ Send email
    await transporter.sendMail(mailOptions);
    console.log(`✅ Credentials sent to ${email}`);
  } catch (error) {
    console.error('❌ Error sending credentials email:', error.message);
  }
};

module.exports = sendDoctorCredentials;
