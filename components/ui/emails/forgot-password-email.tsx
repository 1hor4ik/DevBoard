import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Tailwind,
  Hr,
} from "@react-email/components";

type ForgotPasswordEmailProps = {
  userEmail: string;
  resetUrl: string;
};

export default function ForgotPasswordEmail({
  userEmail,
  resetUrl,
}: ForgotPasswordEmailProps) {
  return (
    <Html lang="en" dir="ltr">
      <Tailwind>
        <Head />
        <Preview>Reset your DevBoard password</Preview>

        <Body className="bg-[#FAF8F3] font-sans py-10">
          <Container className="mx-auto max-w-[560px] px-5">
            <Section className="mb-6 text-center">
              <Text className="m-0 text-xl font-bold text-[#020617]">
                DevBoard
              </Text>
            </Section>

            <Section className="rounded-[24px] border border-[#E6E8EB] bg-white px-8 py-10">
              <Section className="mb-8 text-center">
                <Text className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[16px] bg-[#FFF7D6] text-center text-2xl">
                  🔐
                </Text>

                <Heading className="m-0 text-center text-[28px] font-bold leading-9 text-[#020617]">
                  Reset your password
                </Heading>

                <Text className="mx-auto mt-3 max-w-[420px] text-center text-[14px] leading-6 text-[#64748B]">
                  We received a request to reset the password for your DevBoard
                  account.
                </Text>
              </Section>

              <Section className="rounded-[16px] bg-[#FAF8F3] px-5 py-4">
                <Text className="m-0 text-[13px] leading-5 text-[#64748B]">
                  Account email
                </Text>

                <Text className="m-0 mt-1 text-[14px] font-semibold text-[#020617]">
                  {userEmail}
                </Text>
              </Section>

              <Text className="mt-7 text-[15px] leading-7 text-[#64748B]">
                Click the button below to choose a new password. If you did not
                request this, you can safely ignore this email.
              </Text>

              <Section className="my-8 text-center">
                <Button
                  href={resetUrl}
                  className="box-border rounded-[14px] bg-[#F5B400] px-6 py-3 text-[14px] font-semibold text-[#020617] no-underline"
                >
                  Reset password
                </Button>
              </Section>

              <Text className="text-[13px] leading-6 text-[#64748B]">
                For security reasons, this link may expire after a limited time.
                Never share your password or reset link with anyone.
              </Text>

              <Hr className="my-7 border-[#E6E8EB]" />

              <Text className="m-0 text-[12px] leading-5 text-[#94A3B8]">
                If the button does not work, copy and paste this link into your
                browser:
              </Text>

              <Text className="break-all text-[12px] leading-5 text-[#64748B]">
                {resetUrl}
              </Text>
            </Section>

            <Text className="mt-6 text-center text-[12px] text-[#94A3B8]">
              © DevBoard. Project management for small developer teams.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
