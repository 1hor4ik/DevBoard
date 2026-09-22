import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

type InviteWorkspaceEmailProps = {
  inviterName: string;
  workspaceName: string;
  role: string;
  inviteUrl: string;
};

export default function InviteWorkspaceEmail({
  inviterName,
  workspaceName,
  role,
  inviteUrl,
}: InviteWorkspaceEmailProps) {
  return (
    <Html>
      <Tailwind>
        <Head />

        <Preview>You&#39;re invited to join {workspaceName}</Preview>

        <Body className="bg-slate-950 py-10 font-sans">
          <Container className="mx-auto max-w-xl rounded-3xl bg-slate-900 p-10">
            <Heading className="mb-8 text-center text-3xl font-bold text-white">
              You&#39;re invited 🎉
            </Heading>

            <Text className="text-base leading-7 text-slate-300">
              <strong>{inviterName}</strong> invited you to join the workspace
              below.
            </Text>

            <Section className="my-8 rounded-2xl bg-slate-800 p-6">
              <Text className="mb-1 text-sm text-slate-400">Workspace</Text>

              <Text className="mb-5 text-xl font-semibold text-white">
                {workspaceName}
              </Text>

              <Text className="mb-1 text-sm text-slate-400">Role</Text>

              <Text className="text-lg font-semibold text-amber-400">
                {role}
              </Text>
            </Section>

            <Section className="text-center">
              <Button
                href={inviteUrl}
                className="rounded-xl bg-amber-400 px-8 py-4 font-semibold text-slate-950 no-underline"
              >
                Join workspace
              </Button>
            </Section>

            <Text className="mt-10 text-center text-sm text-slate-400">
              This invitation expires in 7 days.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
