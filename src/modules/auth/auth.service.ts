import { env } from "../../configs/env.js";
import emailTransporter from "../../configs/nodemailer.js";

export const verificationSender = async(email: string, token: string) => {
  const frontendUrl = env.FRONTEND_URL
  const confertedFrontendUrl = frontendUrl.endsWith("/") ? frontendUrl.slice(0, -1) : frontendUrl;
  const verificationLink = `${confertedFrontendUrl}/verify-email?token=${token}`;

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
