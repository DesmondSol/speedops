# Firestore User-Isolated Database Schema

The speedOps database is structured to ensure complete data sovereignty. All operational data is nested under the authenticated user's unique identifier.

## Primary Pathing
All collections reside at: `/users/{userId}/[collection_name]`

## Collections Map

### 1. `/users/{userId}/fana_projects`
Main containers for all work units owned by the user.
```json
{
  "name": "string",
  "client": "string",
  "clientId": "string (foreign_key)",
  "status": "Active | Planning | On Hold | Completed",
  "stage": "Dev | Test | QA | Review | Client",
  "progress": "number (0-100)",
  "lead": "string (member_name)",
  "dealOwner": "string (member_name)",
  "description": "string",
  "brief": "string (Markdown)",
  "objectives": ["string"],
  "teamAssignments": [
    { "memberId": "string", "roles": ["string"] }
  ],
  "features": [
    { "featureName": "string", "tasks": ["object"] }
  ]
}
```

### 2. `/users/{userId}/fana_tasks`
The core operational units for the user's projects.
```json
{
  "projectId": "string (foreign_key)",
  "name": "string",
  "description": "string",
  "assigneeId": "string (foreign_key)",
  "status": "Backlog | In Progress | Testing | QA | Review | Completed",
  "featureOrigin": "string",
  "acceptanceCriteria": ["string"],
  "timeInStage": "string",
  "proofs": [
    { "stage": "string", "link": "string", "timestamp": "string", "note": "string" }
  ],
  "comments": [
    { "id": "string", "authorId": "string", "authorRole": "string", "content": "string", "tag": "string", "timestamp": "string" }
  ],
  "timeline": { "start": "ISO_DATE", "end": "ISO_DATE" },
  "archived": "boolean"
}
```

### 3. `/users/{userId}/fana_members`
Personnel tracking within the user's workspace.
```json
{
  "name": "string",
  "roles": ["string"],
  "status": "Active | Idle | Blocked",
  "availability": "string (percentage)",
  "timezone": "string",
  "strength": "number",
  "specialties": ["string"],
  "bio": "string",
  "joinDate": "string",
  "archived": "boolean"
}
```

### 4. `/users/{userId}/fana_milestones`
Temporal markers for the user's specific schedules.
```json
{
  "projectId": "string (foreign_key)",
  "title": "string",
  "description": "string",
  "deadline": "YYYY-MM-DD",
  "ownerId": "string",
  "urgency": "Low | Medium | High",
  "archived": "boolean"
}
```

### 5. `/users/{userId}/fana_activity`
The live intelligence stream for the user's workspace.
```json
{
  "source": "TASK | PROJECT | ERROR | PERSONNEL",
  "author": "string",
  "content": "string",
  "timestamp": "HH:MM AM/PM",
  "createdAt": "ServerTimestamp"
}
```

### 6. `/users/{userId}/fana_errors` & `/users/{userId}/fana_clients`
Standard logging and entity management collections following the patterns above.
