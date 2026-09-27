const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

function load(file, dependencies = {}) {
  const exports = {};
  const code = ts.transpileModule(
    fs.readFileSync(path.join(__dirname, "..", file), "utf8"),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        esModuleInterop: true,
      },
    },
  ).outputText;
  vm.runInNewContext(code, {
    exports,
    console,
    require: (name) => {
      if (name === "server-only") return {};
      if (name in dependencies) return dependencies[name];
      throw new Error(`Unexpected dependency: ${name}`);
    },
  });
  return exports;
}
const service = load("server/services/activity.ts");

test("notifications deduplicate recipients, exclude actor and former members", async () => {
  let written;
  const db = {
    workspaceMember: { findMany: async () => [{ userId: "member" }] },
    notification: {
      createMany: async (args) => {
        written = args.data;
      },
    },
  };
  await service.createNotifications(db, {
    workspaceId: "w",
    actorId: "actor",
    type: "COMMENT",
    message: "Comment",
    userIds: ["actor", "member", "member", "former", null],
  });
  assert.equal(written.length, 1);
  assert.equal(written[0].userId, "member");
});

test("self-only notifications do not write to the database", async () => {
  await service.createNotifications(
    {},
    {
      workspaceId: "w",
      actorId: "actor",
      type: "TASK_ASSIGNED",
      message: "Assigned",
      userIds: ["actor", null],
    },
  );
});

test("invitations can notify an account before workspace membership exists", async () => {
  let written;
  await service.createNotifications(
    {
      notification: {
        createMany: async (args) => {
          written = args.data;
        },
      },
    },
    {
      workspaceId: "w",
      actorId: "actor",
      type: "INVITATION",
      message: "Invite",
      invitationId: "invite",
      userIds: ["guest", "guest"],
    },
  );
  assert.equal(written.length, 1);
  assert.equal(written[0].invitationId, "invite");
});

test("read actions scope updates to authenticated recipient and workspace access", async () => {
  let where;
  const actions = load("server/actions/notification-actions.ts", {
    "next/headers": { headers: async () => ({}) },
    "@/lib/auth-server": {
      getSession: async () => ({
        user: { id: "me", email: "me@example.test" },
      }),
    },
    "@/lib/prisma": {
      workspaceInvitation: { findMany: async () => [] },
      notification: {
        updateMany: async (args) => {
          where = args.where;
        },
      },
    },
  });
  await actions.markNotificationRead("someone-elses-notification");
  assert.equal(where.userId, "me");
  assert.equal(where.id, "someone-elses-notification");
  assert.equal(where.OR[0].workspace.members.some.userId, "me");
  await actions.markAllNotificationsRead();
  assert.equal(where.userId, "me");
  assert.equal(where.isRead, false);
});

test("unauthenticated notification access fails before querying the database", async () => {
  const actions = load("server/actions/notification-actions.ts", {
    "next/headers": { headers: async () => ({}) },
    "@/lib/auth-server": { getSession: async () => null },
    "@/lib/prisma": {},
  });
  await assert.rejects(actions.getNotifications(), /Unauthorized/);
});
