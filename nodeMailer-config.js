import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport(
    {
      host:process.env.SMTP_HOST,
      port:process.env.SMTP_PORT,
      secure : true,
      auth : {
        user:process.env.MAIL,
        pass:process.env.MAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false
      },
    })

export default transporter;