import { env } from "../../configs/env.js";
import emailTransporter from "../../configs/nodemailer.js";

export const verificationSender = async(email: string, token: string) => {
  const verificationLink = `${env.FRONTEND_URL}/verify-email?token=${token}`;

  try {
    await emailTransporter.sendMail({
      from: env.EMAIL_ADDRESS,
      to: email,
      subject: "Verify your email address",
      html: `
      <p>Please click the link below to verify your email address:</p>
      <a href="${verificationLink}" target="_blank">Verify Email</a>
    `,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error sending verification email:", error);
  }
};
