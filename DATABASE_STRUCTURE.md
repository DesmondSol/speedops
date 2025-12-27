# speedOps Multi-User Database Schema

The database has migrated to an **Operational Cluster (Workspace)** model. Data is stored centrally in clusters, accessible by multiple authorized operators.

## Hierarchical Root
All operational units reside at: `/workspaces/{workspaceId}/[collection_name]`

## Membership Map
- `users/{userId}`: Stores metadata and `activeWorkspaceId`.
- `workspaces/{workspaceId}`: Contains `members` (array of UIDs) and `inviteCode`.

## Core Collections Map (Under Workspace Root)

### 1. `fana_projects`
Mission containers for the entire cluster.
```json
{
  "name": "string",
  "client": "string",
  "status": "string",
  "progress": "number",
  "members": ["uid1", "uid2"]
}
```

### 2. `fana_tasks`, `fana_members`, `fana_milestones`
All operational logs and personnel records are now synced to the cluster ID rather than individual user IDs.

## Global Registry
- `invites/`: (Optional) Can be used for link-based invites, currently handled via `inviteCode` lookup on the `workspaces` collection.
