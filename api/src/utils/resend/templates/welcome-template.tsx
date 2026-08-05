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

type WelcomeTemplateProps = {
  name: string;
};

export function WelcomeTemplate({ name }: WelcomeTemplateProps) {
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
        <Preview>Bem-vindo(a) ao Mintly, {name}!</Preview>
        <Body className="bg-muted py-10 font-sans">
          <Container className="mx-auto max-w-120 rounded-xl border border-solid border-border bg-background p-10">
            <Text className="inline-block rounded-lg bg-primary px-3 py-1.5 text-sm font-bold text-primary-foreground">
              Mintly
            </Text>

            <Heading className="mt-0 mb-3 text-[22px] leading-7 text-foreground">
              Bem-vindo(a), {name}!
            </Heading>

            <Text className="mb-6 text-[15px] leading-6 text-muted-foreground">
              Sua conta foi criada com sucesso. Agora você pode organizar seus
              canais, convidar sua equipe e começar a publicar direto do
              Mintly.
            </Text>

            <Button
              className="inline-block rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground no-underline"
            >
              Acessar o Mintly
            </Button>

            <Hr className="my-8 border-border" />

            <Text className="m-0 text-xs text-muted-foreground">
              Se você não criou essa conta, pode ignorar este e-mail com
              segurança.
            </Text>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
}

export default WelcomeTemplate;
