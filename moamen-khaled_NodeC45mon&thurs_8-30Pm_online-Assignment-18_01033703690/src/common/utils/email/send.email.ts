import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer/index.js";
import {
  APPLICATION_NAME,
  EMAIL_PASS,
  EMAIL_USER,
} from "../../../config/config";
import { BadRequestException } from "../../exceptions";

export const sendEmail = async ({
  to,
  cc,
  bcc,
  html,
  attachments = [],
}: Mail.Options): Promise<void> => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });
  if (!to && !cc && !bcc) {
    throw new BadRequestException("invalid recipient");
  }
  if (!(html as string)?.length && !attachments?.length) {
    throw new BadRequestException("invalid mail content");
  }
  const info = transporter.sendMail({
    to,
    cc,
    bcc,
    html,
    attachments,
    from: `${APPLICATION_NAME} ${EMAIL_USER}`,
  });

  console.log("mail sent", (await info).messageId);
};
