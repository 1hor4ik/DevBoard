import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth-server";

import { Button } from "@/components/ui/button";
import { acceptInvitation } from "@/server/actions/invitation-actions";

type InvitePageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params;

  const invitation = await prisma.workspaceInvitation.findUnique({
    where: {
      token,
    },
    include: {
      workspace: true,
      invitedBy: true,
    },
  });

  if (!invitation) {
    notFound();
  }

  if (invitation.status !== "PENDING") {
    return (
      <CenteredCard
        title="Invitation already used"
        description="This invitation has already been accepted or rejected."
      />
    );
  }

  if (invitation.expiresAt < new Date()) {
    return (
      <CenteredCard
        title="Invitation expired"
        description="Ask the workspace owner to send you a new invitation."
      />
    );
  }

  const session = await getSession(await headers());

  if (!session) {
    redirect(`/sign-in?callbackUrl=/invite/${token}`);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="mb-2 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
          Workspace Invitation
        </p>

        <h1 className="mt-4 text-3xl font-bold">
          Join {invitation.workspace.name}
        </h1>

        <p className="mt-4 text-slate-500 leading-7">
          <strong>{invitation.invitedBy.name}</strong> invited you to join this
          workspace as <strong>{invitation.role}</strong>.
        </p>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm text-slate-500">Invitation for</p>

          <p className="font-semibold">{invitation.email}</p>
        </div>

        <form
          action={async () => {
            "use server";

            const result = await acceptInvitation(token);

            redirect(`/dashboard/${result.workspaceSlug}?toast=joined`);
          }}
        >
          <Button
            type="submit"
            className="mt-8 w-full h-11 bg-amber-400 text-slate-950 hover:bg-amber-500 cursor-pointer"
          >
            Accept invitation
          </Button>
        </form>
      </div>
    </div>
  );
}

function CenteredCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold">{title}</h1>

        <p className="mt-4 text-slate-500">{description}</p>
      </div>
    </div>
  );
}
