import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, html, attachments }) => {
  try {
      console.log(process.env.EMAIL_USER);
      console.log(process.env.EMAIL_PASS);
    if (!to || !subject || !html) {
      throw new Error(
        "Missing required email parameters: to, subject, and html are required"
      );
    }

    // Validate email credentials exist
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error(
        "Email service not configured. Please check EMAIL_USER and EMAIL_PASS environment variables."
      );
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const wrappedHtml = `
  <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff;">
    <h2 style="color: #0d6efd;">EventsBridge</h2>
    ${html}
    <hr style="margin-top: 30px;" />
    <p style="font-size: 12px; color: #888;">This email was sent automatically by EventsBridge. Please do not reply directly to this email.</p>
  </div>
`;

    const plainText = html.replace(/<[^>]+>/g, "");

    const mailOptions = {
      from: `"EventsBridge" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: wrappedHtml,
      text: plainText,
      ...(attachments && { attachments }), // ✅ safely include if exists
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}`);
    return { success: true, messageId: result.messageId };
  } catch (err) {
    console.error("❌ Error sending email:", err);
    
    // Provide more specific error messages for common issues
    let errorMessage = err.message;
    if (err.code === "EAUTH" || err.responseCode === 535) {
      errorMessage = "Invalid email credentials. Please check EMAIL_USER and EMAIL_PASS in environment variables.";
    } else if (err.code === "ENOTFOUND" || err.code === "ETIMEDOUT" || err.code === "ECONNECTION") {
      errorMessage = "Unable to connect to email server. Please contact support for assistance.";
    }
    
    return { success: false, error: errorMessage };
  }
};

/**
 * Cleanup function to remove expired reset tokens from all users
 * This can be called periodically via cron job or on server startup
 */
export const cleanupExpiredResetTokens = async () => {
  try {
    // Dynamic import to avoid circular dependency
    const { User } = await import("../model/user/user.model.js");
    const result = await User.updateMany(
      { resetPasswordTokenExpires: { $lt: new Date() } },
      { $unset: { resetPasswordToken: 1, resetPasswordTokenExpires: 1 } }
    );
    console.log(`✅ Cleaned up ${result.modifiedCount} expired reset tokens`);
    return { success: true, modifiedCount: result.modifiedCount };
  } catch (error) {
    console.error("❌ Error cleaning up expired reset tokens:", error);
    return { success: false, error: error.message };
  }
};
