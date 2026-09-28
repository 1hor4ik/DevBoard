/** Workspace information used by both desktop and mobile navigation. */
export type WorkspaceSummary = {
  id: string;
  name: string;
  slug: string;
  role: string;
};

export type WorkspaceNavigationProps = {
  workspaceSlug: string;
  workspaces: WorkspaceSummary[];
};
