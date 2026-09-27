# DevBoard

An educational full-stack project management app for developer teams. Organize workspaces, plan tasks on a Kanban board, discuss work with teammates, and follow what changed through an activity feed and personal notifications.

Built to practice the complete path from a database model and authenticated server action to an interactive, responsive interface.

## Features

### Accounts and workspaces

- Email/password authentication and password reset emails.
- Google and GitHub sign-in integrations.
- Workspace creation, switching, and settings.
- Owner, admin, and member roles, with permission checks in server actions.
- Email invitations, acceptance, and cancellation.

### Projects and tasks

- Projects with descriptions and due dates.
- Drag-and-drop Kanban columns: **Todo**, **In progress**, **Review**, and **Done**.
- Task creation, editing, deletion, priorities, assignees, and due dates.
- **My Tasks** view for assignments across projects in the current workspace.
- Dashboard statistics and recent projects.

### Collaboration

- Socket.IO updates for task creation, editing, status changes, and deletion.
- Task comments with emoji support and live delivery to other participants.
- Typing indicators with participant names, support for simultaneous typists, and automatic expiry.
- Project rooms for board events and task rooms for discussions.

### Activity and notifications

- Workspace history for task creation, edits, moves, deletion, comments, and new members.
- Recent activity on Overview and a paginated Activity page.
- Personal notifications for task assignment, comments, and invitations to existing accounts.
- Unread count, individual read controls, and **Mark all as read**.
- Recipient deduplication and suppression of notifications about your own actions.
- Activity and notification writes inside the corresponding database transaction.

Notifications refresh when opened, when the window regains focus, and every 15 seconds while the document is visible. They currently use polling rather than Socket.IO. Comment notifications target the task creator and assignee, excluding the commenter.

### Interface

- Responsive dashboard with a desktop sidebar and mobile navigation drawer.
- Active navigation states, workspace switching, and smooth drawer animations.
- Amber accents, loading states, toast feedback, and reduced-motion support for drawer animations.

## Tech stack

| Area | Technologies |
| --- | --- |
| Application | Next.js 16 App Router, React 19, TypeScript |
| Styling and UI | Tailwind CSS 4, Radix UI, shadcn-style components, Lucide icons |
| Database | PostgreSQL, Prisma 7, PostgreSQL driver adapter |
| Authentication | Better Auth |
| Forms | React Hook Form, Zod |
| Drag and drop | dnd-kit |
| Realtime server | Express, Socket.IO, tsx |
| Email | Resend, React Email |
| Feedback | Sonner, react-spinners |

## How it works

The Next.js application handles authentication, database queries, and mutations through server actions. PostgreSQL stores the application data; Prisma provides the schema, migrations, and generated client.

For board updates and comments, the client first awaits a successful server action, then emits a Socket.IO event. A separate server on port `3001` relays that event to the relevant room. Activity and notifications are persisted by the authenticated server actions, independently of socket delivery.

```text
Browser → Next.js server action → Prisma → PostgreSQL
   │
   └─ after successful save → Socket.IO server → other connected clients
```

## Run locally

### 1. Prerequisites

- Node.js 22 LTS or 24 LTS and npm.
- A PostgreSQL database; a local instance or hosted database can be used.
- A Resend API key and a verified sender for email features.
- Google/GitHub OAuth credentials if using social sign-in.

### 2. Install dependencies

```bash
git clone https://github.com/1hor4ik/DevBoard.git
cd DevBoard
npm ci
npm --prefix socket-server ci
```

### 3. Configure the environment

Create a `.env` file in the project root. The values below are placeholders, not usable credentials:

```dotenv
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE"
BETTER_AUTH_URL="http://localhost:3000"
BETTER_AUTH_SECRET="REPLACE_WITH_A_RANDOM_SECRET"
RESEND_API_KEY="REPLACE_WITH_YOUR_RESEND_API_KEY"
GOOGLE_CLIENT_ID="REPLACE_WITH_YOUR_GOOGLE_CLIENT_ID"
GOOGLE_CLIENT_SECRET="REPLACE_WITH_YOUR_GOOGLE_CLIENT_SECRET"
GITHUB_CLIENT_ID="REPLACE_WITH_YOUR_GITHUB_CLIENT_ID"
GITHUB_CLIENT_SECRET="REPLACE_WITH_YOUR_GITHUB_CLIENT_SECRET"
```

Generate an authentication secret with:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

The current auth configuration enables both OAuth providers. Configure them for social login or remove unused providers from `lib/auth.ts`. Local callback URLs are:

- Google: `http://localhost:3000/api/auth/callback/google`
- GitHub: `http://localhost:3000/api/auth/callback/github`

The email sender is currently configured in `lib/auth.ts` and `server/actions/invitation-actions.ts`. Replace `DevBoard <noreply@students.codes>` with a sender verified in your own Resend account. Never commit `.env` or real credentials.

### 4. Prepare the database

```bash
npx prisma migrate deploy
npx prisma generate
```

This applies the committed migrations and generates the client in `generated/prisma`. Use a database intended for this project. There is no seed script: create an account and workspace through the interface.

### 5. Start both servers

In the first terminal:

```bash
npm run dev
```

In a second terminal, from the project root:

```bash
npm --prefix socket-server run dev
```

Open [localhost:3000](http://localhost:3000). The socket client and server currently use `http://localhost:3001` and allow the app origin `http://localhost:3000`. Update `lib/socket-client/socket.ts` and `socket-server/server.ts` when changing these addresses.

To explore collaboration, open the same project in two separate browser sessions signed into different accounts in the same workspace.

## Project structure

```text
app/
  (auth)/                      Sign-in, sign-up, and password recovery
  api/auth/                    Better Auth route handler
  dashboard/[workspaceSlug]/   Overview, projects, tasks, members, activity, settings
  invite/                      Invitation acceptance
components/ui/
  dashboard/                   Navigation, notifications, activity, workspace UI
  tasks/                       Board, task dialogs, comments, typing indicators
  emails/                      Email templates
lib/                           Authentication, Prisma, validation, socket client
prisma/                        Database schema and migrations
generated/prisma/              Generated Prisma client
server/actions/                Authenticated mutations and notification queries
server/services/               Internal activity/notification helpers
socket-server/                 Separate Express and Socket.IO application
tests/                         Activity and notification regression tests
```

## Checks

Run the focused regression tests without connecting to a database:

```bash
node --test tests/activity-notifications.test.cjs
```

These cover recipient deduplication, exclusion of the actor and former members, invitation recipients, notification ownership, and unauthenticated access.

Other development commands:

```bash
npm run lint
npx tsc --noEmit
npm run build
npm start
```

`npm start` serves a previously built Next.js app; it does not start the separate socket server. At the time of this update, type checking still reports existing password-input prop mismatches in the sign-in and reset-password forms. A clean production build is not yet claimed.

## Learning goals and current limitations

This is a learning and portfolio project, not a production-ready service. It explores relational modeling, authentication, server-side authorization, transactions, realtime events, responsive UI, and regression testing.

- Socket room joins and relayed event payloads still need authenticated identity and workspace authorization on the socket server before production use. Room membership alone is not an authorization boundary.
- Notifications use polling; durable realtime delivery and reconnect recovery are future improvements.
- Activity records begin with actions performed after the feature was added; older actions are not backfilled.
- Notifications show the latest 30 accessible updates. Task notifications currently navigate to the project board rather than opening a specific task dialog.
- Email delivery and database changes are separate operations; an outbox/retry mechanism would improve reliability.
- Production deployment needs configurable socket URLs, appropriate CORS, and a separately hosted long-running socket service.

The next improvements can focus on these foundations, broader end-to-end tests, and resolving the remaining type-checking issues.
