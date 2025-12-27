# Firestore Database Schema

The speedOps database is structured into flat, high-performance collections optimized for real-time `onSnapshot` listeners.

## Collections Map

### 1. `fana_projects`
Main containers for all work units.
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

### 2. `fana_tasks`
The core operational units.
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

### 3. `fana_members`
Personnel tracking.
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

### 4. `fana_milestones`
Temporal markers for schedules.
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

### 5. `fana_activity`
The live intelligence stream.
```json
{
  "source": "TASK | PROJECT | ERROR | PERSONNEL",
  "author": "string",
  "content": "string",
  "timestamp": "HH:MM AM/PM",
  "createdAt": "ServerTimestamp"
}
```

### 6. `fana_errors` & `fana_clients`
Standard logging and entity management collections following the patterns above.
