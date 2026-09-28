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

| Area            | Technologies                                                    |
| --------------- | --------------------------------------------------------------- |
| Application     | Next.js 16 App Router, React 19, TypeScript                     |
| Styling and UI  | Tailwind CSS 4, Radix UI, shadcn-style components, Lucide icons |
| Database        | PostgreSQL, Prisma 7, PostgreSQL driver adapter, Neon.db        |
| Authentication  | Better Auth                                                     |
| Forms           | React Hook Form, Zod                                            |
| Drag and drop   | dnd-kit                                                         |
| Realtime server | Express, Socket.IO, tsx                                         |
| Email           | Resend, React Email                                             |
| Feedback        | Sonner, react-spinners                                          |

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
app/                           Routes, layouts, loading states, page-specific components
components/
  ui/                          Low-level UI primitives (shadcn/Radix, inputs, buttons)
  auth/                        Sign-in and sign-up presentation
  onboarding/                  Onboarding layout
  dashboard/                   Navigation, activity, notifications, workspace switcher
  tasks/                       Kanban board, task dialogs, comments
  projects/                    Project creation
  invitations/                 Invitation controls
  emails/                      React Email templates
  shared/                      Reusable application inputs (search, password)
  skeletons/                   Loading placeholders for application screens
  landing/                     Homepage, demo board, FAQ, scroll animations, scoped CSS
hooks/                         Reusable React hooks, including use-task-typing
types/                        Shared task, workspace, and socket payload types
lib/
  constants/                   Shared task status and priority options
  validations/                 Zod schemas and their inferred form types
  socket-client/               Shared Socket.IO client
  ...                          Authentication, Prisma connection, utility functions
prisma/                        Schema and versioned database migrations
generated/prisma/             Generated Prisma client; do not edit manually
server/
  actions/                     Authenticated server actions and queries
  services/                    Internal transactional activity/notification helpers
socket-server/                 Separate Express and Socket.IO application
```

### Where new code belongs

- Keep `components/ui` generic: a button or dialog should not know about tasks or workspaces. Application components belong in the matching folder alongside `ui`.
- Put reusable stateful React logic in `hooks`. Components import `useTaskTyping` from `@/hooks/use-task-typing`.
- Put types used across files in `types`. Task statuses and priorities come from Prisma enum types rather than duplicated string unions. Keep component-specific props beside the component and form types beside their Zod schema.
- Keep shared display options in `lib/constants`; keep database operations on the server. Do not import server implementation code into client components except for Next.js server actions.
- Use kebab-case filenames, PascalCase component names, `@/` imports across folders, and short relative imports for neighboring components.
- Keep route-specific components next to their route when they are not shared. There is no need for extra repository, controller, or barrel-file layers.
- `work/activity` was temporary migration scratch space, not part of the application. It has been removed; the real migration remains under `prisma/migrations`.

## Landing page

The homepage includes an interactive example board, feature illustrations, FAQ, and section reveal animations. The demo runs locally in component state and never writes to your database. Anchor navigation scrolls smoothly; reduced-motion preferences disable decorative motion.

## Development checks

```bash
npx tsc --noEmit
npm run lint
npm run build
```

There is currently no committed automated test suite or seed script. For a manual smoke test, sign in with two accounts in the same workspace, then create/edit/move/delete a task, exchange comments, check typing indicators, and verify the activity feed and notifications. Also check mobile navigation and the landing-page links.

`npm start` serves the built Next.js application. Run the Socket.IO service separately.
