// const nodemailer = require('nodemailer');

// exports.sendDoctorCredentials = async (email, firstName, plainPassword) => {
//   try {
//     // 1️⃣ Create reusable transporter
//     const transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },
//     });

//     // 2️⃣ Email options (HTML version)
//     const mailOptions = {
//       from: `"Surgery Portal" <${process.env.EMAIL_USER}>`,
//       to: email,
//       subject: 'Your Surgery Portal Login Credentials',
//       html: `<body style="margin: 0; padding: 0; background-color: #f4f7fa; font-family: 'Segoe UI', Arial, sans-serif;">
//       <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f7fa; padding: 40px 0;">
//           <tr>
//               <td align="center">
//                   <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">

//                       <tr>
//                           <td style="background: #ffffff; padding: 40px 30px; text-align: center;">
//                               <h1 style="margin: 0; color:rgba(4, 22, 65, 0.05); font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
//                                   Welcome to ISOLP
//                               </h1>
//                               <p style="margin: 10px 0 0 0; color:rgb(25, 77, 251); font-size: 16px;">
//                                   Surgery Portal
//                               </p>
//                           </td>
//                       </tr>

//                       <tr>
//                           <td style="padding: 40px 40px 30px 40px;">
//                               <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
//                                   Hello <strong style="color: #667eea;">Dr. ${firstName}</strong>,
//                               </p>

//                               <p style="margin: 0 0 25px 0; color: #6b7280; font-size: 15px; line-height: 1.7;">
//                                   Your account has been successfully created! We're excited to have you on board. Below are your secure login credentials to access the ISOLP Surgery Portal.
//                               </p>

//                               <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 10px; border: 1px solid #e2e8f0; margin: 25px 0;">
//                                   <tr>
//                                       <td style="padding: 25px;">
//                                           <table width="100%" cellpadding="0" cellspacing="0">
//                                               <tr>
//                                                   <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
//                                                       <table width="100%">
//                                                           <tr>
//                                                               <td style="color: #64748b; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
//                                                                   Email Address
//                                                               </td>
//                                                           </tr>
//                                                           <tr>
//                                                               <td style="padding-top: 6px; color: #1e293b; font-size: 15px; font-weight: 500;">
//                                                                   ${email}
//                                                               </td>
//                                                           </tr>
//                                                       </table>
//                                                   </td>
//                                               </tr>
//                                               <tr>
//                                                   <td style="padding: 12px 0;">
//                                                       <table width="100%">
//                                                           <tr>
//                                                               <td style="color: #64748b; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
//                                                                   Temporary Password
//                                                               </td>
//                                                           </tr>
//                                                           <tr>
//                                                               <td style="padding-top: 6px;">
//                                                                   <span style="display: inline-block; background: #ffffff; border: 2px dashed #667eea; border-radius: 6px; padding: 10px 16px; color: #667eea; font-size: 16px; font-weight: 600; font-family: 'Courier New', monospace; letter-spacing: 1px;">
//                                                                       ${plainPassword}
//                                                                   </span>
//                                                               </td>
//                                                           </tr>
//                                                       </table>
//                                                   </td>
//                                               </tr>
//                                           </table>
//                                       </td>
//                                   </tr>
//                               </table>

//                               <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 6px; margin: 25px 0;">
//                                   <tr>
//                                       <td style="padding: 16px 20px;">
//                                           <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
//                                               <strong style="font-size: 15px;">🔒 Security Notice:</strong><br>
//                                               Please change your password immediately after your first login for security purposes.
//                                           </p>
//                                       </td>
//                                   </tr>
//                               </table>

//                               <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
//                                   <tr>
//                                       <td align="center">
//                                           <a href="#" target='_blank' style="display: inline-block; background: white; color: black; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
//                                               Login to Your Account →
//                                           </a>
//                                       </td>
//                                   </tr>
//                               </table>

//                               <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 30px; padding-top: 25px; border-top: 1px solid #e5e7eb;">
//                                   <tr>
//                                       <td>
//                                           <p style="margin: 0 0 15px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
//                                               Need help getting started? Our support team is here to assist you 24/7.
//                                           </p>
//                                           <p style="margin: 0; color: #9ca3af; font-size: 13px;">
//                                               📧 office@isolp.org
//                                           </p>
//                                       </td>
//                                   </tr>
//                               </table>
//                           </td>
//                       </tr>

//                       <tr>
//                           <td style="background-color: #f9fafb; padding: 30px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
//                               <p style="margin: 0 0 10px 0; color: #374151; font-size: 15px; font-weight: 500;">
//                                   Best regards,
//                               </p>
//                               <p style="margin: 0 0 20px 0; color: #667eea; font-size: 18px; font-weight: 700; letter-spacing: 0.5px;">
//                                   The ISOLP Team
//                               </p>
//                               <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 1.5;">
//                                   © 2024 ISOLP Surgery Portal. All rights reserved.<br>
//                                   This email contains confidential information intended only for the recipient.
//                               </p>
//                           </td>
//                       </tr>
//                   </table>

//                   <table width="600" cellpadding="0" cellspacing="0" style="margin-top: 20px;">
//                       <tr>
//                           <td align="center" style="color: #9ca3af; font-size: 11px; line-height: 1.5;">
//                               If you did not request this account, please contact us immediately.
//                           </td>
//                       </tr>
//                   </table>
//               </td>
//           </tr>
//       </table>
//   </body>`
//       ,
//     };

//     // 3️⃣ Send email
//     await transporter.sendMail(mailOptions);
//     console.log(`✅ Credentials sent to ${email}`);
//   } catch (error) {
//     console.error('❌ Error sending credentials email:', error.message);
//   }
// };

// exports.sendEmail = async ({ to, subject, text, html }) => {
//   try {
//     const transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },
//     });

//     const mailOptions = {
//       from: `"${process.env.EMAIL_USER}" `,
//       to,
//       subject,
//       text,
//       html,
//     };

//     await transporter.sendMail(mailOptions);
//   } catch (error) {
//     console.error("Email send failed:", error);
//     throw new Error("Email could not be sent");
//   }
// };

// // services/emailService.js or utils/emailService.js
// const { Resend } = require('resend');
// const resend = new Resend(process.env.RESEND_API_KEY);

// const FROM_EMAIL = 'ISOLP Surgery Portal <onboarding@resend.dev>';

// /**
//  * Send doctor credentials email
//  */
// exports.sendDoctorCredentials = async (email, firstName, plainPassword) => {
//   try {
//     const { data, error } = await resend.emails.send({
//       from: FROM_EMAIL,
//       to: [email],
//       subject: 'Your Surgery Portal Login Credentials',
//       html: `
//         <body style="margin: 0; padding: 0; background-color: #f4f7fa; font-family: 'Segoe UI', Arial, sans-serif;">
//           <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f7fa; padding: 40px 0;">
//               <tr>
//                   <td align="center">
//                       <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">

//                           <tr>
//                               <td style="background: #ffffff; padding: 40px 30px; text-align: center;">
//                                   <h1 style="margin: 0; color:rgba(4, 22, 65, 0.05); font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
//                                       Welcome to ISOLP
//                                   </h1>
//                                   <p style="margin: 10px 0 0 0; color:rgb(25, 77, 251); font-size: 16px;">
//                                       Surgery Portal
//                                   </p>
//                               </td>
//                           </tr>

//                           <tr>
//                               <td style="padding: 40px 40px 30px 40px;">
//                                   <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
//                                       Hello <strong style="color: #667eea;">Dr. ${firstName}</strong>,
//                                   </p>

//                                   <p style="margin: 0 0 25px 0; color: #6b7280; font-size: 15px; line-height: 1.7;">
//                                       Your account has been successfully created! We're excited to have you on board. Below are your secure login credentials to access the ISOLP Surgery Portal.
//                                   </p>

//                                   <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 10px; border: 1px solid #e2e8f0; margin: 25px 0;">
//                                       <tr>
//                                           <td style="padding: 25px;">
//                                               <table width="100%" cellpadding="0" cellspacing="0">
//                                                   <tr>
//                                                       <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
//                                                           <table width="100%">
//                                                               <tr>
//                                                                   <td style="color: #64748b; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
//                                                                       Email Address
//                                                                   </td>
//                                                               </tr>
//                                                               <tr>
//                                                                   <td style="padding-top: 6px; color: #1e293b; font-size: 15px; font-weight: 500;">
//                                                                       ${email}
//                                                                   </td>
//                                                               </tr>
//                                                           </table>
//                                                       </td>
//                                                   </tr>
//                                                   <tr>
//                                                       <td style="padding: 12px 0;">
//                                                           <table width="100%">
//                                                               <tr>
//                                                                   <td style="color: #64748b; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
//                                                                       Temporary Password
//                                                                   </td>
//                                                               </tr>
//                                                               <tr>
//                                                                   <td style="padding-top: 6px;">
//                                                                       <span style="display: inline-block; background: #ffffff; border: 2px dashed #667eea; border-radius: 6px; padding: 10px 16px; color: #667eea; font-size: 16px; font-weight: 600; font-family: 'Courier New', monospace; letter-spacing: 1px;">
//                                                                           ${plainPassword}
//                                                                       </span>
//                                                                   </td>
//                                                               </tr>
//                                                           </table>
//                                                       </td>
//                                                   </tr>
//                                               </table>
//                                           </td>
//                                       </tr>
//                                   </table>

//                                   <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 6px; margin: 25px 0;">
//                                       <tr>
//                                           <td style="padding: 16px 20px;">
//                                               <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
//                                                   <strong style="font-size: 15px;">🔒 Security Notice:</strong><br>
//                                                   Please change your password immediately after your first login for security purposes.
//                                               </p>
//                                           </td>
//                                       </tr>
//                                   </table>

//                                   <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
//                                       <tr>
//                                           <td align="center">
//                                               <a href="${process.env.FRONTEND_URL || 'https://surgery-portal-six.vercel.app'}/login" target='_blank' style="display: inline-block; background: white; color: black; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
//                                                   Login to Your Account →
//                                               </a>
//                                           </td>
//                                       </tr>
//                                   </table>

//                                   <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 30px; padding-top: 25px; border-top: 1px solid #e5e7eb;">
//                                       <tr>
//                                           <td>
//                                               <p style="margin: 0 0 15px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
//                                                   Need help getting started? Our support team is here to assist you 24/7.
//                                               </p>
//                                               <p style="margin: 0; color: #9ca3af; font-size: 13px;">
//                                                   📧 office@isolp.org
//                                               </p>
//                                           </td>
//                                       </tr>
//                                   </table>
//                               </td>
//                           </tr>

//                           <tr>
//                               <td style="background-color: #f9fafb; padding: 30px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
//                                   <p style="margin: 0 0 10px 0; color: #374151; font-size: 15px; font-weight: 500;">
//                                       Best regards,
//                                   </p>
//                                   <p style="margin: 0 0 20px 0; color: #667eea; font-size: 18px; font-weight: 700; letter-spacing: 0.5px;">
//                                       The ISOLP Team
//                                   </p>
//                                   <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 1.5;">
//                                       © 2024 ISOLP Surgery Portal. All rights reserved.<br>
//                                       This email contains confidential information intended only for the recipient.
//                                   </p>
//                               </td>
//                           </tr>
//                       </table>

//                       <table width="600" cellpadding="0" cellspacing="0" style="margin-top: 20px;">
//                           <tr>
//                               <td align="center" style="color: #9ca3af; font-size: 11px; line-height: 1.5;">
//                                   If you did not request this account, please contact us immediately.
//                               </td>
//                           </tr>
//                       </table>
//                   </td>
//               </tr>
//           </table>
//         </body>
//       `
//     });

//     if (error) {
//       console.error('❌ Error sending credentials email:', error);
//       throw new Error('Failed to send credentials email');
//     }

//     console.log(`✅ Credentials sent to ${email}`);
//     return { success: true, data };
//   } catch (error) {
//     console.error('❌ Error sending credentials email:', error.message);
//     throw error;
//   }
// };

// /**
//  * Send generic email
//  */
// exports.sendEmail = async ({ to, subject, text, html }) => {
//   try {
//     const { data, error } = await resend.emails.send({
//       from: FROM_EMAIL,
//       to: Array.isArray(to) ? to : [to],
//       subject: subject,
//       text: text,
//       html: html || `<p>${text}</p>`
//     });

//     if (error) {
//       console.error("❌ Email send failed:", error);
//       throw new Error("Email could not be sent");
//     }

//     console.log('✅ Email sent successfully:', data);
//     return { success: true, data };
//   } catch (error) {
//     console.error("❌ Email send failed:", error);
//     throw new Error("Email could not be sent");
//   }
// };

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

// const sendDoctorCredentials = (email, firstName, plainPassword) => {
//   sendEmail({
//     to: email,
//     subject: 'Your Surgery Portal Login Credentials',
//     html: `
//       <body style="margin: 0; padding: 0; background-color: #f4f7fa; font-family: 'Segoe UI', Arial, sans-serif;">
//           <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f7fa; padding: 40px 0;">
//               <tr>
//                   <td align="center">
//                       <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">

//                           <tr>
//                               <td style="background: #ffffff; padding: 40px 30px; text-align: center;">
//                                   <h1 style="margin: 0; color:rgba(4, 22, 65, 0.05); font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
//                                       Welcome to ISOLP
//                                   </h1>
//                                   <p style="margin: 10px 0 0 0; color:rgb(25, 77, 251); font-size: 16px;">
//                                       Surgery Portal
//                                   </p>
//                               </td>
//                           </tr>

//                           <tr>
//                               <td style="padding: 40px 40px 30px 40px;">
//                                   <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
//                                       Hello <strong style="color: #667eea;">Dr. ${firstName}</strong>,
//                                   </p>

//                                   <p style="margin: 0 0 25px 0; color: #6b7280; font-size: 15px; line-height: 1.7;">
//                                       Your account has been successfully created! We're excited to have you on board. Below are your secure login credentials to access the ISOLP Surgery Portal.
//                                   </p>

//                                   <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 10px; border: 1px solid #e2e8f0; margin: 25px 0;">
//                                       <tr>
//                                           <td style="padding: 25px;">
//                                               <table width="100%" cellpadding="0" cellspacing="0">
//                                                   <tr>
//                                                       <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
//                                                           <table width="100%">
//                                                               <tr>
//                                                                   <td style="color: #64748b; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
//                                                                       Email Address
//                                                                   </td>
//                                                               </tr>
//                                                               <tr>
//                                                                   <td style="padding-top: 6px; color: #1e293b; font-size: 15px; font-weight: 500;">
//                                                                       ${email}
//                                                                   </td>
//                                                               </tr>
//                                                           </table>
//                                                       </td>
//                                                   </tr>
//                                                   <tr>
//                                                       <td style="padding: 12px 0;">
//                                                           <table width="100%">
//                                                               <tr>
//                                                                   <td style="color: #64748b; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
//                                                                       Temporary Password
//                                                                   </td>
//                                                               </tr>
//                                                               <tr>
//                                                                   <td style="padding-top: 6px;">
//                                                                       <span style="display: inline-block; background: #ffffff; border: 2px dashed #667eea; border-radius: 6px; padding: 10px 16px; color: #667eea; font-size: 16px; font-weight: 600; font-family: 'Courier New', monospace; letter-spacing: 1px;">
//                                                                           ${plainPassword}
//                                                                       </span>
//                                                                   </td>
//                                                               </tr>
//                                                           </table>
//                                                       </td>
//                                                   </tr>
//                                               </table>
//                                           </td>
//                                       </tr>
//                                   </table>

//                                   <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 6px; margin: 25px 0;">
//                                       <tr>
//                                           <td style="padding: 16px 20px;">
//                                               <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
//                                                   <strong style="font-size: 15px;">🔒 Security Notice:</strong><br>
//                                                   Please change your password immediately after your first login for security purposes.
//                                               </p>
//                                           </td>
//                                       </tr>
//                                   </table>

//                                   <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
//                                       <tr>
//                                           <td align="center">
//                                               <a href="${process.env.FRONTEND_URL || 'https://surgery-portal-six.vercel.app'}/signin" target='_blank' style="display: inline-block; background: white; color: black; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
//                                                   Login to Your Account →
//                                               </a>
//                                           </td>
//                                       </tr>
//                                   </table>

//                                   <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 30px; padding-top: 25px; border-top: 1px solid #e5e7eb;">
//                                       <tr>
//                                           <td>
//                                               <p style="margin: 0 0 15px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
//                                                   Need help getting started? Our support team is here to assist you 24/7.
//                                               </p>
//                                               <p style="margin: 0; color: #9ca3af; font-size: 13px;">
//                                                   📧 office@isolp.org
//                                               </p>
//                                           </td>
//                                       </tr>
//                                   </table>
//                               </td>
//                           </tr>

//                           <tr>
//                               <td style="background-color: #f9fafb; padding: 30px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
//                                   <p style="margin: 0 0 10px 0; color: #374151; font-size: 15px; font-weight: 500;">
//                                       Best regards,
//                                   </p>
//                                   <p style="margin: 0 0 20px 0; color: #667eea; font-size: 18px; font-weight: 700; letter-spacing: 0.5px;">
//                                       The ISOLP Team
//                                   </p>
//                                   <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 1.5;">
//                                       © 2024 ISOLP Surgery Portal. All rights reserved.<br>
//                                       This email contains confidential information intended only for the recipient.
//                                   </p>
//                               </td>
//                           </tr>
//                       </table>

//                       <table width="600" cellpadding="0" cellspacing="0" style="margin-top: 20px;">
//                           <tr>
//                               <td align="center" style="color: #9ca3af; font-size: 11px; line-height: 1.5;">
//                                   If you did not request this account, please contact us immediately.
//                               </td>
//                           </tr>
//                       </table>
//                   </td>
//               </tr>
//           </table>
//         </body>
//     `,
//   }).catch(err => {
//     console.error('❌ Brevo send error:', err.response?.text || err.message);
//   });
// };

const sendDoctorCredentials = (email, firstName, plainPassword) => {
    sendEmail({
        to: email,
        subject: 'Invitation to SurgiDesk – Phase 2 Testing Access',
        html: `
        <body style="margin:0;padding:0;background:#f4f7fa;font-family:Segoe UI,Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.1);overflow:hidden;">
                  
                  <!-- Header -->
                  <tr>
                    <td style="padding:40px;text-align:center;">

                      <img 
                        src="https://isolp.org/images/mainlogo.png"
                        alt="ISOLP Logo"
                        width="64"
                        height="64"
                        style="display:block;margin:0 auto 16px auto;border-radius:12px;"
                        />
                      <h1 style="margin:0;color:#1e293b;font-size:26px;">
                        ISOLP SurgiDesk
                      </h1>
                      <p style="margin-top:8px;color:#667eea;font-size:15px;">
                        Phase 2 Testing Invitation
                      </p>
                    </td>
                  </tr>
  
                  <!-- Content -->
                  <tr>
                    <td style="padding:40px;">
                      <p style="font-size:16px;color:#374151;line-height:1.7;">
                        Dear <strong>Dr. ${firstName}</strong>,
                      </p>
  
                      <p style="font-size:15px;color:#4b5563;line-height:1.7;">
                        We are pleased to invite you to participate in <strong>Phase 2 of the testing</strong> of the
                        <strong>SurgiDesk Database</strong>. This testing phase will run for a period of
                        <strong>four (4) weeks</strong>.
                      </p>
  
                      <p style="font-size:15px;color:#4b5563;line-height:1.7;">
                        During this time, we kindly ask that you actively use the database and carefully note any
                        challenges, concerns, or suggestions that may arise. All feedback should be communicated to
                        the <strong>ISOLP Executive Council</strong>, as it will be invaluable in improving the platform.
                      </p>
  
                      <!-- Credentials Box -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin:30px 0;background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;">
                        <tr>
                          <td style="padding:24px;">
                            <p style="margin:0 0 12px 0;font-size:14px;color:#64748b;text-transform:uppercase;">
                              Your Login Credentials
                            </p>
  
                            <p style="margin:8px 0;font-size:15px;color:#1e293b;">
                              <strong>Email:</strong> ${email}
                            </p>
  
                            <p style="margin:8px 0;font-size:15px;color:#1e293b;">
                              <strong>Temporary Password:</strong><br>
                              <span style="display:inline-block;margin-top:6px;padding:10px 16px;border:2px dashed #667eea;border-radius:6px;font-family:Courier New,monospace;font-size:16px;color:#667eea;">
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
                           style="background:#667eea;color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:8px;font-size:16px;font-weight:600;">
                          Login to SurgiDesk →
                        </a>
                      </div>
  
                      <!-- Security Notice -->
                      <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:16px;border-radius:6px;">
                        <p style="margin:0;font-size:14px;color:#92400e;">
                          🔒 <strong>Security Notice:</strong>  
                          Please change your password immediately after your first login.
                        </p>
                      </div>
  
                      <p style="margin-top:30px;font-size:15px;color:#4b5563;">
                        Thank you for your continued support and commitment to this initiative.
                        We trust you will find the testing phase both engaging and rewarding.
                      </p>
                    </td>
                  </tr>
  
                  <!-- Footer -->
                  <tr>
                    <td style="background:#f9fafb;padding:30px;text-align:center;border-top:1px solid #e5e7eb;">
                      <p style="margin:0;font-size:15px;color:#374151;">
                        Warm regards,
                      </p>
                      <p style="margin:6px 0 0 0;font-size:16px;font-weight:600;color:#667eea;">
                        ISOLP Executive Council
                      </p>
                      <p style="margin-top:14px;font-size:12px;color:#9ca3af;">
                        © 2025 SurgiDesk. All rights reserved.
                      </p>
                    </td>
                  </tr>
  
                </table>
              </td>
            </tr>
          </table>
        </body>
      `,
    }).catch(err => {
        console.error('❌ Brevo send error:', err.response?.text || err.message);
    });
};


module.exports = {
    sendEmail,
    sendDoctorCredentials,
};
