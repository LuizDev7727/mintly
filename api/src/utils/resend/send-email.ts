import { resend } from "@/lib/resend.ts"
import { ReactNode } from "react"

type SendEmailProps = {
  to: string
  subject: string
  template?: ReactNode
}

export async function sendEmail(props: SendEmailProps) {

  const { to, subject, template } = props

  await resend.emails.send({
    from: "Acme <onboarding@example.com>",
    to: to,
    react: template,
    subject: subject,
  })
}
