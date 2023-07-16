import { createTransport } from 'nodemailer';
import env from '../env';

const transporter = createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  auth: {
    user: 'harrygothold@hotmail.com',
    pass: env.SMTP_PASSWORD,
  },
});

export const sendVerificationCode = async (
  toEmail: string,
  verificationCode: string
) => {
  await transporter.sendMail({
    from: 'noreply@flowblog.com',
    to: toEmail,
    subject: 'Your verification code',
    html: `<p>This is your verification code. It will expire in 10 minutes.</p> <strong>${verificationCode}</strong>`,
  });
};
