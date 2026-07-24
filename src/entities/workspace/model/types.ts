export interface Workspace {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

export type CreateWorkspaceInput = {
  name: string
}

export type UpdateWorkspaceInput = {
  name?: string
}
