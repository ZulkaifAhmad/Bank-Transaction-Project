
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
    } else if (status === "login") {
      subject = "New Login Alert";
      html = `
        <div>
          <h1>Login Notification</h1>
          <p>Hi ${name},</p>
          <p>You just logged into your account.</p>
          <p>If this was not you, please secure your account.</p>
        </div>
      `;
    } else {
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

async function SendTransactionEmail(
  email,
  name,
  amount,
  type,
  toAccountId,
  reason = "",
) {
  try {
    let subject = "";
    let html = "";

    if (type === "success") {
      subject = "Transaction Successful";

      html = `
        <div>
          <h1>Transaction Successful</h1>
          <p>Dear ${name},</p>

          <p>Your transaction has been completed successfully.</p>

          <h3>Details:</h3>
          <ul>
            <li>Amount: ${amount}</li>
            <li>To Account: ${toAccountId}</li>
            <li>Status: SUCCESS</li>
          </ul>

          <p>Thank you for using our banking system.</p>
        </div>
      `;
    } else if (type === "failed") {
      subject = "Transaction Failed";

      html = `
        <div>
          <h1>Transaction Failed </h1>
          <p>Dear ${name},</p>

          <p>Your transaction could not be completed.</p>

          <h3>Details:</h3>
          <ul>
            <li>Amount: ${amount}</li>
            <li>Status: FAILED</li>
            <li>Reason: ${reason || "Unknown"}</li>
          </ul>

          <p>Please try again later or check your balance.</p>
        </div>
      `;
    } else {
      console.log("Invalid transaction email type");
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

export { SendEmail, SendTransactionEmail };
