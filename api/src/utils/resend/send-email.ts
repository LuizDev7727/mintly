import type { ReactNode } from "react";
import { resend } from "@/lib/resend.ts";

type SendEmailProps = {
  to: string;
  subject: string;
  template?: ReactNode;
};

export async function sendEmail(props: SendEmailProps) {
  const { to, subject, template } = props;

  await resend.emails.send({
    from: "Acme <onboarding@example.com>",
    to: to,
    react: template,
    subject: subject,
  });
}
