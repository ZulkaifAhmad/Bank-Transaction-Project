import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

async function SendEmail(email, name, status) {
  try {
    let subject = "";
    let html = "";

    if (status === "register") {
      subject = "Registration Successful";
      html = `
        <div>
          <h1>Welcome to Bank Transactions</h1>
          <p>Dear ${name},</p>
          <p>Thank you for registering with us.</p>
        </div>
      `;
    }

    else if (status === "login") {
      subject = "New Login Alert";
      html = `
        <div>
          <h1>Login Notification</h1>
          <p>Hi ${name},</p>
          <p>You just logged into your account.</p>
          <p>If this was not you, please secure your account.</p>
        </div>
      `;
    }

    else {
      console.log("Invalid email status");
      return null;
    }

    const { data, error } = await resend.emails.send({
      from: "BankTransactions <onboarding@resend.dev>",
      to: email,
      subject,
      html,
    });

    if (error) {
      console.error("Email error:", error);
      return null;
    }

    return data;

  } catch (error) {
    console.error("Email exception:", error);
    return null;
  }
}

export { SendEmail };