import {
  Body,
  Button,
  Container,
  Font,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Tailwind,
  Text,
} from "@react-email/components";
import { emailTailwindConfig } from "./theme.ts";

type InviteMemberTemplateProps = {
  inviter: {
    name: string;
  }
  organization: {
    name: string;
  }
};

export function InviteMemberTemplate({
  inviter,
  organization,
}: InviteMemberTemplateProps) {
  return (
    <Tailwind config={emailTailwindConfig}>
      <Html>
        <Head>
          <Font
            fontFamily="Inter"
            fallbackFontFamily="Helvetica"
            webFont={{
              url: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2",
              format: "woff2",
            }}
            fontWeight={400}
            fontStyle="normal"
          />
        </Head>
        <Preview>
          {inviter.name} te convidou para {organization.name} no Mintly
        </Preview>
        <Body className="bg-muted py-10 font-sans">
          <Container className="mx-auto max-w-120 rounded-xl border border-solid border-border bg-background p-10">
            <Text className="inline-block rounded-lg bg-primary px-3 py-1.5 text-sm font-bold text-primary-foreground">
              Mintly
            </Text>

            <Heading className="mt-0 mb-3 text-[22px] leading-7 text-foreground">
              Você foi convidado(a) para {organization.name}
            </Heading>

            <Text className="mb-6 text-[15px] leading-6 text-muted-foreground">
              <strong>{inviter.name}</strong> te convidou para participar da
              organização <strong>{organization.name}</strong>
              no Mintly.
            </Text>

            <Hr className="my-8 border-border" />

            <Text className="m-0 text-xs text-muted-foreground">
              Este convite expira em 7 dias. Se você não esperava este
              e-mail, pode ignorá-lo com segurança.
            </Text>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
}

export default InviteMemberTemplate;
