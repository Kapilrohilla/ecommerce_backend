import nodemailer from "nodemailer";

type SendMailArgvs = {
  to: string;
  info: string;
  subject: string;
};

export const sendMail = async ({ to, info, subject }: SendMailArgvs) => {
  const AppPasswordForMail = process.env.GMAIL_APP_PASSWORD;
  const mailTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "kapilrohilla2002@gmail.com",
      pass: AppPasswordForMail,
    },
  });

  const details = {
    from: "kapilrohilla2002@gmail.com",
    to: to,
    subject: subject,
    text: info,
  };

  const r = await mailTransporter.sendMail(details);
  return r.response.includes("OK");
};
