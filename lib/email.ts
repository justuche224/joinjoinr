export async function sendEmail({
  to,
  subject,
  text,
}: {
    to: string;
    subject: string;
    text: string;
}) {
    console.log("Email sent to:", to);
    console.log("Subject:", subject);
    console.log("Text:", text);
}


export async function sendWelcomeEmail(email: string) {
    const subject = "Welcome to Our Platform!";
    const text = `Hi ${email},

    Welcome to our platform! We're excited to have you on board.

    Best regards,
    The Team`;

    await sendEmail({ to: email, subject, text });
}

export async function sendResetPasswordEmail(email: string, url: string) {
  await sendEmail({
    to: email,
    subject: "Reset your password",
    text: `Click the link to reset your password: ${url}`,
  });
}

export async function sendVerificationEmail(email: string, url: string) {
  await sendEmail({
    to: email,
    subject: "Verify your email address",
    text: `Click the link to verify your email: ${url}`,
  });
}