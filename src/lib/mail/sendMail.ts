type SendMailArgs = {
  to: string;
  subject: string;
  html: string;
  text: string;
  fromName?: string;
  replyToEmail?: string;
  replyToName?: string;
};

const REPLY_TO_EMAIL = "thomas.weikop@gmail.com";
const REPLY_TO_NAME = "Thomas Weikop";
const DEFAULT_FROM_NAME = "Weikop";

type SendMailResult = {
  sent: boolean;
  provider?: "mailersend" | "resend";
  providerMessageId?: string | null;
  reason?: string;
};

function maskEmail(email: string) {
  const [localPart = "", domain = ""] = email.split("@");
  const maskedLocal =
    localPart.length <= 2 ? `${localPart.charAt(0)}*` : `${localPart.slice(0, 2)}***`;
  const maskedDomain =
    domain.length <= 4 ? `${domain.charAt(0)}***` : `${domain.slice(0, 2)}***`;
  return `${maskedLocal}@${maskedDomain}`;
}

async function sendViaMailerSend(args: SendMailArgs): Promise<SendMailResult> {
  const token = process.env.MAILERSEND_API_TOKEN;
  const fromEmail = process.env.MAILERSEND_FROM_EMAIL || process.env.INVITE_FROM_EMAIL;
  const fromName = args.fromName?.trim() || DEFAULT_FROM_NAME;

  if (!token || !fromEmail) {
    return { sent: false, reason: "missing_mailersend_config" };
  }

  const replyToEmail = args.replyToEmail?.trim() || REPLY_TO_EMAIL;
  const replyToName = args.replyToName?.trim() || REPLY_TO_NAME;

  const response = await fetch("https://api.mailersend.com/v1/email", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: { email: fromEmail, name: fromName },
      to: [{ email: args.to }],
      reply_to: { email: replyToEmail, name: replyToName },
      subject: args.subject,
      text: args.text,
      html: args.html,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    return { sent: false, reason: `mailersend_${response.status}:${body}` };
  }

  return {
    sent: true,
    provider: "mailersend",
    providerMessageId: response.headers.get("x-message-id"),
  };
}

async function sendViaResend(args: SendMailArgs): Promise<SendMailResult> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.INVITE_FROM_EMAIL;

  if (!key || !from) {
    return { sent: false, reason: "missing_resend_config" };
  }

  const fromName = args.fromName?.trim();
  const replyToEmail = args.replyToEmail?.trim() || REPLY_TO_EMAIL;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromName ? `${fromName} <${from}>` : from,
      to: [args.to],
      reply_to: replyToEmail,
      subject: args.subject,
      html: args.html,
      text: args.text,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    return { sent: false, reason: `resend_${response.status}:${body}` };
  }

  const payload = (await response.json()) as { id?: string };

  return {
    sent: true,
    provider: "resend",
    providerMessageId: payload.id ?? null,
  };
}

export async function sendMail(args: SendMailArgs): Promise<SendMailResult> {
  const mailerSendResult = await sendViaMailerSend(args);
  if (mailerSendResult.sent) {
    console.info("Mail sent", {
      provider: mailerSendResult.provider,
      providerMessageId: mailerSendResult.providerMessageId ?? null,
      to: maskEmail(args.to),
      subject: args.subject,
    });
    return mailerSendResult;
  }

  const resendResult = await sendViaResend(args);
  if (resendResult.sent) {
    console.info("Mail sent", {
      provider: resendResult.provider,
      providerMessageId: resendResult.providerMessageId ?? null,
      to: maskEmail(args.to),
      subject: args.subject,
    });
    return resendResult;
  }

  console.error("Mail send failed", {
    to: maskEmail(args.to),
    subject: args.subject,
    mailersendReason: mailerSendResult.reason,
    resendReason: resendResult.reason,
  });

  return {
    sent: false,
    reason:
      [mailerSendResult.reason, resendResult.reason].filter(Boolean).join(" | ") ||
      "no_provider_available",
  };
}
