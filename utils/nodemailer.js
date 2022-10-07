import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});
const sendMail = (messageOptions) => {
  const message = {
    from: process.env.GMAIL_USER,
    to: messageOptions.recipient,
    subject: messageOptions.subject,
    text: messageOptions.text,
    html: messageOptions.html,
  };
  return transporter.sendMail(message);
};
export { sendMail };
