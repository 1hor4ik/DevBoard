import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { Crown, Mail, Search, ShieldCheck, Users } from "lucide-react";
import Image from "next/image";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth-server";

import { SearchInput } from "@/components/ui/shared/search-input";

import SendInvitationDialog from "@/components/ui/invitation/send-invitation-dialog";

import CopyInviteLinkButton from "@/components/ui/invitation/copy-invite-link-button";
import CancelInvitationButton from "@/components/ui/invitation/cancel-invitation-button";

type MembersPageProps = {
  params: Promise<{
    workspaceSlug: string;
  }>;
  searchParams: Promise<{
    search?: string;
  }>;
};

export default async function MembersPage({
  params,
  searchParams,
}: MembersPageProps) {
  const { workspaceSlug } = await params;
  const { search } = await searchParams;

  const searchQuery = search?.trim() || "";

  const session = await getSession(await headers());

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const workspace = await prisma.workspace.findUnique({
    where: {
      slug: workspaceSlug,
    },
    include: {
      members: {
        where: {
          userId: session.user.id,
        },
      },
    },
  });

  if (!workspace) {
    notFound();
  }

  const currentMember = workspace.members[0];

  if (!currentMember) {
    notFound();
  }

  const allMembers = await prisma.workspaceMember.findMany({
    where: {
      workspaceId: workspace.id,
    },
    select: {
      role: true,
    },
  });

  const members = await prisma.workspaceMember.findMany({
    where: {
      workspaceId: workspace.id,
      user: searchQuery
        ? {
            OR: [
              {
                name: {
                  contains: searchQuery,
                  mode: "insensitive",
                },
              },
              {
                email: {
                  contains: searchQuery,
                  mode: "insensitive",
                },
              },
            ],
          }
        : undefined,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
    orderBy: [
      {
        role: "asc",
      },
      {
        createdAt: "asc",
      },
    ],
  });

  const totalMembersCount = allMembers.length;

  const ownersCount = allMembers.filter(
    (member) => member.role === "OWNER",
  ).length;

  const adminsCount = allMembers.filter(
    (member) => member.role === "ADMIN",
  ).length;

  const regularMembersCount = allMembers.filter(
    (member) => member.role === "MEMBER",
  ).length;

  const invitations = await prisma.workspaceInvitation.findMany({
    where: {
      workspaceId: workspace.id,
      status: "PENDING",
    },
    include: {
      invitedBy: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-4 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm md:flex-row md:items-center">
        <div>
          <p className="mb-2 inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">
            Members
          </p>

          <h2 className="text-3xl font-bold tracking-tight text-slate-950">
            Workspace members
          </h2>

          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
            Manage people in this workspace, check roles, and invite new members
            to collaborate on projects and tasks.
          </p>
        </div>

        <SendInvitationDialog workspaceSlug={workspace.slug} />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MemberStatCard
          title="Total members"
          value={totalMembersCount}
          description="People in workspace"
          icon={Users}
        />

        <MemberStatCard
          title="Owners"
          value={ownersCount}
          description="Workspace owners"
          icon={Crown}
        />

        <MemberStatCard
          title="Admins"
          value={adminsCount}
          description="Can manage workspace"
          icon={ShieldCheck}
        />

        <MemberStatCard
          title="Members"
          value={regularMembersCount}
          description="Regular teammates"
          icon={Users}
        />
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h3 className="text-lg font-semibold text-slate-950">
              Members list
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Search members by name or email.
            </p>
          </div>

          <SearchInput placeholder="Search members..." />
        </div>

        {members.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white/70 p-8 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <Search className="h-6 w-6" />
            </div>

            <h3 className="text-lg font-semibold text-slate-950">
              No members found
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              Try searching by another name or email address.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {members.map((member) => {
              const displayName = member.user.name || member.user.email;
              const initials = getInitials(displayName);
              const isCurrentUser = member.user.id === session.user.id;

              return (
                <div
                  key={member.id}
                  className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-amber-200 hover:shadow-sm md:flex-row md:items-center"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {member.user.image ? (
                      <Image
                        src={member.user.image}
                        alt={displayName}
                        width={44}
                        height={44}
                        className="h-11 w-11 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-semibold text-amber-700">
                        {initials}
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-semibold text-slate-950">
                          {displayName}
                        </p>

                        {isCurrentUser && (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                            You
                          </span>
                        )}
                      </div>

                      <div className="mt-1 flex min-w-0 items-center gap-1.5 text-sm text-slate-500">
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{member.user.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 md:justify-end">
                    <span className={getRoleClassName(member.role)}>
                      {formatRole(member.role)}
                    </span>

                    <span className="text-xs text-slate-400">
                      Joined {formatDate(member.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {invitations.length > 0 && (
        <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-950">
                Pending invitations
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Invitations that haven&apos;t been accepted yet.
              </p>
            </div>

            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
              {invitations.length}
            </span>
          </div>

          <div className="space-y-3">
            {invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-amber-200 hover:shadow-sm md:flex-row md:items-center"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-950">
                      {invitation.email}
                    </p>

                    <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-[11px] font-medium text-yellow-700">
                      Pending
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-500">
                    <span>
                      Role:{" "}
                      <span className="font-medium text-slate-700">
                        {formatRole(invitation.role)}
                      </span>
                    </span>

                    <span>
                      Invited by{" "}
                      <span className="font-medium text-slate-700">
                        {invitation.invitedBy.name}
                      </span>
                    </span>
                  </div>

                  <div className="mt-2 text-xs text-slate-400">
                    Sent {formatDate(invitation.createdAt)} • Expires{" "}
                    {formatDate(invitation.expiresAt)}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <CopyInviteLinkButton token={invitation.token} />

                  <CancelInvitationButton invitationId={invitation.id} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function MemberStatCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: number;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
        <Icon className="h-5 w-5" />
      </div>

      <p className="text-sm font-medium text-slate-500">{title}</p>

      <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
        {value}
      </p>

      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );
}

function getRoleClassName(role: "OWNER" | "ADMIN" | "MEMBER") {
  const base = "rounded-full px-2.5 py-1 text-xs font-semibold";

  if (role === "OWNER") {
    return `${base} bg-amber-100 text-amber-800`;
  }

  if (role === "ADMIN") {
    return `${base} bg-blue-50 text-blue-700`;
  }

  return `${base} bg-slate-100 text-slate-600`;
}

function formatRole(role: "OWNER" | "ADMIN" | "MEMBER") {
  if (role === "OWNER") return "Owner";
  if (role === "ADMIN") return "Admin";
  return "Member";
}

function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function getInitials(value: string) {
  return value
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
