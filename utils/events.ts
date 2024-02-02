import EventEmitter from "events";
import nodemailer from "nodemailer";

const eventEmitter = new EventEmitter();

type SendMailArgvs = {
  to: string;
  info: string;
  subject: string;
};
const sendMail = ({ to, info, subject }: SendMailArgvs) => {
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

  mailTransporter.sendMail(details, (err) => {
    if (err) {
      console.error(`Failed to send mail, Subject: ${subject}`);
      console.log(err);
    } else {
      console.log(`mail send successfully, Subject: ${subject}`);
    }
  });
};
eventEmitter.on("sendmail", sendMail);

export default eventEmitter;
