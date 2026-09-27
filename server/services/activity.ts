import "server-only";
import type {
  Prisma,
  ActivityType,
  NotificationType,
} from "@/generated/prisma/client";

type EventContext = {
  workspaceId: string;
  actorId: string;
  projectId?: string;
  taskId?: string;
};

export function createActivity(
  db: Prisma.TransactionClient,
  data: EventContext & {
    type: ActivityType;
    message: string;
  },
) {
  return db.activity.create({ data });
}

export async function createNotifications(
  db: Prisma.TransactionClient,
  {
    userIds,
    ...data
  }: EventContext & {
    userIds: (string | null | undefined)[];
    type: NotificationType;
    message: string;
    invitationId?: string;
  },
) {
  const recipients = [
    ...new Set(
      userIds.filter((id): id is string => !!id && id !== data.actorId),
    ),
  ];
  if (!recipients.length) return;
  const members =
    data.type === "INVITATION"
      ? recipients
      : (
          await db.workspaceMember.findMany({
            where: {
              workspaceId: data.workspaceId,
              userId: { in: recipients },
            },
            select: { userId: true },
          })
        ).map((member) => member.userId);
  if (!members.length) return;
  await db.notification.createMany({
    data: members.map((userId) => ({ ...data, userId })),
  });
}
