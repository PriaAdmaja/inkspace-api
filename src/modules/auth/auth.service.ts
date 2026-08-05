import { env } from "../../configs/env.js";
import emailTransporter from "../../configs/nodemailer.js";

export const verificationSender = async ({
  email,
  token,
  name,
}: {
  email: string;
  token: string;
  name?: string | null;
}) => {
  const frontendUrl = env.FRONTEND_URL;
  const confertedFrontendUrl = frontendUrl.endsWith("/")
    ? frontendUrl.slice(0, -1)
    : frontendUrl;
  const verificationLink = `${confertedFrontendUrl}/email-confirmation?token=${token}`;

  try {
    await emailTransporter.sendMail({
      from: env.EMAIL_ADDRESS,
      to: email,
      subject: "Inkspace Email Verification",
      html: htmlContent({ name, verificationLink }),
      amp: ampContent({ name, verificationLink }),
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error sending verification email:", error);
  }
};

const htmlContent = ({
  name,
  verificationLink,
}: {
  name?: string | null;
  verificationLink: string;
}) => {
  return `
      <p>Hi ${name || "there"}!</p>
      <p>You've successfully set up an account with Inkspace. To complete your registration, we just need to verify your email address. Please click the link below:</p>
      <a href="${verificationLink}" target="_blank">Verify Email</a>
      <p>Or copy and paste this URL into your browser address bar: <a href="${verificationLink}" target="_blank">${verificationLink}</a></p>
      <p>Regards,</p>
      <p>Inkspace Team</p>
    `;
};

const ampContent = ({
  name,
  verificationLink,
}: {
  name?: string | null;
  verificationLink: string;
}) => {
  return `<!doctype html>
<html>
  <body>
    <div
      style='background-color:#F2F5F7;color:#242424;font-family:"Helvetica Neue", "Arial Nova", "Nimbus Sans", Arial, sans-serif;font-size:16px;font-weight:400;letter-spacing:0.15008px;line-height:1.5;margin:0;padding:32px 0;min-height:100%;width:100%'
    >
      <table
        align="center"
        width="100%"
        style="margin:0 auto;max-width:600px;background-color:#FFFFFF"
        role="presentation"
        cellspacing="0"
        cellpadding="0"
        border="0"
      >
        <tbody>
          <tr style="width:100%">
            <td>
              <div style="font-weight:normal;padding:0px 24px 16px 24px">
                Hi ${name || "there"} 👋,
              </div>
              <div style="font-weight:normal;padding:0px 24px 16px 24px">
                You&#x27;ve successfully set up an account with Inkspace. To
                complete your registration, we just need to verify your email
                address. Please click the button below:
              </div>
              <div style="text-align:center;padding:16px 24px 24px 24px">
                <a
                  href="${verificationLink}"
                  style="color:#FFFFFF;font-size:14px;font-weight:bold;background-color:#0079cc;display:inline-block;padding:12px 20px;text-decoration:none"
                  target="_blank"
                  ><span
                    ><!--[if mso
                      ]><i
                        style="letter-spacing: 20px;mso-font-width:-100%;mso-text-raise:30"
                        hidden
                        >&nbsp;</i
                      ><!
                    [endif]--></span
                  ><span>Verify Your Account</span
                  ><span
                    ><!--[if mso
                      ]><i
                        style="letter-spacing: 20px;mso-font-width:-100%"
                        hidden
                        >&nbsp;</i
                      ><!
                    [endif]--></span
                  ></a
                >
              </div>
              <div style="font-weight:normal;padding:0px 24px 16px 24px">
                Or copy and paste this URL into your browser address bar:
                <a href="${verificationLink}" target="_blank">${verificationLink}</a>
                and get started straight away!
              </div>
              <div style="font-weight:normal;padding:0px 24px 16px 24px">
                Regards, Inkspace Team
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </body>
</html>`;
};
